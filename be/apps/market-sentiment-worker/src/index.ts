import { FirestoreClient } from "./firebase/firestore-rest";
import { getTrackingAssets } from "./matcher/assets";
import { runPipeline } from "./pipeline";
import type { WorkerEnv } from "./types";
import { isKoreanDominantText } from "./utils/content-filter";

function getCacheTtlSeconds(pathname: string): number {
  if (pathname === "/api/market/assets") return 300;
  if (pathname === "/api/market/sentiment/current") return 20;
  if (pathname === "/api/market/sentiment/history") return 45;
  if (pathname === "/api/market/posts") return 30;
  if (pathname === "/api/market/health") return 15;
  return 0;
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function withCors(response: Response, env: WorkerEnv): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN || "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function parsePeriodHours(period: string | null): number {
  if (!period) return 24;
  const match = period.match(/^(\d+)h$/i);
  if (!match) return 24;
  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value) || value <= 0) return 24;
  return Math.min(value, 168);
}

async function handleAssets(env: WorkerEnv): Promise<Response> {
  const client = new FirestoreClient(env);
  let assets = await client.listCollection("market_assets", 100);

  if (assets.length === 0) {
    const seeded = getTrackingAssets(env);
    await Promise.all(
      seeded.map((asset) =>
        client.upsertDoc("market_assets", asset.symbol, {
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          aliases: asset.aliases,
          isTracking: asset.isTracking,
          updatedAt: new Date().toISOString(),
        })
      )
    );
    assets = await client.listCollection("market_assets", 100);
  }

  assets.sort((a, b) => String(a.symbol).localeCompare(String(b.symbol), "ko"));
  return json({ assets });
}

async function handleCurrent(url: URL, env: WorkerEnv): Promise<Response> {
  const symbol = (url.searchParams.get("asset") || "BTC").toUpperCase();
  const client = new FirestoreClient(env);
  const latest = await client.getDoc("market_latest", symbol);

  if (!latest) {
    return json({
      asset: symbol,
      score: 50,
      status: "NEUTRAL",
      mentionVolume: 0,
      topKeywords: [],
      sourceBreakdown: {},
      updatedAt: new Date().toISOString(),
    });
  }

  return json(latest);
}

async function handleHistory(url: URL, env: WorkerEnv): Promise<Response> {
  const symbol = (url.searchParams.get("asset") || "BTC").toUpperCase();
  const hours = parsePeriodHours(url.searchParams.get("period"));
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const targetPoints = Math.min(500, Math.max(24, hours * 6));
  const queryLimit = Math.min(600, targetPoints + 48);

  const client = new FirestoreClient(env);
  let rows: Array<Record<string, unknown>> = [];

  try {
    rows = (await client.runQuery({
      from: [{ collectionId: "market_sentiment_logs" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: "assetSymbol" },
                op: "EQUAL",
                value: { stringValue: symbol },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: "recordedAt" },
                op: "GREATER_THAN_OR_EQUAL",
                value: { stringValue: since },
              },
            },
          ],
        },
      },
      limit: queryLimit,
    })) as Array<Record<string, unknown>>;
  } catch {
    rows = (await client.runQuery({
      from: [{ collectionId: "market_sentiment_logs" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "assetSymbol" },
          op: "EQUAL",
          value: { stringValue: symbol },
        },
      },
      limit: Math.max(queryLimit, 180),
    })) as Array<Record<string, unknown>>;
  }

  const points = rows
    .filter((row) => typeof row.recordedAt === "string" && row.recordedAt >= since)
    .sort((a, b) => String(a.recordedAt).localeCompare(String(b.recordedAt)))
    .slice(-targetPoints)
    .map((row) => ({
      time: row.recordedAt,
      score: row.score,
      volume: row.mentionVolume,
    }));

  return json({ asset: symbol, period: `${hours}h`, points });
}

