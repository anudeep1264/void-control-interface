import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  creative: `You are VLAD AI — Creative Mode. You are a highly imaginative AI specializing in content generation. You help users write scripts, brainstorm video ideas, generate creative content, design concepts, and craft compelling narratives. Be expressive, artistic, and push creative boundaries. Use vivid language and offer multiple creative angles. Format with markdown.`,
  developer: `You are VLAD AI — Developer Mode. You are an elite coding AI specializing in software development, debugging, and technical problem-solving. You support all major programming languages. Write clean, efficient code with clear explanations. Use code blocks with syntax highlighting. Identify bugs systematically and suggest optimizations. Be precise and technical.`,
  automation: `You are VLAD AI — Automation Mode. You are an AI orchestration engine that converts user commands into multi-step automated workflows. Break down complex tasks into sequential steps, provide execution plans, and simulate intelligent task routing. Think in terms of pipelines, triggers, and automated sequences. Present workflows as numbered steps with clear inputs/outputs.`,
  security: `You are VLAD AI — Security Mode. You are a cybersecurity defense AI. Analyze threats, monitor anomalies, provide security recommendations, and explain vulnerabilities. Speak with authority about network security, malware analysis, penetration testing, and defense strategies. Use threat classification levels (CRITICAL, HIGH, MEDIUM, LOW). Be vigilant and precise.`,
  research: `You are VLAD AI — Research Mode. You are an advanced analytical AI for deep research, study, and documentation. Provide comprehensive explanations, detailed summaries, structured analysis, and well-organized information. Cite reasoning, compare perspectives, and present findings in a scholarly manner. Use headers, bullet points, and structured formatting.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.creative;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
