import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const since60s = new Date(now - 60_000).toISOString();
    const since5m = new Date(now - 5 * 60_000).toISOString();

    // Real signals from the user's data
    const [logs60, logs5m, convos, messages] = await Promise.all([
      supabase
        .from("security_logs")
        .select("severity", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", since60s),
      supabase
        .from("security_logs")
        .select("severity", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", since5m),
      supabase
        .from("chat_conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since5m),
    ]);

    const recentLogs = logs60.data ?? [];
    const critical = recentLogs.filter((l) => l.severity === "critical").length;
    const warning = recentLogs.filter((l) => l.severity === "warning").length;
    const eventsPerMin = recentLogs.length;
    const eventsLast5m = logs5m.count ?? 0;
    const conversations = convos.count ?? 0;
    const messages5m = messages.count ?? 0;

    // Derive normalized 0–100 metrics from real signals
    // CPU: weighted by severity of recent events
    const cpuLoad = critical * 20 + warning * 8 + eventsPerMin * 3;
    const cpu = Math.min(99, 18 + cpuLoad);

    // MEM: conversation/context footprint
    const mem = Math.min(95, 25 + Math.log2(conversations + 1) * 8 + Math.min(40, messages5m * 2));

    // NET: event throughput over 5 minutes
    const net = Math.min(99, 15 + Math.min(80, eventsLast5m * 2));

    return new Response(
      JSON.stringify({
        cpu: Math.round(cpu),
        mem: Math.round(mem),
        net: Math.round(net),
        signals: {
          eventsPerMin,
          eventsLast5m,
          critical,
          warning,
          conversations,
          messages5m,
        },
        timestamp: now,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
