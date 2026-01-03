
import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: any;

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      throw new Error("Server configuration error: ELEVENLABS_API_KEY not set.");
    }

    const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
        headers: {
            'xi-api-key': apiKey
        }
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to fetch voices from ElevenLabs: ${err}`);
    }
    
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
