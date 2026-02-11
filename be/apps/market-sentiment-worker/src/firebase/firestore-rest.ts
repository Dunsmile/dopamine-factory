interface FirestoreEnv {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

type JsonObject = Record<string, unknown>;

let tokenCache: { token: string; expiresAt: number } | null = null;

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n");
}

async function createSignedJwt(env: FirestoreEnv): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    sub: env.FIREBASE_CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/datastore",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  const keyData = pemToArrayBuffer(normalizePrivateKey(env.FIREBASE_PRIVATE_KEY));
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${arrayBufferToBase64Url(signature)}`;
}

async function getAccessToken(env: FirestoreEnv): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  const assertion = await createSignedJwt(env);
  const form = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`token request failed: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

function toFirestoreValue(value: unknown): JsonObject {
  if (value === null || value === undefined) return { nullValue: null };

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }

  switch (typeof value) {
    case "string":
      return { stringValue: value };
    case "boolean":
      return { booleanValue: value };
    case "number":
      if (Number.isInteger(value)) {
        return { integerValue: String(value) };
      }
      return { doubleValue: value };
    case "object": {
      const fields: Record<string, JsonObject> = {};
      for (const [key, nested] of Object.entries(value as JsonObject)) {
        fields[key] = toFirestoreValue(nested);
      }
      return { mapValue: { fields } };
    }
    default:
      return { stringValue: String(value) };
  }
}

function fromFirestoreValue(value: JsonObject | undefined): unknown {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;

  if ("arrayValue" in value) {
    const arr = (value.arrayValue as { values?: JsonObject[] }).values || [];
    return arr.map((item) => fromFirestoreValue(item));
  }

  if ("mapValue" in value) {
    const result: JsonObject = {};
    const fields = (value.mapValue as { fields?: Record<string, JsonObject> }).fields || {};
    for (const [key, fieldValue] of Object.entries(fields)) {
      result[key] = fromFirestoreValue(fieldValue);
    }
    return result;
  }

  return null;
}

function decodeDocument(doc: JsonObject): JsonObject {
  const name = (doc.name as string) || "";
  const id = name.split("/").pop() || "";
  const fields = (doc.fields as Record<string, JsonObject>) || {};
  const decoded: JsonObject = { id };

  for (const [key, value] of Object.entries(fields)) {
    decoded[key] = fromFirestoreValue(value);
  }
  return decoded;
}

export class FirestoreClient {
  private readonly env: FirestoreEnv;
  private readonly baseUrl: string;

  constructor(env: FirestoreEnv) {
    this.env = env;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  }

  private async authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await getAccessToken(this.env);
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.get("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
  }

  async getDoc(collection: string, docId: string): Promise<JsonObject | null> {
    const resp = await this.authedFetch(`/${collection}/${encodeURIComponent(docId)}`);
    if (resp.status === 404) {
      return null;
    }
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`getDoc failed: ${resp.status} ${text}`);
    }

    const doc = (await resp.json()) as JsonObject;
    return decodeDocument(doc);
  }

  async upsertDoc(collection: string, docId: string, data: JsonObject): Promise<void> {
    const fields: Record<string, JsonObject> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = toFirestoreValue(value);
    }

    const resp = await this.authedFetch(`/${collection}/${encodeURIComponent(docId)}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`upsertDoc failed: ${resp.status} ${text}`);
    }
  }

  async runQuery(structuredQuery: JsonObject): Promise<JsonObject[]> {
    const resp = await this.authedFetch(":runQuery", {
      method: "POST",
      body: JSON.stringify({ structuredQuery }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`runQuery failed: ${resp.status} ${text}`);
    }

    const raw = (await resp.json()) as Array<{ document?: JsonObject }>;
    return raw
      .filter((row) => Boolean(row.document))
      .map((row) => decodeDocument(row.document as JsonObject));
  }

  async listCollection(collection: string, limit = 100): Promise<JsonObject[]> {
    const query: JsonObject = {
      from: [{ collectionId: collection }],
      limit,
    };
    return this.runQuery(query);
  }
}
