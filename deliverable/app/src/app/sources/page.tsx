import Link from "next/link";

export const dynamic = "force-dynamic";

const sources = [
  ["FAO · República Dominicana", "https://www.fao.org/republica-dominicana/es/", "Organismo internacional · alimentación, agricultura, clima y desarrollo"],
  ["Banco Central de la República Dominicana", "https://www.bancentral.gov.do/", "Datos económicos, sala de prensa y comunicados de política monetaria"],
  ["Diario Libre · RSS", "https://www.diariolibre.com/servicios/rss", "Fuentes RSS por portada, política, actualidad, economía, mundo, planeta y deportes"],
  ["Listín Diario", "https://listindiario.com/", "Prensa dominicana · República, economía, mundo, cultura y deportes"],
];

export default function SourcesPage() {
  return <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
    <header className="border-b-2 border-[#1a1a1a] pb-5">
      <Link href="/" className="font-mono text-xs underline">← Front Page / Portada</Link>
      <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8b0000]">Source Desk · Fuentes</p>
      <h1 className="mt-2 font-display text-5xl font-bold sm:text-7xl">Fuentes / Sources</h1>
      <p className="mt-3 max-w-2xl text-neutral-600">Evoford distingue las fuentes institucionales y periodísticas de la voz editorial. Los feeds se pueden añadir, probar, activar o desactivar desde Settings.</p>
    </header>
    <div className="mt-8 divide-y divide-[#ccc] border-y border-[#1a1a1a]">
      {sources.map(([name, url, desc]) => <article key={url} className="grid gap-3 py-5 sm:grid-cols-[1fr_1.2fr]">
        <div><h2 className="font-display text-2xl font-bold">{name}</h2><a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[#8b0000] underline">Open source ↗</a></div>
        <p className="text-sm leading-relaxed text-neutral-600">{desc}</p>
      </article>)}
    </div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="border-t-2 border-[#1a1a1a] pt-3"><p className="font-mono text-[10px] uppercase tracking-widest text-[#8b0000]">Editorial principle</p><p className="mt-2 text-sm leading-relaxed">Titular y enlace original se mantienen identificados. Los resúmenes automáticos no se presentan como texto original de la fuente.</p></div>
      <div className="border-t-2 border-[#1a1a1a] pt-3"><p className="font-mono text-[10px] uppercase tracking-widest text-[#8b0000]">Automation</p><p className="mt-2 text-sm leading-relaxed">El motor RSS prueba el feed antes de guardarlo, evita duplicados y registra las ejecuciones para auditoría.</p></div>
    </div>
  </main>;
}
