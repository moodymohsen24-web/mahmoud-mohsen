import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { RectangleStackIcon } from './icons/RectangleStackIcon';

const Sidebar: React.FC = () => {
    const { t } = useI18n();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-base relative group ${
        isActive
            ? 'bg-highlight text-white shadow-lg shadow-highlight/30'
            : 'text-text-secondary dark:text-dark-text-secondary hover:bg-accent dark:hover:bg-dark-accent hover:text-text-primary dark:hover:text-dark-text-primary'
        }`;

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-2xl shadow-card-shadow dark:shadow-card-shadow-dark h-full flex flex-col border border-border dark:border-dark-border">
            <nav className="flex flex-col gap-2">
                <div className="px-4 py-2 text-xs font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider opacity-70">
                    {t('sidebar.dashboard')}
                </div>
                <NavLink to="/dashboard" className={navLinkClasses} end>
                    <ChartBarIcon className="w-5 h-5" />
                    <span>{t('sidebar.dashboard')}</span>
                </NavLink>
                
                <div className="mt-4 px-4 py-2 text-xs font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider opacity-70">
                    Tools
                </div>
                <NavLink to="/projects" className={navLinkClasses}>
                    <FolderIcon className="w-5 h-5" />
                    <span>{t('sidebar.projects')}</span>
                </NavLink>
                <NavLink to="/text-check" className={navLinkClasses}>
                    <PencilSquareIcon className="w-5 h-5" />
                    <span>{t('sidebar.textCheck')}</span>
                </NavLink>
                <NavLink to="/text-to-speech" className={navLinkClasses}>
                    <SpeakerWaveIcon className="w-5 h-5" />
                    <span>{t('sidebar.textToSpeech')}</span>
                </NavLink>
                <NavLink to="/image-generator" className={navLinkClasses}>
                    <PhotoIcon className="w-5 h-5" />
                    <span>{t('sidebar.imageGenerator')}</span>
                </NavLink>
                
                <div className="mt-4 px-4 py-2 text-xs font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider opacity-70">
                    Library
                </div>
                <NavLink to="/image-gallery" className={navLinkClasses}>
                    <RectangleStackIcon className="w-5 h-5" />
                    <span>{t('sidebar.imageGallery')}</span>
                </NavLink>
                 <NavLink to="/dictionary" className={navLinkClasses}>
                    <BookOpenIcon className="w-5 h-5" />
                    <span>{t('sidebar.dictionary')}</span>
                </NavLink>

                <div className="mt-4 px-4 py-2 text-xs font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider opacity-70">
                    Account
                </div>
                 <NavLink to="/subscription" className={navLinkClasses}>
                    <CreditCardIcon className="w-5 h-5" />
                    <span>{t('sidebar.subscription')}</span>
                </NavLink>
                 <NavLink to="/settings" className={navLinkClasses}>
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>{t('sidebar.settings')}</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;