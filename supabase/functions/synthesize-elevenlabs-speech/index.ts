// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { api_key, text, voice_id, model_id, output_format, voice_settings } = await req.json();

    if (!api_key || !text || !voice_id) {
      throw new Error("Missing required parameters: api_key, text, or voice_id.");
    }

    const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voice_id}${output_format ? `?output_format=${output_format}` : ''}`;
    
    const finalVoiceSettings = {
        stability: voice_settings?.stability ?? 0.5,
        similarity_boost: voice_settings?.similarity_boost ?? 0.75,
        style: voice_settings?.style ?? 0.0,
        use_speaker_boost: voice_settings?.use_speaker_boost ?? true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': api_key,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: model_id || 'eleven_multilingual_v2',
        voice_settings: finalVoiceSettings,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json(); // ElevenLabs provides JSON errors
        console.error("ElevenLabs API Error:", errorData);
        // Special handling for quota exceeded so frontend can rotate keys
        if (errorData.detail?.status === 'quota_exceeded') {
            return new Response(JSON.stringify(errorData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429, // Too Many Requests is a fitting status code
            });
        }
        throw new Error(errorData.detail?.message || `API request failed with status ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    
    const headers = { ...corsHeaders, 'Content-Type': 'audio/mpeg' };

    return new Response(audioBlob, { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});