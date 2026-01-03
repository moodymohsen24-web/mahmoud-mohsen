
import { supabase } from '../supabaseClient';

export interface GenerateImageParams {
    prompt: string;
    negativePrompt?: string;
    model: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';
    numberOfImages?: number;
    imageInput?: {
        base64: string;
        mimeType: string;
    };
}

export const imageGenerationService = {
    async generateImage(params: GenerateImageParams): Promise<string[]> {
        const { data, error } = await supabase.functions.invoke('generate-image', {
            body: {
                prompt: params.prompt,
                negativePrompt: params.negativePrompt,
                model: params.model,
                numberOfImages: params.numberOfImages,
                imageBase64: params.imageInput?.base64,
                imageMimeType: params.imageInput?.mimeType
            }
        });

        if (error) {
            console.error("Edge Function Error:", error);
            throw new Error(error.message || "Failed to generate image.");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return data.images;
    }
};
