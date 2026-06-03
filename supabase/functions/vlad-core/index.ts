// VLAD Core: central AI router. Takes a user utterance + optional auth,
// uses long-term memory as context, decides intent, workspace, action,
// and an optional spoken reply. Returns structured plan to the client.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = `You are VLAD, a Jarvis-style personal AI operating system.
You are voice-first. Be terse, decisive, and act rather than explain.
You orchestrate specialized workspaces and remember the user long-term.
Always respond by calling the vlad_act tool.

Workspaces you can route to: home, image, email, calendar, files, meetings, media, memory, agents, code, research, automation.

Actions:
- "open_workspace": just switch the visible workspace
- "generate_image": route to image workspace with a prompt
- "remember": persist a long-term memory (kind: fact|preference|context|task)
- "recall": surface memories matching a query
- "speak_only": no UI change, just say something
- "execute": perform a task within the chosen workspace (describe in payload)

Keep "say" under ~25 words; spoken aloud.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const { utterance, history = [] } = await req.json();
    if (!utterance || typeof utterance !== "string") return json({ error: "utterance required" }, 400);

    // Optional auth context for memory
    let userId: string | null = null;
    let memoryContext = "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supa = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: { user } } = await supa.auth.getUser();
        if (user) {
          userId = user.id;
          const { data: mems } = await supa
            .from("vlad_memories")
            .select("kind,content,importance")
            .order("importance", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(40);
          if (mems?.length) {
            memoryContext = "\n\nLong-term memory (most important first):\n" +
              mems.map((m: any) => `- [${m.kind}] ${m.content}`).join("\n");
          }
        }
      } catch (_) { /* anonymous mode */ }
    }

    const messages = [
      { role: "system", content: SYSTEM + memoryContext },
      ...history.slice(-8),
      { role: "user", content: utterance },
    ];

    const tools = [{
      type: "function",
      function: {
        name: "vlad_act",
        description: "Decide what VLAD should do in response to the user.",
        parameters: {
          type: "object",
          properties: {
            workspace: {
              type: "string",
              enum: ["home","image","email","calendar","files","meetings","media","memory","agents","code","research","automation"],
            },
            action: {
              type: "string",
              enum: ["open_workspace","generate_image","remember","recall","speak_only","execute"],
            },
            payload: { type: "string", description: "Action payload: image prompt, memory content, query, or task description." },
            memory_kind: { type: "string", enum: ["fact","preference","context","task"], description: "Only for remember action." },
            say: { type: "string", description: "Short spoken response (<25 words). Required." },
          },
          required: ["workspace","action","say"],
          additionalProperties: false,
        },
      },
    }];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: { type: "function", function: { name: "vlad_act" } },
      }),
    });

    if (res.status === 429) return json({ error: "Rate limited, try again shortly." }, 429);
    if (res.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await res.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return json({ error: "no tool call" }, 502);

    let plan: any;
    try { plan = JSON.parse(call.function.arguments); }
    catch { return json({ error: "invalid plan json" }, 502); }

    // Execute memory persistence server-side
    if (plan.action === "remember" && userId && plan.payload) {
      const supa = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader! } } },
      );
      await supa.from("vlad_memories").insert({
        user_id: userId,
        kind: plan.memory_kind || "fact",
        content: plan.payload,
        importance: 3,
      });
    }

    return json({ plan });
  } catch (e) {
    console.error("vlad-core error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
