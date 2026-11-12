import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://evoford.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};
const ADMIN_EMAIL = "eepinedacarrasco@gmail.com";

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return respond({ error: "Authentication required" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!url || !anon || !service) return respond({ error: "Supabase server configuration is incomplete." }, 500);
  if (!openaiKey) return respond({ error: "Falta configurar OPENAI_API_KEY en los secretos de Supabase." }, 503);

  const authClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: userData, error: authError } = await authClient.auth.getUser();
  if (authError || userData.user?.email?.toLowerCase() !== ADMIN_EMAIL) return respond({ error: "Not authorized." }, 403);

  const body = await req.json().catch(() => ({}));
  const itemId = clip(body.item_id, 120);
  if (!itemId) return respond({ error: "Falta item_id." }, 400);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: item, error: itemError } = await admin.from("imported_items").select("*").eq("id", itemId).single();
  if (itemError || !item) return respond({ error: "No se encontró la noticia RSS." }, 404);

  const prompt = `Eres editor de una publicación internacional. Trabaja SOLO con el titular, resumen RSS y URL aportados. No afirmes haber leído la página enlazada. No inventes hechos, cifras, citas, fechas, cargos ni contexto. Si los datos no bastan para una noticia completa, dilo claramente y entrega un borrador breve con preguntas de verificación entre corchetes. No copies frases extensas del resumen. Crea una redacción original y atribuye la información al medio fuente. Devuelve SOLO JSON válido con estas claves:
{"country":"país principal o null","region":"Europe|Americas|Middle East|Africa|Asia-Pacific|Global","category":"Internacional|Política|Economía|Seguridad|Tecnología|Opinión|Clima|Sociedad","confidence":0.0,"source_language":"es|en|other","title_es":"titular en español","summary_es":"resumen en español","article_es":"borrador original en español, con contexto solo si está en el material, y notas de verificación si faltan datos","title_en":"headline in English","summary_en":"English summary","article_en":"original English draft, faithful to Spanish version and source material"}.
Reglas: clasificación basada en el contenido, no en suposiciones sobre el medio. country debe ser país del hecho principal; si no se puede determinar, null. region debe reflejar la geografía del hecho. No atribuyas opiniones ni declares culpabilidad. No incluyas imágenes.

Titular RSS: ${clip(item.title, 500)}
Resumen RSS: ${clip(item.summary, 3500)}
Medio: ${clip(item.source_name, 160)}
URL fuente: ${clip(item.article_url, 1800)}
Categoría de la fuente: ${clip(item.category, 80)}`;

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responde únicamente con un objeto JSON válido. Sé estricto con los hechos y reconoce la incertidumbre." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    return respond({ error: `OpenAI devolvió HTTP ${aiResponse.status}: ${errorText.slice(0, 500)}` }, 502);
  }
  const result = await aiResponse.json();
  const raw = result.choices?.[0]?.message?.content || "{}";
  let draft: Record<string, unknown>;
  try { draft = JSON.parse(raw); } catch { return respond({ error: "La respuesta editorial no tenía formato JSON válido." }, 502); }

  const allowedCategories = ["Internacional", "Política", "Economía", "Seguridad", "Tecnología", "Opinión", "Clima", "Sociedad"];
  const category = allowedCategories.includes(String(draft.category)) ? String(draft.category) : "Internacional";
  const titleEs = clip(draft.title_es, 180) || clip(item.title, 180);
  const summaryEs = clip(draft.summary_es, 600);
  const articleEs = clip(draft.article_es, 16000);
  if (!articleEs) return respond({ error: "La asistencia no generó un borrador en español." }, 502);

  const articlePayload = {
    title: titleEs,
    slug: titleEs.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90),
    category,
    author: "EVOFORD NEWS",
    summary: summaryEs,
    content: articleEs,
    country: clip(draft.country, 100) || null,
    region: clip(draft.region, 60) || "Global",
    language: "es",
    summary_en: clip(draft.summary_en, 600),
    content_en: clip(draft.article_en, 16000),
    source_url: clip(item.article_url, 2000),
    source_title: clip(item.title, 500),
    status: "draft",
    updated_at: new Date().toISOString(),
  };
  const { data: article, error: saveError } = await admin.from("articles").insert(articlePayload).select("id,title,status").single();
  if (saveError) return respond({ error: saveError.message }, 500);

  await admin.from("imported_items").update({
    country: articlePayload.country,
    region: articlePayload.region,
    suggested_category: category,
    source_language: clip(draft.source_language, 12) || "other",
    classification_confidence: typeof draft.confidence === "number" ? Math.max(0, Math.min(1, draft.confidence)) : null,
    editorial_status: "draft_created",
  }).eq("id", itemId);

  return respond({
    success: true,
    article,
    classification: { country: articlePayload.country, region: articlePayload.region, category, confidence: articlePayload.classification_confidence },
    bilingual: Boolean(articlePayload.content_en),
  });
});
