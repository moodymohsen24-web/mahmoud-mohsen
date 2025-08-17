const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use sandbox for testing

/**
 * Generates a PayPal access token using client credentials.
 * @param clientId The PayPal Client ID.
 * @param clientSecret The PayPal Client Secret.
 * @returns The access token string.
 */
export async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`PayPal Auth Error (${response.status}):`, errorBody);
    throw new Error('Failed to get PayPal access token.');
  }

  const data = await response.json();
  return data.access_token;
}


/**
 * Verifies a webhook signature to ensure it came from PayPal.
 * @param req The incoming request object.
 * @param webhookId The Webhook ID from your PayPal developer dashboard.
 * @param accessToken A valid PayPal access token.
 * @returns A boolean indicating if the signature is valid.
 */
export async function verifyPayPalWebhookSignature(req: Request, webhookId: string, accessToken: string): Promise<boolean> {
  const body = await req.text(); // Read body as text for verification
  const headers = req.headers;

  const verificationResponse = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_time: headers.get('paypal-transmission-time'),
      cert_url: headers.get('paypal-cert-url'),
      auth_algo: headers.get('paypal-auth-algo'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body), // Must send the original event body
    }),
  });

  if (!verificationResponse.ok) {
    console.error("Webhook verification API call failed:", await verificationResponse.text());
    return false;
  }

  const verificationData = await verificationResponse.json();
  return verificationData.verification_status === 'SUCCESS';
}