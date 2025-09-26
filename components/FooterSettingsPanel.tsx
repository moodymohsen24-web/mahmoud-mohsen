
import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';
import type { Settings, EditableLink } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon } from './icons/TrashIcon';

const LinkEditor: React.FC<{
    links: EditableLink[];
    setLinks: React.Dispatch<React.SetStateAction<EditableLink[]>>;
    title: string;
}> = ({ links, setLinks, title }) => {
    const { t } = useI18n();

    const handleLinkChange = (id: string, field: 'text' | 'url', value: string) => {
        setLinks(prevLinks => prevLinks.map(link => link.id === id ? { ...link, [field]: value } : link));
    };

    const addLink = () => {
        setLinks(prev => [...prev, { id: uuidv4(), text: '', url: '' }]);
    };

    const removeLink = (id: string) => {
        setLinks(prev => prev.filter(link => link.id !== id));
    };

    return (
        <div>
            <h4 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-3">{title}</h4>
            <div className="space-y-4">
                {links.map((link, index) => (
                    <div key={link.id} className="flex items-center gap-2 p-3 bg-accent/50 dark:bg-dark-accent/50 rounded-lg">
                        <span className="text-text-secondary dark:text-dark-text-secondary font-bold">{index + 1}.</span>
                        <input
                            type="text"
                            placeholder={t('settings.footer.linkText')}
                            value={link.text}
                            onChange={(e) => handleLinkChange(link.id, 'text', e.target.value)}
                            className="flex-grow p-2 bg-secondary dark:bg-dark-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-highlight"
                        />
                        <input
                            type="url"
                            placeholder={t('settings.footer.url')}
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            className="flex-grow p-2 bg-secondary dark:bg-dark-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-highlight"
                        />
                        <button type="button" onClick={() => removeLink(link.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addLink} className="mt-4 bg-highlight/10 text-highlight font-bold py-2 px-4 rounded-lg hover:bg-highlight/20 transition-colors">
                {t('settings.footer.addLink')}
            </button>
        </div>
    );
};

const FooterSettingsPanel: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    const loadSettings = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            const userSettings = await settingsService.getSettings(user.id);
            setSettings(userSettings);
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && settings) {
            setIsSaving(true);
            setSuccessMessage('');
            try {
                // Filter out empty links before saving
                const cleanedSettings = {
                    ...settings,
                    footer: {
                        ...settings.footer!,
                        platformLinks: settings.footer?.platformLinks.filter(l => l.text.trim() && l.url.trim()) || [],
                        legalLinks: settings.footer?.legalLinks.filter(l => l.text.trim() && l.url.trim()) || [],
                        socialLinks: settings.footer?.socialLinks.filter(l => l.text.trim() && l.url.trim()) || [],
                    }
                };
                await settingsService.saveSettings(user.id, cleanedSettings);
                setSettings(cleanedSettings); // Update local state with cleaned version
                setSuccessMessage(t('settings.save.success'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error("Failed to save settings", error);
            } finally {
                setIsSaving(false);
            }
        }
    };
    
    const setFooterSetting = (update: Partial<Settings['footer']>) => {
        setSettings(prev => prev ? ({ ...prev, footer: { ...(prev.footer!), ...update } }) : prev);
    };

    if (isLoading || !settings?.footer) {
        return <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>;
    }

    const { description, copyright, ogImage, platformLinks, legalLinks, socialLinks } = settings.footer;

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('settings.footer.title')}</h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6">{t('settings.footer.description')}</p>
            
            <form onSubmit={handleSave} className="space-y-10">
                <div>
                    <label className="block text-sm font-bold mb-2">{t('settings.footer.siteDescription')}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setFooterSetting({ description: e.target.value })}
                        rows={3}
                        placeholder="Enter a brief description of your site..."
                        className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">{t('settings.footer.copyright')}</label>
                    <input
                        type="text"
                        value={copyright}
                        onChange={(e) => setFooterSetting({ copyright: e.target.value })}
                        placeholder="Your Company Name. All rights reserved."
                        className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold mb-2">{t('settings.footer.ogImage')}</label>
                    <input
                        type="url"
                        value={ogImage}
                        onChange={(e) => setFooterSetting({ ogImage: e.target.value })}
                        placeholder="https://example.com/social-preview.png"
                        className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    />
                </div>
                
                <LinkEditor title={t('settings.footer.platformLinks')} links={platformLinks} setLinks={(links) => setFooterSetting({ platformLinks: typeof links === 'function' ? links(platformLinks) : links })} />
                <LinkEditor title={t('settings.footer.legalLinks')} links={legalLinks} setLinks={(links) => setFooterSetting({ legalLinks: typeof links === 'function' ? links(legalLinks) : links })} />
                <LinkEditor title={t('settings.footer.socialLinks')} links={socialLinks} setLinks={(links) => setFooterSetting({ socialLinks: typeof links === 'function' ? links(socialLinks) : links })} />

                <div className="mt-10 pt-5 border-t border-accent dark:border-dark-accent">
                    <div className="flex justify-end items-center gap-4">
                        {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                        <button type="submit" disabled={isSaving} className="bg-highlight text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {isSaving ? t('settings.save.saving') : t('settings.save.button')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FooterSettingsPanel;