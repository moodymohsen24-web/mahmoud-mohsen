import React from 'react';
import { useI18n } from '../hooks/useI18n';

interface GeneratingAnimationProps {
  progress: number;
}

const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({ progress }) => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 text-text-secondary dark:text-dark-text-secondary">
            <div className="flex items-center justify-center space-x-2 h-12">
                <div className="w-3 h-3 bg-highlight dark:bg-dark-highlight rounded-full animate-wave-scale" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-highlight dark:bg-dark-highlight rounded-full animate-wave-scale" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-highlight dark:bg-dark-highlight rounded-full animate-wave-scale" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-highlight dark:bg-dark-highlight rounded-full animate-wave-scale" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-3 bg-highlight dark:bg-dark-highlight rounded-full animate-wave-scale" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mt-6 tabular-nums">
                {t('imageGenerator.generating')}... {progress}%
            </h3>
        </div>
    );
};

export default GeneratingAnimation;