
import { supabase } from '../supabaseClient';
import type { AnalysisResponse } from '../types';
import { dictionaryService } from './dictionaryService';

export const textAnalysisService = {
  
  async correctAndClean(text: string): Promise<AnalysisResponse> {
    const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text, task: 'correctAndClean' }
    });
    if (error) throw error;
    return data;
  },

  async addSelectiveDiacritics(text: string): Promise<AnalysisResponse> {
    const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text, task: 'addSelectiveDiacritics' }
    });
    if (error) throw error;
    return data;
  },

  async replaceWordsFromDictionary(text: string, userId: string): Promise<AnalysisResponse> {
    // Dictionary logic remains client-side/hybrid as it relies on user DB data
    const customDictionary = await dictionaryService.getDictionary(userId);
    let correctionsCount = 0;
    
    if (Object.keys(customDictionary).length === 0) {
      return { processedText: text, correctionsCount: 0 };
    }
    
    const removeDiacritics = (str: string) => str.replace(/[\u064B-\u0652]/g, '');

    const parts = text.split(/(\s+|[.,!?:;،ـ'"()])/);

    const processedParts = parts.map(part => {
        if (/^\s*$|^[.,!?:;،ـ'"()]$/.test(part)) return part;

        const baseWord = removeDiacritics(part);
        
        if (Object.prototype.hasOwnProperty.call(customDictionary, baseWord)) {
            correctionsCount++;
            const replacement = customDictionary[baseWord];
            const safeOriginal = part.replace(/"/g, '&quot;');
            return `<ch data-original="${safeOriginal}">${replacement}</ch>`;
        }
        return part;
    });

    return { processedText: processedParts.join(''), correctionsCount };
  },

  async enhanceText(text: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text, task: 'enhance' }
    });
    if (error) throw error;
    return data.processedText;
  },

  async logAnalysis(userId: string, corrections_made: number, step: number) {
    const { error } = await supabase.from('text_analysis_log').insert({
        user_id: userId,
        corrections_made,
        step,
    } as any);
    if (error) console.error('Failed to log analysis:', error);
  }
};
