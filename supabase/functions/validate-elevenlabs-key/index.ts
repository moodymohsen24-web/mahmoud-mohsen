// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Use a top-level try-catch to ensure a structured JSON response is always returned.
  try {
    let body;
    try {
        body = await req.json();
    } catch (e) {
         // If body is not valid JSON, return a structured error.
         return new Response(JSON.stringify({ success: false, status: 'error', message: 'Failed to parse request body as JSON.' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    
    const { api_key } = body;

    if (!api_key || typeof api_key !== 'string') {
      return new Response(JSON.stringify({ success: false, status: 'error', message: 'API key is required and must be a string.' }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Proxy the request to ElevenLabs to validate the key.
    const response = await fetch(`${ELEVENLABS_API_BASE}/user`, {
        method: 'GET',
        headers: { 'xi-api-key': api_key }
    });
    
    // Parse the response from ElevenLabs. It might be a success or an error JSON.
    const data = await response.json();

    // Key is invalid.
    if (response.status === 401) {
      return new Response(JSON.stringify({ success: false, status: 'invalid', message: data.detail?.message || "Invalid API Key." }), {
        status: 200, // Return 200 so the client can process the 'invalid' status from the body.
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Any other API error from ElevenLabs.
    if (!response.ok) {
        const errorMessage = data.detail?.message || `ElevenLabs API Error (${response.status})`;
        return new Response(JSON.stringify({ success: false, status: 'error', message: errorMessage }), {
            status: 200, // Return 200 so client can process the error message from the body.
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    
    // Key is valid, now check subscription status.
    const sub = data?.subscription;
    
    let resultBody;
    if (sub && typeof sub.character_limit === 'number' && typeof sub.character_count === 'number') {
        const balance = {
            character_count: sub.character_count,
            character_limit: sub.character_limit,
        };
        const isDepleted = balance.character_count >= balance.character_limit;
        const status = isDepleted ? 'depleted' : 'active';
        resultBody = { success: true, status, data: balance };
    } else {
        // Assume active if subscription details aren't present but the call was successful.
        resultBody = { success: true, status: 'active', data: null };
    }
    
    return new Response(JSON.stringify(resultBody), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    // This catches unexpected internal errors (e.g., network failure to ElevenLabs).
    console.error("Critical error in validate-elevenlabs-key function:", error);
    return new Response(JSON.stringify({ success: false, status: 'error', message: error.message || 'An unexpected internal error occurred.' }), {
      status: 200, // Still return 200 OK so client can parse the specific internal error message.
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});