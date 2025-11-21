declare const Deno: any;

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import { verifyPayPalWebhookSignature, getPayPalAccessToken } from "../_shared/paypal-api.ts";

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Find an Admin user to fetch their settings
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'ADMIN')
      .limit(1)
      .single();

    if (adminError || !adminProfile) {
      throw new Error("Could not find an admin user to load payment settings for webhook verification.");
    }
    
    // 2. Fetch PayPal credentials from admin's settings to get an access token
    const { data: settings, error: settingsError } = await supabaseAdmin
        .from('settings')
        .select('payload')
        .eq('id', adminProfile.id)
        .single();
    
    if (settingsError || !settings?.payload?.paymentGateways?.paypal) {
      throw new Error("PayPal credentials are not configured for webhook verification.");
    }

    const { clientId, clientSecret } = settings.payload.paymentGateways.paypal;
    const accessToken = await getPayPalAccessToken(clientId, clientSecret);
    
    // 3. Verify the webhook signature
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    if (!webhookId) {
        throw new Error("PAYPAL_WEBHOOK_ID is not set in Supabase secrets.");
    }
    
    // We need to clone the request to read the body twice
    const isValid = await verifyPayPalWebhookSignature(req.clone(), webhookId, accessToken);
    
    if (!isValid) {
      console.warn("Invalid PayPal webhook signature received.");
      return new Response("Invalid signature", { status: 403 });
    }

    // 4. Process the event
    const event = await req.json();

    if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const order = event.resource;
      const customId = order.purchase_units[0].custom_id;
      
      if (!customId || !customId.includes('|')) {
          throw new Error("Webhook Error: custom_id is missing or malformed.");
      }
      
      const [userId, planId] = customId.split('|');

      console.log(`Processing approved order: Upgrading user ${userId} to plan ${planId}`);

      // 5. Update user's subscription in the database
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ subscription_plan_id: planId })
        .eq('id', userId);

      if (updateError) {
        console.error("Failed to update user subscription:", updateError);
        // We should still return 200 to PayPal to acknowledge receipt,
        // but log the error for manual intervention.
      } else {
        console.log(`Successfully updated user ${userId} to plan ${planId}`);
      }
    } else {
      console.log(`Received unhandled PayPal event type: ${event.event_type}`);
    }

    // 6. Return a 200 OK response to PayPal
    return new Response("Webhook received", { status: 200 });

  } catch (error) {
    console.error("Error processing PayPal webhook:", error.message);
    // Return a server error but avoid sending detailed error info back
    return new Response("Internal Server Error", { status: 500 });
  }
});