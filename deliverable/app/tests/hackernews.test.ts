import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "fs";
import { filterHnItems, fetchHackerNews } from "@/ingestion/fetchers/hackernews";

const items = JSON.parse(readFileSync("tests/fixtures/hn-items.json", "utf8"));
const topicRows = [
  { keyword: "AI", section: "tech" as const },
  { keyword: "Python", section: "tech" as const },
];

describe("filterHnItems", () => {
  it("keeps only items matching a topic keyword and having a url", () => {
    const articles = filterHnItems(items, topicRows);
    expect(articles).toHaveLength(2);
    expect(articles.every((a) => a.sourceType === "hn")).toBe(true);
    expect(articles.every((a) => a.section === "tech")).toBe(true);
  });

  it("matches keywords case-insensitively", () => {
    const articles = filterHnItems(
      [{ id: 1, title: "the future of ai agents", url: "https://x.com/a", time: 1720500000 }],
      topicRows,
    );
    expect(articles).toHaveLength(1);
  });

  it("skips items with no title", () => {
    const articles = filterHnItems(
      [{ id: 2, url: "https://x.com/b", time: 1720500000 }],
      topicRows,
    );
    expect(articles).toHaveLength(0);
  });
});

describe("fetchHackerNews", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches topstories and item details, returning only filtered results", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("topstories.json")) {
        return Promise.resolve({ ok: true, json: async () => [41234567, 41234568, 41234569, 41234570] });
      }
      const id = Number(url.match(/item\/(\d+)\.json/)?.[1]);
      const item = items.find((i: { id: number }) => i.id === id);
      return Promise.resolve({ ok: true, json: async () => item });
    });
    vi.stubGlobal("fetch", fetchMock);

    const articles = await fetchHackerNews(topicRows);

    expect(articles).toHaveLength(2);
    expect(articles.every((a) => a.sourceType === "hn")).toBe(true);
  });

  it("throws with HTTP status when topstories fetch is not OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchHackerNews(topicRows)).rejects.toThrow(/HTTP/);
  });

  it("skips an item when its individual fetch is not OK, keeping others", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("topstories.json")) {
        return Promise.resolve({ ok: true, json: async () => [1, 2] });
      }
      if (url.includes("item/1.json")) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 2,
          title: "New AI model beats benchmarks",
          url: "https://example.com/ai",
          time: 1720400000,
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const articles = await fetchHackerNews(topicRows);
    expect(articles).toHaveLength(1);
    expect(articles[0].url).toBe("https://example.com/ai");
  });

  it("survives an item fetch that rejects (network error), keeping others", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("topstories.json")) {
        return Promise.resolve({ ok: true, json: async () => [1, 2] });
      }
      if (url.includes("item/1.json")) {
        return Promise.reject(new Error("socket hang up"));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 2,
          title: "New AI model beats benchmarks",
          url: "https://example.com/ai",
          time: 1720400000,
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const articles = await fetchHackerNews(topicRows);
    expect(articles).toHaveLength(1);
    expect(articles[0].url).toBe("https://example.com/ai");
  });
});
