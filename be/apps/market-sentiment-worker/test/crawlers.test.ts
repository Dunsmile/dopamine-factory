import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseDcinsideDetailHtml, parseDcinsideListHtml } from "../src/crawlers/dcinside";
import { parseFmkoreaDetailHtml, parseFmkoreaListHtml } from "../src/crawlers/fmkorea";

const fixture = (path: string) =>
  readFileSync(new URL(`./fixtures/${path}`, import.meta.url), "utf-8");

describe("crawler parsers", () => {
  it("parses modern dcinside list markup", () => {
    const html = `
      <table>
        <tbody>
          <tr class="ub-content us-post" data-no="123">
            <td class="gall_num">123</td>
            <td class="gall_tit ub-word">
              <a href="/board/view/?id=neostock&no=123&page=1">
                <em class="icon_img icon_pic"></em>현대제철 당진공장 폐쇄
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const posts = parseDcinsideListHtml(html, "stock");
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toContain("/board/view/?id=neostock&no=123");
    expect(posts[0].title).toContain("현대제철");
  });

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

  it("parses modern fmkorea list markup", () => {
    const html = `
      <table class="bd_lst bd_tb_lst bd_tb">
        <tbody>
          <tr>
            <td class="title hotdeal_var8">
              <a href="/9481303194">몸이 안좋아지는거같다 진짜</a>
              <a href="/index.php?mid=coin&document_srl=9481303194#comment" class="replyNum">1</a>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const posts = parseFmkoreaListHtml(html, "coin", "https://www.fmkorea.com");
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toBe("https://www.fmkorea.com/9481303194");
    expect(posts[0].title).toContain("몸이 안좋아지는거같다 진짜");
  });
});
