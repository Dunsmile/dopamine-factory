export type AssetType = "coin" | "stock";
export type SentimentStatus =
  | "EXTREME_FEAR"
  | "FEAR"
  | "NEUTRAL"
  | "GREED"
  | "EXTREME_GREED";

export interface TrackedAsset {
  symbol: string;
  name: string;
  type: AssetType;
  aliases: string[];
  isTracking: boolean;
}

export interface CrawledPost {
  source: "dcinside" | "fmkorea";
  boardType: AssetType;
  title: string;
  body: string;
  url: string;
  postedAt: string | null;
  collectedAt: string;
  matchedAssets: string[];
  expireAt: string;
}

export interface SentimentSummary {
  asset: string;
  score: number;
  status: SentimentStatus;
  mentionVolume: number;
  topKeywords: string[];
  sourceBreakdown: Record<string, number>;
  updatedAt: string;
}

export interface PipelineResult {
  status: "SUCCESS" | "FAILED";
  startedAt: string;
  finishedAt: string;
  createdPosts: number;
  analyzedAssets: number;
  parseSuccessRate: number;
  errors: string[];
}

export interface WorkerEnv {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  MARKET_ADMIN_KEY?: string;
  CORS_ORIGIN?: string;

  TRACKING_COINS?: string;
  TRACKING_STOCKS?: string;

  DCINSIDE_CRYPTO_GALL_ID?: string;
  DCINSIDE_STOCK_GALL_ID?: string;
  FMKOREA_CRYPTO_BOARD?: string;
  FMKOREA_STOCK_BOARD?: string;
  FMKOREA_BASE_URL?: string;

  CRAWL_LIST_LIMIT?: string;
  CRAWL_DETAIL_LIMIT?: string;
  SENTIMENT_WINDOW_HOURS?: string;
}
