// VLAD Ω SOC — risk scoring + state machine + alert correlator
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingEvent {
  kind: string;
  severity?: "low" | "medium" | "high" | "critical";
  score?: number;
  source?: string;
  evidence?: Record<string, unknown>;
}

const KIND_BASE: Record<string, number> = {
  ocr_hit: 6,
  secret_leak: 35,
  phash_match: 28,
  phishing_match: 30,
  behavior_anomaly: 18,
  bot_typing: 22,
  rapid_app_switch: 12,
  agent_yolo_hit: 24,
  agent_yara_hit: 40,
  agent_usb_insert: 18,
  agent_file_copy: 22,
  capture_started: 0,
  capture_stopped: 0,
};

const SEV_MULT: Record<string, number> = { low: 0.6, medium: 1, high: 1.5, critical: 2.2 };

function bucket(score: number) {
  if (score >= 91) return { sev: "critical", state: "Incident Response" };
  if (score >= 76) return { sev: "high", state: "Critical" };
  if (score >= 51) return { sev: "medium", state: "High Risk" };
  if (score >= 26) return { sev: "low", state: "Suspicious" };
  return { sev: "low", state: "Normal" };
}

function correlate(events: IncomingEvent[]): { title: string; type: string; action: string } | null {
  const kinds = new Set(events.map((e) => e.kind));
  if (kinds.has("secret_leak") && (kinds.has("agent_file_copy") || kinds.has("agent_usb_insert"))) {
    return { type: "data_exfiltration", title: "Potential data exfiltration chain detected", action: "Lock session, revoke clipboard, capture forensic snapshot." };
  }
  if (kinds.has("phishing_match") && kinds.has("ocr_hit")) {
    return { type: "phishing", title: "Phishing surface detected on screen", action: "Block credential input, warn user, screenshot for SOC review." };
  }
  if (kinds.has("agent_yara_hit")) {
    return { type: "malware", title: "Known malicious signature observed by agent", action: "Quarantine process, isolate host, escalate to incident response." };
  }
  if (kinds.has("bot_typing")) {
    return { type: "impersonation", title: "Non-human typing dynamics detected", action: "Step-up authentication, log session, flag account." };
  }
  if (kinds.has("secret_leak")) {
    return { type: "data_leak", title: "Sensitive data visible on screen", action: "Redact display, rotate exposed credentials." };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json() as { sessionId?: string | null; events: IncomingEvent[] };
    const events = (body.events ?? []).slice(0, 50);
    if (events.length === 0) return new Response(JSON.stringify({ ok: true, score: 0 }), { headers: { ...cors, "Content-Type": "application/json" } });

    // Score events
    const scored = events.map((e) => {
      const base = e.score ?? KIND_BASE[e.kind] ?? 5;
      const mult = SEV_MULT[e.severity ?? "low"] ?? 1;
      const score = Math.min(100, Math.round(base * mult));
      return { ...e, score };
    });

    // Insert events
    await supabase.from("soc_events").insert(scored.map((e) => ({
      user_id: user.id,
      session_id: body.sessionId ?? null,
      kind: e.kind,
      severity: e.severity ?? "low",
      score: e.score,
      source: e.source ?? "browser",
      evidence: e.evidence ?? {},
    })));

    // Pull recent events for rolling risk (last 60s)
    const since = new Date(Date.now() - 60_000).toISOString();
    const { data: recent } = await supabase
      .from("soc_events")
      .select("kind, score, severity, evidence")
      .eq("user_id", user.id)
      .gte("created_at", since);

    const recentList = recent ?? [];
    // Aggregate risk: weighted sum w/ decay
    const total = recentList.reduce((acc, r) => acc + (r.score ?? 0), 0);
    const risk = Math.min(100, Math.round(total / Math.max(1, recentList.length * 0.6)));
    const b = bucket(risk);

    // Correlation alert
    const corr = correlate(scored as IncomingEvent[]);
    let alert: Record<string, unknown> | null = null;
    if (corr && (b.sev === "high" || b.sev === "critical" || b.sev === "medium")) {
      const evidence = { kinds: scored.map((e) => e.kind), sample: scored.slice(0, 5) };
      const { data } = await supabase.from("soc_alerts").insert({
        user_id: user.id,
        session_id: body.sessionId ?? null,
        threat_type: corr.type,
        severity: b.sev,
        risk_score: risk,
        state: "open",
        title: corr.title,
        detail: `State machine: ${b.state}. ${recentList.length} signals in last 60s.`,
        evidence,
        recommended_action: corr.action,
      }).select().single();
      alert = data;
    }

    // Update session summary
    if (body.sessionId) {
      await supabase.rpc; // no-op placeholder; do plain update below
      await supabase
        .from("soc_sessions")
        .update({ max_risk: risk, alerts_count: alert ? 1 : 0 })
        .eq("id", body.sessionId)
        .lt("max_risk", risk);
    }

    return new Response(JSON.stringify({
      ok: true,
      risk,
      severity: b.sev,
      state: b.state,
      alert,
      signals: recentList.length,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
