import type { AssetType } from "../types";

export interface FmkoreaListPost {
  source: "fmkorea";
  boardType: AssetType;
  title: string;
  url: string;
}

export interface FmkoreaDetail {
  title: string;
  body: string;
  postedAt: string | null;
}

const USER_AGENT = "DopaminMarketSentimentBot/1.0";
const DEFAULT_BASE_URL = "https://www.fmkorea.com";

function buildListUrl(baseUrl: string, board: string): string {
  if (board.startsWith("http")) return board;
  if (board.startsWith("/")) return `${baseUrl}${board}`;
  if (board.includes("mid=")) return `${baseUrl}/index.php?${board}`;
  return `${baseUrl}/index.php?mid=${board}`;
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const normalized = raw.trim().replace(/\./g, "-");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseFmkoreaListHtml(html: string, boardType: AssetType, baseUrl: string = DEFAULT_BASE_URL): FmkoreaListPost[] {
  const posts: FmkoreaListPost[] = [];
  const linkMatches = html.matchAll(/<a[^>]*class="[^"]*hx[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);

  for (const [, href = "", rawTitle = ""] of linkMatches) {
    const title = rawTitle.replace(/<[^>]+>/g, "").trim();
    if (!href || !title) {
      continue;
    }

    const url = href.startsWith("http") ? href : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
    posts.push({
      source: "fmkorea",
      boardType,
      title,
      url,
    });
  }

  return posts;
}

export function parseFmkoreaDetailHtml(html: string): FmkoreaDetail {
  const titleMatch = html.match(/<h1[^>]*(?:class="np_18px"|class="rd_tit"|class="title")[^>]*>([\s\S]*?)<\/h1>/i);
  const bodyMatch = html.match(/<div[^>]*class="rd_body"[^>]*>([\s\S]*?)<\/div>/i);
  const dateMatch = html.match(/<span[^>]*(?:class="date"|class="rd_date")[^>]*>([\s\S]*?)<\/span>/i);

  const title = (titleMatch?.[1] || "").replace(/<[^>]+>/g, "").trim();
  const body = (bodyMatch?.[1] || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s+\n/g, "\n")
    .trim();
  const postedAt = parseDate((dateMatch?.[1] || "").replace(/<[^>]+>/g, "").trim());

  return { title, body, postedAt };
}

export async function fetchFmkoreaList(
  board: string,
  boardType: AssetType,
  limit: number,
  baseUrl: string = DEFAULT_BASE_URL,
  fetcher: typeof fetch = fetch
): Promise<FmkoreaListPost[]> {
  if (!board) {
    return [];
  }

  const url = buildListUrl(baseUrl, board);
  const resp = await fetcher(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resp.ok) {
    return [];
  }

  const html = await resp.text();
  return parseFmkoreaListHtml(html, boardType, baseUrl).slice(0, limit);
}

export async function fetchFmkoreaDetail(url: string, fetcher: typeof fetch = fetch): Promise<FmkoreaDetail | null> {
  const resp = await fetcher(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resp.ok) {
    return null;
  }

  const html = await resp.text();
  const parsed = parseFmkoreaDetailHtml(html);
  if (!parsed.title && !parsed.body) {
    return null;
  }
  return parsed;
}
