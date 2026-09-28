import "dotenv/config";
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db";
import { articles, settings } from "@/db/schema";
import { getFrontPage, touchLastVisit, getFilteredToday } from "@/lib/queries";

function art(over: Record<string, unknown>) {
  return {
    url: `https://x.com/${Math.random()}`, urlHash: "h", title: "T", source: "S",
    sourceType: "rss" as const, section: "tech" as const,
    publishedAt: new Date(), fetchedAt: new Date(), // JS-supplied fetchedAt avoids DB/host clock-skew flakes
    ...over,
  };
}

describe("getFrontPage", () => {
  beforeEach(async () => {
    await db.delete(articles);
    await db.insert(settings).values({ id: 1, scoreThreshold: 5 })
      .onConflictDoUpdate({ target: settings.id, set: { scoreThreshold: 5, lastVisitAt: null } });
  });

  it("filters below-threshold, clickbait, and dismissed; keeps unscored", async () => {
    await db.insert(articles).values([
      // absorb-lead takes the lead slot (highest score, different section)
      // so keep-high stays inside sections.tech — the lead is excluded from sections.
      art({ title: "absorb-lead", score: 10, section: "finance" }),
      art({ title: "keep-high", score: 8 }),
      art({ title: "drop-low", score: 3 }),
      art({ title: "drop-clickbait", score: 9, clickbait: true }),
      art({ title: "drop-dismissed", score: 9, status: "dismissed" }),
      art({ title: "keep-unscored", score: null }),
    ]);
    const page = await getFrontPage();
    expect(page.lead?.title).toBe("absorb-lead");
    const titles = page.sections.tech.map((a) => a.title);
    expect(titles).toContain("keep-high");
    expect(titles).toContain("keep-unscored");
    expect(titles).not.toContain("drop-low");
    expect(titles).not.toContain("drop-clickbait");
    expect(titles).not.toContain("drop-dismissed");
  });

  it("computes newCounts against pre-update lastVisitAt", async () => {
    await db.insert(articles).values([art({ title: "new", score: 8 })]);
    const first = await getFrontPage(); // lastVisitAt was null → everything new
    expect(first.newCounts.tech).toBe(1);
    await touchLastVisit();
    const second = await getFrontPage();
    expect(second.newCounts.tech).toBe(0);
  });

  it("picks the highest-scored unread article as lead", async () => {
    await db.insert(articles).values([
      art({ title: "lead", score: 10, section: "finance" }),
      art({ title: "not-lead", score: 6 }),
    ]);
    const page = await getFrontPage();
    expect(page.lead?.title).toBe("lead");
  });
});

describe("getFilteredToday", () => {
  beforeEach(async () => {
    await db.delete(articles);
    await db.insert(settings).values({ id: 1, scoreThreshold: 5 })
      .onConflictDoUpdate({ target: settings.id, set: { scoreThreshold: 5, lastVisitAt: null } });
  });

  it("returns only clickbait and below-threshold articles fetched in the last 24h", async () => {
    await db.insert(articles).values([
      art({ title: "clickbait-one", score: 8, clickbait: true }),
      art({ title: "below-threshold", score: 2 }),
      art({ title: "keeper", score: 8 }),
    ]);
    const filtered = await getFilteredToday();
    const titles = filtered.map((a) => a.title).sort();
    expect(titles).toEqual(["below-threshold", "clickbait-one"]);
  });
});
