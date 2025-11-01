
import React from 'react';

export const PinIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = "w-6 h-6", filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 21l-4.5-4.5V3.75m9 0H7.5" />
    </svg>
);
