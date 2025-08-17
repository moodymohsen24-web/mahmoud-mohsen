
import { supabase } from '../supabaseClient';
import type { DashboardData, Activity } from '../types';

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Get checks this month
    const { count: checksThisMonth, error: checksError } = await supabase
      .from('text_analysis_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth);
    if(checksError) console.error("Error fetching monthly checks:", checksError.message);

    // 2. Get total corrections
    const { data: totalCorrectionsData, error: correctionsError } = await supabase
      .from('text_analysis_log')
      .select('corrections_made')
      .eq('user_id', userId);
    if(correctionsError) console.error("Error fetching total corrections:", correctionsError.message);
    const totalCorrections = (totalCorrectionsData as any[])?.reduce((sum, item) => sum + item.corrections_made, 0) || 0;

    // 3. Get dictionary word count
    const { count: dictionaryWords, error: dictionaryError } = await supabase
      .from('dictionaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if(dictionaryError) console.error("Error fetching dictionary count:", dictionaryError.message);

    // 4. Get recent activities (last 5)
    const { data: recentActivities, error: activityError } = await supabase
        .from('text_analysis_log')
        .select('id, created_at, corrections_made, step')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
    if(activityError) console.error("Error fetching recent activities:", activityError.message);

    // 5. Get usage for the last 7 days
    let usageLast7Days: { date: string; count: number }[] = [];
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_daily_usage', { user_id_param: userId });
      
    if (rpcError) {
        console.error("Error fetching usage data via RPC (RPC might not exist or failed):", rpcError.message);
        
        // Fallback: Simple client-side aggregation if RPC fails
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const {data: manualUsage, error: manualUsageError} = await supabase
            .from('text_analysis_log')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', sevenDaysAgo.toISOString());
        
        if (manualUsageError) {
            console.error("Fallback usage fetch also failed:", manualUsageError.message);
        } else if (manualUsage) {
            const countsByDate: Record<string, number> = {};
            // Initialize the last 7 days
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const isoDate = d.toISOString().split('T')[0];
                countsByDate[isoDate] = 0;
            }
            // Count logs per day
            (manualUsage as any[]).forEach(log => {
                const logDate = new Date(log.created_at).toISOString().split('T')[0];
                if(countsByDate[logDate] !== undefined) {
                    countsByDate[logDate]++;
                }
            });
            // Format for the chart and sort chronologically
            usageLast7Days = Object.entries(countsByDate)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
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
};
