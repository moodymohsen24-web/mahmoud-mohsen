
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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        const dashboardData = await dashboardService.getDashboardData(user.id);
        setData(dashboardData);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading || !data || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-highlight dark:border-dark-highlight"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('dashboard.welcome', { name: user.name })}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('dashboard.subtitle')}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.statCards.checksThisMonth')} value={data.checksThisMonth.toLocaleString()} icon={<DocumentTextIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.totalCorrections')} value={data.totalCorrections.toLocaleString()} icon={<SparklesIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.dictionaryWords')} value={data.dictionaryWords.toLocaleString()} icon={<BookOpenIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        <StatCard title={t('dashboard.statCards.currentPlan')} value={user.subscription_plans?.name || 'N/A'} icon={<CreditCardIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
      </div>

      {(data.totalActiveKeys !== undefined && data.totalBalance !== undefined) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <StatCard title={'المفاتيح النشطة'} value={data.totalActiveKeys.toLocaleString()} icon={<KeyIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
          <StatCard title={'إجمالي الرصيد المتاح'} value={data.totalBalance.toLocaleString()} icon={<WalletIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
            <UsageChart data={data.usageLast7Days} />
        </div>
        <div>
            <RecentActivity activities={data.recentActivities} />
        </div>
      </div>

      <QuickAccessPanel />

    </div>
  );
};

export default DashboardPage;