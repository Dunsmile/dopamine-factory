import type { SentimentStatus } from "../types";

const POSITIVE_WEIGHTS: Record<string, number> = {
  불장: 3,
  급등: 3,
  호재: 2,
  반등: 2,
  상승: 2,
  매수: 1,
  떡상: 3,
  수익: 2,
  바닥확인: 2,
  저점매수: 2,
  long: 1,
  bullish: 2,
};

const NEGATIVE_WEIGHTS: Record<string, number> = {
  폭락: 3,
  공포: 3,
  손절: 3,
  하락: 2,
  악재: 2,
  나락: 3,
  상폐: 4,
  개미털기: 2,
  마진콜: 3,
  숏: 1,
  short: 1,
  bearish: 2,
};

export interface PostSentiment {
  score: number;
  positive: string[];
  negative: string[];
}

export interface AggregateSentiment {
  score: number;
  status: SentimentStatus;
  mentionVolume: number;
  topKeywords: string[];
  sourceBreakdown: Record<string, number>;
}

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function collectMatches(text: string, dict: Record<string, number>): string[] {
  const lowered = text.toLowerCase();
  return Object.keys(dict).filter((keyword) => lowered.includes(keyword.toLowerCase()));
}

export function scoreToStatus(score: number): SentimentStatus {
  if (score <= 20) return "EXTREME_FEAR";
  if (score <= 40) return "FEAR";
  if (score <= 60) return "NEUTRAL";
  if (score <= 80) return "GREED";
  return "EXTREME_GREED";
}

export function analyzePostSentiment(text: string): PostSentiment {
  const positive = collectMatches(text, POSITIVE_WEIGHTS);
  const negative = collectMatches(text, NEGATIVE_WEIGHTS);

  const positiveScore = positive.reduce((acc, keyword) => acc + POSITIVE_WEIGHTS[keyword], 0);
  const negativeScore = negative.reduce((acc, keyword) => acc + NEGATIVE_WEIGHTS[keyword], 0);
  const raw = positiveScore - negativeScore;
  const score = clamp(0, 50 + raw * 8, 100);

  return {
    score,
    positive,
    negative,
  };
}

export function aggregateSentiment(
  posts: Array<{ title: string; body?: string; source: string }>
): AggregateSentiment {
  if (posts.length === 0) {
    return {
      score: 50,
      status: scoreToStatus(50),
      mentionVolume: 0,
      topKeywords: [],
      sourceBreakdown: {},
    };
  }

  let weightedSum = 0;
  let weightBase = 0;
  const keywordCounts = new Map<string, number>();
  const sourceBreakdown: Record<string, number> = {};

  for (const post of posts) {
    const text = `${post.title} ${post.body || ""}`;
    const analysis = analyzePostSentiment(text);
    const lengthWeight = Math.min(2, 1 + (post.body?.length || 0) / 1200);

    weightedSum += analysis.score * lengthWeight;
    weightBase += lengthWeight;

    for (const keyword of [...analysis.positive, ...analysis.negative]) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    }

    sourceBreakdown[post.source] = (sourceBreakdown[post.source] || 0) + 1;
  }

  const score = clamp(0, Math.round(weightedSum / weightBase), 100);
  const topKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([keyword]) => keyword);

  return {
    score,
    status: scoreToStatus(score),
    mentionVolume: posts.length,
    topKeywords,
    sourceBreakdown,
  };
}
