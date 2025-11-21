
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import RecentActivity from '../components/RecentActivity';
import type { DashboardData } from '../types';
import { useI18n } from '../hooks/useI18n';
import { dashboardService } from '../services/dashboardService';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { WalletIcon } from '../components/icons/WalletIcon';
import UsageChart from '../components/UsageChart';
import QuickAccessPanel from '../components/QuickAccessPanel';
import DashboardSkeleton from '../components/DashboardSkeleton';

const AnimatedStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; delay: number; trend?: string }> = ({ title, value, icon, delay, trend }) => (
    <div className="animate-fade-in-up h-full" style={{ animationDelay: `${delay}ms` }}>
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
    <div className="container mx-auto max-w-7xl pb-12">
      {/* Header Banner */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-1 tracking-tight">
                {getTimeBasedGreeting()}, {user.name}.
            </h1>
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg">{t('dashboard.subtitle')}</p>
        </div>
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary font-medium bg-secondary dark:bg-dark-secondary px-4 py-2 rounded-full shadow-sm border border-border dark:border-dark-border">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Charts (2/3 width) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedStatCard 
                    delay={100} 
                    title={t('dashboard.statCards.checksThisMonth')} 
                    value={coreData.checksThisMonth.toLocaleString()} 
                    icon={<DocumentTextIcon className="w-6 h-6 text-white"/>} 
                />
                <AnimatedStatCard 
                    delay={200} 
                    title={t('dashboard.statCards.totalCorrections')} 
                    value={coreData.totalCorrections.toLocaleString()} 
                    icon={<SparklesIcon className="w-6 h-6 text-white"/>} 
                />
                <AnimatedStatCard 
                    delay={300} 
                    title={'TTS Balance'} 
                    value={isTtsLoading ? '...' : (ttsStats?.totalBalance ?? 0).toLocaleString()} 
                    icon={<WalletIcon className="w-6 h-6 text-white"/>} 
                />
            </div>

            {/* Chart Section */}
            <div className="bg-secondary dark:bg-dark-secondary p-1 rounded-2xl shadow-sm border border-border dark:border-dark-border animate-fade-in-up flex-grow min-h-[400px]" style={{ animationDelay: '400ms' }}>
                <UsageChart data={coreData.usageLast7Days} />
            </div>
        </div>

        {/* Right Column: Quick Access & Activity (1/3 width) */}
        <div className="xl:col-span-1 flex flex-col gap-8">
             {/* Quick Access */}
             <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-2xl shadow-sm border border-border dark:border-dark-border animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <QuickAccessPanel />
            </div>

            {/* Recent Activity */}
            <div className="flex-grow animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <RecentActivity activities={coreData.recentActivities} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
