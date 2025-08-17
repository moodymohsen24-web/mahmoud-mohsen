
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-secondary dark:bg-dark-secondary mt-12 py-6">
      <div className="container mx-auto px-6 text-center text-text-secondary dark:text-dark-text-secondary">
        <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;