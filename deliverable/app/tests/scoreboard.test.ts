import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { parseTeamScoreboard, parseTennisScoreboard } from "@/ingestion/scoreboard";

const soccer = JSON.parse(readFileSync("tests/fixtures/espn-soccer.json", "utf8"));
const tennis = JSON.parse(readFileSync("tests/fixtures/espn-tennis.json", "utf8"));

describe("parseTeamScoreboard", () => {
  it("maps a completed match with int scores and FT status", () => {
    const rows = parseTeamScoreboard(soccer, "World Cup", "soccer");
    const final = rows.find((r) => r.externalId === "soccer:760500")!;
    expect(final).toMatchObject({
      sport: "soccer",
      competition: "World Cup",
      home: "ESP",
      away: "BRA",
      homeScore: 2,
      awayScore: 1,
      status: "post",
      statusDetail: "FT",
    });
  });

  it("gives a scheduled (pre) match null scores", () => {
    const rows = parseTeamScoreboard(soccer, "World Cup", "soccer");
    const pre = rows.find((r) => r.externalId === "soccer:760511")!;
    expect(pre.homeScore).toBeNull();
    expect(pre.awayScore).toBeNull();
    expect(pre.status).toBe("pre");
    expect(pre.home).toBe("ESP");
    expect(pre.away).toBe("BEL");
  });

  it("prefixes externalId with the sport", () => {
    const rows = parseTeamScoreboard(soccer, "World Cup", "soccer");
    expect(rows.every((r) => r.externalId.startsWith("soccer:"))).toBe(true);
  });

  it("returns both events", () => {
    expect(parseTeamScoreboard(soccer, "World Cup", "soccer")).toHaveLength(2);
  });
});

describe("parseTennisScoreboard", () => {
  it("keeps only grand-slam singles matches", () => {
    const rows = parseTennisScoreboard(tennis);
    // Wimbledon men's singles kept; Wimbledon doubles + Nordea Open (non-slam) filtered
    expect(rows).toHaveLength(1);
    expect(rows[0].competition).toBe("Wimbledon");
  });

  it("puts the winner in home with sets-won as homeScore, loser in away", () => {
    const rows = parseTennisScoreboard(tennis);
    expect(rows[0]).toMatchObject({
      home: "C. Alcaraz",
      away: "J. Sinner",
      homeScore: 2, // sets won by Alcaraz (6, 7 > 3, 6 wait- recompute below)
    });
  });

  it("builds the winner-perspective set-by-set detail string", () => {
    const rows = parseTennisScoreboard(tennis);
    // winner (Alcaraz, away in raw data) sets: 6,3,7 ; loser (Sinner, home) sets: 4,6,6
    // winner-perspective per-set "w-l": 6-4 3-6 7-6
    expect(rows[0].detail).toBe("6-4 3-6 7-6");
  });

  it("sets externalId as tennis:<competitionId> and status/statusDetail", () => {
    const rows = parseTennisScoreboard(tennis);
    expect(rows[0].externalId).toBe("tennis:179900");
    expect(rows[0].status).toBe("post");
    expect(rows[0].statusDetail).toBe("Final");
    expect(rows[0].sport).toBe("tennis");
  });
});
