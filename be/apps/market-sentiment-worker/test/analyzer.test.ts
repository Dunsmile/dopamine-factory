import { describe, expect, it } from "vitest";

import { aggregateSentiment, analyzePostSentiment, scoreToStatus } from "../src/analyzer/keyword-score";

describe("keyword analyzer", () => {
  it("scores positive posts above neutral", () => {
    const result = analyzePostSentiment("비트코인 급등 호재 불장");
    expect(result.score).toBeGreaterThan(50);
  });

  it("scores negative posts below neutral", () => {
    const result = analyzePostSentiment("폭락 공포 손절 나락");
    expect(result.score).toBeLessThan(50);
  });

  it("aggregates posts and returns status", () => {
    const summary = aggregateSentiment([
      { source: "dcinside", title: "급등 반등", body: "호재" },
      { source: "fmkorea", title: "손절", body: "폭락 공포" },
    ]);

    expect(summary.mentionVolume).toBe(2);
    expect(summary.topKeywords.length).toBeGreaterThan(0);
    expect(["EXTREME_FEAR", "FEAR", "NEUTRAL", "GREED", "EXTREME_GREED"]).toContain(summary.status);
  });

  it("maps score to status boundaries", () => {
    expect(scoreToStatus(20)).toBe("EXTREME_FEAR");
    expect(scoreToStatus(40)).toBe("FEAR");
    expect(scoreToStatus(60)).toBe("NEUTRAL");
    expect(scoreToStatus(80)).toBe("GREED");
    expect(scoreToStatus(95)).toBe("EXTREME_GREED");
  });
});
