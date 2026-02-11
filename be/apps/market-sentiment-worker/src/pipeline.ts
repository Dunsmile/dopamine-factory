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

const MAX_DETAIL_FETCHES_PER_RUN = 10;

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
  await client.batchUpsertDocs(
    assets.map((asset) => ({
      collection: "market_assets",
      docId: asset.symbol,
      data: {
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        aliases: asset.aliases,
        isTracking: asset.isTracking,
        updatedAt: nowIso,
      },
    }))
  );
}

async function crawlBoards(
  env: WorkerEnv,
  client: FirestoreClient,
  assets: TrackedAsset[],
  nowIso: string,
  errors: string[]
): Promise<{ createdPosts: number; detailAttempts: number; detailSuccess: number }> {
  const boardConfigs = getBoardConfigs(env);
  const listLimit = parseNumber(env.CRAWL_LIST_LIMIT, 30);
  const detailLimit = Math.min(parseNumber(env.CRAWL_DETAIL_LIMIT, MAX_DETAIL_FETCHES_PER_RUN), MAX_DETAIL_FETCHES_PER_RUN);
  let remainingDetailBudget = detailLimit;
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentWindowStart = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const existingRows = await client.runQuery({
    from: [{ collectionId: "market_posts" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "collectedAt" },
        op: "GREATER_THAN_OR_EQUAL",
        value: { stringValue: recentWindowStart },
      },
    },
    limit: 400,
  });
  const existingUrls = new Set(
    existingRows
      .map((row) => (typeof row.url === "string" ? row.url : ""))
      .filter((url): url is string => Boolean(url))
  );

  let createdPosts = 0;
  let detailAttempts = 0;
  let detailSuccess = 0;
  const postWrites: Array<{ collection: string; docId: string; data: Record<string, unknown> }> = [];

  for (const board of boardConfigs) {
    if (remainingDetailBudget <= 0) {
      break;
    }

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

      for (const listPost of listPosts) {
        if (remainingDetailBudget <= 0) {
          break;
        }

        if (existingUrls.has(listPost.url)) {
          continue;
        }

        detailAttempts += 1;
        remainingDetailBudget -= 1;

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
        const postId = await sha1Hex(`${listPost.source}:${listPost.url}`);

        postWrites.push({
          collection: "market_posts",
          docId: postId,
          data: {
            source: listPost.source,
            boardType: listPost.boardType,
            title,
            body,
            url: listPost.url,
            postedAt: detail.postedAt,
            collectedAt: nowIso,
            matchedAssets,
            expireAt,
          },
        });
        existingUrls.add(listPost.url);

        createdPosts += 1;
      }
    } catch (error) {
      errors.push(`crawl_failed:${board.source}:${board.boardType}:${String(error)}`);
    }
  }

  await client.batchUpsertDocs(postWrites);
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

  const rows = await client.runQuery({
    from: [{ collectionId: "market_posts" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "collectedAt" },
        op: "GREATER_THAN_OR_EQUAL",
        value: { stringValue: windowStartIso },
      },
    },
    limit: 500,
  });

  const postsByAsset = new Map<string, Array<{ title: string; body?: string; source: string }>>();
  for (const asset of assets) {
    postsByAsset.set(asset.symbol, []);
  }

  for (const row of rows as Array<Record<string, unknown>>) {
    const post = extractPostPayload(row);
    const matchedAssets = Array.isArray(row.matchedAssets)
      ? row.matchedAssets.filter((value): value is string => typeof value === "string")
      : [];

    for (const symbol of matchedAssets) {
      const bucket = postsByAsset.get(symbol);
      if (bucket) {
        bucket.push(post);
      }
    }
  }

  const updatedAt = now.toISOString();
  const sentimentWrites: Array<{ collection: string; docId: string; data: Record<string, unknown> }> = [];
  let analyzedAssets = 0;

  for (const asset of assets) {
    try {
      const sentiment = aggregateSentiment(postsByAsset.get(asset.symbol) || []);
      sentimentWrites.push({
        collection: "market_sentiment_logs",
        docId: `${asset.symbol}_${minuteSuffix}`,
        data: {
          assetSymbol: asset.symbol,
          score: sentiment.score,
          status: sentiment.status,
          mentionVolume: sentiment.mentionVolume,
          topKeywords: sentiment.topKeywords,
          sourceBreakdown: sentiment.sourceBreakdown,
          recordedAt: updatedAt,
          expireAt,
        },
      });
      sentimentWrites.push({
        collection: "market_latest",
        docId: asset.symbol,
        data: {
          asset: asset.symbol,
          score: sentiment.score,
          status: sentiment.status,
          mentionVolume: sentiment.mentionVolume,
          topKeywords: sentiment.topKeywords,
          sourceBreakdown: sentiment.sourceBreakdown,
          updatedAt,
        },
      });
      analyzedAssets += 1;
    } catch (error) {
      errors.push(`analyze_failed:${asset.symbol}:${String(error)}`);
    }
  }

  await client.batchUpsertDocs(sentimentWrites);
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
