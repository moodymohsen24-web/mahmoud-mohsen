// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";
// @ts-ignore
import { getPayPalAccessToken } from '../_shared/paypal-api.ts';

declare const Deno: any;

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan_id } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Get user from JWT
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch plan details from the database
    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("name, price")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found or database error.");
    }
    
    // 3. Find an Admin user to fetch their settings
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'ADMIN')
      .limit(1)
      .single();

    if (adminError || !adminProfile) {
      throw new Error("Could not find an admin user to load payment settings from.");
    }

    // 4. Fetch the admin's PayPal credentials securely from the database
    const { data: settingsData, error: settingsError } = await supabaseAdmin
        .from('settings')
        .select('payload')
        .eq('id', adminProfile.id)
        .single();
    
    const paypalSettings = settingsData?.payload?.paymentGateways?.paypal;

    if (settingsError || !paypalSettings?.clientId || !paypalSettings?.clientSecret) {
      throw new Error("PayPal credentials are not configured by an admin.");
    }

    const { clientId, clientSecret } = paypalSettings;
    
    // 5. Get PayPal Access Token
    const accessToken = await getPayPalAccessToken(clientId, clientSecret);
    
    // 6. Create a PayPal Order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: plan.price.toString(),
        },
        description: `Subscription to ${plan.name} plan`,
        custom_id: `${user.id}|${plan_id}` // Important: Pass user and plan IDs for webhook
      }],
      application_context: {
        return_url: `${Deno.env.get("SITE_URL") || 'http://localhost:3000'}/#/payment-success`,
        cancel_url: `${Deno.env.get("SITE_URL") || 'http://localhost:3000'}/#/payment-cancelled`,
        brand_name: "Masmoo",
        user_action: 'PAY_NOW',
      },
    };

    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
        const errorBody = await orderResponse.json();
        console.error(`PayPal Order Error (${orderResponse.status}):`, errorBody);
        throw new Error(errorBody.message || 'Failed to create PayPal order.');
    }
    
    const orderData = await orderResponse.json();
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error("Could not find PayPal approval URL.");
    }
    
    return new Response(JSON.stringify({ approval_url: approvalUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});