
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
        if (session) {
            const { data, error } = await supabase.functions.invoke('validate-elevenlabs-key', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
                body: { api_key: apiKey },
            });

            if (error) throw error;
            if (data) return data as KeyValidationResult;
        }
    } catch (error) {
        // Silently fail to fallback
        // console.debug("Edge Function validation skipped:", error);
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
        // console.debug("Edge Function voices fetch failed:", e);
    }

    // If Edge function fails, we just throw or return empty, as we can't easily list voices client-side without an admin key (usually).
    // However, for the user's OWN key, we could try.
    // For now, we'll assume the predefined list in the UI is the fallback.
    throw new Error("Failed to fetch voices from server.");
  },
  
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

            if (error) {
                 // Try to extract JSON error body if possible
                 try {
                     // @ts-ignore
                     if(error.context && typeof error.context.json === 'function') {
                         // @ts-ignore
                         const errBody = await error.context.json();
                         if(errBody && errBody.detail && errBody.detail.status === 'quota_exceeded') {
                             throw new Error('quota');
                         }
                     }
                 } catch(e) { /* ignore */ }
                 throw error; 
            }

            if (data instanceof Blob) {
                return data;
            }
            throw new Error("Invalid data received from Edge Function");
        }
    } catch (error: any) {
        if (error.message === 'quota') throw error;
        // console.debug("Edge Function synthesis skipped, using fallback:", error);
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
