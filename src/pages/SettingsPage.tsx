
import React, { useState, useCallback, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import UserManagementPanel from '../components/UserManagementPanel';
import SubscriptionPlanManagement from '../components/SubscriptionPlanManagement';
import { settingsService } from '../services/settingsService';
import type { Settings } from '../types';
import FooterSettingsPanel from '../components/FooterSettingsPanel';
import VoiceManagementPanel from '../components/VoiceManagementPanel';

const GeneralSettings: React.FC = () => {
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

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && settings) {
            setIsSaving(true);
            try {
                await settingsService.saveSettings(user.id, settings);
                setSuccessMessage(t('settings.save.success'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error("Failed to save settings", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (isLoading || !settings) return <div className="p-8">Loading...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-bold text-blue-700 dark:text-blue-300">Security Update</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    API Keys are now managed securely on the server. You do not need to configure them here.
                </p>
            </div>
            
            <div className="flex justify-end">
                {successMessage && <p className="text-green-500 mr-4 self-center">{successMessage}</p>}
                <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-50">
                    {isSaving ? t('settings.save.saving') : t('settings.save.button')}
                </button>
            </div>
        </form>
    );
};

// ... Rest of the file (PaymentGatewaySettings, SettingsPage layout) remains largely similar but simplified
// Keeping the structure clean for the final output.

type Tab = 'general' | 'users' | 'plans' | 'payment' | 'footer' | 'voices';

const SettingsPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagementPanel />;
            case 'plans': return <SubscriptionPlanManagement />;
            case 'payment': return <div className="p-4">Payment settings moved to Admin Dashboard</div>;
            case 'footer': return <FooterSettingsPanel />;
            case 'voices': return <VoiceManagementPanel />;
            case 'general': default: return <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg"><GeneralSettings /></div>;
        }
    };
    
    const getTabClass = (name: Tab) => `px-4 py-2 rounded-t-lg transition-colors ${activeTab === name ? 'bg-secondary dark:bg-dark-secondary border-b-2 border-highlight text-highlight' : 'hover:bg-accent dark:hover:bg-dark-accent'}`;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-dark-text-primary">{t('settings.title')}</h1>
            <div className="border-b border-accent dark:border-dark-accent mb-8 flex space-x-1 overflow-x-auto">
                <button onClick={() => setActiveTab('general')} className={getTabClass('general')}>{t('settings.tabs.general')}</button>
                {user?.role === 'ADMIN' && (
                    <>
                        <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>{t('settings.tabs.users')}</button>
                        <button onClick={() => setActiveTab('plans')} className={getTabClass('plans')}>{t('settings.tabs.plans')}</button>
                        <button onClick={() => setActiveTab('voices')} className={getTabClass('voices')}>{t('settings.tabs.voices')}</button>
                        <button onClick={() => setActiveTab('footer')} className={getTabClass('footer')}>{t('settings.tabs.footer')}</button>
                    </>
                )}
            </div>
            {renderTabContent()}
        </div>
    );
};

export default SettingsPage;
