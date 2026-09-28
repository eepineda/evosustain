const sources = [
  { name: "FAO · República Dominicana", type: "UN / OFFICIAL", url: "https://www.fao.org/republica-dominicana/es/", es: "Noticias, programas y publicaciones de FAO en República Dominicana.", en: "News, programmes and publications from FAO in the Dominican Republic." },
  { name: "Banco Central de la República Dominicana", type: "OFFICIAL", url: "https://www.bancentral.gov.do/", es: "Indicadores, estadísticas, política monetaria y sala de prensa.", en: "Indicators, statistics, monetary policy and newsroom." },
  { name: "Presidencia de la República Dominicana", type: "OFFICIAL", url: "https://presidencia.gob.do/noticias", es: "Comunicaciones y publicaciones institucionales del Gobierno dominicano.", en: "Institutional communications and publications from the Dominican Government." },
  { name: "Oficina Nacional de Estadística", type: "OFFICIAL", url: "https://www.one.gob.do/", es: "Estadísticas oficiales para contextualizar la actualidad dominicana.", en: "Official statistics for context on Dominican affairs." },
];

export function OfficialBriefing({ locale }: { locale: "es" | "en" }) {
  return (
    <section className="mt-8 border-y-2 border-[#171714]">
      <div className="flex items-end justify-between gap-4 border-b border-[#cfcac0] py-3">
        <div>
          <div className="ej-kicker text-[#1d5d4a]">{locale === "es" ? "FUENTES OFICIALES" : "OFFICIAL SOURCES"}</div>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            {locale === "es" ? "Official-source briefing" : "Official-source briefing"}
          </h2>
        </div>
        <span className="hidden font-mono text-[9px] uppercase tracking-[.16em] text-neutral-500 sm:block">
          {locale === "es" ? "Origen identificado · enlace original" : "Identified origin · original link"}
        </span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-[#cfcac0] md:grid-cols-2 md:divide-x md:divide-y-0">
        {sources.map((s) => (
          <article key={s.name} className="p-4 first:md:pr-7 md:even:pl-7">
            <div className="ej-kicker text-[#7b2018]">{s.type}</div>
            <h3 className="mt-2 font-display text-2xl font-bold leading-tight">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a>
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">{locale === "es" ? s.es : s.en}</p>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-[10px] font-semibold uppercase tracking-[.12em] underline underline-offset-2">
              {locale === "es" ? "Fuente original →" : "Original source →"}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}