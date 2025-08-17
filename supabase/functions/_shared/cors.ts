// supabase/functions/_shared/cors.ts

// These are the standard CORS headers for Supabase Edge Functions.
// They allow requests from any origin and specify which headers are allowed.
// This is crucial for allowing the browser (frontend) to call the Edge Functions.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
