import { supabase } from '../supabaseClient';
type Dictionary = Record<string, string>;

export const dictionaryService = {
  async getDictionary(userId: string): Promise<Dictionary> {
    const { data, error } = await supabase
      .from('dictionaries')
      .select('original_word, replacement_word')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching dictionary:', error);
      if (error.message.includes('violates row-level security policy')) {
          throw new Error("Security policy error: Permission denied to view the dictionary.");
      }
      return {};
    }
    
    return (data || []).reduce((acc, item: any) => {
        acc[item.original_word] = item.replacement_word;
        return acc;
    }, {} as Dictionary);
  },

  async addWord(userId: string, originalWord: string, replacementWord: string): Promise<void> {
    const { error } = await supabase
      .from('dictionaries')
      .upsert({ user_id: userId, original_word: originalWord, replacement_word: replacementWord } as any, { onConflict: 'user_id, original_word' });

    if (error) {
        if (error.message.includes('violates row-level security policy')) {
            throw new Error("Security policy error: Permission denied to add a word to the dictionary.");
        }
        throw error;
    }
  },

  async bulkAddWords(userId: string, words: Dictionary): Promise<void> {
    const wordsToInsert = Object.entries(words).map(([original, replacement]) => ({
        user_id: userId,
        original_word: original,
        replacement_word: replacement
    }));
    
    if (wordsToInsert.length === 0) return;

    const { error } = await supabase
      .from('dictionaries')
      .upsert(wordsToInsert as any, { onConflict: 'user_id, original_word' });
      
    if (error) {
        if (error.message.includes('violates row-level security policy')) {
            throw new Error("Security policy error: Permission denied to import words to the dictionary.");
        }
        throw error;
    }
  },

  async deleteWord(userId: string, originalWord: string): Promise<void> {
    const { error } = await supabase
      .from('dictionaries')
      .delete()
      .match({ user_id: userId, original_word: originalWord });
      
    if (error) {
        if (error.message.includes('violates row-level security policy')) {
            throw new Error("Security policy error: Permission denied to delete a word from the dictionary.");
        }
        throw error;
    }
  },
};