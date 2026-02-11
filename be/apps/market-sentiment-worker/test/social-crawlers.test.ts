import { describe, expect, it, vi } from "vitest";

import { fetchRedditCommentPosts } from "../src/crawlers/reddit";
import { fetchYoutubeCommentPosts } from "../src/crawlers/youtube";

describe("social crawlers", () => {
  it("fetches youtube comments with video context", async () => {
    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/youtube/v3/search")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: { videoId: "video-1" },
                snippet: {
                  title: "비트코인 분석",
                  description: "하락장인가",
                },
              },
            ],
          }),
          { status: 200 }
        );
      }

      if (url.includes("/youtube/v3/commentThreads")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "comment-1",
                snippet: {
                  topLevelComment: {
                    snippet: {
                      textDisplay: "BTC 반등한다",
                      publishedAt: "2026-02-11T05:00:00.000Z",
                    },
                  },
                },
              },
            ],
          }),
          { status: 200 }
        );
      }

      return new Response("not-found", { status: 404 });
    });

    const posts = await fetchYoutubeCommentPosts(
      {
        YOUTUBE_API_KEY: "yt-key",
        YOUTUBE_SEARCH_QUERIES: "bitcoin",
        YOUTUBE_MAX_VIDEOS_PER_QUERY: "1",
        YOUTUBE_MAX_COMMENTS_PER_VIDEO: "1",
      },
      mockFetch as unknown as typeof fetch
    );

    expect(posts).toHaveLength(1);
    expect(posts[0].source).toBe("youtube");
    expect(posts[0].url).toContain("youtube.com/watch?v=video-1");
    expect(posts[0].body).toContain("BTC 반등한다");
  });

  it("fetches reddit comments from public json endpoint", async () => {
    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/r/stocks/comments.json")) {
        return new Response(
          JSON.stringify({
            data: {
              children: [
                {
                  data: {
                    body: "삼전은 장기적으로 우상향",
                    permalink: "/r/stocks/comments/abc123/thread/comment1/",
                    link_title: "KR stocks thread",
                    created_utc: 1770786000,
                  },
                },
              ],
            },
          }),
          { status: 200 }
        );
      }

      return new Response("not-found", { status: 404 });
    });

    const posts = await fetchRedditCommentPosts(
      {
        REDDIT_SUBREDDITS: "stocks",
        REDDIT_COMMENTS_PER_SUBREDDIT: "1",
        REDDIT_USER_AGENT: "dopamin-market-test/1.0",
      },
      mockFetch as unknown as typeof fetch
    );

    expect(posts).toHaveLength(1);
    expect(posts[0].source).toBe("reddit");
    expect(posts[0].title).toContain("KR stocks thread");
    expect(posts[0].body).toContain("삼전");
  });

  it("filters non-korean reddit comments by default", async () => {
    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/r/stocks/comments.json")) {
        return new Response(
          JSON.stringify({
            data: {
              children: [
                {
                  data: {
                    body: "I think this stock will go up",
                    permalink: "/r/stocks/comments/abc123/thread/comment1/",
                    link_title: "English thread",
                    created_utc: 1770786000,
                  },
                },
              ],
            },
          }),
          { status: 200 }
        );
      }
      return new Response("not-found", { status: 404 });
    });

    const posts = await fetchRedditCommentPosts(
      {
        REDDIT_SUBREDDITS: "stocks",
        REDDIT_COMMENTS_PER_SUBREDDIT: "1",
        REDDIT_USER_AGENT: "dopamin-market-test/1.0",
      },
      mockFetch as unknown as typeof fetch
    );

    expect(posts).toHaveLength(0);
  });
});
