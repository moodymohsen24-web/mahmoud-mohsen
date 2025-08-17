import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { SoundWaveIcon } from '../components/icons/SoundWaveIcon';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  return (
    <div className="flex flex-1 bg-primary dark:bg-dark-primary">
      {/* Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary dark:bg-dark-secondary items-center justify-center p-12">
        <div className="text-center">
            <SoundWaveIcon className="w-24 h-24 text-highlight dark:text-dark-highlight mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-3">{t('login.branding.title')}</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg">{t('login.branding.subtitle')}</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full">
            <div className="lg:hidden text-center mb-8">
                <SoundWaveIcon className="w-16 h-16 text-highlight dark:text-dark-highlight mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('header.brand')}</h1>
            </div>

            <LoginForm />
            
            <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm mt-8">
                {t('login.noAccount')}{' '}
                <Link to="/signup" className="font-bold text-highlight dark:text-dark-highlight hover:underline">
                    {t('login.signUpLink')}
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;