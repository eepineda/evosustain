import "dotenv/config";
import { db } from "./index";
import { settings, tickers, feeds, topics } from "./schema";

async function seed() {
  await db.insert(settings).values({ id: 1, paperName: "Evoford Journal", scoreThreshold: 4 }).onConflictDoNothing();

  await db.insert(tickers).values([
    { symbol: "EURUSD" }, { symbol: "DOP" }, { symbol: "SPY" }, { symbol: "NVDA" },
  ]).onConflictDoNothing();

  await db.insert(feeds).values([
    { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml", section: "local" },
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml", section: "local" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", section: "tech" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", section: "tech" },
    { name: "CNBC Economy", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", section: "finance" },
    { name: "MarketWatch Top Stories", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", section: "finance" },
    { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", section: "sports" },
  ]).onConflictDoNothing();

  await db.insert(topics).values([
    { keyword: "República Dominicana", section: "equities" },
    { keyword: "Dominican Republic", section: "equities" },
    { keyword: "Santo Domingo", section: "equities" },
    { keyword: "Caribe", section: "local" },
    { keyword: "Latinoamérica", section: "finance" },
    { keyword: "Latin America", section: "finance" },
    { keyword: "economía dominicana", section: "finance" },
    { keyword: "remesas", section: "finance" },
    { keyword: "turismo", section: "finance" },
    { keyword: "FAO", section: "local" },
    { keyword: "alimentación", section: "local" },
    { keyword: "agricultura", section: "local" },
    { keyword: "climate", section: "local" },
    { keyword: "AI", section: "tech" },
    { keyword: "artificial intelligence", section: "tech" },
    { keyword: "technology", section: "tech" },
    { keyword: "London", section: "local" },
    { keyword: "Caribbean", section: "local" },
    { keyword: "health", section: "fitness" },
    { keyword: "science", section: "fitness" },
    { keyword: "world", section: "sports" },
  ]).onConflictDoNothing();

  console.log("Evoford Journal seed complete.");
  process.exit(0);
}
seed();