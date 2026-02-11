import { beforeEach, describe, expect, it, vi } from "vitest";

const metrics = {
  getDoc: 0,
  runQuery: 0,
  upsertDoc: 0,
  batchUpsertDocs: 0,
  detailFetch: 0,
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

function mockFetch(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);

  if (url.includes("gall.dcinside.com/board/lists")) {
    if (url.includes("id=bitcoins_new1")) {
      return Promise.resolve(new Response(DC_LIST_HTML_COIN, { status: 200 }));
    }
    return Promise.resolve(new Response(DC_LIST_HTML_STOCK, { status: 200 }));
  }

  if (url.includes("gall.dcinside.com/board/view")) {
    metrics.detailFetch += 1;
    return Promise.resolve(new Response(DC_DETAIL_HTML, { status: 200 }));
  }

  if (url.includes("fmkorea.com/coin") || url.includes("fmkorea.com/stock")) {
    if (url.includes("/coin")) {
      return Promise.resolve(new Response(FM_LIST_HTML_COIN, { status: 200 }));
    }
    return Promise.resolve(new Response(FM_LIST_HTML_STOCK, { status: 200 }));
  }

  if (url.includes("fmkorea.com/posts/")) {
    metrics.detailFetch += 1;
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
});
