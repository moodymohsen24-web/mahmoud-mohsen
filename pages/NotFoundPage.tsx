
import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';

const NotFoundPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center bg-primary dark:bg-dark-primary p-4">
      <h1 className="text-9xl font-extrabold text-highlight dark:text-dark-highlight tracking-widest">404</h1>
      <div className="bg-secondary dark:bg-dark-secondary px-2 text-sm text-text-primary dark:text-dark-text-primary rounded rotate-12 absolute">
        {t('notFound.title')}
      </div>
      <p className="text-text-secondary dark:text-dark-text-secondary mt-4 mb-8">
        {t('notFound.message')}
      </p>
      <Link
        to="/"
        className="px-8 py-3 bg-highlight dark:bg-dark-highlight text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-transform transform hover:scale-105"
      >
        {t('notFound.goHome')}
      </Link>
    </div>
  );
};

export default NotFoundPage;