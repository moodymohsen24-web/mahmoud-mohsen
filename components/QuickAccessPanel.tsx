import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';

const QuickAccessCard: React.FC<{ to: string; icon: React.ReactNode; title: string; }> = ({ to, icon, title }) => (
    <Link to={to} className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-md border border-border dark:border-dark-border flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
        <div className="bg-accent dark:bg-dark-accent p-4 rounded-full mb-4 text-highlight dark:text-dark-highlight">
            {icon}
        </div>
        <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{title}</h3>
    </Link>
);

const QuickAccessPanel: React.FC = () => {
    const { t } = useI18n();

    const links = [
        { to: '/text-check', icon: <PencilSquareIcon className="w-8 h-8"/>, title: t('sidebar.textCheck') },
        { to: '/dictionary', icon: <BookOpenIcon className="w-8 h-8"/>, title: t('sidebar.dictionary') },
        { to: '/settings', icon: <Cog6ToothIcon className="w-8 h-8"/>, title: t('sidebar.settings') },
    ];
    
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('quickAccess.title')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {links.map(link => <QuickAccessCard key={link.to} {...link} />)}
            </div>
        </div>
    );
};

export default QuickAccessPanel;