import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function pruneOldArticles(): Promise<void> {
  const now = Date.now();
  await db.delete(articles).where(lt(articles.fetchedAt, new Date(now - 30 * 24 * 3600 * 1000)));
  await db.delete(articles).where(
    and(eq(articles.status, "dismissed"), lt(articles.fetchedAt, new Date(now - 7 * 24 * 3600 * 1000))),
  );
}
