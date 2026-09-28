import cron from "node-cron";

let started = false;

export function startScheduler() {
  if (started) return; // defense-in-depth: don't register cron jobs twice
  started = true;

  // Lazy-import so instrumentation doesn't pull the db at build time
  const run = async (mode: "fast" | "full") => {
    const { runIngestion } = await import("./ingestion/run");
    await runIngestion(mode).catch((e) => console.error("[ingestion]", e));
  };

  cron.schedule("*/15 * * * *", () => run("fast")); // finnhub + quotes
  cron.schedule("5 * * * *", () => run("full")); // everything, at :05
  console.log("[scheduler] started (fast: */15m, full: hourly)");

  // First run shortly after boot so a fresh deploy has content
  setTimeout(() => run("full"), 10_000);
}
