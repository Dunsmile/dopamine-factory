interface RedditEnv {
  REDDIT_CLIENT_ID?: string;
  REDDIT_CLIENT_SECRET?: string;
  REDDIT_USER_AGENT?: string;
  REDDIT_SUBREDDITS?: string;
  REDDIT_COMMENTS_PER_SUBREDDIT?: string;
  PREFER_KOREAN_CONTENT?: string;
  KOREAN_CONTENT_MIN_HANGUL_RATIO?: string;
  KOREAN_CONTENT_MIN_HANGUL_CHARS?: string;
}
import { isKoreanDominantText } from "../utils/content-filter";

export interface RedditCommentPost {
  source: "reddit";
  title: string;
  body: string;
  url: string;
  postedAt: string | null;
}

function parseNumber(value: string | undefined, fallback: number, min = 1, max = 25): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function parseSubreddits(raw: string | undefined): string[] {
  const defaults = "CryptoCurrency,Bitcoin,wallstreetbets,stocks";
  const value = raw?.trim() || defaults;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getRedditAccessToken(env: RedditEnv, fetcher: typeof fetch): Promise<string | null> {
  if (!env.REDDIT_CLIENT_ID || !env.REDDIT_CLIENT_SECRET) {
    return null;
  }

  const authValue = btoa(`${env.REDDIT_CLIENT_ID}:${env.REDDIT_CLIENT_SECRET}`);
  const body = new URLSearchParams({ grant_type: "client_credentials" }).toString();
  const resp = await fetcher("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authValue}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": env.REDDIT_USER_AGENT || "dopamin-market-worker/1.0",
    },
    body,
  });

  if (!resp.ok) {
    return null;
  }

  const data = (await resp.json()) as { access_token?: string };
  return data.access_token || null;
}

function toIsoTime(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value * 1000).toISOString();
}

function toAbsoluteRedditUrl(permalink: string): string {
  if (permalink.startsWith("http")) {
    return permalink;
  }
  const path = permalink.startsWith("/") ? permalink : `/${permalink}`;
  return `https://www.reddit.com${path}`;
}

export async function fetchRedditCommentPosts(
  env: RedditEnv,
  fetcher: typeof fetch = fetch
): Promise<RedditCommentPost[]> {
  const subreddits = parseSubreddits(env.REDDIT_SUBREDDITS);
  const limitPerSubreddit = parseNumber(env.REDDIT_COMMENTS_PER_SUBREDDIT, 3, 1, 25);
  const userAgent = env.REDDIT_USER_AGENT || "dopamin-market-worker/1.0";
  const token = await getRedditAccessToken(env, fetcher);
  const baseUrl = token ? "https://oauth.reddit.com" : "https://www.reddit.com";

  const posts: RedditCommentPost[] = [];
  const seen = new Set<string>();

  for (const subreddit of subreddits) {
    const params = new URLSearchParams({
      limit: String(limitPerSubreddit),
      raw_json: "1",
    });

    const resp = await fetcher(`${baseUrl}/r/${encodeURIComponent(subreddit)}/comments.json?${params.toString()}`, {
      headers: {
        "User-Agent": userAgent,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!resp.ok) {
      continue;
    }

    const data = (await resp.json()) as {
      data?: {
        children?: Array<{
          data?: {
            body?: string;
            permalink?: string;
            link_title?: string;
            created_utc?: number;
          };
        }>;
      };
    };

    for (const child of data.data?.children || []) {
      const comment = child.data;
      const body = (comment?.body || "").trim();
      const permalink = (comment?.permalink || "").trim();
      if (!body || !permalink) {
        continue;
      }
      const merged = `${comment?.link_title || ""} ${body}`.trim();
      if (!isKoreanDominantText(merged, env)) {
        continue;
      }

      const url = toAbsoluteRedditUrl(permalink);
      if (seen.has(url)) {
        continue;
      }
      seen.add(url);

      posts.push({
        source: "reddit",
        title: comment?.link_title || `r/${subreddit}`,
        body,
        url,
        postedAt: toIsoTime(comment?.created_utc),
      });
    }
  }

  return posts;
}
