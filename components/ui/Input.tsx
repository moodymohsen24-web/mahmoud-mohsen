import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, containerClassName = '', ...props }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-')}`;
  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="w-full px-3 py-2 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-accent dark:border-dark-accent focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};