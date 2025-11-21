import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string; // e.g., "+12%"
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-xl shadow-sm border border-border dark:border-dark-border flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-gradient-to-br from-highlight to-blue-600 dark:from-blue-600 dark:to-blue-800 p-3 rounded-lg shadow-md">
            {icon}
        </div>
        {trend && (
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                {trend}
            </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-1">{value}</p>
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;