import { beforeEach, describe, expect, it, vi } from "vitest";

const metrics = {
  getDoc: 0,
  runQuery: 0,
  upsertDoc: 0,
  batchUpsertDocs: 0,
  detailFetch: 0,
  detailByBoard: {
    dcCoin: 0,
    dcStock: 0,
    fmCoin: 0,
    fmStock: 0,
  },
};

vi.mock("../src/firebase/firestore-rest", () => {
  class FirestoreClient {
    async getDoc() {
      metrics.getDoc += 1;
      return null;
    }

    async runQuery() {
      metrics.runQuery += 1;
      return [];
    }

    async upsertDoc() {
      metrics.upsertDoc += 1;
      return;
    }

    async batchUpsertDocs() {
      metrics.batchUpsertDocs += 1;
      return;
    }
  }

  return { FirestoreClient };
});

import { runPipeline } from "../src/pipeline";

const DC_LIST_HTML_COIN = `
<table>
  <tr class="ub-content us-post">
    <td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=100">비트코인 급등 신호</a></td>
  </tr>
</table>
`;

const DC_LIST_HTML_COIN_HEAVY = `
<table>
  <tr class="ub-content us-post"><td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=100">비트코인 급등 신호</a></td></tr>
  <tr class="ub-content us-post"><td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=101">이더리움 반등</a></td></tr>
  <tr class="ub-content us-post"><td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=102">리플 전망</a></td></tr>
  <tr class="ub-content us-post"><td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=103">도지 밈코인 급등</a></td></tr>
  <tr class="ub-content us-post"><td class="gall_tit"><a href="/board/view/?id=bitcoins_new1&no=104">솔라나 단기 조정</a></td></tr>
</table>
`;

const DC_LIST_HTML_STOCK = `
<table>
  <tr class="ub-content us-post">
    <td class="gall_tit"><a href="/board/view/?id=neostock&no=200">삼성전자 반등 기대</a></td>
  </tr>
</table>
`;

const DC_DETAIL_HTML = `
<div>
  <span class="title_subject">비트코인 급등 신호</span>
  <span class="gall_date" title="2026.02.11 10:10:00"></span>
  <div id="write_div">불장 시작 호재 반등</div>
</div>
`;

const FM_LIST_HTML_COIN = `
<div>
  <a class="hx" href="/posts/12345">BTC 반등 기대</a>
</div>
`;

const FM_LIST_HTML_STOCK = `
<div>
  <a class="hx" href="/posts/67890">005930 반등 기대</a>
</div>
`;

const FM_DETAIL_HTML = `
<div>
  <h1 class="rd_tit">005930 반등 기대</h1>
  <span class="date">2026.02.11 09:30:00</span>
  <div class="rd_body">호재 가능성 있지만 관망</div>
</div>
`;

let scenario: "default" | "coin-heavy" = "default";
let socialScenario = false;

function mockFetch(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);

  if (url.includes("gall.dcinside.com/board/lists")) {
    if (socialScenario) {
      return Promise.resolve(new Response("<table></table>", { status: 200 }));
    }
    if (url.includes("id=bitcoins_new1")) {
      const html = scenario === "coin-heavy" ? DC_LIST_HTML_COIN_HEAVY : DC_LIST_HTML_COIN;
      return Promise.resolve(new Response(html, { status: 200 }));
    }
    return Promise.resolve(new Response(DC_LIST_HTML_STOCK, { status: 200 }));
  }

  if (url.includes("gall.dcinside.com/board/view")) {
    metrics.detailFetch += 1;
    if (url.includes("id=bitcoins_new1")) {
      metrics.detailByBoard.dcCoin += 1;
    } else if (url.includes("id=neostock")) {
      metrics.detailByBoard.dcStock += 1;
    }
    return Promise.resolve(new Response(DC_DETAIL_HTML, { status: 200 }));
  }

  if (url.includes("fmkorea.com/coin") || url.includes("fmkorea.com/stock")) {
    if (socialScenario) {
      return Promise.resolve(new Response("<table></table>", { status: 200 }));
    }
    if (url.includes("/coin")) {
      return Promise.resolve(new Response(FM_LIST_HTML_COIN, { status: 200 }));
    }
    return Promise.resolve(new Response(FM_LIST_HTML_STOCK, { status: 200 }));
  }

  if (url.includes("googleapis.com/youtube/v3/search")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          items: [
            {
              id: { videoId: "video-1" },
              snippet: { title: "BTC 시황", description: "오늘 코인 시장" },
            },
          ],
        }),
        { status: 200 }
      )
    );
  }

  if (url.includes("googleapis.com/youtube/v3/commentThreads")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "comment-1",
              snippet: {
                topLevelComment: {
                  snippet: {
                    textDisplay: "비트코인 반등 가능성",
                    publishedAt: "2026-02-11T05:00:00.000Z",
                  },
                },
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
  }

  if (url.includes("reddit.com/r/stocks/comments.json")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          data: {
            children: [
              {
                data: {
                  body: "삼전은 길게 보면 좋다",
                  permalink: "/r/stocks/comments/abc123/thread/comment1/",
                  link_title: "KR stocks thread",
                  created_utc: 1770786000,
                },
              },
            ],
          },
        }),
        { status: 200 }
      )
    );
  }

  if (url.includes("fmkorea.com/posts/")) {
    metrics.detailFetch += 1;
    if (url.includes("/posts/12345")) {
      metrics.detailByBoard.fmCoin += 1;
    } else if (url.includes("/posts/67890")) {
      metrics.detailByBoard.fmStock += 1;
    }
    return Promise.resolve(new Response(FM_DETAIL_HTML, { status: 200 }));
  }

  throw new Error(`Unhandled URL in test: ${url}`);
}

