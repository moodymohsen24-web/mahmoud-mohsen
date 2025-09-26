import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { useI18n } from '../hooks/useI18n';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useModal } from '../hooks/useModal';

const UserMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-text-primary dark:text-dark-text-primary font-medium px-3 py-2 rounded-md hover:bg-accent dark:hover:bg-dark-accent transition-colors"
            >
                {user?.name}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 end-0 bg-secondary dark:bg-dark-secondary rounded-md shadow-lg py-1 w-40 z-20 border border-border dark:border-dark-border">
                    <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-start px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-accent dark:hover:bg-dark-accent"
                    >
                        {t('header.profile')}
                    </Link>
                    <button
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className="block w-full text-start px-4 py-2 text-sm text-red-500 hover:bg-accent dark:hover:bg-dark-accent"
                    >
                        {t('header.logout')}
                    </button>
                </div>
            )}
        </div>
    );
};


const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const smoothScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleFeaturesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo('features');
  };
  
  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo('pricing');
  };

  return (
    <header className="bg-secondary/80 dark:bg-dark-secondary/80 backdrop-blur-lg sticky top-0 z-50 border-b border-border dark:border-dark-border">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="flex items-center gap-2 text-xl font-bold text-text-primary dark:text-dark-text-primary hover:text-highlight dark:hover:text-dark-highlight transition-colors"
        >
            <SoundWaveIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>
            <span>{t('header.brand')}</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <UserMenu onLogout={handleLogout} />
              <LanguageSwitcher />
              <ThemeSwitcher />
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-text-primary dark:text-dark-text-primary font-medium hover:text-highlight dark:hover:text-dark-highlight transition-colors">{t('header.home')}</Link>
                <a href="#features" onClick={handleFeaturesClick} className="text-text-primary dark:text-dark-text-primary font-medium hover:text-highlight dark:hover:text-dark-highlight transition-colors">{t('header.features')}</a>
                <a href="#pricing" onClick={handlePricingClick} className="text-text-primary dark:text-dark-text-primary font-medium hover:text-highlight dark:hover:text-dark-highlight transition-colors">{t('header.pricing')}</a>
              </div>
              <button
                onClick={() => openModal('auth')}
                className="bg-highlight text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight"
              >
                  {t('header.loginOrSignUp')}
              </button>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;