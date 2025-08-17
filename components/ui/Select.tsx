import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, id, containerClassName = '', ...props }) => {
  const selectId = id || `select-${label.replace(/\s+/g, '-')}`;
  return (
    <div className={containerClassName}>
      <label htmlFor={selectId} className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">
        {label}
      </label>
      <select
        id={selectId}
        {...props}
        className="w-full p-2.5 text-text-primary dark:text-dark-text-primary bg-accent dark:bg-dark-accent rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
