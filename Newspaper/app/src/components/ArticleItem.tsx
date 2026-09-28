"use client";

import { useRouter } from "next/navigation";
import type { Article } from "@/lib/queries";

export function ArticleItem({ article, lead = false }: { article: Article; lead?: boolean }) {
  const router = useRouter();

  async function setStatus(status: "read" | "dismissed") {
    await fetch(`/api/articles/${article.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <article className={`group relative ${article.status === "read" ? "opacity-55" : ""}`}>
      <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => setStatus("read")} className="block">
        <h3 className={`font-display font-bold leading-[1.02] hover:underline ${lead ? "text-4xl sm:text-5xl" : "text-[22px]"}`}>
          {article.title}
        </h3>
        {article.summary && (
          <p className={`mt-2 text-neutral-600 ${lead ? "max-w-2xl text-base sm:text-lg" : "line-clamp-2 text-[14px] leading-snug"}`}>
            {article.summary}
          </p>
        )}
        {lead && article.scoreReason && <p className="mt-2 text-sm italic text-neutral-500">{article.scoreReason}</p>}
      </a>
      <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.05em] text-neutral-500">
        {article.tickerSymbol && <span className="font-bold text-[#7b2018]">{article.tickerSymbol}</span>}
        <span>{article.source}</span>
        <span>·</span>
        <span>{new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
        <button onClick={() => setStatus("dismissed")} aria-label="Dismiss article" className="ml-auto cursor-pointer text-neutral-400 lg:opacity-0 lg:group-hover:opacity-100">×</button>
      </div>
    </article>
  );
}