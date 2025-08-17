
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { BeakerIcon } from './icons/BeakerIcon';

const Sidebar: React.FC = () => {
    const { t } = useI18n();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
        isActive
            ? 'bg-highlight/15 text-highlight'
            : 'text-text-secondary dark:text-dark-text-secondary hover:bg-accent dark:hover:bg-dark-accent hover:text-text-primary dark:hover:text-dark-text-primary'
        }`;

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg shadow-lg h-full flex flex-col">
            <nav className="flex flex-col gap-2">
                <NavLink to="/dashboard" className={navLinkClasses} end>
                    <ChartBarIcon className="w-6 h-6" />
                    <span>{t('sidebar.dashboard')}</span>
                </NavLink>
                <NavLink to="/text-check" className={navLinkClasses}>
                    <PencilSquareIcon className="w-6 h-6" />
                    <span>{t('sidebar.textCheck')}</span>
                </NavLink>
                <NavLink to="/text-to-speech" className={navLinkClasses}>
                    <SpeakerWaveIcon className="w-6 h-6" />
                    <span>{t('sidebar.textToSpeech')}</span>
                </NavLink>
                 <NavLink to="/dictionary" className={navLinkClasses}>
                    <BookOpenIcon className="w-6 h-6" />
                    <span>{t('sidebar.dictionary')}</span>
                </NavLink>
                 <NavLink to="/subscription" className={navLinkClasses}>
                    <CreditCardIcon className="w-6 h-6" />
                    <span>{t('sidebar.subscription')}</span>
                </NavLink>
                 <NavLink to="/settings" className={navLinkClasses}>
                    <Cog6ToothIcon className="w-6 h-6" />
                    <span>{t('sidebar.settings')}</span>
                </NavLink>
                 <NavLink to="/experimental" className={navLinkClasses}>
                    <BeakerIcon className="w-6 h-6" />
                    <span>{t('sidebar.experimental')}</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;