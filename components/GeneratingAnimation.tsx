import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { PhotoIcon } from './icons/PhotoIcon';

interface GeneratingAnimationProps {
  progress: number;
}

const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({ progress }) => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 text-text-secondary dark:text-dark-text-secondary">
             <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .shimmer-icon {
                    position: relative;
                    overflow: hidden;
                    -webkit-mask-image: -webkit-radial-gradient(white, black);
                }
                .shimmer-icon::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    animation: shimmer 2s infinite linear;
                }
                .dark .shimmer-icon::after {
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                }
            `}</style>
            <div className="shimmer-icon mb-4">
                <PhotoIcon className="w-24 h-24 text-highlight/30 dark:text-dark-highlight/30"/>
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary tabular-nums">
                {t('imageGenerator.generating')}... {progress}%
            </h3>
        </div>
    );
};

export default GeneratingAnimation;
