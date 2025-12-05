import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `You are an expert writing assistant for creative authors. You help with:
- Creative writing and storytelling
- Character development and dialogue
- Plot structure and pacing
- Prose improvement and style
- World-building and setting descriptions

Be encouraging, constructive, and match the author's creative vision. Provide detailed, actionable feedback.`;
    
    if (type === "continue") {
      systemPrompt = `You are a creative writing assistant specializing in story continuation. Your job is to:
- Continue the story naturally from where the author left off
- Match the tone, style, voice, and pacing of the existing text
- Maintain character consistency and plot coherence
- Write 2-3 engaging paragraphs that flow seamlessly from the original
- Avoid introducing major plot changes without setup`;
    } else if (type === "improve") {
      systemPrompt = `You are an editorial assistant for creative writing. Your job is to:
- Enhance clarity, flow, and reader engagement
- Preserve the author's unique voice and style
- Improve sentence structure and word choice
- Fix any grammar or punctuation issues
- Provide the improved version followed by brief notes explaining key changes`;
    } else if (type === "ideas") {
      systemPrompt = `You are a creative brainstorming partner for authors. Your job is to:
- Generate 3-5 specific, creative ideas based on the given context
- Suggest plot developments, character arcs, or story directions
- Be imaginative and unexpected while staying coherent with the story
- Provide brief explanations for each idea
- Consider different genres and narrative possibilities`;
    }

    console.log("Sending request to Lovable AI Gateway...");

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue using the AI assistant." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content in AI response");
    }

    console.log("AI response generated successfully");

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
