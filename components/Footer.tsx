
import React, { useState, useEffect } from 'react';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { GithubIcon } from './icons/GithubIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { settingsService } from '../services/settingsService';
import type { Settings } from '../types';

const FooterSkeleton: React.FC = () => (
    <div className="container mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
                <div className="h-8 w-32 bg-accent dark:bg-dark-accent rounded-md mb-4"></div>
                <div className="h-4 w-full bg-accent dark:bg-dark-accent rounded-md"></div>
                <div className="h-4 w-3/4 bg-accent dark:bg-dark-accent rounded-md mt-2"></div>
            </div>
            <div>
                <div className="h-6 w-24 bg-accent dark:bg-dark-accent rounded-md mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-accent dark:bg-dark-accent rounded-md"></div>
                    <div className="h-4 w-2/3 bg-accent dark:bg-dark-accent rounded-md"></div>
                    <div className="h-4 w-1/2 bg-accent dark:bg-dark-accent rounded-md"></div>
                </div>
            </div>
            <div>
                <div className="h-6 w-20 bg-accent dark:bg-dark-accent rounded-md mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-accent dark:bg-dark-accent rounded-md"></div>
                    <div className="h-4 w-2/3 bg-accent dark:bg-dark-accent rounded-md"></div>
                </div>
            </div>
            <div>
                <div className="h-6 w-24 bg-accent dark:bg-dark-accent rounded-md mb-4"></div>
                <div className="flex space-x-4">
                    <div className="w-6 h-6 bg-accent dark:bg-dark-accent rounded-full"></div>
                    <div className="w-6 h-6 bg-accent dark:bg-dark-accent rounded-full"></div>
                    <div className="w-6 h-6 bg-accent dark:bg-dark-accent rounded-full"></div>
                </div>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border text-center">
            <div className="h-4 w-1/3 bg-accent dark:bg-dark-accent rounded-md mx-auto"></div>
        </div>
    </div>
);


const Footer: React.FC = () => {
  const [footerSettings, setFooterSettings] = useState<Settings['footer'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settings = await settingsService.getPublicSettings();
            setFooterSettings(settings);

            // Update meta tag for social media previews
            if (settings?.ogImage) {
                let meta = document.querySelector('meta[property="og:image"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('property', 'og:image');
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
                meta.setAttribute('content', settings.ogImage);
            }

        } catch (e) {
            console.error("Failed to load footer settings", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchSettings();
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return <FooterSkeleton />;
    }

    if (!footerSettings) {
        return null; // Or a minimal fallback footer
    }
    
    const socialIconMap: { [key: string]: React.ReactNode } = {
        twitter: <TwitterIcon />,
        github: <GithubIcon />,
        linkedin: <LinkedInIcon />,
        facebook: <FacebookIcon />,
        instagram: <InstagramIcon />,
        youtube: <YouTubeIcon />,
    };

    const { description, copyright, platformLinks, legalLinks, socialLinks } = footerSettings;

    return (
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <SoundWaveIcon className="w-8 h-8 text-highlight dark:text-dark-highlight"/>
                <span className="text-xl font-bold">مسموع</span>
            </div>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                {description}
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">المنصة</h3>
            <ul className="space-y-2">
                {platformLinks.map(link => (
                    <li key={link.id}><a href={link.url} className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{link.text}</a></li>
                ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">قانوني</h3>
            <ul className="space-y-2">
                {legalLinks.map(link => (
                    <li key={link.id}><a href={link.url} className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors">{link.text}</a></li>
                ))}
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">التواصل</h3>
             <div className="flex space-x-4">
              {socialLinks.map(link => {
                const iconKey = link.text.toLowerCase().trim();
                const IconComponent = socialIconMap[iconKey];
                if (!IconComponent) return null;

                return (
                    <a key={link.id} href={link.url} className="text-text-secondary dark:text-dark-text-secondary hover:text-highlight transition-colors" aria-label={link.text}>
                        {React.cloneElement(IconComponent as React.ReactElement, { className: "w-6 h-6" })}
                    </a>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border text-center text-sm text-text-secondary dark:text-dark-text-secondary">
          <p>&copy; {new Date().getFullYear()} {copyright}</p>
        </div>
      </div>
    );
  };
  
  return (
    <footer className="bg-secondary/80 dark:bg-dark-secondary/80 backdrop-blur-lg border-t border-border dark:border-dark-border mt-12">
      {renderContent()}
    </footer>
  );
};

export default Footer;