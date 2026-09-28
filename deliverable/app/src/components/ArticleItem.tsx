"use client";

import { useRouter } from "next/navigation";
import type { Article } from "@/lib/queries";

export function ArticleItem({ article, lead = false }: { article: Article; lead?: boolean }) {
  const router = useRouter();

  async function setStatus(status: "read" | "dismissed") {
    await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <article className={`group relative ${article.status === "read" ? "opacity-50" : ""}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setStatus("read")}
        className="block"
      >
        <h3 className={`font-display font-bold leading-snug hover:underline ${lead ? "text-3xl" : "text-base"}`}>
          {article.title}
        </h3>
        {article.summary && (
          <p className={`mt-1 text-neutral-600 ${lead ? "text-sm" : "line-clamp-2 text-[13px] leading-snug"}`}>
            {article.summary}
          </p>
        )}
        {lead && article.scoreReason && (
          <p className="mt-1 text-sm italic text-neutral-500">{article.scoreReason}</p>
        )}
      </a>
      <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-neutral-500">
        {article.tickerSymbol && <span className="font-bold text-[#8b0000]">{article.tickerSymbol}</span>}
        <span>{article.source}</span>
        {article.score === null && <span className="rounded border px-1">unscored</span>}
        <button
          onClick={() => setStatus("dismissed")}
          aria-label="Dismiss article"
          // opacity (not visibility) keeps the button tabbable for keyboard users;
          // always shown below lg since touch devices have no hover
          className="cursor-pointer text-neutral-400 hover:text-[#8b0000] lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
        >
          ×
        </button>
      </div>
    </article>
  );
}
