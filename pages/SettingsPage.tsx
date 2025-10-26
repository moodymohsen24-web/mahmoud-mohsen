

import React, { useState, useCallback, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import UserManagementPanel from '../components/UserManagementPanel';
import SubscriptionPlanManagement from '../components/SubscriptionPlanManagement';
import type { Settings, AiModel } from '../types';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { settingsService } from '../services/settingsService';
import { textAnalysisService } from '../services/textAnalysisService';
import { supabase } from '../supabaseClient';
import FooterSettingsPanel from '../components/FooterSettingsPanel';
import VoiceManagementPanel from '../components/VoiceManagementPanel';

const GeneralSettings: React.FC = () => {
    // ... same as before, no changes needed in this sub-component
    const { t } = useI18n();
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [testStatus, setTestStatus] = useState<Record<string, { testing: boolean; result: 'success' | 'error' | null }>>({
        gemini: { testing: false, result: null },
        chatgpt: { testing: false, result: null },
        deepseek: { testing: false, result: null },
    });

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
    
    const handleModelChange = (model: AiModel) => {
        if (settings) {
            setSettings({ ...settings, aiModels: { ...settings.aiModels, selected: model } });
        }
    };
    
    const handleApiKeyChange = (model: AiModel, apiKey: string) => {
        if (settings) {
            setSettings({
                ...settings,
                aiModels: {
                    ...settings.aiModels,
                    keys: { ...settings.aiModels.keys, [model]: apiKey }
                }
            });
        }
    };

    const handleTestKey = async (model: AiModel) => {
        if (!settings) return;
        const apiKey = settings.aiModels.keys[model];
        
        setTestStatus(prev => ({ ...prev, [model]: { testing: true, result: null } }));
        const isValid = await textAnalysisService.testApiKey(model, apiKey);
        setTestStatus(prev => ({ ...prev, [model]: { testing: false, result: isValid ? 'success' : 'error' } }));
    };

    if (isLoading || !settings) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
            </div>
        );
    }
    
    const aiModels: { id: AiModel, name: string }[] = [
        { id: 'gemini', name: 'Gemini' },
        { id: 'chatgpt', name: 'ChatGPT' },
        { id: 'deepseek', name: 'DeepSeek' },
    ];
    
    const selectedModel = settings.aiModels.selected;

    return (
        <form onSubmit={handleSave} className="space-y-10">
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{t('settings.textAnalysis.title')}</h3>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{t('settings.textAnalysis.description')}</p>
                </div>
                <div>
                    <label htmlFor="aiModelSelect" className="block text-sm font-medium mb-2">{t('settings.textAnalysis.model')}</label>
                    <select
                        id="aiModelSelect"
                        value={selectedModel}
                        onChange={(e) => handleModelChange(e.target.value as AiModel)}
                        className="w-full max-w-xs p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    >
                        {aiModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${selectedModel}ApiKey`} className="block text-sm font-medium mb-2">
                        {t('settings.apiKey.label', { modelName: aiModels.find(m => m.id === selectedModel)?.name })}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id={`${selectedModel}ApiKey`}
                            type="password"
                            value={settings.aiModels.keys[selectedModel]}
                            onChange={(e) => handleApiKeyChange(selectedModel, e.target.value)}
                            placeholder={t('settings.apiKey.placeholder')}
                            className="flex-grow p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                        <button
                            type="button"
                            onClick={() => handleTestKey(selectedModel)}
                            disabled={!settings.aiModels.keys[selectedModel] || testStatus[selectedModel].testing}
                            className="flex-shrink-0 w-28 text-center bg-highlight/10 text-highlight font-bold py-2 px-4 rounded-lg hover:bg-highlight/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testStatus[selectedModel].testing ? t('settings.apiKey.test.testing') : t('settings.apiKey.testButton')}
                        </button>
                        <div className="w-6 h-6">
                            {testStatus[selectedModel].result === 'success' && <CheckCircleIcon className="text-green-500" />}
                            {testStatus[selectedModel].result === 'error' && <XCircleIcon className="text-red-500" />}
                        </div>
                    </div>
                    {testStatus[selectedModel].result === 'success' && <p className="text-xs text-green-500 mt-1">{t('settings.apiKey.test.success')}</p>}
                    {testStatus[selectedModel].result === 'error' && <p className="text-xs text-red-500 mt-1">{t('settings.apiKey.test.error')}</p>}
                </div>
            </div>
             <div className="mt-10 pt-5 border-t border-accent dark:border-dark-accent">
                <div className="flex justify-end items-center gap-4">
                    {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                    <button
                        type="submit" disabled={isSaving}
                        className="bg-highlight text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? t('settings.save.saving') : t('settings.save.button')}
                    </button>
                </div>
            </div>
        </form>
    );
};

const PaymentGatewaySettings: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [testStatus, setTestStatus] = useState<{ testing: boolean; result: 'success' | 'error' | null }>({ testing: false, result: null });


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

    const handleCredentialsChange = (field: 'clientId' | 'clientSecret', value: string) => {
        if(settings) {
            setSettings({
                ...settings,
                paymentGateways: {
                    ...settings.paymentGateways,
                    paypal: {
                        ...settings.paymentGateways.paypal,
                        [field]: value,
                    }
                }
            })
        }
    };
    
    const handleTestCredentials = async () => {
        if (!settings) return;
        setTestStatus({ testing: true, result: null });
        const { clientId, clientSecret } = settings.paymentGateways.paypal;

        const { data, error } = await supabase.functions.invoke('test-paypal-credentials', {
            body: { client_id: clientId, client_secret: clientSecret },
        });

        if (error || !data.success) {
            console.error('PayPal credential test failed:', error);
            setTestStatus({ testing: false, result: 'error' });
        } else {
            setTestStatus({ testing: false, result: 'success' });
        }
    };


    if (isLoading || !settings) {
        return <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>;
    }


    return (
        <form onSubmit={handleSave} className="space-y-10">
             <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{t('settings.payment.title')}</h3>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{t('settings.payment.description')}</p>
                </div>
                 <div>
                    <label htmlFor="paypalClientId" className="block text-sm font-medium mb-2">
                        {t('settings.payment.paypal.clientId')}
                    </label>
                    <input
                        id="paypalClientId"
                        type="text"
                        value={settings.paymentGateways.paypal.clientId}
                        onChange={(e) => handleCredentialsChange('clientId', e.target.value)}
                        placeholder="Enter your PayPal Client ID"
                        className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                    />
                </div>
                 <div>
                    <label htmlFor="paypalClientSecret" className="block text-sm font-medium mb-2">
                        {t('settings.payment.paypal.clientSecret')}
                    </label>
                     <div className="flex items-center gap-2">
                        <input
                            id="paypalClientSecret"
                            type="password"
                            value={settings.paymentGateways.paypal.clientSecret}
                            onChange={(e) => handleCredentialsChange('clientSecret', e.target.value)}
                            placeholder="Enter your PayPal Client Secret"
                            className="flex-grow p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                        <button
                            type="button"
                            onClick={handleTestCredentials}
                            disabled={!settings.paymentGateways.paypal.clientId || !settings.paymentGateways.paypal.clientSecret || testStatus.testing}
                            className="flex-shrink-0 w-28 text-center bg-highlight/10 text-highlight font-bold py-2 px-4 rounded-lg hover:bg-highlight/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testStatus.testing ? t('settings.apiKey.test.testing') : t('settings.apiKey.testButton')}
                        </button>
                        <div className="w-6 h-6">
                            {testStatus.result === 'success' && <CheckCircleIcon className="text-green-500" />}
                            {testStatus.result === 'error' && <XCircleIcon className="text-red-500" />}
                        </div>
                    </div>
                     {testStatus.result === 'success' && <p className="text-xs text-green-500 mt-1">{t('settings.apiKey.test.success')}</p>}
                     {testStatus.result === 'error' && <p className="text-xs text-red-500 mt-1">{t('settings.apiKey.test.error')}</p>}
                </div>
            </div>
             <div className="mt-10 pt-5 border-t border-accent dark:border-dark-accent">
                <div className="flex justify-end items-center gap-4">
                    {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                    <button
                        type="submit" disabled={isSaving}
                        className="bg-highlight text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? t('settings.save.saving') : t('settings.save.button')}
                    </button>
                </div>
            </div>
        </form>
    )
}


type Tab = 'general' | 'users' | 'plans' | 'payment' | 'footer' | 'voices';

const SettingsPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagementPanel />;
            case 'plans':
                return <SubscriptionPlanManagement />;
            case 'payment':
                return <PaymentGatewaySettings />;
            case 'footer':
                return <FooterSettingsPanel />;
            case 'voices':
                return <VoiceManagementPanel />;
            case 'general':
            default:
                return <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg max-w-3xl"><GeneralSettings /></div>;
        }
    };
    
    const getTabClass = (tabName: Tab) => {
        return `px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === tabName
                ? 'bg-secondary dark:bg-dark-secondary text-highlight border-b-2 border-highlight'
                : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
        }`;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('settings.title')}</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('settings.subtitle')}</p>

            <div className="border-b border-accent dark:border-dark-accent mb-8">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('general')} className={getTabClass('general')}>
                        {t('settings.tabs.general')}
                    </button>
                    {user?.role === 'ADMIN' && (
                        <>
                            <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>
                                {t('settings.tabs.users')}
                            </button>
                            <button onClick={() => setActiveTab('plans')} className={getTabClass('plans')}>
                                {t('settings.tabs.plans')}
                            </button>
                             <button onClick={() => setActiveTab('voices')} className={getTabClass('voices')}>
                                {t('settings.tabs.voices')}
                            </button>
                            <button onClick={() => setActiveTab('payment')} className={getTabClass('payment')}>
                                {t('settings.tabs.payment')}
                            </button>
                            <button onClick={() => setActiveTab('footer')} className={getTabClass('footer')}>
                                {t('settings.tabs.footer')}
                            </button>
                        </>
                    )}
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SettingsPage;