async function handlePosts(url: URL, env: WorkerEnv): Promise<Response> {
  const symbol = (url.searchParams.get("asset") || "BTC").toUpperCase();
  const limit = Math.max(1, Math.min(100, Number.parseInt(url.searchParams.get("limit") || "30", 10) || 30));
  const lookbackHours = Math.max(1, Math.min(7 * 24, Number.parseInt(url.searchParams.get("lookbackHours") || "72", 10) || 72));
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();
  const queryLimit = Math.min(300, Math.max(60, limit * 4));

  const client = new FirestoreClient(env);
  let rows: Array<Record<string, unknown>> = [];

  try {
    rows = (await client.runQuery({
      from: [{ collectionId: "market_posts" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: "matchedAssets" },
                op: "ARRAY_CONTAINS",
                value: { stringValue: symbol },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: "collectedAt" },
                op: "GREATER_THAN_OR_EQUAL",
                value: { stringValue: since },
              },
            },
          ],
        },
      },
      limit: queryLimit,
    })) as Array<Record<string, unknown>>;
  } catch {
    rows = (await client.runQuery({
      from: [{ collectionId: "market_posts" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "matchedAssets" },
          op: "ARRAY_CONTAINS",
          value: { stringValue: symbol },
        },
      },
      limit: queryLimit,
    })) as Array<Record<string, unknown>>;
  }

  return json({
    asset: symbol,
    posts: rows
      .filter((row) => typeof row.collectedAt !== "string" || row.collectedAt >= since)
      .filter((row) => isKoreanDominantText(`${String(row.title || "")} ${String(row.body || "")}`, env))
      .sort((a, b) => String(b.collectedAt || "").localeCompare(String(a.collectedAt || "")))
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        source: row.source,
        boardType: row.boardType,
        title: row.title,
        body: row.body,
        url: row.url,
        postedAt: row.postedAt,
        collectedAt: row.collectedAt,
      })),
  });
}

async function handleHealth(env: WorkerEnv): Promise<Response> {
  const client = new FirestoreClient(env);
  const rows = await client.runQuery({
    from: [{ collectionId: "market_pipeline_runs" }],
    orderBy: [{ field: { fieldPath: "startedAt" }, direction: "DESCENDING" }],
    limit: 30,
  });

  const latest = rows[0] || null;
  const lastSuccess = rows.find((row) => row.status === "SUCCESS") || null;
  const failures = rows.filter((row) => row.status !== "SUCCESS").length;

  return json({
    latest,
    lastSuccessAt: lastSuccess?.finishedAt || null,
    failureCountRecent: failures,
    parseSuccessRate: latest?.parseSuccessRate ?? 0,
    checkedAt: new Date().toISOString(),
  });
}

async function handleManualRun(request: Request, env: WorkerEnv): Promise<Response> {
  if (!env.MARKET_ADMIN_KEY) {
    return json({ error: "MARKET_ADMIN_KEY is not configured" }, { status: 500 });
  }

  const key = request.headers.get("x-admin-key");
  if (!key || key !== env.MARKET_ADMIN_KEY) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPipeline(env);
  return json(result);
}

async function route(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (url.pathname === "/api/market/assets" && request.method === "GET") {
    return handleAssets(env);
  }
  if (url.pathname === "/api/market/sentiment/current" && request.method === "GET") {
    return handleCurrent(url, env);
  }
  if (url.pathname === "/api/market/sentiment/history" && request.method === "GET") {
    return handleHistory(url, env);
  }
  if (url.pathname === "/api/market/posts" && request.method === "GET") {
    return handlePosts(url, env);
  }
  if (url.pathname === "/api/market/pipeline/run" && request.method === "POST") {
    return handleManualRun(request, env);
  }
  if (url.pathname === "/api/market/health" && request.method === "GET") {
    return handleHealth(env);
  }

  return json({ error: "Not Found" }, { status: 404 });
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheTtl = request.method === "GET" ? getCacheTtlSeconds(url.pathname) : 0;
    const cacheKey = cacheTtl > 0 ? new Request(url.toString(), request) : null;

    try {
      if (cacheKey) {
        const cached = await caches.default.match(cacheKey);
        if (cached) {
          return withCors(cached, env);
        }
      }

      const response = await route(request, env);

      if (cacheKey && cacheTtl > 0 && response.ok) {
        const cacheable = new Response(response.body, response);
        cacheable.headers.set("Cache-Control", `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}`);
        ctx.waitUntil(caches.default.put(cacheKey, cacheable.clone()));
        return withCors(cacheable, env);
      }

      return withCors(response, env);
    } catch (error) {
      const response = json(
        {
          error: "Internal Server Error",
          message: String(error),
        },
        { status: 500 }
      );
      return withCors(response, env);
    }
  },

  async scheduled(_event: ScheduledEvent, env: WorkerEnv): Promise<void> {
    await runPipeline(env);
  },
};
