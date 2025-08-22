import React from 'react';

interface CardProps {
  title?: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, titleIcon, children, className = '', headerActions }) => {
  return (
    <div className={`bg-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-lg shadow-lg ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
                {titleIcon && <div className="text-highlight dark:text-dark-highlight">{titleIcon}</div>}
                <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{title}</h2>
            </div>
            {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
