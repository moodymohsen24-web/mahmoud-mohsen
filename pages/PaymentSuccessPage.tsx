import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

const PaymentSuccessPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center bg-primary dark:bg-dark-primary p-4">
      <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-3">
        {t('paymentSuccess.title')}
      </h1>
      <p className="text-text-secondary dark:text-dark-text-secondary max-w-md mx-auto mb-8">
        {t('paymentSuccess.message')}
      </p>
      <Link
        to="/dashboard"
        className="px-8 py-3 bg-highlight dark:bg-dark-highlight text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-transform transform hover:scale-105"
      >
        {t('paymentSuccess.backToDashboard')}
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;
