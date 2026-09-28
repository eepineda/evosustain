import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "fs";
import { parseRssXml, fetchRssFeed } from "@/ingestion/fetchers/rss";

const xml = readFileSync("tests/fixtures/rss-sample.xml", "utf8");

describe("parseRssXml", () => {
  it("maps items to RawArticle", async () => {
    const articles = await parseRssXml(xml, { name: "Test Feed", section: "tech" });
    expect(articles).toHaveLength(2);
    expect(articles[0]).toMatchObject({
      sourceType: "rss",
      source: "Test Feed",
      section: "tech",
      tickerSymbol: null,
      title: "First Article",
      summary: "Summary of the first article.",
    });
    expect(articles[0].url).toMatch(/^https?:\/\//);
    expect(articles[0].publishedAt).toBeInstanceOf(Date);
  });

  it("skips items without a link", async () => {
    const broken = xml.replace(/<link>.*?<\/link>/, "");
    const articles = await parseRssXml(broken, { name: "Test Feed", section: "tech" });
    expect(articles).toHaveLength(1);
  });

  it("falls back to now when an item has no pubDate", async () => {
    const noDate = xml.replace(/<pubDate>.*?<\/pubDate>/, "");
    const articles = await parseRssXml(noDate, { name: "Test Feed", section: "tech" });
    expect(articles).toHaveLength(2);
    const published = articles[0].publishedAt;
    expect(published).toBeInstanceOf(Date);
    expect(Number.isNaN(published.getTime())).toBe(false);
    expect(Math.abs(Date.now() - published.getTime())).toBeLessThan(5_000);
  });
});

describe("fetchRssFeed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and parses a feed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => xml });
    vi.stubGlobal("fetch", fetchMock);

    const articles = await fetchRssFeed({
      name: "Test Feed",
      url: "https://example.com/feed.xml",
      section: "tech",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.com/feed.xml");
    expect(articles).toHaveLength(2);
    expect(articles[0]).toMatchObject({ source: "Test Feed", sourceType: "rss" });
  });

  it("throws on non-OK HTTP responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(
      fetchRssFeed({ name: "Test Feed", url: "https://example.com/feed.xml", section: "tech" }),
    ).rejects.toThrow(/Test Feed.*HTTP 500/);
  });
});