describe("runPipeline efficiency", () => {
  beforeEach(() => {
    metrics.getDoc = 0;
    metrics.runQuery = 0;
    metrics.upsertDoc = 0;
    metrics.batchUpsertDocs = 0;
    metrics.detailFetch = 0;
    metrics.detailByBoard.dcCoin = 0;
    metrics.detailByBoard.dcStock = 0;
    metrics.detailByBoard.fmCoin = 0;
    metrics.detailByBoard.fmStock = 0;
    scenario = "default";
    socialScenario = false;
    vi.stubGlobal("fetch", vi.fn(mockFetch));
  });

  it("avoids per-post existence checks and per-asset runQuery loops", async () => {
    await runPipeline({
      FIREBASE_PROJECT_ID: "x",
      FIREBASE_CLIENT_EMAIL: "x",
      FIREBASE_PRIVATE_KEY: "x",
      CRAWL_LIST_LIMIT: "1",
      CRAWL_DETAIL_LIMIT: "1",
      SENTIMENT_WINDOW_HOURS: "24",
    });

    expect(metrics.getDoc).toBe(0);
    expect(metrics.runQuery).toBeLessThanOrEqual(3);
  });

  it("caps detail crawling as a global pipeline budget", async () => {
    await runPipeline({
      FIREBASE_PROJECT_ID: "x",
      FIREBASE_CLIENT_EMAIL: "x",
      FIREBASE_PRIVATE_KEY: "x",
      CRAWL_LIST_LIMIT: "1",
      CRAWL_DETAIL_LIMIT: "2",
      SENTIMENT_WINDOW_HOURS: "24",
    });

    expect(metrics.detailFetch).toBeLessThanOrEqual(2);
  });

  it("keeps stock boards from starvation when coin board is noisy", async () => {
    scenario = "coin-heavy";

    await runPipeline({
      FIREBASE_PROJECT_ID: "x",
      FIREBASE_CLIENT_EMAIL: "x",
      FIREBASE_PRIVATE_KEY: "x",
      CRAWL_LIST_LIMIT: "30",
      CRAWL_DETAIL_LIMIT: "4",
      SENTIMENT_WINDOW_HOURS: "24",
    });

    expect(metrics.detailFetch).toBe(4);
    expect(metrics.detailByBoard.dcStock + metrics.detailByBoard.fmStock).toBeGreaterThan(0);
  });

  it("ingests youtube and reddit posts when social sources are enabled", async () => {
    socialScenario = true;

    const result = await runPipeline({
      FIREBASE_PROJECT_ID: "x",
      FIREBASE_CLIENT_EMAIL: "x",
      FIREBASE_PRIVATE_KEY: "x",
      CRAWL_LIST_LIMIT: "1",
      CRAWL_DETAIL_LIMIT: "1",
      SENTIMENT_WINDOW_HOURS: "24",
      YOUTUBE_API_KEY: "yt-key",
      YOUTUBE_SEARCH_QUERIES: "bitcoin",
      YOUTUBE_MAX_VIDEOS_PER_QUERY: "1",
      YOUTUBE_MAX_COMMENTS_PER_VIDEO: "1",
      REDDIT_SUBREDDITS: "stocks",
      REDDIT_COMMENTS_PER_SUBREDDIT: "1",
      REDDIT_USER_AGENT: "dopamin-market-test/1.0",
    } as any);

    expect(result.createdPosts).toBe(2);
  });
});
