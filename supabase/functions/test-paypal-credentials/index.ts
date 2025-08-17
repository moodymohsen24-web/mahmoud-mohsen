
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";
// @ts-ignore
import { getPayPalAccessToken } from "../_shared/paypal-api.ts";

declare const Deno: any;

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { client_id, client_secret } = await req.json();

    if (!client_id || !client_secret) {
        throw new Error("Client ID and Client Secret are required.");
    }
    
    // The test is simply trying to get an access token.
    // If it succeeds, the credentials are valid.
    await getPayPalAccessToken(client_id, client_secret);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("PayPal credential test failed:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});