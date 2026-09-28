"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ingestionRuns } from "@/db/schema";

type LastRun = typeof ingestionRuns.$inferSelect | null;
type Settings = { paperName: string };
type Locale = "es" | "en";

const copy = {
  es: { updated: "Actualizado", refresh: "Actualizar", refreshing: "Actualizando…", settings: "Edición", sources: "Fuentes", briefing: "Briefing oficial", switch: "EN", location: "Londres · Santo Domingo · Latinoamérica" },
  en: { updated: "Updated", refresh: "Refresh", refreshing: "Refreshing…", settings: "Edition", sources: "Sources", briefing: "Official briefing", switch: "ES", location: "London · Santo Domingo · Latin America" },
};

function updatedLabel(finishedAt: Date | null, locale: Locale) {
  if (!finishedAt) return locale === "es" ? "sin datos" : "never";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(finishedAt).getTime()) / 60000));
  if (minutes < 1) return locale === "es" ? "ahora" : "just now";
  return locale === "es" ? `hace ${minutes} min` : `${minutes} min ago`;
}

export function Masthead({ settings, lastRun, dateLine, locale }: {
  settings: Settings; lastRun: LastRun; dateLine: string; locale: Locale;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [langPending, setLangPending] = useState(false);
  const t = copy[locale];

  async function refresh() {
    setPending(true);
    try { await fetch("/api/refresh", { method: "POST" }); router.refresh(); }
    finally { setPending(false); }
  }

  async function switchLanguage() {
    setLangPending(true);
    document.cookie = `evoford_lang=${locale === "es" ? "en" : "es"};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
    setTimeout(() => setLangPending(false), 300);
  }

  return (
    <header className="border-b-2 border-[#171714]">
      <div className="flex items-center justify-between border-b border-[#171714] bg-[#171714] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.16em] text-[#f7f4ec] sm:px-4">
        <span>Evoford Journal</span>
        <span className="hidden sm:inline">{t.location}</span>
        <span>{dateLine}</span>
      </div>

      <div className="py-5 sm:py-7">
        <Link href="/" className="block text-center">
          <h1 className="ej-masthead font-display text-5xl font-bold sm:text-6xl lg:text-7xl">
            Evoford <span className="font-normal italic text-[#1d5d4a]">Journal</span>
          </h1>
        </Link>
        <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[.24em] text-neutral-500 sm:text-[10px]">
          Independent reporting · intelligence · perspective
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#cfcac0] py-2 font-mono text-[10px] text-neutral-600 sm:justify-end">
        <span>{t.updated} {updatedLabel(lastRun?.finishedAt ?? null, locale)}</span>
        <button onClick={refresh} disabled={pending} className="underline underline-offset-2 disabled:no-underline">
          {pending ? t.refreshing : t.refresh}
        </button>
        <Link href="/settings" className="underline underline-offset-2">{t.settings}</Link>
        <Link href="/sources" className="underline underline-offset-2">{t.sources}</Link>
        <button onClick={switchLanguage} disabled={langPending} className="font-bold text-[#7b2018]">{t.switch}</button>
      </div>
    </header>
  );
}