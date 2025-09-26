import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useI18n } from '../hooks/useI18n';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      // AuthContext listener will handle the global state update and redirection.
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('email not confirmed')) {
          setError(t('login.emailNotConfirmed'));
        } else {
          setError(t('login.invalidCredentials'));
        }
      } else {
         setError(t('login.invalidCredentials'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <h2 className="text-3xl font-bold text-start text-text-primary dark:text-dark-text-primary mb-6">{t('login.title')}</h2>
        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-center border border-red-500/20">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="login-email">
                    {t('form.email')}
                </label>
                <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                required
                />
            </div>
            <div>
                <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="login-password">
                    {t('form.password')}
                </label>
                <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                required
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input 
                        id="remember-me" 
                        name="remember-me" 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-highlight bg-accent border-gray-300 rounded focus:ring-highlight dark:border-gray-600" 
                    />
                    <label htmlFor="remember-me" className="ms-2 block text-sm text-text-secondary dark:text-dark-text-secondary">
                        {t('form.rememberMe')}
                    </label>
                </div>

                <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-highlight hover:underline">
                        {t('login.forgotPassword')}
                    </Link>
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-highlight text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight"
                >
                {isLoading ? t('login.signingIn') : t('login.signInButton')}
                </button>
            </div>
        </form>
    </div>
  );
};

export default LoginForm;