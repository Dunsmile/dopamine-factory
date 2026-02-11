interface KoreanPreferenceEnv {
  PREFER_KOREAN_CONTENT?: string;
  KOREAN_CONTENT_MIN_HANGUL_RATIO?: string;
  KOREAN_CONTENT_MIN_HANGUL_CHARS?: string;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value || "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function countHangul(text: string): number {
  const matches = text.match(/[가-힣]/g);
  return matches ? matches.length : 0;
}

function countMeaningfulChars(text: string): number {
  const cleaned = text.replace(/\s+/g, "");
  return cleaned.length;
}

export function isKoreanPreferred(env: KoreanPreferenceEnv): boolean {
  return parseBoolean(env.PREFER_KOREAN_CONTENT, true);
}

export function isKoreanDominantText(text: string, env: KoreanPreferenceEnv): boolean {
  if (!isKoreanPreferred(env)) {
    return true;
  }

  const normalized = String(text || "").trim();
  if (!normalized) {
    return false;
  }

  const minHangulChars = Math.max(1, Math.round(parseNumber(env.KOREAN_CONTENT_MIN_HANGUL_CHARS, 8)));
  const minHangulRatio = Math.max(0.01, Math.min(1, parseNumber(env.KOREAN_CONTENT_MIN_HANGUL_RATIO, 0.3)));

  const hangulChars = countHangul(normalized);
  const meaningfulChars = Math.max(1, countMeaningfulChars(normalized));
  const hangulRatio = hangulChars / meaningfulChars;

  return hangulChars >= minHangulChars && hangulRatio >= minHangulRatio;
}
