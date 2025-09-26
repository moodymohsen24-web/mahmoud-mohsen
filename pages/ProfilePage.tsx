import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useI18n } from '../hooks/useI18n';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.updateProfile(user.id, name, email, newPassword || undefined);
      
      const updatedUser: User = { ...user, name, email };
      updateUser(updatedUser);

      setSuccess(t('profile.updateSuccess'));
      setNewPassword('');

    } catch (err: any) {
      if (err.message.includes("Email rate limit exceeded")) {
         setError(t('profile.emailExists'));
      } else {
         setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return null; // or a loading state
  }

  return (
    <div className="container mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('profile.title')}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('profile.subtitle')}</p>
      
      <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-md border border-border dark:border-dark-border">
        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-6 text-center border border-red-500/20">{error}</p>}
        {success && <p className="bg-green-500/10 text-green-500 p-3 rounded mb-6 text-center border border-green-500/20">{success}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="name">
              {t('form.name')}
            </label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-primary dark:bg-dark-primary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
          </div>
          
          <div>
            <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="email">
              {t('form.email')}
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-primary dark:bg-dark-primary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
          </div>

          <hr className="border-border dark:border-dark-border" />

          <div>
            <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="newPassword">
              {t('form.newPassword')}
            </label>
            <input
              id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-text-primary dark:text-dark-text-primary bg-primary dark:bg-dark-primary rounded-lg border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>

          <div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-highlight text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight"
            >
              {isLoading ? t('profile.updating') : t('profile.updateButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;