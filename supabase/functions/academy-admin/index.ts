import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://evoford.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const respond = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return respond({ error: "Authentication required" }, 401);
  const caller = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user || (user.email || "").toLowerCase() !== "eepinedacarrasco@gmail.com") {
    return respond({ error: "Not authorized" }, 403);
  }
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const body = await req.json();
    if (body.action === "update_status") {
      const allowed = ["active", "suspended", "completed"];
      if (typeof body.enrollment_id !== "string" || !allowed.includes(body.status)) return respond({ error: "Invalid update" }, 400);
      const { data, error } = await admin.from("academy_enrollments").update({ status: body.status }).eq("id", body.enrollment_id).select("id,status").single();
      if (error) return respond({ error: error.message }, 400);
      return respond({ ok: true, enrollment: data });
    }
    if (body.action === "progress") {
      if (typeof body.user_id !== "string" || typeof body.course_slug !== "string") return respond({ error: "Invalid student" }, 400);
      const { data, error } = await admin.from("academy_progress").select("lesson_index,completed_at").eq("user_id", body.user_id).eq("course_slug", body.course_slug).order("lesson_index");
      if (error) return respond({ error: error.message }, 400);
      return respond({ lessons: data || [] });
    }
    if (body.action !== "list") return respond({ error: "Unknown action" }, 400);
    const [{ data: enrollments, error: enrollmentError }, { data: usersData, error: usersError }, { data: progress, error: progressError }] = await Promise.all([
      admin.from("academy_enrollments").select("id,user_id,course_slug,course_title,status,approved_at,created_at").order("created_at", { ascending: false }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("academy_progress").select("user_id,course_slug,lesson_index,completed_at"),
    ]);
    if (enrollmentError || usersError || progressError) return respond({ error: enrollmentError?.message || usersError?.message || progressError?.message || "Could not load Academy records" }, 500);
    const users = new Map((usersData.users || []).map((u) => [u.id, u]));
    const counts = new Map<string, number>();
    for (const row of progress || []) {
      const key = row.user_id + ":" + row.course_slug;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const students = (enrollments || []).map((e) => {
      const account = users.get(e.user_id);
      return {
        ...e,
        email: account?.email || "",
        full_name: account?.user_metadata?.full_name || account?.user_metadata?.name || "",
        completed_lessons: counts.get(e.user_id + ":" + e.course_slug) || 0,
        status_label: ({ active: "Activo", suspended: "Suspendido", completed: "Finalizado" } as Record<string,string>)[e.status] || e.status,
      };
    });
    return respond({ students });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
