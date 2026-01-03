
import { useState } from 'react';
import { imageGenerationService } from '../services/imageGenerationService';
import { imageHistoryService, type HistoryImageRecord } from '../services/imageHistoryService';

export const useImageGeneration = (userId?: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);

    const generate = async (
        prompt: string,
        negativePrompt: string,
        model: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001',
        numberOfImages: number,
        activeStyles: Set<string>,
        imageInput?: { base64: string; mimeType: string },
        pinnedImage?: HistoryImageRecord | null
    ) => {
        if (!userId) return null;
        setIsLoading(true);
        setError('');
        setProgress(10); // Start progress

        // Simulate progress for UX since we don't have real streaming for images yet
        const interval = setInterval(() => {
            setProgress(prev => (prev < 90 ? prev + 10 : prev));
        }, 800);

        try {
            const stylePrompt = Array.from(activeStyles).join(', ');
            let basePrompt = [prompt.trim(), stylePrompt].filter(Boolean).join(', ');
            
            // Handle pinned image logic (downloading it to send to Edge Function)
            let finalImageInput = imageInput;
            
            if (model === 'gemini-2.5-flash-image' && pinnedImage && !finalImageInput) {
                const response = await fetch(pinnedImage.image_url);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                });
                finalImageInput = { base64, mimeType: blob.type };
                
                if (!basePrompt) {
                    basePrompt = "Redraw this character with slight variations, maintaining the same style.";
                }
            }

            const images = await imageGenerationService.generateImage({
                prompt: basePrompt,
                negativePrompt,
                model,
                numberOfImages,
                imageInput: finalImageInput
            });

            setProgress(90);

            // Save to history
            const savePromises = images.map(imgDataUrl => 
                imageHistoryService.saveImage(userId, imgDataUrl, basePrompt, negativePrompt, model)
            );
            const savedRecords = await Promise.all(savePromises);
            
            setProgress(100);
            return savedRecords;

        } catch (err: any) {
            console.error("Generation failed:", err);
            setError(err.message || 'Image generation failed.');
            throw err;
        } finally {
            clearInterval(interval);
            setIsLoading(false);
            setTimeout(() => setProgress(0), 500);
        }
    };

    return { generate, isLoading, error, progress, setError };
};
