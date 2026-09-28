import type { tickers } from "@/db/schema";

type Ticker = typeof tickers.$inferSelect;

export function TickerStrip({ tickers }: { tickers: Ticker[] }) {
  const priced = tickers.filter((t) => t.price !== null);
  if (priced.length === 0) return null;

  return (
    <div className="overflow-x-auto whitespace-nowrap border-b border-[#ddd] py-1 font-mono text-xs">
      {priced.map((t, i) => {
        const up = (t.dayChangePct ?? 0) >= 0;
        return (
          <span key={t.symbol}>
            {i > 0 && <span className="mx-2 text-neutral-400">·</span>}
            <span className="font-bold">{t.symbol}</span>{" "}
            <span>{t.price!.toFixed(2)}</span>{" "}
            <span className={up ? "text-green-700" : "text-[#8b0000]"}>
              {up ? "▲" : "▼"}
              {Math.abs(t.dayChangePct ?? 0).toFixed(1)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}
