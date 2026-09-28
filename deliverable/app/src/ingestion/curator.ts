import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RawArticle } from "./types";

const Verdict = z.object({
  index: z.number().int().min(0),
  score: z.number().int().min(0).max(10),
  clickbait: z.boolean(),
  reason: z.string().max(200),
  section: z.enum(["equities", "finance", "tech", "local", "fitness", "sports"]),
});
const Response = z.object({ verdicts: z.array(Verdict) });
export type CuratorVerdict = z.infer<typeof Verdict>;

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          score: { type: "integer" },
          clickbait: { type: "boolean" },
          reason: { type: "string" },
          section: {
            type: "string",
            enum: ["equities", "finance", "tech", "local", "fitness", "sports"],
          },
        },
        required: ["index", "score", "clickbait", "reason", "section"],
        additionalProperties: false,
      },
    },
  },
  required: ["verdicts"],
  additionalProperties: false,
};

export function buildPrompt(
  articles: Pick<RawArticle, "title" | "summary" | "source" | "section">[],
  profile: { topics: string[]; tickers: string[] },
): string {
  const list = articles
    .map(
      (a, i) =>
        `${i}. [${a.source}]${a.section ? ` (${a.section})` : ""} ${a.title}${
          a.summary ? ` — ${a.summary}` : ""
        }`,
    )
    .join("\n");
  return [
    "You curate a personal newspaper. Score each article for this reader.",
    `Reader interests: ${profile.topics.join(", ")}.`,
    `Portfolio tickers: ${profile.tickers.join(", ")}.`,
    "",
    "For each article return: index; score 0-10 (10 = must-read for this reader, 0 = irrelevant);",
    "clickbait=true when the headline is sensationalist, a listicle, or substance-free;",
    "reason (one short line, max 120 chars); section (keep the given section unless clearly wrong;",
    "if none given, assign the best fit).",
    "",
    "Articles:",
    list,
  ].join("\n");
}

export function parseCuratorResponse(text: string, batchSize: number): CuratorVerdict[] {
  const parsed = Response.parse(JSON.parse(text));
  // Duplicate indices mean a malformed response and must fail; missing indices
  // are tolerated — those articles are saved unscored and rescored next run.
  const seen = new Set<number>();
  for (const v of parsed.verdicts) {
    if (v.index >= batchSize) {
      throw new Error(`Curator verdict index ${v.index} out of range for batch size ${batchSize}`);
    }
    if (seen.has(v.index)) {
      throw new Error(`Curator returned duplicate verdict for index ${v.index}`);
    }
    seen.add(v.index);
  }
  return parsed.verdicts;
}

export async function scoreArticles(
  articles: RawArticle[],
  profile: { topics: string[]; tickers: string[] },
): Promise<{ verdicts: CuratorVerdict[]; tokensUsed: number }> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(articles, profile) }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Curator returned no text block");
  }
  return {
    verdicts: parseCuratorResponse(textBlock.text, articles.length),
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
