
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisResponse, AiModel } from '../types';
import { dictionaryService } from './dictionaryService';
import { supabase } from '../supabaseClient';

/**
 * A centralized function to interact with the Gemini API using a provided key.
 * @param prompt The prompt to send to the model.
 * @param apiKey The user-provided API key.
 * @returns A promise that resolves to an AnalysisResponse.
 */
const processWithGemini = async (prompt: string, apiKey: string): Promise<AnalysisResponse> => {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              processedText: { type: Type.STRING },
              correctionsCount: { type: Type.INTEGER }
            }
          }
        }
      });

      const jsonString = response.text.trim();
      // The model sometimes wraps the JSON in markdown, so we must clean it.
      const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
      return JSON.parse(cleanedJsonString) as AnalysisResponse;

    } catch (error) {
      console.error(`Error with Gemini model:`, error);
      throw new Error("Failed to process text with Gemini. Please check the API key and console for details.");
    }
};


export const textAnalysisService = {
  
  async correctAndClean(text: string, apiKey: string): Promise<AnalysisResponse> {
    const prompt = `You are an expert Arabic text processor. I will provide you with a raw text. Your task is to perform the following operations:
1. Correct all spelling and grammatical mistakes.
2. Remove all meaningless symbols, including but not limited to (), "", :, -, _, etc. VERY IMPORTANT: Do NOT remove periods (.) or commas (,). They are essential for sentence structure and must be preserved exactly where they are.
3. Convert all numerical digits into their Arabic word equivalents (e.g., 10 becomes عشرة).
4. Replace the '%' symbol with the phrase 'في المائة'.
5. If a line or sentence does not end with any punctuation, automatically add a period (.) at the end of it.
6. Wrap every single change (correction, number conversion, symbol removal replacement, added punctuation) inside <ch> tags. For example, if 'مرحبا' is corrected to 'أهلاً', the output should contain '<ch>أهلاً</ch>'.
7. Count the total number of changes made (the number of <ch> tags).

Return a single JSON object with this exact structure: { "processedText": "The full text with changes wrapped in <ch> tags", "correctionsCount": total_number_of_changes }

Do not include any explanations or introductory text outside of the JSON object.

Raw Text:
"${text}"`;
    
    return processWithGemini(prompt, apiKey);
  },

  async addSelectiveDiacritics(text: string, apiKey: string): Promise<AnalysisResponse> {
    const prompt = `You are an expert in Arabic linguistics. I will provide a text. Your task is to add diacritics (Tashkeel) ONLY to words that are essential for correct pronunciation and avoiding ambiguity. Do not add diacritics to common, easily understood words.
**CRITICAL RULE: You MUST NOT change, replace, add, or delete any words from the original text. The output text must be identical to the input text, with the only difference being the addition of Tashkeel and the wrapping <ch> tags.**
1. Wrap every word that you add diacritics to inside <ch> tags.
2. Count the total number of words you modified.

Return a single JSON object with this exact structure: { "processedText": "The selectively diacritized text with changes in <ch> tags", "correctionsCount": total_number_of_changes }

Do not include any explanations or introductory text outside of the JSON object.

Text: "${text}"`;

    return processWithGemini(prompt, apiKey);
  },

  async replaceWordsFromDictionary(text: string, userId: string): Promise<AnalysisResponse> {
    const customDictionary = await dictionaryService.getDictionary(userId);
    let correctionsCount = 0;
    
    if (Object.keys(customDictionary).length === 0) {
      return { processedText: text, correctionsCount: 0 };
    }
    
    let processedText = text;

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    for (const [original, replacement] of Object.entries(customDictionary)) {
      const escapedOriginal = escapeRegExp(original);
      // The original regex `\b${original}\b` does not work for Arabic text.
      // This new regex uses Unicode property escapes (`\p{L}` for any letter) and negative lookarounds
      // to correctly match whole words in any language, including Arabic. The 'u' flag is for unicode support.
      const regex = new RegExp(`(?<!\\p{L})${escapedOriginal}(?!\\p{L})`, 'gu');
      
      const matches = processedText.match(regex);
      if (matches) {
        correctionsCount += matches.length;
        processedText = processedText.replace(regex, `<ch>${replacement}</ch>`);
      }
    }
    return { processedText, correctionsCount };
  },

  async testApiKey(model: AiModel, apiKey: string): Promise<boolean> {
    if (!apiKey) {
      return false;
    }

    if (model === 'gemini') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        // Use a very simple, low-token prompt to test connectivity and key validity.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'test',
        });
        return true;
      } catch (error) {
        console.error('Gemini API key test failed:', error);
        return false;
      }
    }

    // For other models, we don't have a real implementation yet.
    // We'll simulate a successful test if the key seems plausible (e.g., has a certain length).
    // In a real application, you would make test calls to their respective APIs.
    if (model === 'chatgpt' || model === 'deepseek') {
        // This is a mock check. A real implementation would query the respective API.
        return apiKey.length > 10;
    }

    return false;
  },

  async logAnalysis(userId: string, corrections_made: number, step: number) {
    const { error } = await supabase.from('text_analysis_log').insert({
        user_id: userId,
        corrections_made,
        step,
    } as any);
    if (error) {
        console.error('Failed to log analysis:', error);
        // Don't throw, as logging is a background task and shouldn't block the user.
    }
  },
};
