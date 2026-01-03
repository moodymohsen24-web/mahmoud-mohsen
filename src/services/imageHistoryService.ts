
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryImageRecord {
    id: string;
    user_id: string;
    image_url: string;
    prompt: string | null;
    negative_prompt: string | null;
    model_used: string | null;
    created_at: string;
}

function dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

export const imageHistoryService = {
    async getHistory(userId: string, page: number = 1, pageSize: number = 12): Promise<{ data: HistoryImageRecord[], total: number }> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
            .from('generated_images')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching image history:", error);
            throw error;
        }

        return { data: data || [], total: count || 0 };
    },
    
    async saveImage(
        userId: string, 
        imageDataUrl: string, 
        prompt: string, 
        negativePrompt: string, 
        model: string
    ): Promise<HistoryImageRecord> {
        const blob = dataURLtoBlob(imageDataUrl);
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated_images')
            .upload(filePath, blob, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
            .from('generated_images')
            .getPublicUrl(uploadData.path);

        const { data: dbData, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: userId,
                image_url: urlData.publicUrl,
                prompt: prompt || null,
                negative_prompt: negativePrompt || null,
                model_used: model,
            } as any)
            .select()
            .single();
            
        if (dbError) throw dbError;

        return dbData;
    },
    
    async clearHistory(userId: string): Promise<void> {
        const { data: files } = await supabase.storage.from('generated_images').list(userId);
        if (files && files.length > 0) {
            const filePaths = files.map(file => `${userId}/${file.name}`);
            await supabase.storage.from('generated_images').remove(filePaths);
        }
        await supabase.from('generated_images').delete().eq('user_id', userId);
    }
};
