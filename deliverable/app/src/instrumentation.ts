export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.ENABLE_SCHEDULER !== "false") {
    const { startScheduler } = await import("./scheduler");
    startScheduler();
  }
}
