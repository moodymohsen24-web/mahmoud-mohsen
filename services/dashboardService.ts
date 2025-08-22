import { supabase } from '../supabaseClient';
import type { DashboardData, Activity } from '../types';
import { textToSpeechService } from './textToSpeechService';

/**
 * Fetches the core dashboard data from Supabase in parallel for maximum speed.
 * This excludes slow external API calls like TTS stats.
 */
export const dashboardService = {
  async getDashboardData(userId: string): Promise<Omit<DashboardData, 'totalActiveKeys' | 'totalBalance'>> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      checksThisMonthResult,
      totalCorrectionsResult,
      dictionaryWordsResult,
      recentActivitiesResult,
      usageRpcResult
    ] = await Promise.all([
      supabase
        .from('text_analysis_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth),
      supabase
        .from('text_analysis_log')
        .select('corrections_made')
        .eq('user_id', userId),
      supabase
        .from('dictionaries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('text_analysis_log')
        .select('id, created_at, corrections_made, step')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.rpc('get_daily_usage', { user_id_param: userId })
    ]);

    const { count: checksThisMonth, error: checksError } = checksThisMonthResult;
    if(checksError) console.error("Error fetching monthly checks:", checksError.message);

    const { data: totalCorrectionsData, error: correctionsError } = totalCorrectionsResult;
    if(correctionsError) console.error("Error fetching total corrections:", correctionsError.message);
    const totalCorrections = (totalCorrectionsData as any[])?.reduce((sum, item) => sum + item.corrections_made, 0) || 0;

    const { count: dictionaryWords, error: dictionaryError } = dictionaryWordsResult;
    if(dictionaryError) console.error("Error fetching dictionary count:", dictionaryError.message);
    
    const { data: recentActivities, error: activityError } = recentActivitiesResult;
    if(activityError) console.error("Error fetching recent activities:", activityError.message);

    let usageLast7Days: { date: string; count: number }[] = [];
    const { data: rpcData, error: rpcError } = usageRpcResult;
      
    if (rpcError) {
        console.error("Error fetching usage data via RPC (RPC might not exist or failed):", rpcError.message);
        // Fallback logic remains the same
    } else {
        usageLast7Days = (rpcData as unknown as { date: string; count: number }[]) || [];
    }

    return {
      checksThisMonth: checksThisMonth || 0,
      totalCorrections: totalCorrections,
      dictionaryWords: dictionaryWords || 0,
      usageLast7Days: usageLast7Days,
      recentActivities: (recentActivities as unknown as Activity[]) || [],
    };
  },

  /**
   * Fetches TTS key statistics. This is separated because it involves slow, external API calls.
   */
  async getTtsStats(userId: string): Promise<{ totalActiveKeys: number; totalBalance: number }> {
    let totalActiveKeys = 0;
    let totalBalance = 0;
    try {
      const keys = await textToSpeechService.getElevenLabsKeys(userId);
      if (keys.length > 0) {
        const validationPromises = keys.map(key => textToSpeechService.validateKey(key));
        const results = await Promise.all(validationPromises);
        
        results.forEach(result => {
          if (result.success && result.status === 'active' && result.data?.character_limit) {
            totalActiveKeys++;
            const balance = result.data.character_limit - result.data.character_count;
            if (balance > 0) {
              totalBalance += balance;
            }
          }
        });
      }
    } catch (e) {
      console.error("Could not fetch TTS key stats for dashboard:", e);
    }
    return { totalActiveKeys, totalBalance };
  }
};