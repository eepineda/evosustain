import { cookies } from "next/headers";
import { getFrontPage, touchLastVisit } from "@/lib/queries";
import { sha256Hex } from "@/proxy";
import { Masthead } from "@/components/Masthead";
import { TickerStrip } from "@/components/TickerStrip";
import { SectionBlock } from "@/components/SectionBlock";
import { ArticleItem } from "@/components/ArticleItem";
import { Scoreboard } from "@/components/Scoreboard";

export const dynamic = "force-dynamic";

async function isOwner(): Promise<boolean> {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return true; // local dev: no key configured
  const cookie = (await cookies()).get("newspaper_admin")?.value;
  return cookie === (await sha256Hex(adminKey));
}

export default async function FrontPage() {
  const page = await getFrontPage(); // newCounts computed against pre-update lastVisitAt
  // Only the owner's visits reset the "N new" counters — anonymous readers
  // must not change any state, including this.
  if (await isOwner()) await touchLastVisit();
  const dateLine =
    new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }) +
    " · London";

  return (
    <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <Masthead settings={page.settings} lastRun={page.lastRun} dateLine={dateLine} />
      <TickerStrip tickers={page.tickers} />
      {/* Mobile stacks in reading-priority order (money → scoreboard/sports → tech);
          the order-* classes reset at lg where the three-column grid takes over. */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-8 lg:divide-x lg:divide-[#ddd] [&>*+*]:lg:pl-8">
        <div className="order-1 lg:order-none">
          {page.lead && (
            <div className="mb-6 border-b-2 border-[#1a1a1a] pb-4">
              <ArticleItem article={page.lead} lead />
            </div>
          )}
          <SectionBlock title="Latinoamérica & World" articles={page.sections.equities} newCount={page.newCounts.equities} />
          <SectionBlock title="Economía & Business" articles={page.sections.finance} newCount={page.newCounts.finance} />
        </div>
        <div className="order-3 lg:order-none">
          <SectionBlock title="Tecnología / Technology" articles={page.sections.tech} newCount={page.newCounts.tech} />
          <SectionBlock title="Sociedad & Ciencia" articles={page.sections.fitness} newCount={page.newCounts.fitness} />
        </div>
        <div className="order-2 lg:order-none">
          <Scoreboard scoreboard={page.scoreboard} />
          <SectionBlock title="Deportes / Sports" articles={page.sections.sports} newCount={page.newCounts.sports} />
          <SectionBlock title="República Dominicana" articles={page.sections.local} newCount={page.newCounts.local} />
        </div>
      </div>
    </main>
  );
}
