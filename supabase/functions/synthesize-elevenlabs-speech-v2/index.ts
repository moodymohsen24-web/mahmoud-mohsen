
import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: any;

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voice_id, model_id, output_format, voice_settings } = await req.json();
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (!apiKey) throw new Error("Server configuration error: ELEVENLABS_API_KEY not set.");
    if (!text || !voice_id) throw new Error("Missing required parameters: text or voice_id.");

    const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voice_id}${output_format ? `?output_format=${output_format}` : ''}`;
    
    const body = JSON.stringify({
        text,
        model_id: model_id || 'eleven_multilingual_v2',
        voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75
        }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `API request failed with status ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    
    return new Response(audioBlob, { 
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' }, 
        status: 200 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
