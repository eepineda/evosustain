import "dotenv/config";
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { pruneOldArticles } from "@/ingestion/retention";

const DAY = 24 * 3600 * 1000;

function art(over: Partial<typeof articles.$inferInsert>): typeof articles.$inferInsert {
  return {
    url: `https://x.com/${Math.random()}`,
    urlHash: "h",
    title: "T",
    source: "S",
    sourceType: "rss",
    section: "tech",
    publishedAt: new Date(),
    ...over,
  };
}

describe("pruneOldArticles", () => {
  beforeEach(async () => {
    await db.delete(articles);
  });

  it("deletes >30d articles and >7d dismissed ones, keeps the rest", async () => {
    await db.insert(articles).values([
      art({ title: "fresh", fetchedAt: new Date() }),
      art({ title: "old-31d", fetchedAt: new Date(Date.now() - 31 * DAY) }),
      art({ title: "dismissed-8d", status: "dismissed", fetchedAt: new Date(Date.now() - 8 * DAY) }),
      art({ title: "dismissed-fresh", status: "dismissed", fetchedAt: new Date() }),
      art({ title: "read-20d", status: "read", fetchedAt: new Date(Date.now() - 20 * DAY) }),
    ]);

    await pruneOldArticles();

    const titles = (await db.select().from(articles)).map((a) => a.title).sort();
    expect(titles).toEqual(["dismissed-fresh", "fresh", "read-20d"]);
  });
});
