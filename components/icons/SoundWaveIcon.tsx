import React from 'react';

export const SoundWaveIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5v15m-4.5-9v3m9-6v9m-9-1.5h.008v.008H8.25v-.008zm4.5-.75h.008v.008H12.75v-.008zm4.5 3h.008v.008H17.25v-.008z" />
    </svg>
);