import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export const dynamic = "force-dynamic";
export default async function EditorialArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = `/editorial/${slug}`;
  const [article] = await db.select().from(articles).where(eq(articles.url, url)).limit(1);
  if (!article) return <main className="mx-auto max-w-3xl px-4 py-12"><p>Article not found.</p><Link href="/" className="underline">Back / Volver</Link></main>;
  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12"><Link href="/" className="font-mono text-xs underline">← Evoford Journal</Link><article className="mt-10"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8b0000]">Original / Original</p><h1 className="mt-3 font-display text-5xl font-bold leading-none sm:text-7xl">{article.title}</h1>{article.summary && <p className="mt-5 max-w-2xl text-xl leading-relaxed text-neutral-600">{article.summary}</p>}<div className="mt-6 border-y border-[#aaa] py-2 font-mono text-[10px] uppercase tracking-widest">{article.source} · {new Date(article.publishedAt).toLocaleDateString("es-ES")}</div><div className="prose prose-lg mt-10 max-w-2xl"><p>{article.summary || "Evoford Journal original publication."}</p></div></article></main>;
}
