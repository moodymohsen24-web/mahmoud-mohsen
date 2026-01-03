
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { GoogleGenAI, Modality } from 'https://esm.sh/@google/genai@0.1.1';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, negativePrompt, model, imageBase64, imageMimeType, numberOfImages } = await req.json();

    // 1. Validate User
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 2. Initialize AI Model
    const apiKey = Deno.env.get('GEMINI_API_KEY'); // Use same key for both for now, or separate if needed
    if (!apiKey) throw new Error('Server configuration error: Missing AI Key');

    const ai = new GoogleGenAI({ apiKey });
    
    let generatedImages: string[] = [];

    if (model === 'imagen-4.0-generate-001') {
        // Imagen 4 Logic
        const fullPrompt = negativePrompt 
            ? `${prompt}. Negative prompt: ${negativePrompt}` 
            : prompt;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: numberOfImages || 1,
            },
        });

        if (!response.generatedImages) throw new Error('No images generated');
        generatedImages = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);

    } else {
        // Gemini Flash Logic (Editing/Generation)
        const parts: any[] = [];
        
        if (imageBase64 && imageMimeType) {
            parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
        }
        
        const fullPrompt = negativePrompt 
            ? `${prompt}. Negative prompt: ${negativePrompt}` 
            : prompt;
            
        parts.push({ text: fullPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        if (response.promptFeedback?.blockReason) {
            throw new Error(`Blocked: ${response.promptFeedback.blockReason}`);
        }

        const candidates = response.candidates?.[0]?.content?.parts || [];
        for (const part of candidates) {
            if (part.inlineData) {
                generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }

    if (generatedImages.length === 0) throw new Error('Model returned no valid images.');

    return new Response(JSON.stringify({ images: generatedImages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
