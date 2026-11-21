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
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return respond({ error: "Authentication required" }, 401);

  const caller = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user || (user.email || "").toLowerCase() !== "eepinedacarrasco@gmail.com") {
    return respond({ error: "Not authorized" }, 403);
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const { request_id } = await req.json();
    if (typeof request_id !== "string") return respond({ error: "Invalid request" }, 400);

    const { data: enquiry, error: enquiryError } = await admin
      .from("course_enquiries")
      .select("id,full_name,email,course_interest,status")
      .eq("id", request_id)
      .single();
    if (enquiryError || !enquiry) return respond({ error: "Application not found" }, 404);
    if (enquiry.status === "discarded" || enquiry.status === "closed") {
      return respond({ error: "This application is closed" }, 409);
    }

    const email = String(enquiry.email || "").trim().toLowerCase();
    if (!email) return respond({ error: "Application has no email address" }, 400);

    let studentId: string | null = null;
    let invitationSent = false;

    const { data: invite, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: "https://evoford.com/news/aula-virtual.html",
      data: { full_name: enquiry.full_name, academy_invite: true },
    });

    if (!inviteError && invite.user) {
      studentId = invite.user.id;
      invitationSent = true;
    } else if (
      inviteError &&
      (inviteError.code === "user_already_exists" ||
        /already registered|already been registered|user already exists/i.test(inviteError.message))
    ) {
      for (let page = 1; page <= 20 && !studentId; page++) {
        const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (listError) return respond({ error: listError.message }, 500);
        const existing = data.users.find((candidate) => (candidate.email || "").toLowerCase() === email);
        if (existing) studentId = existing.id;
        if (data.users.length < 1000) break;
      }
      if (!studentId) return respond({ error: "El correo ya existe, pero no se pudo localizar la cuenta. Contacta con soporte." }, 409);
    } else if (inviteError) {
      return respond({ error: inviteError.message }, 409);
    }

    if (!studentId) return respond({ error: "No se pudo identificar la cuenta del alumno." }, 500);

    const { error: enrollmentError } = await admin.from("academy_enrollments").upsert({
      user_id: studentId,
      course_slug: "ia-practica",
      course_title: "Inteligencia artificial aplicada",
      status: "active",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    }, { onConflict: "user_id,course_slug" });
    if (enrollmentError) return respond({ error: "Invitation sent but enrolment failed: " + enrollmentError.message }, 500);

    const { error: updateError } = await admin.from("course_enquiries")
      .update({ status: "enrolled" }).eq("id", request_id);
    if (updateError) return respond({ error: "Enrolment created but application status update failed" }, 500);

    return respond({ ok: true, email, name: enquiry.full_name, invitation_sent: invitationSent, existing_account: !invitationSent });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
