import type { Article } from "@/lib/queries";
import { ArticleItem } from "./ArticleItem";

export function SectionBlock({ title, articles, newCount }: {
  title: string; articles: Article[]; newCount: number;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-[#1a1a1a] pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b0000]">
        {title}
        {newCount > 0 && <span className="ml-2 font-mono text-neutral-500">{newCount} new</span>}
      </h2>
      {articles.length === 0 ? (
        <p className="text-sm italic text-neutral-400">Nothing new in {title}.</p>
      ) : (
        <div className="space-y-3 divide-y divide-[#ddd] [&>*+*]:pt-3">
          {articles.map((a) => <ArticleItem key={a.id} article={a} />)}
        </div>
      )}
    </section>
  );
}
