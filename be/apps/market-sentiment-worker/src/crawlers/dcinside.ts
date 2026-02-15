import type { AssetType } from "../types";

export interface DcinsideListPost {
  source: "dcinside";
  boardType: AssetType;
  title: string;
  url: string;
}

export interface DcinsideDetail {
  title: string;
  body: string;
  postedAt: string | null;
}

const USER_AGENT = "DopaminMarketSentimentBot/1.0";
const BASE_URL = "https://gall.dcinside.com";

function parseDate(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/\./g, "-");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseDcinsideListHtml(html: string, boardType: AssetType): DcinsideListPost[] {
  const posts: DcinsideListPost[] = [];
  const rowMatches = html.matchAll(/<tr[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const [, rowClass = "", rowHtml = ""] of rowMatches) {
    if (rowClass.includes("notice")) {
      continue;
    }

    const linkMatch = rowHtml.match(/<td[^>]*class="gall_tit"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) {
      continue;
    }

    const rawHref = linkMatch[1];
    const rawTitle = linkMatch[2].replace(/<[^>]+>/g, "").trim();
    if (!rawHref || !rawTitle) {
      continue;
    }

    const url = rawHref.startsWith("http") ? rawHref : `${BASE_URL}${rawHref.startsWith("/") ? "" : "/"}${rawHref}`;
    posts.push({
      source: "dcinside",
      boardType,
      title: rawTitle,
      url,
    });
  }

  return posts;
}

export function parseDcinsideDetailHtml(html: string): DcinsideDetail {
  const titleMatch = html.match(/<span[^>]*class="title_subject"[^>]*>([\s\S]*?)<\/span>/i)
    || html.match(/<h3[^>]*class="title"[^>]*>([\s\S]*?)<\/h3>/i);

  const bodyMatch = html.match(/<div[^>]*(?:id="write_div"|class="write_div"|class="gallview_contents")[^>]*>([\s\S]*?)<\/div>/i);
  const dateMatch = html.match(/<span[^>]*class="gall_date"[^>]*title="([^"]+)"/i);

  const title = (titleMatch?.[1] || "").replace(/<[^>]+>/g, "").trim();
  const body = (bodyMatch?.[1] || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s+\n/g, "\n")
    .trim();

  return {
    title,
    body,
    postedAt: parseDate(dateMatch?.[1] || null),
  };
}

export async function fetchDcinsideList(
  gallId: string,
  boardType: AssetType,
  limit: number,
  fetcher: typeof fetch = fetch
): Promise<DcinsideListPost[]> {
  if (!gallId) {
    return [];
  }

  const url = `${BASE_URL}/board/lists/?id=${encodeURIComponent(gallId)}`;
  const resp = await fetcher(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resp.ok) {
    return [];
  }

  const html = await resp.text();
  return parseDcinsideListHtml(html, boardType).slice(0, limit);
}

export async function fetchDcinsideDetail(url: string, fetcher: typeof fetch = fetch): Promise<DcinsideDetail | null> {
  const resp = await fetcher(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resp.ok) {
    return null;
  }

  const html = await resp.text();
  const parsed = parseDcinsideDetailHtml(html);
  if (!parsed.title && !parsed.body) {
    return null;
  }
  return parsed;
}
