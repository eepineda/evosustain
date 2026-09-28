import type { Article } from "@/lib/queries";
import { ArticleItem } from "./ArticleItem";

export function SectionBlock({ title, articles, newCount }: {
  title: string; articles: Article[]; newCount: number;
}) {
  return (
    <section className="mb-7">
      <h2 className="mb-2 flex items-baseline justify-between border-b border-[#171714] pb-1 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#7b2018]">
        <span>{title}</span>
        {newCount > 0 && <span className="font-mono font-normal text-neutral-500">{newCount} new</span>}
      </h2>
      {articles.length === 0 ? (
        <p className="py-1 text-sm italic text-neutral-400">No new stories.</p>
      ) : (
        <div className="space-y-3 divide-y divide-[#cfcac0] [&>*+*]:pt-3">
          {articles.map((a) => <ArticleItem key={a.id} article={a} />)}
        </div>
      )}
    </section>
  );
}