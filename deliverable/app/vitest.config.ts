import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration test files share the same Postgres tables
    fileParallelism: false,
    // Dedicated test database so `npm test` never wipes the dev seed data.
    // dotenv (import "dotenv/config" in tests) does not override existing vars,
    // so this value wins. Created via: CREATE DATABASE newspaper_test + db:push:test.
    env: {
      DATABASE_URL: "postgres://newspaper:newspaper@localhost:5433/newspaper_test",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
