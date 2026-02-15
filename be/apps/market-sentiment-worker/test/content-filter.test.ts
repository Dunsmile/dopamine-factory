import { describe, expect, it } from "vitest";

import { isKoreanDominantText } from "../src/utils/content-filter";

describe("content filter", () => {
  it("accepts korean-dominant text by default", () => {
    expect(isKoreanDominantText("삼성전자 오늘 반등 가능성 높음", {})).toBe(true);
  });

  it("rejects english-only text by default", () => {
    expect(isKoreanDominantText("this market looks very bullish today", {})).toBe(false);
  });

  it("can disable korean preference with env override", () => {
    expect(
      isKoreanDominantText("this market looks very bullish today", {
        PREFER_KOREAN_CONTENT: "false",
      })
    ).toBe(true);
  });
});
