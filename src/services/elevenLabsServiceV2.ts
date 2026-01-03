
import { supabase } from '../supabaseClient';

export interface ElevenLabsVoiceV2 {
    voice_id: string;
    name: string;
    category?: string;
    labels?: Record<string, string>;
    preview_url?: string;
}

export interface TTSOptionsV2 {
    voiceId: string;
    modelId: string;
    outputFormat: string; // e.g., 'mp3_44100_128'
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
}

export const elevenLabsServiceV2 = {
    async getVoices(): Promise<ElevenLabsVoiceV2[]> {
        const { data, error } = await supabase.functions.invoke('get-elevenlabs-voices-v2');
        if (error) throw error;
        return data?.voices || [];
    },

    async synthesize(text: string, options: TTSOptionsV2): Promise<Blob> {
        const { data, error } = await supabase.functions.invoke('synthesize-elevenlabs-speech-v2', {
            body: {
                text,
                voice_id: options.voiceId,
                model_id: options.modelId,
                output_format: options.outputFormat,
                voice_settings: {
                    stability: options.stability,
                    similarity_boost: options.similarityBoost,
                    style: options.style,
                    use_speaker_boost: options.useSpeakerBoost
                }
            }
        });

        if (error) throw error;
        if (data instanceof Blob) return data;
        throw new Error("Invalid response format from server.");
    }
};
