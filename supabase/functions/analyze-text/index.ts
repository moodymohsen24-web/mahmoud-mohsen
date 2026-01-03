
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai';

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
    const { text, task, userId } = await req.json();
    
    // 1. Verify User
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 2. Initialize Gemini with Server-Side Secret
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Server configuration error: Missing AI Key');
    
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    let prompt = '';
    let responseSchema = null;
    let responseMimeType = 'text/plain';

    // 3. Construct Prompt based on Task
    if (task === 'correctAndClean') {
        prompt = `You are an expert Arabic text processor. 
        1. Correct spelling/grammar.
        2. Remove meaningless symbols (keep punctuation).
        3. Convert digits to Arabic words.
        4. Replace '%' with 'في المائة'.
        5. Ensure sentences end with punctuation.
        6. Wrap changes in <ch> tags.
        Return JSON: { "processedText": string, "correctionsCount": number }
        Text: "${text}"`;
        responseMimeType = 'application/json';
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                processedText: { type: Type.STRING },
                correctionsCount: { type: Type.INTEGER }
            }
        };
    } else if (task === 'addSelectiveDiacritics') {
        prompt = `Add diacritics (Tashkeel) ONLY to essential words for pronunciation. 
        Do not change words. Wrap modified words in <ch>.
        Return JSON: { "processedText": string, "correctionsCount": number }
        Text: "${text}"`;
        responseMimeType = 'application/json';
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                processedText: { type: Type.STRING },
                correctionsCount: { type: Type.INTEGER }
            }
        };
    } else if (task === 'enhance') {
        prompt = `Enhance the following Arabic text for clarity and flow. Return ONLY the text.
        Text: "${text}"`;
    } else {
        throw new Error('Invalid task');
    }

    // 4. Generate Content
    const config: any = {};
    if (responseMimeType === 'application/json') {
        config.responseMimeType = responseMimeType;
        if (responseSchema) config.responseSchema = responseSchema;
    }

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config
    });

    let output = result.text.trim();

    // 5. Parse JSON if needed
    if (responseMimeType === 'application/json') {
        // Clean markdown code blocks if present
        output = output.replace(/^```json\s*|```\s*$/g, '');
        const json = JSON.parse(output);
        return new Response(JSON.stringify(json), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ processedText: output }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
