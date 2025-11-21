
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
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm relative group overflow-hidden ${
        isActive
            ? 'bg-highlight text-white shadow-md shadow-highlight/20'
            : 'text-text-secondary dark:text-dark-text-secondary hover:bg-accent dark:hover:bg-dark-accent hover:text-text-primary dark:hover:text-dark-text-primary'
        }`;

    const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="px-4 py-2 mt-4 mb-1 text-[11px] font-bold text-text-secondary/70 dark:text-dark-text-secondary/70 uppercase tracking-widest">
            {children}
        </div>
    );

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-2xl shadow-sm border border-border dark:border-dark-border h-full flex flex-col">
            <nav className="flex flex-col space-y-1">
                <NavLink to="/dashboard" className={navLinkClasses} end>
                    <ChartBarIcon className="w-5 h-5" />
                    <span>{t('sidebar.dashboard')}</span>
                </NavLink>
                
                <SectionLabel>Tools</SectionLabel>
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
                
                <SectionLabel>Library</SectionLabel>
                <NavLink to="/image-gallery" className={navLinkClasses}>
                    <RectangleStackIcon className="w-5 h-5" />
                    <span>{t('sidebar.imageGallery')}</span>
                </NavLink>
                 <NavLink to="/dictionary" className={navLinkClasses}>
                    <BookOpenIcon className="w-5 h-5" />
                    <span>{t('sidebar.dictionary')}</span>
                </NavLink>

                <SectionLabel>Account</SectionLabel>
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
