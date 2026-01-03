
import { supabase } from '../supabaseClient';
import type { Settings, FooterContent } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default settings structures...
const defaultFooterContentEn: FooterContent = {
  description: 'Masmoo transforms your written scripts, articles, or speeches into perfectly prepared content.',
  copyright: 'Masmoo. All rights reserved.',
  ogImage: '',
  platformLinks: [
    { id: uuidv4(), text: 'Features', url: '#features' },
    { id: uuidv4(), text: 'Pricing', url: '#pricing' },
  ],
  legalLinks: [
    { id: uuidv4(), text: 'Privacy Policy', url: '#' },
    { id: uuidv4(), text: 'Terms of Service', url: '#' },
  ],
  socialLinks: []
};

const defaultFooterContentAr: FooterContent = {
  description: 'يقوم ’مسموع‘ بتحويل نصوصك إلى محتوى مُعد بإتقان.',
  copyright: 'مسموع. جميع الحقوق محفوظة.',
  ogImage: '',
  platformLinks: [],
  legalLinks: [],
  socialLinks: []
};

const defaultSettings: Settings = {
  aiModels: { selected: 'gemini', keys: { gemini: '', chatgpt: '', deepseek: '' } }, // Keys are placeholders now
  paymentGateways: { paypal: { clientId: '', clientSecret: '' } },
  textToSpeech: { keys: { elevenlabs: [] }, customVoices: [] },
  footer: { en: defaultFooterContentEn, ar: defaultFooterContentAr }
};

let publicSettingsCache: Settings['footer'] | null = null;
let publicSettingsCacheTime: number | null = null;

export const settingsService = {
  async getSettings(userId: string): Promise<Settings> {
    const { data, error } = await supabase.from('settings').select('payload').eq('id', userId).single();
    
    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching settings: ", error);
        return defaultSettings;
    }
    
    const userSettings = (data as any)?.payload;
    // Deep merge logic omitted for brevity, assuming standard merge
    return userSettings ? { ...defaultSettings, ...userSettings } : defaultSettings;
  },

  async saveSettings(userId: string, settings: Settings): Promise<Settings> {
    // Sanitize settings before saving: DO NOT SAVE API KEYS TO DB
    const safeSettings = { ...settings };
    // We intentionally wipe keys here so they don't persist in the DB. 
    // Real keys should be in Edge Function Secrets.
    if(safeSettings.aiModels?.keys) {
        safeSettings.aiModels.keys = { gemini: '', chatgpt: '', deepseek: '' };
    }

    const { data, error } = await supabase
        .from('settings')
        .upsert({ id: userId, payload: safeSettings } as any)
        .select()
        .single();
    
    if (error) throw error;
    
    // Invalidate cache
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (userProfile?.role === 'ADMIN') {
        publicSettingsCache = null;
    }

    return (data as any).payload as Settings;
  },
  
  async getPublicSettings(): Promise<Settings['footer'] | null> {
    const now = Date.now();
    if (publicSettingsCache && publicSettingsCacheTime && (now - publicSettingsCacheTime < 300000)) {
        return publicSettingsCache;
    }

    const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single();
    if (!admin) return defaultSettings.footer!;

    const adminSettings = await this.getSettings(admin.id);
    publicSettingsCache = adminSettings.footer!;
    publicSettingsCacheTime = now;

    return adminSettings.footer!;
  },
};
