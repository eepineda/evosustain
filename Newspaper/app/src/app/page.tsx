import { cookies } from "next/headers";
import { getFrontPage, touchLastVisit } from "@/lib/queries";
import { Masthead } from "@/components/Masthead";
import { TickerStrip } from "@/components/TickerStrip";
import { SectionBlock } from "@/components/SectionBlock";
import { ArticleItem } from "@/components/ArticleItem";
import { OfficialBriefing } from "@/components/OfficialBriefing";

export const dynamic = "force-dynamic";

type Locale = "es" | "en";

async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("evoford_lang")?.value;
  return value === "en" ? "en" : "es";
}

async function isOwner(): Promise<boolean> {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return true;
  const cookie = (await cookies()).get("newspaper_admin")?.value;
  const { sha256Hex } = await import("@/proxy");
  return cookie === (await sha256Hex(adminKey));
}

export default async function FrontPage() {
  const locale = await getLocale();
  const page = await getFrontPage();
  if (await isOwner()) await touchLastVisit();

  const dateLine = new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const labels = locale === "es" ? {
    front: "Primera plana", rd: "República Dominicana", latam: "Latinoamérica · Economía",
    tech: "Tecnología", london: "Londres · Caribe", society: "Sociedad · Ciencia", world: "Mundo",
    latest: "Últimas historias", editorial: "Periodismo independiente · inteligencia · perspectiva",
  } : {
    front: "Front page", rd: "Dominican Republic", latam: "Latin America · Business",
    tech: "Technology", london: "London · Caribbean", society: "Society · Science", world: "World",
    latest: "Latest stories", editorial: "Independent reporting · intelligence · perspective",
  };

  return (
    <main className="mx-auto w-full max-w-[1320px] px-3 py-0 sm:px-5 lg:px-7">
      <Masthead settings={page.settings} lastRun={page.lastRun} dateLine={dateLine} locale={locale} />
      <nav className="hidden border-b border-[#cfcac0] py-2.5 sm:flex sm:items-center sm:justify-center sm:gap-7 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
        <a href="#front" className="hover:text-[#7b2018]">{labels.front}</a>
        <a href="#rd" className="hover:text-[#7b2018]">{labels.rd}</a>
        <a href="#latam" className="hover:text-[#7b2018]">{labels.latam}</a>
        <a href="#tech" className="hover:text-[#7b2018]">{labels.tech}</a>
        <a href="#briefing" className="hover:text-[#7b2018]">{locale === "es" ? "Fuentes oficiales" : "Official sources"}</a>
      </nav>

      <div id="front" className="border-b border-[#171714] py-3 font-mono text-[10px] uppercase tracking-[.14em] text-neutral-500">
        <div className="flex justify-between gap-3"><span>{labels.editorial}</span><span className="hidden sm:inline">{labels.latest}</span></div>
      </div>

      <TickerStrip tickers={page.tickers} />

      <section className="border-b-2 border-[#171714] py-8 sm:py-10">
        <div className="max-w-5xl">
          <div className="ej-kicker text-[#1d5d4a]">EVOFORD JOURNAL · {locale === "es" ? "EDICIÓN INTERNACIONAL" : "INTERNATIONAL EDITION"}</div>
          <h2 className="mt-3 font-display text-[48px] font-bold leading-[.91] tracking-[-.04em] sm:text-6xl lg:text-8xl">
            {locale === "es" ? "El mundo dominicano y latino, con contexto." : "Dominican and Latin American life, with context."}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            {locale === "es"
              ? "Una portada construida desde Londres para lectores de República Dominicana, Latinoamérica y sus comunidades en el exterior."
              : "A London-based front page for readers across the Dominican Republic, Latin America and their communities abroad."}
          </p>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:divide-x lg:divide-[#cfcac0] lg:gap-0">
        <div className="lg:pr-7">
          <div id="rd" className="mb-6 border-b-2 border-[#171714] pb-5">
            <div className="ej-kicker text-[#7b2018]">{labels.rd}</div>
            {page.lead ? <div className="mt-3"><ArticleItem article={page.lead} lead /></div> :
              <div className="mt-3 font-display text-3xl font-bold">Evoford Journal</div>}
          </div>
          <SectionBlock title={labels.rd} articles={page.sections.equities} newCount={page.newCounts.equities} />
          <SectionBlock title={labels.latam} articles={page.sections.finance} newCount={page.newCounts.finance} />
        </div>

        <div id="tech" className="lg:px-7">
          <SectionBlock title={labels.tech} articles={page.sections.tech} newCount={page.newCounts.tech} />
          <SectionBlock title={labels.society} articles={page.sections.fitness} newCount={page.newCounts.fitness} />
          <section className="border-t-2 border-[#171714] pt-3">
            <div className="ej-kicker text-[#7b2018]">{locale === "es" ? "NOTA DEL EDITOR" : "EDITOR'S NOTE"}</div>
            <p className="mt-2 font-display text-2xl font-bold leading-tight">
              {locale === "es"
                ? "Historias verificables, fuentes visibles y espacio para el contexto."
                : "Verifiable stories, visible sources and room for context."}
            </p>
          </section>
        </div>

        <div className="lg:pl-7">
          <SectionBlock title={labels.london} articles={page.sections.local} newCount={page.newCounts.local} />
          <SectionBlock title={labels.world} articles={page.sections.sports} newCount={page.newCounts.sports} />
        </div>
      </div>

      <div id="latam">
        <OfficialBriefing locale={locale} />
      </div>

      <section className="my-9 border-y-2 border-[#171714] py-7 text-center">
        <div className="ej-kicker text-[#1d5d4a]">EVOFORD JOURNAL</div>
        <p className="mx-auto mt-2 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
          {locale === "es"
            ? "De Londres al Caribe. De la noticia al contexto."
            : "From London to the Caribbean. From news to context."}
        </p>
      </section>
    </main>
  );
}