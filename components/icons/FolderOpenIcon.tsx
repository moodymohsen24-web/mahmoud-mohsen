
import React from 'react';

export const FolderOpenIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a3.75 3.75 0 013.75-3.75h9.75a3.75 3.75 0 013.75 3.75m-16.5 0v7.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-7.5m-16.5 0h16.5" />
    </svg>
);