import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Telemetry {
  cpuHint?: number;
  memUsedGb?: number;
  memTotalGb?: number;
  storageUsed?: number;
  storageTotal?: number;
  downlinkMbps?: number;
  rttMs?: number;
  interactions?: number;
  idleSeconds?: number;
  tabVisible?: boolean;
  autopilot?: boolean;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const jitter = (base: number, range: number) => base + (Math.random() - 0.5) * range;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: { telemetry?: Telemetry } = await req.json().catch(() => ({}));
    const tel = body.telemetry ?? {};

    const since60s = new Date(Date.now() - 60_000).toISOString();
    const since5m = new Date(Date.now() - 5 * 60_000).toISOString();

    const [logs60, prev] = await Promise.all([
      supabase
        .from("security_logs")
        .select("severity")
        .eq("user_id", user.id)
        .gte("created_at", since60s),
      supabase
        .from("monitoring_metrics")
        .select("cpu, mem_pct, net_up, net_down")
        .eq("user_id", user.id)
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const recent = logs60.data ?? [];
    const critical = recent.filter((l) => l.severity === "critical").length;
    const warning = recent.filter((l) => l.severity === "warning").length;
    const eventsPerMin = recent.length;

    // CPU: random walk anchored to prior + load + telemetry hint
    const cpuBase = prev?.cpu ?? 32;
    const cpuTarget = (tel.cpuHint ?? 30) + critical * 18 + warning * 7 + eventsPerMin * 2 +
      (tel.interactions ?? 0) * 0.4;
    const cpu = Math.round(clamp(jitter(cpuBase * 0.6 + cpuTarget * 0.4, 12)));

    // MEM: from telemetry if provided, else smoothed
    const memTotalGb = tel.memTotalGb && tel.memTotalGb > 0 ? tel.memTotalGb : 16;
    const memUsedGb = tel.memUsedGb && tel.memUsedGb > 0
      ? tel.memUsedGb
      : (prev?.mem_pct ?? 45) / 100 * memTotalGb;
    const memPct = Math.round(clamp((memUsedGb / memTotalGb) * 100));

    // Storage: from navigator.storage.estimate if provided, else simulated GB
    const storageTotal = tel.storageTotal && tel.storageTotal > 0 ? tel.storageTotal : 512 * 1024 ** 3;
    const storageUsed = tel.storageUsed && tel.storageUsed > 0
      ? tel.storageUsed
      : storageTotal * (0.35 + Math.random() * 0.05);

    // Network: derive from downlink + random walk
    const downBase = prev?.net_down ?? (tel.downlinkMbps ?? 12);
    const upBase = prev?.net_up ?? Math.max(1, (tel.downlinkMbps ?? 12) * 0.2);
    const netDown = Math.max(0, Math.round(jitter(downBase * 0.7 + (tel.downlinkMbps ?? 12) * 0.3, 6) * 10) / 10);
    const netUp = Math.max(0, Math.round(jitter(upBase, 2) * 10) / 10);
    const diskRw = Math.round(clamp(jitter(20 + cpu * 0.4, 18)));

    const tabVisible = tel.tabVisible ?? true;
    const idle = tel.idleSeconds ?? 0;
    const active = tabVisible && idle < 120;

    let threat: "low" | "medium" | "high" = "low";
    if (critical > 0 || cpu > 90) threat = "high";
    else if (warning > 0 || cpu > 70 || memPct > 85) threat = "medium";

    // Insert metric snapshot
    await supabase.from("monitoring_metrics").insert({
      user_id: user.id,
      cpu,
      mem_pct: memPct,
      mem_gb: Math.round(memUsedGb * 100) / 100,
      mem_total_gb: Math.round(memTotalGb * 100) / 100,
      storage_used: storageUsed,
      storage_total: storageTotal,
      net_up: netUp,
      net_down: netDown,
      disk_rw: diskRw,
      active,
      threat_level: threat,
    });

    // Upsert session
    await supabase.from("monitoring_sessions").upsert({
      user_id: user.id,
      last_active_at: new Date().toISOString(),
      idle_seconds: idle,
      interactions: tel.interactions ?? 0,
      tab_visible: tabVisible,
      autopilot: tel.autopilot ?? false,
    }, { onConflict: "user_id" });

    // Generate insights on threshold breach
    const insights: Array<{ kind: string; severity: string; title: string; detail: string }> = [];
    if (cpu > 85) insights.push({ kind: "anomaly", severity: "high", title: "High CPU usage", detail: `CPU at ${cpu}% — consider closing background tasks.` });
    if (memPct > 85) insights.push({ kind: "anomaly", severity: "high", title: "Memory pressure", detail: `Memory at ${memPct}% (${memUsedGb.toFixed(1)}GB / ${memTotalGb.toFixed(0)}GB).` });
    if (storageUsed / storageTotal > 0.9) insights.push({ kind: "anomaly", severity: "medium", title: "High disk usage", detail: "Storage above 90% — clean unused files." });
    if (idle > 120) insights.push({ kind: "status", severity: "low", title: "System idle", detail: `User idle for ${Math.round(idle / 60)} minutes.` });
    if (eventsPerMin > 8) insights.push({ kind: "anomaly", severity: "medium", title: "Unusual activity spike", detail: `${eventsPerMin} events in last minute.` });
    if (critical > 0) insights.push({ kind: "anomaly", severity: "high", title: "Critical security event", detail: `${critical} critical event(s) detected.` });
    if ((tel.interactions ?? 0) > 80) insights.push({ kind: "status", severity: "low", title: "High interaction detected", detail: "User is highly active." });

    if (insights.length > 0) {
      // Only insert 1 per tick to avoid spam
      const pick = insights[Math.floor(Math.random() * insights.length)];
      await supabase.from("monitoring_insights").insert({ user_id: user.id, ...pick });
    }

    // Retention: trim metrics older than 500 rows
    const { data: oldRows } = await supabase
      .from("monitoring_metrics")
      .select("id")
      .eq("user_id", user.id)
      .order("captured_at", { ascending: false })
      .range(500, 999);
    if (oldRows && oldRows.length > 0) {
      await supabase.from("monitoring_metrics").delete().in("id", oldRows.map((r) => r.id));
    }

    return new Response(
      JSON.stringify({
        cpu,
        mem_pct: memPct,
        mem_gb: memUsedGb,
        mem_total_gb: memTotalGb,
        storage_used: storageUsed,
        storage_total: storageTotal,
        net_up: netUp,
        net_down: netDown,
        disk_rw: diskRw,
        active,
        threat_level: threat,
        signals: { eventsPerMin, critical, warning },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
