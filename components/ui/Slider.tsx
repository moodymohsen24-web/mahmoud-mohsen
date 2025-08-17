import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueLabel: string;
  description?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, valueLabel, description, id, ...props }) => {
  const sliderId = id || `slider-${label.replace(/\s+/g, '-')}`;
  
  return (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={sliderId} className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary">
            {label}
            </label>
            <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{valueLabel}</span>
        </div>
        <input
            id={sliderId}
            type="range"
            {...props}
            className="w-full h-2 bg-secondary dark:bg-dark-secondary rounded-lg appearance-none cursor-pointer"
        />
        {description && <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">{description}</p>}
    </div>
  );
};
