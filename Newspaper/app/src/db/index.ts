import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set"); // fail loudly, not localhost fallback
}

const globalForDb = globalThis as unknown as { conn?: postgres.Sql };
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
