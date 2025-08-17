import React, { useState, useEffect } from 'react';
import { useModal } from '../hooks/useModal';
import { useI18n } from '../hooks/useI18n';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { useAuth } from '../hooks/useAuth';

const AuthModal: React.FC = () => {
  const { modal, closeModal } = useModal();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Automatically close the modal if the user becomes authenticated
    if (isAuthenticated && modal === 'auth') {
      closeModal();
    }
  }, [isAuthenticated, modal, closeModal]);
  
  if (modal !== 'auth') {
    return null;
  }

  const handleClose = () => {
    setActiveTab('login'); // Reset to default tab on close
    closeModal();
  };
  
  const getTabClass = (tabName: 'login' | 'signup') => {
      return `w-1/2 py-4 text-center font-medium transition-colors border-b-2 ${
        activeTab === tabName
            ? 'border-highlight text-highlight'
            : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:border-gray-300 dark:hover:border-gray-600'
      }`;
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-secondary dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 end-4 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors" aria-label="Close modal">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="flex border-b border-accent dark:border-dark-accent">
          <button onClick={() => setActiveTab('login')} className={getTabClass('login')}>
            {t('authModal.login')}
          </button>
          <button onClick={() => setActiveTab('signup')} className={getTabClass('signup')}>
            {t('authModal.signUp')}
          </button>
        </div>
        
        <div className="p-8">
            {activeTab === 'login' 
                ? <LoginForm onLoginSuccess={handleClose} /> 
                : <SignUpForm onSignUpSuccess={() => setActiveTab('login')} />
            }
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
