import { lt } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";

export type Sport = "soccer" | "basketball" | "tennis";
export type MatchStatus = "pre" | "in" | "post";

export interface MatchRow {
  externalId: string;
  sport: Sport;
  competition: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  detail: string | null;
  status: MatchStatus;
  statusDetail: string | null;
  startsAt: Date;
}

// --- ESPN team-sport scoreboard (soccer, basketball) -----------------------

interface TeamCompetitor {
  homeAway: "home" | "away";
  score?: string;
  team: { abbreviation: string };
}

interface TeamCompetition {
  id?: string;
  date?: string;
  status: { type: StatusType };
  competitors: TeamCompetitor[];
}

interface StatusType {
  state: "pre" | "in" | "post";
  completed: boolean;
  shortDetail?: string;
}

interface TeamEvent {
  id: string;
  date: string;
  status: { type: StatusType };
  competitions: TeamCompetition[];
}

interface TeamScoreboard {
  events: TeamEvent[];
}

export function parseTeamScoreboard(
  json: TeamScoreboard,
  competitionLabel: string,
  sport: Sport,
): MatchRow[] {
  const rows: MatchRow[] = [];
  for (const event of json.events ?? []) {
    const comp = event.competitions?.[0];
    if (!comp) continue;
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
    if (!home || !away) continue;
    const state = event.status.type.state;
    rows.push({
      externalId: `${sport}:${event.id}`,
      sport,
      competition: competitionLabel,
      home: home.team.abbreviation,
      away: away.team.abbreviation,
      homeScore: state === "pre" ? null : toInt(home.score),
      awayScore: state === "pre" ? null : toInt(away.score),
      detail: null,
      status: state,
      statusDetail: event.status.type.shortDetail ?? null,
      startsAt: new Date(event.date),
    });
  }
  return rows;
}

function toInt(score: string | undefined): number | null {
  if (score === undefined || score === "") return null;
  const n = Number(score);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// --- ESPN tennis scoreboard (atp, wta) --------------------------------------

interface TennisLinescore {
  value: number;
}

interface TennisCompetitor {
  homeAway: "home" | "away";
  winner?: boolean;
  athlete?: { shortName: string };
  linescores?: TennisLinescore[];
}

interface TennisCompetition {
  id: string;
  date: string;
  status: { type: StatusType };
  competitors: TennisCompetitor[];
}

interface TennisGrouping {
  grouping: { displayName: string };
  competitions: TennisCompetition[];
}

interface TennisEvent {
  id: string;
  name: string;
  groupings?: TennisGrouping[];
}

interface TennisScoreboard {
  events: TennisEvent[];
}

const GRAND_SLAM_RE = /wimbledon|us open|french open|roland garros|australian open/i;

export function parseTennisScoreboard(json: TennisScoreboard): MatchRow[] {
  const rows: MatchRow[] = [];
  for (const event of json.events ?? []) {
    if (!GRAND_SLAM_RE.test(event.name)) continue;
    for (const grouping of event.groupings ?? []) {
      if (!grouping.grouping.displayName.includes("Singles")) continue;
      for (const comp of grouping.competitions ?? []) {
        const row = parseTennisCompetition(comp, event.name);
        if (row) rows.push(row);
      }
    }
  }
  return rows;
}

function parseTennisCompetition(comp: TennisCompetition, competition: string): MatchRow | null {
  const a = comp.competitors?.[0];
  const b = comp.competitors?.[1];
  if (!a?.athlete || !b?.athlete) return null; // skip matches with no athletes assigned yet

  const winner = a.winner ? a : b.winner ? b : null;
  const loser = winner === a ? b : a;

  const state = comp.status.type.state;
  let home: string;
  let away: string;
  let homeScore: number | null = null;
  let awayScore: number | null = null;
  let detail: string | null = null;

  if (winner) {
    home = winner.athlete!.shortName;
    away = loser.athlete!.shortName;
    const winnerSets = winner.linescores ?? [];
    const loserSets = loser.linescores ?? [];
    let winnerSetsWon = 0;
    let loserSetsWon = 0;
    const parts: string[] = [];
    for (let i = 0; i < Math.max(winnerSets.length, loserSets.length); i++) {
      const w = winnerSets[i]?.value;
      const l = loserSets[i]?.value;
      if (w === undefined || l === undefined) continue;
      const wi = Math.trunc(w);
      const li = Math.trunc(l);
      if (wi > li) winnerSetsWon++;
      else if (li > wi) loserSetsWon++;
      parts.push(`${wi}-${li}`);
    }
    homeScore = winnerSetsWon;
    awayScore = loserSetsWon;
    detail = parts.length > 0 ? parts.join(" ") : null;
  } else {
    // no winner yet (in progress / not started) — keep home/away as-is (a=home, b=away)
    home = a.athlete.shortName;
    away = b.athlete.shortName;
  }

  return {
    externalId: `tennis:${comp.id}`,
    sport: "tennis",
    competition,
    home,
    away,
    homeScore,
    awayScore,
    detail,
    status: state,
    statusDetail: comp.status.type.shortDetail ?? null,
    startsAt: new Date(comp.date),
  };
}

// --- refresh ------------------------------------------------------------

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`ESPN ${url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function refreshScoreboard(): Promise<void> {
  const endpoints: { label: string; fn: () => Promise<MatchRow[]> }[] = [
    {
      label: "soccer/fifa.world",
      fn: async () =>
        parseTeamScoreboard(
          await fetchJson(`${ESPN_BASE}/soccer/fifa.world/scoreboard`),
          "World Cup",
          "soccer",
        ),
    },
    {
      label: "basketball/fiba",
      fn: async () =>
        parseTeamScoreboard(
          await fetchJson(`${ESPN_BASE}/basketball/fiba/scoreboard`),
          "FIBA World Cup",
          "basketball",
        ),
    },
    {
      label: "tennis/atp",
      fn: async () => parseTennisScoreboard(await fetchJson(`${ESPN_BASE}/tennis/atp/scoreboard`)),
    },
    {
      label: "tennis/wta",
      fn: async () => parseTennisScoreboard(await fetchJson(`${ESPN_BASE}/tennis/wta/scoreboard`)),
    },
  ];

  const failed: string[] = [];
  const rowsByExternalId = new Map<string, MatchRow>();

  for (const { label, fn } of endpoints) {
    try {
      const rows = await fn();
      for (const row of rows) rowsByExternalId.set(row.externalId, row);
    } catch (e) {
      failed.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (failed.length === endpoints.length) {
    throw new Error(`all scoreboard endpoints failed: ${failed.join("; ")}`);
  }

  for (const row of rowsByExternalId.values()) {
    await db.insert(matches).values(row).onConflictDoUpdate({
      target: matches.externalId,
      set: {
        homeScore: row.homeScore,
        awayScore: row.awayScore,
        detail: row.detail,
        status: row.status,
        statusDetail: row.statusDetail,
        updatedAt: new Date(),
      },
    });
  }

  await db.delete(matches).where(lt(matches.startsAt, new Date(Date.now() - 3 * 24 * 3600 * 1000)));
}
