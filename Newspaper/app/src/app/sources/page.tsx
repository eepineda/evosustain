import Link from "next/link";

const sources = [
  ["FAO · República Dominicana", "Organización de las Naciones Unidas para la Alimentación y la Agricultura", "https://www.fao.org/republica-dominicana/es/"],
  ["Banco Central de la República Dominicana", "Indicadores, estadísticas, política monetaria y sala de prensa", "https://www.bancentral.gov.do/"],
  ["Presidencia de la República Dominicana", "Comunicaciones y publicaciones institucionales", "https://presidencia.gob.do/noticias"],
  ["Oficina Nacional de Estadística", "Estadísticas oficiales de República Dominicana", "https://www.one.gob.do/"],
  ["BBC Mundo", "Cobertura internacional en español", "https://www.bbc.com/mundo"],
  ["BBC News · Latin America", "International coverage of Latin America", "https://www.bbc.com/news/world/latin_america"],
];

export default function SourcesPage() {
  return <main className="mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-7 sm:py-8">
    <header className="border-b-2 border-[#171714] pb-5">
      <Link href="/" className="ej-kicker text-[#7b2018] hover:underline">← Evoford Journal</Link>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-[-.04em] sm:text-7xl">Source Desk</h1>
      <p className="mt-3 max-w-2xl text-base text-neutral-600">Fuentes institucionales y periodísticas de referencia. Cada historia automática debe conservar su origen y enlace.</p>
    </header>
    <div className="mt-6 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[#cfcac0]">
      {sources.map(([name,desc,url]) => <article key={name} className="border-b border-[#cfcac0] p-4 first:sm:pl-0 sm:odd:pr-7 sm:even:pl-7">
        <div className="ej-kicker text-[#1d5d4a]">SOURCE / FUENTE</div>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight"><a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">{name}</a></h2>
        <p className="mt-2 text-sm text-neutral-600">{desc}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[.12em] underline">Original →</a>
      </article>)}
    </div>
  </main>
}