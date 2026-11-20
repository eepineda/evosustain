import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://evoford.com",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return json({ error: "Inicia sesión para continuar." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("Missing Supabase function environment configuration.");
    return json({ error: "Servicio temporalmente no disponible." }, 503);
  }

  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: authError } = await authClient.auth.getUser(token);
  const user = userData?.user;
  if (authError || !user?.email) return json({ error: "La sesión no es válida. Vuelve a iniciar sesión." }, 401);

  const email = user.email.trim().toLowerCase();
  const adminEmails = ["eepinedacarrasco@gmail.com", "speepineda@gmail.com"];
  const isAdmin = adminEmails.includes(email);
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch { return json({ error: "Solicitud no válida." }, 400); }
  const action = String(payload.action || "load");

  if (action === "load") {
    if (!isAdmin) return json({ error: "La edición impresa está reservada al administrador." }, 403);

    const [articlesResult, adsResult] = await Promise.all([
      db.from("articles")
        .select("title,title_en,title_es,slug,category,author,summary,summary_en,summary_es,image_url,created_at,updated_at,country,content,content_es,content_en")
        .eq("status", "published").order("updated_at", { ascending: false }).limit(40),
      db.from("published_ad_campaigns")
        .select("id,campaign_title,placement,creative_url,target_url").eq("placement", "print"),
    ]);
    if (articlesResult.error || adsResult.error) {
      console.error("Print edition data query failed.", articlesResult.error || adsResult.error);
      return json({ error: "No se pudo preparar la edición." }, 500);
    }
    return json({
      articles: articlesResult.data || [],
      printAd: (adsResult.data || []).find((item: { creative_url?: string }) => /^https:\/\//i.test(item.creative_url || "")) || null,
    });
  }

  if (!isAdmin) return json({ error: "No tienes permiso para administrar accesos." }, 403);

  if (action === "list_access") {
    const { data, error } = await db.from("print_edition_access").select("email,approved,created_at,updated_at").order("email");
    if (error) return json({ error: "No se pudo cargar la lista de accesos." }, 500);
    return json({ access: data || [] });
  }

  if (action === "add_access") {
    const target = String(payload.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target) || target.length > 254) {
      return json({ error: "Introduce un correo electrónico válido." }, 400);
    }
    const { error } = await db.from("print_edition_access").upsert({ email: target, approved: true, updated_at: new Date().toISOString() }, { onConflict: "email" });
    if (error) return json({ error: "No se pudo aprobar el correo." }, 500);
    return json({ ok: true });
  }

  if (action === "delete_access") {
    const target = String(payload.email || "").trim().toLowerCase();
    if (!target || adminEmails.includes(target)) return json({ error: "No se puede eliminar el correo de un administrador." }, 400);
    const { error } = await db.from("print_edition_access").delete().eq("email", target);
    if (error) return json({ error: "No se pudo eliminar el correo autorizado." }, 500);
    return json({ ok: true });
  }

  return json({ error: "Acción desconocida." }, 400);
});
