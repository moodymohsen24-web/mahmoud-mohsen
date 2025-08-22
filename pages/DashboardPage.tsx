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
          // Optionally set an error state here
        } finally {
          setIsCoreLoading(false);
        }
      }
    };

    fetchCoreData();
  }, [user]);

  useEffect(() => {
    // This effect runs after the core data has loaded
    if (user && !isCoreLoading) {
      const fetchTtsData = async () => {
        setIsTtsLoading(true);
        try {
          const stats = await dashboardService.getTtsStats(user.id);
          setTtsStats(stats);
        } catch (error) {
          console.error("Failed to load TTS stats:", error);
          setTtsStats({ totalActiveKeys: 0, totalBalance: 0 }); // Set default on error
        } finally {
          setIsTtsLoading(false);
        }
      };
      fetchTtsData();
    }
  }, [user, isCoreLoading]); // Dependency on isCoreLoading ensures it runs after the first fetch

  if (isCoreLoading || !coreData || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('dashboard.welcome', { name: user.name })}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('dashboard.subtitle')}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.statCards.checksThisMonth')} value={coreData.checksThisMonth.toLocaleString()} icon={<DocumentTextIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.totalCorrections')} value={coreData.totalCorrections.toLocaleString()} icon={<SparklesIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.dictionaryWords')} value={coreData.dictionaryWords.toLocaleString()} icon={<BookOpenIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.currentPlan')} value={user.subscription_plans?.name || 'N/A'} icon={<CreditCardIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard 
          title={'المفاتيح النشطة'} 
          value={isTtsLoading ? '...' : (ttsStats?.totalActiveKeys ?? 0).toLocaleString()} 
          icon={<KeyIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} 
        />
        <StatCard 
          title={'إجمالي الرصيد المتاح'} 
          value={isTtsLoading ? '...' : (ttsStats?.totalBalance ?? 0).toLocaleString()} 
          icon={<WalletIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
            <UsageChart data={coreData.usageLast7Days} />
        </div>
        <div>
            <RecentActivity activities={coreData.recentActivities} />
        </div>
      </div>

      <QuickAccessPanel />

    </div>
  );
};

export default DashboardPage;