import { aggregateSentiment } from "./analyzer/keyword-score";
import { fetchDcinsideDetail, fetchDcinsideList } from "./crawlers/dcinside";
import { fetchFmkoreaDetail, fetchFmkoreaList } from "./crawlers/fmkorea";
import { FirestoreClient } from "./firebase/firestore-rest";
import { getTrackingAssets, matchAssetSymbols } from "./matcher/assets";
import type { AssetType, PipelineResult, TrackedAsset, WorkerEnv } from "./types";
import { minuteKey, sha1Hex } from "./utils/hash";

interface BoardConfig {
  source: "dcinside" | "fmkorea";
  boardType: AssetType;
  idOrUrl: string;
}

function getBoardConfigs(env: WorkerEnv): BoardConfig[] {
  return [
    {
      source: "dcinside",
      boardType: "coin",
      idOrUrl: env.DCINSIDE_CRYPTO_GALL_ID || "bitcoins_new1",
    },
    {
      source: "dcinside",
      boardType: "stock",
      idOrUrl: env.DCINSIDE_STOCK_GALL_ID || "neostock",
    },
    {
      source: "fmkorea",
      boardType: "coin",
      idOrUrl: env.FMKOREA_CRYPTO_BOARD || "https://www.fmkorea.com/coin",
    },
    {
      source: "fmkorea",
      boardType: "stock",
      idOrUrl: env.FMKOREA_STOCK_BOARD || "https://www.fmkorea.com/stock",
    },
  ];
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function extractPostPayload(doc: Record<string, unknown>): { title: string; body?: string; source: string; collectedAt?: string } {
  return {
    title: String(doc.title || ""),
    body: typeof doc.body === "string" ? doc.body : "",
    source: String(doc.source || "unknown"),
    collectedAt: typeof doc.collectedAt === "string" ? doc.collectedAt : undefined,
  };
}

async function seedAssets(client: FirestoreClient, assets: TrackedAsset[], nowIso: string): Promise<void> {
  await Promise.all(
    assets.map((asset) =>
      client.upsertDoc("market_assets", asset.symbol, {
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        aliases: asset.aliases,
        isTracking: asset.isTracking,
        updatedAt: nowIso,
      })
    )
  );
}

async function crawlBoards(
  env: WorkerEnv,
  client: FirestoreClient,
  assets: TrackedAsset[],
  nowIso: string,
  errors: string[]
): Promise<{ createdPosts: number; detailAttempts: number; detailSuccess: number }> {
  const listLimit = parseNumber(env.CRAWL_LIST_LIMIT, 30);
  const detailLimit = parseNumber(env.CRAWL_DETAIL_LIMIT, 30);
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let createdPosts = 0;
  let detailAttempts = 0;
  let detailSuccess = 0;

  for (const board of getBoardConfigs(env)) {
    try {
      const listPosts =
        board.source === "dcinside"
          ? await fetchDcinsideList(board.idOrUrl, board.boardType, listLimit)
          : await fetchFmkoreaList(
              board.idOrUrl,
              board.boardType,
              listLimit,
              env.FMKOREA_BASE_URL || "https://www.fmkorea.com"
            );

      let detailFetched = 0;
      for (const listPost of listPosts) {
        const postId = await sha1Hex(`${listPost.source}:${listPost.url}`);
        const exists = await client.getDoc("market_posts", postId);
        if (exists) {
          continue;
        }
        if (detailFetched >= detailLimit) {
          break;
        }

        detailAttempts += 1;
        detailFetched += 1;

        const detail =
          listPost.source === "dcinside"
            ? await fetchDcinsideDetail(listPost.url)
            : await fetchFmkoreaDetail(listPost.url);

        if (!detail) {
          errors.push(`detail_fetch_failed:${listPost.source}:${listPost.url}`);
          continue;
        }

        detailSuccess += 1;
        const title = detail.title || listPost.title;
        const body = detail.body || "";
        const matchedAssets = matchAssetSymbols(`${title} ${body}`, assets);

        await client.upsertDoc("market_posts", postId, {
          source: listPost.source,
          boardType: listPost.boardType,
          title,
          body,
          url: listPost.url,
          postedAt: detail.postedAt,
          collectedAt: nowIso,
          matchedAssets,
          expireAt,
        });

        createdPosts += 1;
      }
    } catch (error) {
      errors.push(`crawl_failed:${board.source}:${board.boardType}:${String(error)}`);
    }
  }

  return { createdPosts, detailAttempts, detailSuccess };
}

async function analyzeAssets(
  env: WorkerEnv,
  client: FirestoreClient,
  assets: TrackedAsset[],
  now: Date,
  errors: string[]
): Promise<number> {
  const windowHours = parseNumber(env.SENTIMENT_WINDOW_HOURS, 24);
  const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
  const windowStartIso = windowStart.toISOString();
  const minuteSuffix = minuteKey(now);
  const expireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let analyzedAssets = 0;

  for (const asset of assets) {
    try {
      const rows = await client.runQuery({
        from: [{ collectionId: "market_posts" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "matchedAssets" },
            op: "ARRAY_CONTAINS",
            value: { stringValue: asset.symbol },
          },
        },
        limit: 200,
      });

      const posts = rows
        .map((row) => extractPostPayload(row as Record<string, unknown>))
        .filter((row) => row.collectedAt && row.collectedAt >= windowStartIso);

      const sentiment = aggregateSentiment(posts);
      const updatedAt = now.toISOString();

      await client.upsertDoc("market_sentiment_logs", `${asset.symbol}_${minuteSuffix}`, {
        assetSymbol: asset.symbol,
        score: sentiment.score,
        status: sentiment.status,
        mentionVolume: sentiment.mentionVolume,
        topKeywords: sentiment.topKeywords,
        sourceBreakdown: sentiment.sourceBreakdown,
        recordedAt: updatedAt,
        expireAt,
      });

      await client.upsertDoc("market_latest", asset.symbol, {
        asset: asset.symbol,
        score: sentiment.score,
        status: sentiment.status,
        mentionVolume: sentiment.mentionVolume,
        topKeywords: sentiment.topKeywords,
        sourceBreakdown: sentiment.sourceBreakdown,
        updatedAt,
      });

      analyzedAssets += 1;
    } catch (error) {
      errors.push(`analyze_failed:${asset.symbol}:${String(error)}`);
    }
  }

  return analyzedAssets;
}

export async function runPipeline(env: WorkerEnv): Promise<PipelineResult> {
  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();
  const client = new FirestoreClient(env);
  const assets = getTrackingAssets(env);
  const errors: string[] = [];

  await seedAssets(client, assets, startedAt);
  const crawlResult = await crawlBoards(env, client, assets, startedAt, errors);
  const analyzedAssets = await analyzeAssets(env, client, assets, new Date(), errors);

  const finishedAt = new Date().toISOString();
  const status = errors.length > 0 ? "FAILED" : "SUCCESS";
  const parseSuccessRate =
    crawlResult.detailAttempts === 0
      ? 100
      : Math.round((crawlResult.detailSuccess / crawlResult.detailAttempts) * 100);

  const result: PipelineResult = {
    status,
    startedAt,
    finishedAt,
    createdPosts: crawlResult.createdPosts,
    analyzedAssets,
    parseSuccessRate,
    errors,
  };

  const runId = await sha1Hex(`run:${startedAt}`);
  await client.upsertDoc("market_pipeline_runs", runId, {
    ...result,
  });

  return result;
}
