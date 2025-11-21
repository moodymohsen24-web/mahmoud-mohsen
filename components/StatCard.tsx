
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-2xl shadow-sm border border-border dark:border-dark-border flex flex-col justify-between h-full hover:shadow-md hover:border-highlight/30 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-highlight/10 dark:bg-highlight/20 p-3 rounded-xl text-highlight dark:text-dark-highlight group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-highlight dark:text-dark-highlight" })}
        </div>
        {trend && (
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                {trend}
            </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-1 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
