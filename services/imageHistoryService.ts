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

// Helper to convert data URL to Blob for uploading
function dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
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
    async getHistory(userId: string): Promise<HistoryImageRecord[]> {
        // Fallback to direct DB query instead of Edge Function to avoid "Failed to send request" errors
        const { data, error } = await supabase
            .from('generated_images')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching image history:", error);
            throw error;
        }

        return data || [];
    },
    
    async saveImage(
        userId: string, 
        imageDataUrl: string, 
        prompt: string, 
        negativePrompt: string, 
        model: string
    ): Promise<HistoryImageRecord> {
        // 1. Convert data URL to blob
        const blob = dataURLtoBlob(imageDataUrl);
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // 2. Upload to Supabase Storage in the 'generated_images' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated_images')
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error("Error uploading image to storage:", uploadError);
            throw uploadError;
        }
        
        // 3. Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('generated_images')
            .getPublicUrl(uploadData.path);

        // 4. Insert record into the database table
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
            
        if (dbError) {
            console.error("Error saving image record to DB:", dbError);
            // Attempt to clean up storage if DB insert fails to avoid orphaned files
            await supabase.storage.from('generated_images').remove([filePath]);
            
            if (dbError.message.includes('violates row-level security policy')) {
                throw new Error("Security policy error: Your user account does not have permission to save images. Please check your database's Row Level Security policies.");
            }
            throw dbError;
        }

        return dbData;
    },
    
    async clearHistory(userId: string): Promise<void> {
        // 1. Get all files for the user from storage
        const { data: files, error: listError } = await supabase.storage
            .from('generated_images')
            .list(userId);

        if (listError) {
            console.error("Error listing files for deletion:", listError);
            throw listError;
        }
        
        // 2. Delete all found files from storage
        if (files && files.length > 0) {
            const filePaths = files.map(file => `${userId}/${file.name}`);
            const { error: removeError } = await supabase.storage
                .from('generated_images')
                .remove(filePaths);
            if(removeError) {
                console.error("Error removing files from storage:", removeError);
                // We proceed to delete DB records anyway, but log this error
            }
        }
        
        // 3. Delete all records from the database for that user
        const { error: dbError } = await supabase
            .from('generated_images')
            .delete()
            .eq('user_id', userId);
            
        if (dbError) {
            console.error("Error deleting records from DB:", dbError);
            if (dbError.message.includes('violates row-level security policy')) {
                throw new Error("Security policy error: Permission denied to clear history. Please check RLS policies.");
            }
            throw dbError;
        }
    }
};