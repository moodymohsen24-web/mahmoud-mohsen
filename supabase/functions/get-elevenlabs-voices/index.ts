
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: any;

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Get user from JWT to ensure this is an authenticated request
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find an Admin user to fetch their settings
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'ADMIN')
      .limit(1)
      .single();

    if (adminError || !adminProfile) {
      throw new Error("Could not find an admin user to load TTS settings from.");
    }
    
    // 3. Fetch the admin's settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
        .from('settings')
        .select('payload')
        .eq('id', adminProfile.id)
        .single();
        
    const ttsKeysRaw = settingsData?.payload?.textToSpeech?.keys?.elevenlabs || [];
    // Sanitize keys to handle both string arrays and legacy arrays of objects {key: '...'}
    const ttsKeys = Array.isArray(ttsKeysRaw) ? ttsKeysRaw.map((k: any) =>
        (typeof k === 'object' && k !== null && k.key) ? k.key : k
    ).filter((k: any): k is string => typeof k === 'string' && k.length > 0) : [];
    
    const apiKey = ttsKeys.length > 0 ? ttsKeys[0] : null;

    if (settingsError || !apiKey) {
      throw new Error("No ElevenLabs API key found in admin settings.");
    }
    
    // 4. Fetch voices from ElevenLabs
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
        headers: {
            'xi-api-key': apiKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch voices from ElevenLabs.');
    }
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});