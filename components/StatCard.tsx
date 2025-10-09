import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-xl shadow-card-shadow dark:shadow-card-shadow-dark flex items-center space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
      <div className="bg-highlight/10 dark:bg-dark-accent p-3 rounded-full">
        {icon}
      </div>
      <div className="rtl:space-x-reverse">
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary font-medium">{title}</p>
        <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;