import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    async function callModel(model: string) {
      const isOpenAI = model.startsWith("openai/");
      const body = isOpenAI
        ? { model, prompt, size: "1024x1024", quality: "low", n: 1 }
        : {
            model,
            messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
            modalities: ["image", "text"],
          };
      const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return res;
    }

    const models = ["openai/gpt-image-2", "google/gemini-2.5-flash-image"];
    let lastErrStatus = 500;
    let lastErrText = "";
    for (const model of models) {
      const response = await callModel(model);
      if (!response.ok) {
        lastErrStatus = response.status;
        lastErrText = await response.text();
        console.error("Image gateway error", model, response.status, lastErrText);
        if (response.status === 429 || response.status === 402) break;
        continue;
      }
      const data = await response.json();
      const b64: string | undefined = data?.data?.[0]?.b64_json;
      if (b64) {
        return new Response(JSON.stringify({ image_url: `data:image/png;base64,${b64}`, model }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("No image in response", model, JSON.stringify(data).slice(0, 500));
    }

    if (lastErrStatus === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (lastErrStatus === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "No image returned by model" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
