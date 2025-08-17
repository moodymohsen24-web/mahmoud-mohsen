import React from 'react';

export const TuneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75m-9.75 6h9.75M3.75 6A.75.75 0 014.5 5.25h1.5A.75.75 0 016.75 6v1.5a.75.75 0 01-.75.75H4.5A.75.75 0 013.75 7.5V6zM3.75 12A.75.75 0 014.5 11.25h1.5A.75.75 0 016.75 12v1.5a.75.75 0 01-.75.75H4.5A.75.75 0 013.75 13.5V12zM3.75 18A.75.75 0 014.5 17.25h1.5A.75.75 0 016.75 18v1.5a.75.75 0 01-.75.75H4.5A.75.75 0 013.75 19.5V18z" />
    </svg>
);
