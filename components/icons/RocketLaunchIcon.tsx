
import React from 'react';

export const RocketLaunchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.56-5.84a6 6 0 017.38-5.84m-7.38 5.84L5.937 5.937m0 0a6 6 0 017.38-5.84m-7.38 5.84L2.25 2.25" />
    </svg>
);