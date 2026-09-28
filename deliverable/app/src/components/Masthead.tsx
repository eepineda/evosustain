"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ingestionRuns } from "@/db/schema";

type LastRun = typeof ingestionRuns.$inferSelect | null;
type Settings = { paperName: string };

function updatedLabel(finishedAt: Date | null) {
  if (!finishedAt) return "never";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(finishedAt).getTime()) / 60000));
  if (minutes < 1) return "just now / ahora";
  return `${minutes} min ago / hace ${minutes} min`;
}

export function Masthead({
  settings,
  lastRun,
  dateLine,
}: {
  settings: Settings;
  lastRun: LastRun;
  dateLine: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function refresh() {
    setPending(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <header className="border-b-2 border-[#1a1a1a] pb-3 lg:pb-4">
      <div className="border-b border-[#1a1a1a] pb-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-600">LONDON · SANTO DOMINGO · LATIN AMERICA</div>
      <h1 className="text-center font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {settings.paperName}
      </h1>
      <p className="mt-1 text-center font-mono text-[11px] text-neutral-600 sm:text-xs">{dateLine}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-600 lg:justify-end lg:gap-3">
        <span className="py-1">
          Actualizado / Updated {updatedLabel(lastRun?.finishedAt ?? null)}
          {lastRun?.error && (
            <span className="ml-1 cursor-help text-[#8b0000]" title={lastRun.error}>
              ⚠
            </span>
          )}
        </span>
        <button
          onClick={refresh}
          disabled={pending}
          className="cursor-pointer py-1 underline hover:text-[#1a1a1a] disabled:cursor-default disabled:no-underline disabled:text-neutral-400"
        >
          {pending ? "Refreshing…" : "Refresh"}
        </button>
        <Link href="/sources" className="py-1 underline hover:text-[#1a1a1a]">Sources / Fuentes</Link>
        <Link href="/editor" className="py-1 underline hover:text-[#1a1a1a]">
          Settings
        </Link>
      </div>
    </header>
  );
}
