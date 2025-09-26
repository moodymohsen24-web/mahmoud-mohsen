import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useI18n } from '../hooks/useI18n';

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUpSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.signUp(name, email, password);
      setSuccess(t('signup.success'));
      if (onSignUpSuccess) {
        setTimeout(onSignUpSuccess, 4000); // Wait so user can read the confirmation message
      }
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('password should be at least 6 characters')) {
            setError(t('signup.error.weakPassword'));
        } else if (err.message.toLowerCase().includes('user already registered')) {
            setError(t('signup.emailExists'));
        } else {
            setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disable form if a success message is shown
  const isFormDisabled = isLoading || !!success;

  return (
    <div>
        <h2 className="text-3xl font-bold text-start text-text-primary dark:text-dark-text-primary mb-6">{t('signup.title')}</h2>
        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-center border border-red-500/20">{error}</p>}
        {success && <p className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-center border border-green-500/20">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="signup-name">
                    {t('form.name')}
                </label>
                <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                required
                disabled={isFormDisabled}
                />
            </div>
            <div>
                <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="signup-email">
                    {t('form.email')}
                </label>
                <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                required
                disabled={isFormDisabled}
                />
            </div>
            <div>
                <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="signup-password">
                    {t('form.password')}
                </label>
                <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
                required
                disabled={isFormDisabled}
                />
            </div>
            <div>
                <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full bg-highlight text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight"
                >
                {isLoading ? t('signup.creatingAccount') : t('signup.signUpButton')}
                </button>
            </div>
        </form>
    </div>
  );
};

export default SignUpForm;