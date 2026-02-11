import type { AssetType, TrackedAsset, WorkerEnv } from "../types";

interface SeedAsset {
  symbol: string;
  name: string;
  type: AssetType;
  aliases: string[];
}

const COIN_SEED: SeedAsset[] = [
  { symbol: "BTC", name: "비트코인", type: "coin", aliases: ["btc", "비트코인", "bitcoin", "비트"] },
  { symbol: "ETH", name: "이더리움", type: "coin", aliases: ["eth", "이더리움", "ethereum", "이더"] },
  { symbol: "XRP", name: "리플", type: "coin", aliases: ["xrp", "리플", "ripple"] },
  { symbol: "SOL", name: "솔라나", type: "coin", aliases: ["sol", "솔라나", "solana"] },
  { symbol: "DOGE", name: "도지코인", type: "coin", aliases: ["doge", "도지", "dogecoin", "도지코인"] },
  { symbol: "ADA", name: "에이다", type: "coin", aliases: ["ada", "에이다", "cardano"] },
  { symbol: "AVAX", name: "아발란체", type: "coin", aliases: ["avax", "아발란체", "avalanche"] },
  { symbol: "LINK", name: "체인링크", type: "coin", aliases: ["link", "체인링크", "chainlink"] },
  { symbol: "TRX", name: "트론", type: "coin", aliases: ["trx", "트론", "tron"] },
  { symbol: "SUI", name: "수이", type: "coin", aliases: ["sui", "수이"] },
];

const STOCK_SEED: SeedAsset[] = [
  { symbol: "005930", name: "삼성전자", type: "stock", aliases: ["005930", "삼성전자", "삼전"] },
  { symbol: "000660", name: "SK하이닉스", type: "stock", aliases: ["000660", "sk하이닉스", "하이닉스"] },
  { symbol: "035420", name: "NAVER", type: "stock", aliases: ["035420", "naver", "네이버"] },
  { symbol: "005380", name: "현대차", type: "stock", aliases: ["005380", "현대차", "현대자동차"] },
  { symbol: "035720", name: "카카오", type: "stock", aliases: ["035720", "카카오"] },
  { symbol: "068270", name: "셀트리온", type: "stock", aliases: ["068270", "셀트리온"] },
  { symbol: "051910", name: "LG화학", type: "stock", aliases: ["051910", "lg화학"] },
  { symbol: "207940", name: "삼성바이오로직스", type: "stock", aliases: ["207940", "삼성바이오로직스", "삼바"] },
  { symbol: "373220", name: "LG에너지솔루션", type: "stock", aliases: ["373220", "lg에너지솔루션", "엘지엔솔"] },
  { symbol: "005490", name: "POSCO홀딩스", type: "stock", aliases: ["005490", "포스코", "posco", "posco홀딩스"] },
];

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase();
}

function parseOverride(raw: string | undefined, fallback: SeedAsset[]): SeedAsset[] {
  if (!raw || !raw.trim()) {
    return fallback;
  }

  const fallbackMap = new Map(fallback.map((item) => [item.symbol, item]));
  const items = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((entry) => {
      const [symbolPart, namePart] = entry.split(":").map((v) => v.trim());
      const symbol = (symbolPart || "").toUpperCase();
      if (!symbol) {
        return null;
      }
      const fallbackItem = fallbackMap.get(symbol);
      const aliases = new Set<string>([symbol.toLowerCase()]);
      if (namePart) {
        aliases.add(normalizeAlias(namePart));
      }
      if (fallbackItem) {
        for (const alias of fallbackItem.aliases) {
          aliases.add(normalizeAlias(alias));
        }
      }

      return {
        symbol,
        name: namePart || fallbackItem?.name || symbol,
        type: fallbackItem?.type || "coin",
        aliases: Array.from(aliases),
      } as SeedAsset;
    })
    .filter((v): v is SeedAsset => Boolean(v));

  return items.length > 0 ? items : fallback;
}

function toTrackedAsset(source: SeedAsset): TrackedAsset {
  const aliases = new Set<string>(source.aliases.map(normalizeAlias));
  aliases.add(source.symbol.toLowerCase());
  aliases.add(source.name.toLowerCase());

  return {
    symbol: source.symbol,
    name: source.name,
    type: source.type,
    aliases: Array.from(aliases),
    isTracking: true,
  };
}

export function getTrackingAssets(env: WorkerEnv): TrackedAsset[] {
  const overrideCoins = parseOverride(env.TRACKING_COINS, COIN_SEED).map((item) => ({
    ...item,
    type: "coin" as const,
  }));
  const overrideStocks = parseOverride(env.TRACKING_STOCKS, STOCK_SEED).map((item) => ({
    ...item,
    type: "stock" as const,
  }));

  return [...overrideCoins, ...overrideStocks].map(toTrackedAsset);
}

export function matchAssetSymbols(text: string, assets: TrackedAsset[]): string[] {
  const normalized = text.toLowerCase();
  const matched = new Set<string>();

  for (const asset of assets) {
    for (const alias of asset.aliases) {
      if (!alias) {
        continue;
      }
      if (normalized.includes(alias)) {
        matched.add(asset.symbol);
        break;
      }
    }
  }

  return Array.from(matched);
}
