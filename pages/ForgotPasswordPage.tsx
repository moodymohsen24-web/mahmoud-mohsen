import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useI18n } from '../hooks/useI18n';
import { SoundWaveIcon } from '../components/icons/SoundWaveIcon';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage(t('forgotPassword.emailSent'));
    } catch (err) {
      setMessage(t('forgotPassword.emailSent')); // Show generic success message for security
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-primary dark:bg-dark-primary">
      <div className="w-full flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <SoundWaveIcon className="w-16 h-16 text-highlight dark:text-dark-highlight mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('forgotPassword.title')}</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary mt-2">{t('forgotPassword.subtitle')}</p>
            </div>

            {message && <p className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-center border border-green-500/20">{message}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="email">
                        {t('form.email')}
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-highlight text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight"
                    >
                    {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
                    </button>
                </div>
            </form>
            <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm mt-8">
                <Link to="/login" className="font-bold text-highlight dark:text-dark-highlight hover:underline">
                    {t('forgotPassword.backToLogin')}
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;