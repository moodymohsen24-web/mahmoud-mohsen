import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import RecentActivity from '../components/RecentActivity';
import type { DashboardData } from '../types';
import { useI18n } from '../hooks/useI18n';
import { dashboardService } from '../services/dashboardService';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import UsageChart from '../components/UsageChart';
import { KeyIcon } from '../components/icons/KeyIcon';
import { WalletIcon } from '../components/icons/WalletIcon';
import QuickAccessPanel from '../components/QuickAccessPanel';
import DashboardSkeleton from '../components/DashboardSkeleton';

const AnimatedStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; delay: number; trend?: string }> = ({ title, value, icon, delay, trend }) => (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <StatCard title={title} value={value} icon={icon} trend={trend} />
    </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [coreData, setCoreData] = useState<Omit<DashboardData, 'totalActiveKeys' | 'totalBalance'> | null>(null);
  const [ttsStats, setTtsStats] = useState<{ totalActiveKeys: number; totalBalance: number } | null>(null);
  const [isCoreLoading, setIsCoreLoading] = useState(true);
  const [isTtsLoading, setIsTtsLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const fetchCoreData = async () => {
      if (user) {
        setIsCoreLoading(true);
        try {
          const data = await dashboardService.getDashboardData(user.id);
          setCoreData(data);
        } catch (error) {
          console.error("Failed to load core dashboard data:", error);
        } finally {
          setIsCoreLoading(false);
        }
      }
    };

    fetchCoreData();
  }, [user]);

  useEffect(() => {
    if (user && !isCoreLoading) {
      const fetchTtsData = async () => {
        setIsTtsLoading(true);
        try {
          const stats = await dashboardService.getTtsStats(user.id);
          setTtsStats(stats);
        } catch (error) {
          console.error("Failed to load TTS stats:", error);
          setTtsStats({ totalActiveKeys: 0, totalBalance: 0 });
        } finally {
          setIsTtsLoading(false);
        }
      };
      fetchTtsData();
    }
  }, [user, isCoreLoading]);

  const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
  };

  if (isCoreLoading || !coreData || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-7xl pb-10">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8 mb-8 shadow-lg animate-fade-in-down overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
                {getTimeBasedGreeting()}, {user.name}.
            </h1>
            <p className="text-blue-100 text-lg max-w-xl">{t('dashboard.subtitle')}</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
      
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Charts (Takes up 3 columns on large screens) */}
        <div className="xl:col-span-3 space-y-8">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedStatCard delay={100} title={t('dashboard.statCards.checksThisMonth')} value={coreData.checksThisMonth.toLocaleString()} icon={<DocumentTextIcon className="w-6 h-6 text-white"/>} />
                <AnimatedStatCard delay={200} title={t('dashboard.statCards.totalCorrections')} value={coreData.totalCorrections.toLocaleString()} icon={<SparklesIcon className="w-6 h-6 text-white"/>} />
                <AnimatedStatCard delay={300} title={t('dashboard.statCards.dictionaryWords')} value={coreData.dictionaryWords.toLocaleString()} icon={<BookOpenIcon className="w-6 h-6 text-white"/>} />
                <AnimatedStatCard delay={400} title={t('dashboard.statCards.currentPlan')} value={user.subscription_plans?.name || 'Free'} icon={<CreditCardIcon className="w-6 h-6 text-white"/>} />
            </div>

            {/* Secondary Stats Row (TTS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatedStatCard 
                delay={500}
                title={'Active API Keys'} 
                value={isTtsLoading ? '...' : (ttsStats?.totalActiveKeys ?? 0).toLocaleString()} 
                icon={<KeyIcon className="w-6 h-6 text-white"/>} 
                />
                <AnimatedStatCard 
                delay={600}
                title={'Available Balance (Chars)'} 
                value={isTtsLoading ? '...' : (ttsStats?.totalBalance ?? 0).toLocaleString()} 
                icon={<WalletIcon className="w-6 h-6 text-white"/>} 
                />
            </div>

            {/* Chart Area */}
            <div className="bg-secondary dark:bg-dark-secondary p-1 rounded-2xl shadow-card-shadow dark:shadow-card-shadow-dark animate-fade-in-up border border-border dark:border-dark-border" style={{ animationDelay: '700ms' }}>
                <UsageChart data={coreData.usageLast7Days} />
            </div>
        </div>

        {/* Right Column: Sidebar Actions & Activity (Takes up 1 column) */}
        <div className="xl:col-span-1 space-y-8">
             {/* Quick Access Panel */}
             <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                <QuickAccessPanel />
            </div>

            {/* Recent Activity */}
            <div className="animate-fade-in-up h-full" style={{ animationDelay: '900ms' }}>
                <RecentActivity activities={coreData.recentActivities} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;