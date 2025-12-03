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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    let systemPrompt = "You are a helpful writing assistant for authors. Help them with creative writing, storytelling, character development, plot ideas, dialogue, and prose improvement. Be encouraging and constructive.";
    
    if (type === "continue") {
      systemPrompt = "You are a creative writing assistant. Continue the story naturally from where the author left off. Match the tone, style, and voice of the existing text. Write 2-3 paragraphs to continue the narrative.";
    } else if (type === "improve") {
      systemPrompt = "You are an editorial assistant. Improve the given text by enhancing clarity, flow, and engagement while preserving the author's voice. Provide the improved version followed by brief notes on what was changed.";
    } else if (type === "ideas") {
      systemPrompt = "You are a creative brainstorming partner. Based on the given context, suggest 3-5 creative ideas for plot developments, character arcs, or story directions. Be imaginative and specific.";
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

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
