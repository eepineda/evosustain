import type { CompetitionScoreboard, Match } from "@/lib/queries";

export function Scoreboard({ scoreboard }: { scoreboard: CompetitionScoreboard[] }) {
  if (scoreboard.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-[#1a1a1a] pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b0000]">
        Scoreboard
      </h2>
      <div className="space-y-3">
        {scoreboard.map(({ competition, matches }) => (
          <div key={competition}>
            <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              {competition}
            </h3>
            <div className="space-y-1.5 divide-y divide-[#ddd] [&>*+*]:pt-1.5">
              {matches.map((m) => (
                <MatchRow key={m.externalId} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchRow({ match }: { match: Match }) {
  const live = match.status === "in";
  const isTennis = match.sport === "tennis";

  let left: string;
  if (isTennis) {
    left = live ? `${match.home} vs ${match.away}` : `${match.home} d. ${match.away}`;
  } else {
    left = `${match.home} ${match.homeScore ?? 0}–${match.awayScore ?? 0} ${match.away}`;
  }

  const right = live ? (
    <span className="font-bold text-[#8b0000]">LIVE</span>
  ) : (
    <span className="text-neutral-500">{isTennis ? match.detail : match.statusDetail}</span>
  );

  return (
    <div className="flex items-baseline justify-between gap-3 font-mono text-[12px] tabular-nums">
      <span className="truncate text-[#1a1a1a]">{left}</span>
      <span className="shrink-0">{right}</span>
    </div>
  );
}
