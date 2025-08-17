
import React from 'react';

export const BeakerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.625a3.375 3.375 0 01-3.375 3.375H3.375v1.5a1.125 1.125 0 01-1.125 1.125H1.5v3.75m15-15.375v5.625a3.375 3.375 0 003.375 3.375h3.375v-1.5a1.125 1.125 0 00-1.125-1.125h-1.5V3.375c0-.621-.504-1.125-1.125-1.125h-1.5A1.125 1.125 0 0016.5 3.375v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 12.75h17.25a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125v-1.5A1.125 1.125 0 013.375 12.75z" />
  </svg>
);