import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';
import type { Settings, CustomVoice } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon } from './icons/XMarkIcon';

const defaultVoices: Omit<CustomVoice, 'id'>[] = [
    { voice_id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', languages: ['English'], accent: 'American', category: 'Narration' },
    { voice_id: 'NFG5qt843uXKj4pFvR7C', name: 'Adam Stone', languages: ['English'], accent: 'American', category: 'Narration' },
    { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', languages: ['English'], accent: 'British', category: 'Narration' },
];

const VoiceManagementPanel: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [newVoice, setNewVoice] = useState({ voice_id: '', name: '', languages: '', accent: '', category: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingVoice, setEditingVoice] = useState<CustomVoice | null>(null);

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
    
    const handleSave = async (updatedVoices: CustomVoice[]) => {
        if (user && settings) {
            setIsSaving(true);
            setSuccessMessage('');
            try {
                const updatedSettings: Settings = { 
                    ...settings, 
                    textToSpeech: { 
                        ...settings.textToSpeech, 
                        customVoices: updatedVoices 
                    } 
                };
                await settingsService.saveSettings(user.id, updatedSettings);
                setSettings(updatedSettings);
                setSuccessMessage(t('settings.save.success'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error("Failed to save settings", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleAddVoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVoice.voice_id.trim() || !newVoice.name.trim()) return;

        const currentVoices = settings?.textToSpeech?.customVoices || [];
        const voiceToAdd: CustomVoice = {
            id: uuidv4(),
            voice_id: newVoice.voice_id.trim(),
            name: newVoice.name.trim(),
            languages: newVoice.languages.split(',').map(lang => lang.trim()).filter(Boolean),
            accent: newVoice.accent.trim(),
            category: newVoice.category.trim()
        };
        handleSave([...currentVoices, voiceToAdd]);
        setNewVoice({ voice_id: '', name: '', languages: '', accent: '', category: '' });
    };

    const handleDeleteVoice = (id: string) => {
        if (window.confirm(t('voiceManagement.deleteConfirm'))) {
            const currentVoices = settings?.textToSpeech?.customVoices || [];
            handleSave(currentVoices.filter(v => v.id !== id));
        }
    };
    
    const startEditing = (voice: CustomVoice) => {
        setEditingId(voice.id);
        setEditingVoice({ ...voice });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingVoice(null);
    };
    
    const handleUpdateVoice = () => {
        if (!editingVoice) return;
        const currentVoices = settings?.textToSpeech?.customVoices || [];
        handleSave(currentVoices.map(v => v.id === editingId ? editingVoice : v));
        cancelEditing();
    }

    if (isLoading || !settings) {
        return <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>;
    }

    const customVoices = settings.textToSpeech?.customVoices || [];

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('voiceManagement.title')}</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">{t('voiceManagement.subtitle')}</p>
            
            {successMessage && <p className="text-sm text-green-500 mb-4">{successMessage}</p>}

            <form onSubmit={handleAddVoice} className="bg-accent dark:bg-dark-accent p-4 rounded-lg space-y-4 mb-8">
                <h4 className="font-semibold">{t('voiceManagement.addVoice')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <input type="text" placeholder={t('voiceManagement.form.voiceId')} value={newVoice.voice_id} onChange={e => setNewVoice({...newVoice, voice_id: e.target.value})} required className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md md:col-span-2" />
                    <input type="text" placeholder={t('voiceManagement.form.name')} value={newVoice.name} onChange={e => setNewVoice({...newVoice, name: e.target.value})} required className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
                    <input type="text" placeholder={t('voiceManagement.form.languagePlaceholder')} value={newVoice.languages} onChange={e => setNewVoice({...newVoice, languages: e.target.value})} className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
                    <input type="text" placeholder={t('voiceManagement.form.accent')} value={newVoice.accent} onChange={e => setNewVoice({...newVoice, accent: e.target.value})} className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
                    <input type="text" placeholder={t('voiceManagement.form.category')} value={newVoice.category} onChange={e => setNewVoice({...newVoice, category: e.target.value})} className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
                </div>
                 <button type="submit" disabled={isSaving} className="w-full md:w-auto bg-highlight text-white font-bold py-2 px-6 rounded-lg hover:bg-highlight-hover transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('voiceManagement.addVoice')}
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-accent dark:bg-dark-accent">
                        <tr>
                            <th className="px-6 py-3">{t('voiceManagement.table.name')}</th>
                            <th className="px-6 py-3">{t('voiceManagement.table.id')}</th>
                            <th className="px-6 py-3">{t('voiceManagement.table.language')}</th>
                            <th className="px-6 py-3">{t('voiceManagement.table.accent')}</th>
                            <th className="px-6 py-3">{t('voiceManagement.table.category')}</th>
                            <th className="px-6 py-3 text-end">{t('voiceManagement.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defaultVoices.map(voice => (
                            <tr key={voice.voice_id} className="border-b border-accent dark:border-dark-accent bg-accent/30 dark:bg-dark-accent/30 text-text-secondary dark:text-dark-text-secondary">
                                <td className="px-6 py-4 font-bold">{voice.name}</td>
                                <td className="px-6 py-4 font-mono">{voice.voice_id}</td>
                                <td className="px-6 py-4">{voice.languages.join(', ')}</td>
                                <td className="px-6 py-4">{voice.accent}</td>
                                <td className="px-6 py-4">{voice.category}</td>
                                <td className="px-6 py-4 text-end italic text-xs">{t('voiceManagement.type.default')}</td>
                            </tr>
                        ))}
                        {customVoices.length === 0 && defaultVoices.length > 0 && (
                            <tr><td colSpan={6} className="text-center text-text-secondary dark:text-dark-text-secondary py-8">{t('voiceManagement.empty')}</td></tr>
                        )}
                        {customVoices.map(voice => (
                            <tr key={voice.id} className="border-b border-accent dark:border-dark-accent">
                                {editingId === voice.id && editingVoice ? (
                                    <>
                                        <td className="px-2 py-2"><input type="text" value={editingVoice.name} onChange={e => setEditingVoice({...editingVoice, name: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/></td>
                                        <td className="px-2 py-2"><input type="text" value={editingVoice.voice_id} onChange={e => setEditingVoice({...editingVoice, voice_id: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/></td>
                                        <td className="px-2 py-2"><input type="text" value={editingVoice.languages.join(', ')} onChange={e => setEditingVoice(prev => prev ? {...prev, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)} : null)} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/></td>
                                        <td className="px-2 py-2"><input type="text" value={editingVoice.accent} onChange={e => setEditingVoice({...editingVoice, accent: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/></td>
                                        <td className="px-2 py-2"><input type="text" value={editingVoice.category} onChange={e => setEditingVoice({...editingVoice, category: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/></td>
                                        <td className="px-6 py-2 text-end">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={handleUpdateVoice} disabled={isSaving} title={t('voiceManagement.save')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                                <button onClick={cancelEditing} title={t('voiceManagement.cancel')} className="p-2 text-text-secondary hover:bg-gray-500/10 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-bold">{voice.name}</td>
                                        <td className="px-6 py-4 font-mono">{voice.voice_id}</td>
                                        <td className="px-6 py-4">{voice.languages.join(', ')}</td>
                                        <td className="px-6 py-4">{voice.accent}</td>
                                        <td className="px-6 py-4">{voice.category}</td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => startEditing(voice)} title={t('voiceManagement.edit')} className="p-2 text-highlight hover:bg-highlight/10 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteVoice(voice.id)} title={t('voiceManagement.delete')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VoiceManagementPanel;