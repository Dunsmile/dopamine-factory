interface YoutubeEnv {
  YOUTUBE_API_KEY?: string;
  YOUTUBE_SEARCH_QUERIES?: string;
  YOUTUBE_MAX_QUERIES?: string;
  YOUTUBE_MAX_VIDEOS_PER_QUERY?: string;
  YOUTUBE_MAX_COMMENTS_PER_VIDEO?: string;
  PREFER_KOREAN_CONTENT?: string;
  KOREAN_CONTENT_MIN_HANGUL_RATIO?: string;
  KOREAN_CONTENT_MIN_HANGUL_CHARS?: string;
}
import { isKoreanDominantText, isKoreanPreferred } from "../utils/content-filter";

export interface YoutubeCommentPost {
  source: "youtube";
  title: string;
  body: string;
  url: string;
  postedAt: string | null;
}

function parseNumber(value: string | undefined, fallback: number, min = 1, max = 20): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function parseQueries(raw: string | undefined): string[] {
  const value = raw?.trim() || "비트코인,이더리움,삼성전자,하이닉스";
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toWatchUrl(videoId: string, commentId: string): string {
  const params = new URLSearchParams();
  params.set("v", videoId);
  if (commentId) {
    params.set("lc", commentId);
  }
  return `https://www.youtube.com/watch?${params.toString()}`;
}

export async function fetchYoutubeCommentPosts(
  env: YoutubeEnv,
  fetcher: typeof fetch = fetch
): Promise<YoutubeCommentPost[]> {
  if (!env.YOUTUBE_API_KEY) {
    return [];
  }

  const maxQueries = parseNumber(env.YOUTUBE_MAX_QUERIES, 1, 1, 5);
  const maxVideosPerQuery = parseNumber(env.YOUTUBE_MAX_VIDEOS_PER_QUERY, 1, 1, 5);
  const maxCommentsPerVideo = parseNumber(env.YOUTUBE_MAX_COMMENTS_PER_VIDEO, 3, 1, 20);
  const queries = parseQueries(env.YOUTUBE_SEARCH_QUERIES).slice(0, maxQueries);

  const posts: YoutubeCommentPost[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    const searchParams = new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      part: "snippet",
      type: "video",
      order: "date",
      maxResults: String(maxVideosPerQuery),
      q: query,
    });
    if (isKoreanPreferred(env)) {
      searchParams.set("relevanceLanguage", "ko");
      searchParams.set("regionCode", "KR");
    }

    const searchResp = await fetcher(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
    if (!searchResp.ok) {
      continue;
    }

    const searchData = (await searchResp.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: { title?: string; description?: string };
      }>;
    };

    for (const item of searchData.items || []) {
      const videoId = item.id?.videoId;
      if (!videoId) {
        continue;
      }

      const videoTitle = item.snippet?.title || "YouTube";
      const videoDescription = item.snippet?.description || "";

      const commentParams = new URLSearchParams({
        key: env.YOUTUBE_API_KEY,
        part: "snippet",
        order: "time",
        textFormat: "plainText",
        maxResults: String(maxCommentsPerVideo),
        videoId,
      });

      const commentResp = await fetcher(`https://www.googleapis.com/youtube/v3/commentThreads?${commentParams.toString()}`);
      if (!commentResp.ok) {
        continue;
      }

      const commentData = (await commentResp.json()) as {
        items?: Array<{
          id?: string;
          snippet?: {
            topLevelComment?: {
              snippet?: {
                textDisplay?: string;
                publishedAt?: string;
              };
            };
          };
        }>;
      };

      for (const comment of commentData.items || []) {
        const commentId = comment.id || "";
        const commentSnippet = comment.snippet?.topLevelComment?.snippet;
        const text = (commentSnippet?.textDisplay || "").trim();
        if (!text) {
          continue;
        }
        const merged = `${videoTitle} ${videoDescription} ${text}`.trim();
        if (!isKoreanDominantText(merged, env)) {
          continue;
        }

        const key = `${videoId}:${commentId}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);

        posts.push({
          source: "youtube",
          title: videoTitle,
          body: videoDescription ? `${text}\n${videoDescription}` : text,
          url: toWatchUrl(videoId, commentId),
          postedAt: commentSnippet?.publishedAt || null,
        });
      }
    }
  }

  return posts;
}
