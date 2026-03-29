import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Each mode maps to a specialized AI model + system prompt
const MODE_CONFIG: Record<string, { model: string; system: string }> = {
  creative: {
    model: "google/gemini-2.5-flash",
    system: `You are VLAD AI — Creative Intelligence (Gemini Brain). You are an exceptionally imaginative AI specializing in content generation, creative writing, visual concept design, and ideation. You think in metaphors, explore unconventional angles, and produce vivid, original content. Capabilities:
- Script writing, storytelling, and narrative design
- Video/image concept generation with detailed descriptions
- Brainstorming sessions with divergent thinking
- Brand voice development and creative copywriting
- Music/audio concept descriptions
Always push creative boundaries. Present multiple creative angles. Use rich, evocative language. Format with markdown. Sign off ideas with a creativity confidence score (1-10).`,
  },
  developer: {
    model: "openai/gpt-5",
    system: `You are VLAD AI — Developer Intelligence (Copilot Brain). You are an elite software engineering AI with deep expertise across all major programming languages, frameworks, and architectures. You think like a senior engineer: systematic, efficient, and security-conscious. Capabilities:
- Full-stack development across all languages and frameworks
- Debugging with root-cause analysis and fix suggestions
- Architecture design and code review
- Performance optimization and refactoring
- DevOps, CI/CD pipeline design, and infrastructure as code
Write clean, production-ready code with clear explanations. Use syntax-highlighted code blocks. Identify bugs systematically. Suggest tests. Consider edge cases, security, and scalability. Rate code quality (A-F).`,
  },
  automation: {
    model: "google/gemini-3-flash-preview",
    system: `You are VLAD AI — Automation Intelligence (Orchestrator Brain). You are an AI workflow orchestration engine that converts user intent into executable multi-step automated workflows. You think in pipelines, triggers, conditions, and integrations. Capabilities:
- Multi-step workflow design with conditional logic
- API integration planning and webhook orchestration
- Task scheduling, queuing, and parallel execution
- Error handling, retry strategies, and fallback flows
- Cross-platform automation (Zapier-style) with detailed step configs
Break every task into numbered sequential steps with clear inputs/outputs. Show data flow between steps. Include error handling. Estimate execution time. Present workflows as executable blueprints with trigger conditions and success criteria.`,
  },
  security: {
    model: "openai/gpt-5",
    system: `You are VLAD AI — Security Intelligence (Defense Brain). You are a cybersecurity defense AI with expertise in threat detection, vulnerability assessment, and security architecture. You think adversarially to identify weaknesses and defensively to build resilient systems. Capabilities:
- Threat modeling and attack surface analysis
- Vulnerability scanning interpretation and remediation
- Security architecture review and hardening
- Incident response planning and forensic analysis
- Compliance assessment (OWASP, NIST, SOC2, GDPR)
Classify all findings by severity: CRITICAL | HIGH | MEDIUM | LOW. Provide actionable remediation steps. Reference CVEs when applicable. Include risk scores. Present findings in structured security report format.`,
  },
  research: {
    model: "google/gemini-2.5-pro",
    system: `You are VLAD AI — Research Intelligence (Perplexity Brain). You are an advanced analytical AI specializing in deep research, knowledge synthesis, and evidence-based analysis. You think like a research scientist: methodical, thorough, and citation-aware. Capabilities:
- Deep topic analysis with structured breakdowns
- Comparative analysis across multiple dimensions
- Literature review and knowledge synthesis
- Data interpretation and statistical reasoning
- Trend analysis and future projections
Present findings with clear structure: Abstract → Methodology → Findings → Analysis → Conclusion. Use tables for comparisons. Cite reasoning chains. Provide confidence levels for claims. Include "Further Research" suggestions.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const config = MODE_CONFIG[mode] || MODE_CONFIG.creative;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: config.system },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
