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

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

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

    // 1. Try Supabase Edge Function first (Secure Proxy)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        // If no session, skip directly to fallback to allow non-logged in testing if needed, or just fail.
        if (session) {
            const { data, error } = await supabase.functions.invoke('validate-elevenlabs-key', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
                body: { api_key: apiKey },
            });

            if (!error) {
                return data as KeyValidationResult;
            }
            console.warn("Edge Function validation failed, falling back to direct API:", error);
        }
    } catch (error) {
        console.warn("Edge Function validation crashed, falling back to direct API:", error);
    }

    // 2. Fallback: Direct Client-Side Call
    try {
        const response = await fetch(`${ELEVENLABS_API_BASE}/user`, {
            method: 'GET',
            headers: { 'xi-api-key': apiKey }
        });

        if (response.status === 401) {
            const data = await response.json();
            return { success: false, status: 'invalid', message: data.detail?.message || "Invalid API Key." };
        }

        if (!response.ok) {
            const data = await response.json();
            return { success: false, status: 'error', message: data.detail?.message || `API Error ${response.status}` };
        }

        const data = await response.json();
        const sub = data?.subscription;
        
        if (sub && typeof sub.character_limit === 'number' && typeof sub.character_count === 'number') {
            const balance = {
                character_count: sub.character_count,
                character_limit: sub.character_limit,
            };
            const isDepleted = balance.character_count >= balance.character_limit;
            return { success: true, status: isDepleted ? 'depleted' : 'active', data: balance };
        }

        return { success: true, status: 'active', data: null };

    } catch (error: any) {
        console.error("Client-side validation failed:", error);
        return { success: false, status: 'error', message: error.message || 'Network error during validation.' };
    }
  },

  /**
   * Fetches available voices for the ElevenLabs API.
   */
  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    // 1. Try Edge Function
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase.functions.invoke('get-elevenlabs-voices', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            if (!error && data?.voices) {
                return data.voices;
            }
        }
    } catch (e) {
        console.warn("Edge Function voices fetch failed:", e);
    }

    // Note: We can't easily fallback for voices without an API key provided by the caller.
    // The edge function uses the admin's key. If the user has provided their own key in UI, 
    // we could use that, but this method signature doesn't take a key.
    // For now, we just throw if the edge function fails.
    throw new Error("Failed to fetch voices from server.");
  },
  
  /**
   * Converts a text chunk to speech. Tries Edge Function first, then direct API.
   */
  async synthesizeSpeech(apiKey: string, text: string, voiceId: string, modelId: string, outputFormat: string, voiceSettings: TTSGenerationSettings): Promise<Blob> {
    
    // 1. Try Edge Function
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
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

            if (!error && data instanceof Blob) {
                return data;
            }
            // Specific handling for quota errors passed from EF
            // @ts-ignore
            if (error && error.context && typeof error.context.json === 'function') {
                 // @ts-ignore
                 const errorJson = await error.context.json();
                 if (errorJson.detail?.status === 'quota_exceeded') throw new Error('quota');
            }
            console.warn("Edge Function synthesis failed, falling back to direct API.");
        }
    } catch (error: any) {
        if (error.message === 'quota') throw error; // Rethrow quota errors immediately
        console.warn("Edge Function synthesis crashed:", error);
    }

    // 2. Fallback: Direct Client-Side Call
    try {
        const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}${outputFormat ? `?output_format=${outputFormat}` : ''}`;
        const finalVoiceSettings = {
            stability: voiceSettings?.stability ?? 0.5,
            similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
            style: voiceSettings?.style ?? 0.0,
            use_speaker_boost: voiceSettings?.use_speaker_boost ?? true,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
                'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
                text: text,
                model_id: modelId || 'eleven_multilingual_v2',
                voice_settings: finalVoiceSettings,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.detail?.status === 'quota_exceeded') {
                throw new Error('quota');
            }
            throw new Error(errorData.detail?.message || `API request failed with status ${response.status}`);
        }

        return await response.blob();

    } catch (error) {
        console.error("Client-side synthesis failed:", error);
        throw error;
    }
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
      }
  }
};