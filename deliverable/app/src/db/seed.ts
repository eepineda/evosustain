import "dotenv/config";
import { db } from "./index";
import { settings, tickers, feeds, topics } from "./schema";

async function seed() {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();

  await db.insert(tickers).values([
    { symbol: "BCRD" }, { symbol: "DXY" }, { symbol: "SPY" },
    { symbol: "NVDA" }, { symbol: "MSFT" }, { symbol: "GOOGL" },
  ]).onConflictDoNothing();

  // Sources with publicly documented RSS endpoints. Additional sources can be
  // added safely from /settings after testing the feed URL.
  await db.insert(feeds).values([
    { name: "Diario Libre · Portada", url: "https://www.diariolibre.com/rss/portada.xml", section: "local" },
    { name: "Diario Libre · Política", url: "https://www.diariolibre.com/rss/politica.xml", section: "local" },
    { name: "Diario Libre · Economía", url: "https://www.diariolibre.com/rss/economia.xml", section: "finance" },
    { name: "Diario Libre · Mundo", url: "https://www.diariolibre.com/rss/mundo.xml", section: "equities" },
    { name: "Diario Libre · Planeta", url: "https://www.diariolibre.com/rss/planeta.xml", section: "fitness" },
    { name: "Diario Libre · Deportes", url: "https://www.diariolibre.com/rss/deportes.xml", section: "sports" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", section: "tech" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", section: "tech" },
    { name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml", section: "sports" },
    { name: "BBC Tennis", url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml", section: "sports" },
  ]).onConflictDoNothing();

  await db.insert(topics).values([
    { keyword: "República Dominicana", section: "local" },
    { keyword: "Santo Domingo", section: "local" },
    { keyword: "Caribe", section: "local" },
    { keyword: "Latinoamérica", section: "equities" },
    { keyword: "América Latina", section: "equities" },
    { keyword: "Dominican Republic", section: "local" },
    { keyword: "economía dominicana", section: "finance" },
    { keyword: "Banco Central", section: "finance" },
    { keyword: "inflación", section: "finance" },
    { keyword: "turismo", section: "finance" },
    { keyword: "FAO", section: "fitness" },
    { keyword: "seguridad alimentaria", section: "fitness" },
    { keyword: "cambio climático", section: "fitness" },
    { keyword: "Londres", section: "local" },
    { keyword: "Caribbean", section: "local" },
    { keyword: "AI", section: "tech" },
    { keyword: "inteligencia artificial", section: "tech" },
    { keyword: "tecnología", section: "tech" },
    { keyword: "football", section: "sports" },
    { keyword: "tennis", section: "sports" },
  ]).onConflictDoNothing();

  console.log("Seeded.");
  process.exit(0);
}
seed();
