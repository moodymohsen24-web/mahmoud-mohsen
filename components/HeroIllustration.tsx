import React from 'react';

export const HeroIllustration: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`relative ${className}`}>
        <svg viewBox="0 0 400 300" className="w-full h-auto">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'var(--color-highlight)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--color-highlight-hover)', stopOpacity: 1 }} />
                </linearGradient>
                <style>
                    {`
                        .line { stroke: var(--color-text-secondary); animation: dash 5s linear infinite; }
                        @keyframes dash { to { stroke-dashoffset: -100; } }

                        .wave { stroke: url(#grad1); animation: wave-anim 3s ease-in-out infinite alternate; }
                        @keyframes wave-anim {
                            0% { d: path("M50,150 Q100,120 150,150 T250,150 T350,150"); }
                            100% { d: path("M50,150 Q100,180 150,150 T250,150 T350,150"); }
                        }
                        
                        .sparkle { fill: var(--color-highlight); animation: sparkle-anim 2s ease-in-out infinite; opacity: 0; }
                        @keyframes sparkle-anim {
                            0%, 100% { opacity: 0; transform: scale(0.5); }
                            50% { opacity: 1; transform: scale(1.2); }
                        }
                        .sparkle-1 { animation-delay: 0s; }
                        .sparkle-2 { animation-delay: 0.3s; }
                        .sparkle-3 { animation-delay: 0.6s; }
                        .sparkle-4 { animation-delay: 0.9s; }
                    `}
                </style>
            </defs>

            {/* Text lines */}
            <g transform="translate(20, 50)">
                <path className="line" strokeWidth="2" strokeDasharray="10 5" d="M0,0 L120,0" />
                <path className="line" strokeWidth="2" strokeDasharray="10 5" style={{ animationDelay: '-1s' }} d="M0,20 L150,20" />
                <path className="line" strokeWidth="2" strokeDasharray="10 5" style={{ animationDelay: '-2s' }} d="M0,40 L100,40" />
            </g>

            {/* Sound wave */}
            <path className="wave" strokeWidth="4" fill="none" />
            
            {/* Sparkles */}
            <circle cx="150" cy="150" r="3" className="sparkle sparkle-1" />
            <circle cx="100" cy="130" r="2" className="sparkle sparkle-2" />
            <circle cx="200" cy="160" r="2.5" className="sparkle sparkle-3" />
            <circle cx="250" cy="140" r="3" className="sparkle sparkle-4" />

            {/* Corrected text lines */}
             <g transform="translate(230, 200)">
                <path stroke="var(--color-text-primary)" strokeWidth="2" d="M0,0 L150,0" />
                <path stroke="var(--color-text-primary)" strokeWidth="2" d="M0,20 L120,20" />
                <path stroke="var(--color-text-primary)" strokeWidth="2" d="M0,40 L160,40" />
            </g>
        </svg>
        <style>
          {`
            :root {
              --color-highlight: #2563eb;
              --color-highlight-hover: #3b82f6;
              --color-text-secondary: #64748b;
              --color-text-primary: #0f172a;
            }
            .dark {
              --color-highlight: #3b82f6;
              --color-highlight-hover: #60a5fa;
              --color-text-secondary: #94a3b8;
              --color-text-primary: #f1f5f9;
            }
          `}
        </style>
    </div>
);