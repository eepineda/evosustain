import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { readFileSync } from "fs";
import {
  mapCompanyNews,
  mapMarketNews,
  fetchCompanyNews,
  fetchMarketNews,
  fetchQuote,
} from "@/ingestion/fetchers/finnhub";

const company = JSON.parse(readFileSync("tests/fixtures/finnhub-company-news.json", "utf8"));
const market = JSON.parse(readFileSync("tests/fixtures/finnhub-market-news.json", "utf8"));

describe("finnhub mappers", () => {
  it("maps company news with ticker and equities section", () => {
    const arts = mapCompanyNews(company, "AAPL");
    expect(arts).toHaveLength(2);
    expect(arts[0]).toMatchObject({ sourceType: "finnhub", section: "equities", tickerSymbol: "AAPL" });
  });

  it("maps market news to finance section with no ticker", () => {
    const arts = mapMarketNews(market);
    expect(arts[0]).toMatchObject({ section: "finance", tickerSymbol: null });
  });

  it("skips entries without url", () => {
    expect(mapCompanyNews([{ ...company[0], url: "" }], "AAPL")).toHaveLength(0);
  });
});

describe("finnhub fetchers (mocked fetch)", () => {
  const ORIGINAL_KEY = process.env.FINNHUB_API_KEY;

  beforeEach(() => {
    process.env.FINNHUB_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.FINNHUB_API_KEY = ORIGINAL_KEY;
  });

  describe("fetchQuote", () => {
    it("returns price and dayChangePct on a valid quote", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ c: 227.4, dp: 1.2 }) }),
      );

      const quote = await fetchQuote("AAPL");
      expect(quote).toEqual({ price: 227.4, dayChangePct: 1.2 });
    });

    it("returns null when c is 0 (unknown symbol)", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ c: 0, dp: null }) }));

      const quote = await fetchQuote("NOTREAL");
      expect(quote).toBeNull();
    });

    it("maps a null dp to dayChangePct 0", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ c: 50, dp: null }) }),
      );

      const quote = await fetchQuote("XYZ");
      expect(quote).toEqual({ price: 50, dayChangePct: 0 });
    });

    it("includes the auth token in the request URL", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ c: 10, dp: 0 }) });
      vi.stubGlobal("fetch", fetchMock);

      await fetchQuote("AAPL");

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("token=test-key");
      expect(url).toContain("symbol=AAPL");
    });
  });

  describe("fetchCompanyNews", () => {
    it("fetches and maps company news, hitting the correct URL", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => company });
      vi.stubGlobal("fetch", fetchMock);

      const articles = await fetchCompanyNews("AAPL");

      expect(articles).toHaveLength(2);
      expect(articles.every((a) => a.sourceType === "finnhub" && a.tickerSymbol === "AAPL")).toBe(true);

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("symbol=AAPL");
      expect(url).toContain("from=");
      expect(url).toContain("to=");
      expect(url).toContain("token=test-key");
    });

    it("throws with HTTP status when response is not OK", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

      await expect(fetchCompanyNews("AAPL")).rejects.toThrow(/HTTP/);
    });
  });

  describe("fetchMarketNews", () => {
    it("fetches and maps general market news", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => market });
      vi.stubGlobal("fetch", fetchMock);

      const articles = await fetchMarketNews();

      expect(articles).toHaveLength(2);
      expect(articles.every((a) => a.section === "finance" && a.tickerSymbol === null)).toBe(true);

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("category=general");
      expect(url).toContain("token=test-key");
    });

    it("throws with HTTP status when response is not OK", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

      await expect(fetchMarketNews()).rejects.toThrow(/HTTP/);
    });
  });
});
