import { supabase } from '../supabaseClient';
import type { TTSGenerationSettings, Settings } from '../types';
import { settingsService } from './settingsService';

export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
}

// Define a more specific return type for the validation function
export interface KeyValidationResult {
    success: boolean;
    status: 'active' | 'invalid' | 'depleted' | 'error';
    data?: {
      character_count: number;
      character_limit: number;
    } | null;
    message?: string;
}


export const textToSpeechService = {
  
  async getElevenLabsKeys(userId: string): Promise<string[]> {
    try {
      const settings = await settingsService.getSettings(userId);
      const rawKeys = settings.textToSpeech?.keys?.elevenlabs || [];
      // Sanitize keys to handle potential legacy object format {key: string, status: string}
      const sanitizedKeys = rawKeys.map((k: any) => 
        (typeof k === 'object' && k !== null && 'key' in k) ? k.key : k
      ).filter((k: any): k is string => typeof k === 'string' && k.trim().length > 0)
      .map(k => k.trim());
      
      const uniqueKeys = [...new Set(sanitizedKeys)];
      return uniqueKeys;
    } catch (e) {
      console.error("Failed to fetch keys from settings", e);
      return [];
    }
  },

  async validateKey(apiKey: string): Promise<KeyValidationResult> {
    if (!apiKey) {
        return { success: false, status: 'invalid', message: 'API key is missing.' };
    }

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated for function call.");

        const { data, error } = await supabase.functions.invoke('validate-elevenlabs-key', {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            body: { api_key: apiKey },
        });

        if (error) {
            // This error is for failures in invoking the function itself (e.g., network, function not found)
            throw new Error(`Failed to invoke validation function: ${error.message}`);
        }

        // The edge function is designed to always return a JSON object with the validation result.
        // We can directly return this data, as its structure matches KeyValidationResult.
        return data as KeyValidationResult;

    } catch (error: any) {
        console.error("Critical error in validateKey:", error);
        return { success: false, status: 'error', message: error.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Fetches available voices for the ElevenLabs API via a secure Supabase Edge Function
   * to avoid exposing the API key on the client-side.
   */
  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated for function call.");

    const { data, error } = await supabase.functions.invoke('get-elevenlabs-voices', {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (error) {
        console.error('Error fetching voices:', error);
        throw error;
    }
    if (!data || !data.voices) {
        throw new Error('Invalid response from voice fetch function.');
    }
    return data.voices;
  },
  
  /**
   * Converts a text chunk to speech using a secure Supabase Edge Function.
   */
  async synthesizeSpeech(apiKey: string, text: string, voiceId: string, modelId: string, outputFormat: string, voiceSettings: TTSGenerationSettings): Promise<Blob> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated for function call.");

    const { data, error } = await supabase.functions.invoke('synthesize-elevenlabs-speech', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: { 
            api_key: apiKey, 
            text, 
            voice_id: voiceId,
            model_id: modelId,
            output_format: outputFormat,
            voice_settings: voiceSettings,
        }
    });

    if (error) {
        // @ts-ignore
        if (error.context && typeof error.context.json === 'function') {
            // @ts-ignore
            const errorJson = await error.context.json();
            if (errorJson.detail?.status === 'quota_exceeded') {
                throw new Error('quota');
            }
            throw new Error(errorJson.detail?.message || errorJson.error || 'Synthesis failed');
        }
        throw error;
    }

    if (!(data instanceof Blob)) {
        throw new Error('Unexpected response format from synthesis function.');
    }
    
    return data;
  },

  /**
   * Logs a successful TTS conversion event to the database.
   */
  async logUsage(logData: {
      api_key_used_suffix: string;
      characters_converted: number;
      voice_id_used: string;
      model_id_used: string;
  }, userId: string) {
      const { error } = await supabase.from('tts_usage_log').insert({
          ...logData,
          user_id: userId
      } as any);

      if (error) {
          console.error('Failed to log TTS usage:', error);
          // This is a non-critical background task, so we don't throw to the user.
      }
  }
};