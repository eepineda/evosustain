"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { feeds, tickers, topics } from "@/db/schema";
import type { Article } from "@/lib/queries";

type Settings = { paperSource / Fuente: string; scoreThreshold: number };
type Ticker = typeof tickers.$inferSelect;
type Feed = typeof feeds.$inferSelect;
type Topic = typeof topics.$inferSelect;

const SECTIONS = ["equities", "finance", "tech", "local", "fitness", "sports"] as const;
const SECTION_LABELS: Record<(typeof SECTIONS)[number], string> = { equities: "Latinoamérica / Mundo", finance: "Economía", tech: "Tecnología", local: "República Dominicana", fitness: "Sociedad / Ciencia", sports: "Deportes" };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#1a1a1a] pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b0000]">
      {children}
    </h2>
  );
}

const inputClasses =
  "border border-[#ddd] bg-[#FCFBF7] px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a1a1a]";
const buttonClasses =
  "cursor-pointer border border-[#1a1a1a] px-2 py-1 text-xs font-bold uppercase tracking-wide hover:bg-[#1a1a1a] hover:text-[#FCFBF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a1a1a]";
const deleteClasses =
  "cursor-pointer text-neutral-400 hover:text-[#8b0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b0000]";

export function SettingsClient({
  settings,
  tickers,
  feeds,
  topics,
  filteredToday,
  totals,
}: {
  settings: Settings;
  tickers: Ticker[];
  feeds: Feed[];
  topics: Topic[];
  filteredToday: Article[];
  totals: { fetched: number; kept: number };
}) {
  const router = useRouter();

  const [paperName, setPaperName] = useState(settings.paperName);
  const [scoreThreshold, setScoreThreshold] = useState(settings.scoreThreshold);

  const [newTicker, setNewTicker] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedSection, setNewFeedSection] = useState<(typeof SECTIONS)[number]>("tech");
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedPending, setFeedPending] = useState(false);
  const [newTopicKeyword, setNewTopicKeyword] = useState("");
  const [newTopicSection, setNewTopicSection] = useState<(typeof SECTIONS)[number]>("tech");

  async function patchSettings(patch: Partial<Settings>) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function addTicker(e: React.FormEvent) {
    e.preventDefault();
    if (!newTicker.trim()) return;
    await fetch("/api/tickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: newTicker.trim() }),
    });
    setNewTicker("");
    router.refresh();
  }

  async function deleteTicker(id: number) {
    await fetch(`/api/tickers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function addFeed(e: React.FormEvent) {
    e.preventDefault();
    if (feedPending) return; // Enter-key submits bypass the disabled button
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;
    setFeedPending(true);
    setFeedError(null);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFeedName.trim(), url: newFeedUrl.trim(), section: newFeedSection }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFeedError(body.error ?? "Failed to add feed");
        return;
      }
      setNewFeedName("");
      setNewFeedUrl("");
      router.refresh();
    } finally {
      setFeedPending(false);
    }
  }

  async function deleteFeed(id: number) {
    await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleFeed(id: number, enabled: boolean) {
    await fetch(`/api/feeds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    router.refresh();
  }

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopicKeyword.trim()) return;
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: newTopicKeyword.trim(), section: newTopicSection }),
    });
    setNewTopicKeyword("");
    router.refresh();
  }

  async function deleteTopic(id: number) {
    await fetch(`/api/topics/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleTopic(id: number, enabled: boolean) {
    await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-[#1a1a1a] pb-4">
        <Link href="/" className="text-xs underline hover:text-[#1a1a1a]">
          ← Front page
        </Link>
        <h1 className="mt-2 font-display text-4xl font-bold">Editorial Settings / Configuración</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">Añade fuentes RSS, activa/desactiva feeds, define temas y revisa qué noticias fueron filtradas. Para escribir una noticia propia usa Editorial Desk.</p>
      </header>

      {/* Paper */}
      <section>
        <SectionHeading>Paper</SectionHeading>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-neutral-600">Paper name</span>
            <input
              className={`${inputClasses} w-64`}
              value={paperName}
              onChange={(e) => setPaperName(e.target.value)}
              onBlur={() => {
                if (paperName.trim() && paperName !== settings.paperName) {
                  patchSettings({ paperName: paperName.trim() });
                }
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-neutral-600">
              Score threshold: <span className="font-mono font-bold">{scoreThreshold}</span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={scoreThreshold}
              onChange={(e) => setScoreThreshold(Number(e.target.value))}
              onMouseUp={() => patchSettings({ scoreThreshold })}
              onKeyUp={() => patchSettings({ scoreThreshold })}
              className="w-64 cursor-pointer accent-[#8b0000]"
            />
          </label>
        </div>
      </section>

      {/* Tickers */}
      <section>
        <SectionHeading>Tickers</SectionHeading>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#ddd]">
            {tickers.map((t) => (
              <tr key={t.id}>
                <td className="py-1.5 pr-2 font-mono font-bold">{t.symbol}</td>
                <td className="py-1.5 pr-2 font-mono text-neutral-600">
                  {t.price !== null ? t.price.toFixed(2) : "—"}
                </td>
                <td className="w-6 py-1.5 text-right">
                  <button
                    aria-label={`Delete ${t.symbol}`}
                    onClick={() => deleteTicker(t.id)}
                    className={deleteClasses}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {tickers.length === 0 && (
              <tr>
                <td colSpan={3} className="py-1.5 text-sm italic text-neutral-400">
                  No tickers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <form onSubmit={addTicker} className="mt-3 flex items-center gap-2">
          <input
            className={`${inputClasses} w-32 uppercase`}
            placeholder="SYMBOL"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          />
          <button type="submit" className={buttonClasses}>
            Add
          </button>
        </form>
      </section>

      {/* Feeds */}
      <section>
        <SectionHeading>Feeds</SectionHeading>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#ddd]">
            {feeds.map((f) => (
              <tr key={f.id}>
                <td className="py-1.5 pr-2">{f.name}</td>
                <td className="max-w-0 truncate py-1.5 pr-2 font-mono text-xs text-neutral-500">
                  {f.url}
                </td>
                <td className="py-1.5 pr-2 text-xs uppercase text-neutral-600">{SECTION_LABELS[f.section as (typeof SECTIONS)[number]] ?? f.section}</td>
                <td className="py-1.5 pr-2 text-center">
                  <input
                    type="checkbox"
                    checked={f.enabled}
                    onChange={(e) => toggleFeed(f.id, e.target.checked)}
                    className="cursor-pointer accent-[#8b0000]"
                    aria-label={`${f.enabled ? "Disable" : "Enable"} ${f.name}`}
                  />
                </td>
                <td className="w-6 py-1.5 text-right">
                  <button
                    aria-label={`Delete ${f.name}`}
                    onClick={() => deleteFeed(f.id)}
                    className={deleteClasses}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {feeds.length === 0 && (
              <tr>
                <td colSpan={5} className="py-1.5 text-sm italic text-neutral-400">
                  No feeds yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <form onSubmit={addFeed} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className={`${inputClasses} w-40`}
            placeholder="Name"
            value={newFeedName}
            onChange={(e) => setNewFeedName(e.target.value)}
          />
          <input
            className={`${inputClasses} w-64`}
            placeholder="https://example.com/feed.xml"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
          />
          <select
            className={inputClasses}
            value={newFeedSection}
            onChange={(e) => setNewFeedSection(e.target.value as (typeof SECTIONS)[number])}
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {SECTION_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" disabled={feedPending} className={buttonClasses}>
            {feedPending ? "Testing…" : "Add"}
          </button>
          {feedError && <span className="text-xs text-[#8b0000]">{feedError}</span>}
        </form>
      </section>

      {/* Topics */}
      <section>
        <SectionHeading>Topics</SectionHeading>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#ddd]">
            {topics.map((t) => (
              <tr key={t.id}>
                <td className="py-1.5 pr-2">{t.keyword}</td>
                <td className="py-1.5 pr-2 text-xs uppercase text-neutral-600">{SECTION_LABELS[t.section as (typeof SECTIONS)[number]] ?? t.section}</td>
                <td className="py-1.5 pr-2 text-center">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => toggleTopic(t.id, e.target.checked)}
                    className="cursor-pointer accent-[#8b0000]"
                    aria-label={`${t.enabled ? "Disable" : "Enable"} ${t.keyword}`}
                  />
                </td>
                <td className="w-6 py-1.5 text-right">
                  <button
                    aria-label={`Delete ${t.keyword}`}
                    onClick={() => deleteTopic(t.id)}
                    className={deleteClasses}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {topics.length === 0 && (
              <tr>
                <td colSpan={4} className="py-1.5 text-sm italic text-neutral-400">
                  No topics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <form onSubmit={addTopic} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className={`${inputClasses} w-48`}
            placeholder="keyword"
            value={newTopicKeyword}
            onChange={(e) => setNewTopicKeyword(e.target.value)}
          />
          <select
            className={inputClasses}
            value={newTopicSection}
            onChange={(e) => setNewTopicSection(e.target.value as (typeof SECTIONS)[number])}
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {SECTION_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonClasses}>
            Add
          </button>
        </form>
      </section>

      {/* Curation audit */}
      <section>
        <SectionHeading>Curation audit</SectionHeading>
        <p className="font-mono text-sm">
          {totals.fetched} fetched, {totals.kept} kept today
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm underline">
            Filtered today ({filteredToday.length})
          </summary>
          <ul className="mt-2 divide-y divide-[#ddd] text-sm">
            {filteredToday.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-1.5">
                <span>{a.title}</span>
                <span className="shrink-0 font-mono text-xs text-neutral-500">
                  {a.score ?? "—"} · {a.scoreReason ?? "clickbait"}
                </span>
              </li>
            ))}
            {filteredToday.length === 0 && (
              <li className="py-1.5 text-sm italic text-neutral-400">Nothing filtered today.</li>
            )}
          </ul>
        </details>
      </section>
    </div>
  );
}
