import { describe, expect, it } from "vitest";

import { getTrackingAssets, matchAssetSymbols } from "../src/matcher/assets";

describe("asset matcher", () => {
  it("loads default 20 tracking assets", () => {
    const assets = getTrackingAssets({} as never);
    expect(assets).toHaveLength(20);
  });

  it("supports env override", () => {
    const assets = getTrackingAssets({
      TRACKING_COINS: "BTC:비트코인,ETH:이더리움",
      TRACKING_STOCKS: "005930:삼성전자",
    } as never);

    expect(assets.map((x) => x.symbol)).toEqual(["BTC", "ETH", "005930"]);
  });

  it("matches korean and symbol aliases", () => {
    const assets = getTrackingAssets({} as never);
    const matched = matchAssetSymbols("오늘 비트코인과 005930 둘 다 하락", assets);

    expect(matched).toContain("BTC");
    expect(matched).toContain("005930");
  });
});
