import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { Link } from 'react-router-dom';
import { TwitterIcon } from './icons/TwitterIcon';
import { GithubIcon } from './icons/GithubIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-secondary/80 dark:bg-dark-secondary/80 backdrop-blur-lg border-t border-border dark:border-dark-border mt-12">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <SoundWaveIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>
                <span className="text-xl font-bold">{t('header.brand')}</span>
            </div>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                {t('footer.description')}
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('footer.links.platform')}</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('header.features')}</a></li>
              <li><a href="#pricing" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('header.pricing')}</a></li>
              <li><Link to="/text-check" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('sidebar.textCheck')}</Link></li>
              <li><Link to="/text-to-speech" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('sidebar.textToSpeech')}</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('footer.links.legal')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('footer.links.privacy')}</a></li>
              <li><a href="#" className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{t('footer.links.terms')}</a></li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('footer.links.social')}</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors" aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" className="text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors" aria-label="GitHub"><GithubIcon /></a>
              <a href="#" className="text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border text-center text-sm text-text-secondary dark:text-dark-text-secondary">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
