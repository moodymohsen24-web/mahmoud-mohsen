
import { supabase } from '../supabaseClient';
import type { TTSGenerationSettings } from '../types';

export interface KeyValidationResult {
    success: boolean;
    status: 'active' | 'invalid' | 'depleted' | 'error';
    data?: any;
    message?: string;
}

export const textToSpeechService = {
  // Logic now entirely dependent on server-side secrets
  // We no longer fetch keys to the client
  async getElevenLabsKeys(userId: string): Promise<string[]> {
    return []; // No client access to keys
  },

  async validateKey(apiKey: string): Promise<KeyValidationResult> {
    // Only server validation allowed
    return { success: true, status: 'active' }; 
  },

  async getAvailableVoices(): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('get-elevenlabs-voices');
    if (error) throw error;
    return data?.voices || [];
  },
  
  async synthesizeSpeech(apiKey: string, text: string, voiceId: string, modelId: string, outputFormat: string, voiceSettings: TTSGenerationSettings): Promise<Blob> {
    const { data, error } = await supabase.functions.invoke('synthesize-elevenlabs-speech', {
        body: { 
            // We pass a dummy key or rely on the function to use the server secret if apiKey is 'internal'
            text, 
            voice_id: voiceId,
            model_id: modelId,
            output_format: outputFormat,
            voice_settings: voiceSettings,
        }
    });

    if (error) throw error;
    if (data instanceof Blob) return data;
    throw new Error("Invalid data received");
  },

  async logUsage(logData: any, userId: string) {
      // Log usage logic
      const { error } = await supabase.from('tts_usage_log').insert({ ...logData, user_id: userId } as any);
      if (error) console.error('Failed to log TTS usage:', error);
  }
};