const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const agentId = Deno.env.get("ELEVENLABS_AGENT_ID");
    if (!agentId) throw new Error("ELEVENLABS_AGENT_ID not configured");

    if (!apiKey) {
      return jsonResponse({
        agentId,
        mode: "public-agent",
        warning: "Secure token minting is not configured; using public agent mode.",
      });
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("ElevenLabs token error:", res.status, txt);

      if (res.status === 401 && txt.includes("missing_permissions")) {
        return jsonResponse({
          agentId,
          mode: "public-agent",
          warning: "ElevenLabs API key is missing Conversational AI write permission; using public agent mode.",
        });
      }

      return jsonResponse({ error: `ElevenLabs ${res.status}: ${txt}` }, 502);
    }

    const data = await res.json();
    return jsonResponse({ token: data.token, agentId, mode: "token" });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
