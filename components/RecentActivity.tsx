import React from 'react';
import type { Activity } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { useI18n } from '../hooks/useI18n';

const RecentActivity: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const { t } = useI18n();
  
  const stepToTranslationKey = (step: number) => {
    switch(step) {
      case 1: return 'activity.textAnalysis.step1';
      case 2: return 'activity.textAnalysis.step2';
      case 3: return 'activity.textAnalysis.step3';
      default: return 'activity.textAnalysis.unknown';
    }
  }

  const formatTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(t('language') === 'ar' ? 'ar-EG' : 'en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
      }).format(date);
  }

  return (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-md border border-border dark:border-dark-border h-full">
      <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('dashboard.recentActivity.title')}</h3>
      {activities.length === 0 ? (
          <p className="text-center text-text-secondary dark:text-dark-text-secondary py-8">{t('dashboard.recentActivity.empty')}</p>
      ) : (
        <ul className="space-y-4">
            {activities.map((activity) => (
            <li key={activity.id} className="flex items-center gap-4">
                <div className="bg-accent dark:bg-dark-accent p-2 rounded-full flex-shrink-0">
                <PencilSquareIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                <p className="text-text-primary dark:text-dark-text-primary text-sm">
                    {t(stepToTranslationKey(activity.step), { count: activity.corrections_made })}
                </p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{formatTimestamp(activity.created_at)}</p>
                </div>
            </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;