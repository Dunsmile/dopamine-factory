import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseDcinsideDetailHtml, parseDcinsideListHtml } from "../src/crawlers/dcinside";
import { parseFmkoreaDetailHtml, parseFmkoreaListHtml } from "../src/crawlers/fmkorea";

const fixture = (path: string) =>
  readFileSync(new URL(`./fixtures/${path}`, import.meta.url), "utf-8");

describe("crawler parsers", () => {
  it("parses dcinside list and skips notice", () => {
    const html = fixture("dcinside/list.html");
    const posts = parseDcinsideListHtml(html, "coin");

    expect(posts).toHaveLength(2);
    expect(posts[0].url).toContain("/board/view/");
    expect(posts[0].title).toContain("비트코인");
  });

  it("parses dcinside detail page", () => {
    const html = fixture("dcinside/detail.html");
    const post = parseDcinsideDetailHtml(html);

    expect(post.title).toBe("비트코인 급등 신호인가");
    expect(post.body).toContain("불장 시작");
    expect(post.postedAt).toBeTruthy();
  });

  it("parses fmkorea list and detail", () => {
    const list = parseFmkoreaListHtml(fixture("fmkorea/list.html"), "stock", "https://www.fmkorea.com");
    const detail = parseFmkoreaDetailHtml(fixture("fmkorea/detail.html"));

    expect(list).toHaveLength(2);
    expect(list[0].url).toBe("https://www.fmkorea.com/12345");
    expect(detail.title).toContain("삼성전자");
    expect(detail.body).toContain("반등");
  });
});
