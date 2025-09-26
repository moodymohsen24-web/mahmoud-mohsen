
import { supabase } from '../supabaseClient';
import type { Settings, EditableLink } from '../types';
import { v4 as uuidv4 } from 'uuid';

const defaultSettings: Settings = {
  aiModels: {
    selected: 'gemini',
    keys: {
      gemini: '',
      chatgpt: '',
      deepseek: ''
    }
  },
  paymentGateways: {
    paypal: {
      clientId: '',
      clientSecret: '',
    }
  },
  textToSpeech: {
    keys: {
        elevenlabs: []
    }
  },
  footer: {
    description: 'Enter site description here.',
    copyright: 'Enter copyright text here.',
    ogImage: '',
    platformLinks: [
        { id: uuidv4(), text: 'Features', url: '#features' },
        { id: uuidv4(), text: 'Pricing', url: '#pricing' },
    ],
    legalLinks: [
        { id: uuidv4(), text: 'Privacy Policy', url: '#' },
        { id: uuidv4(), text: 'Terms of Service', url: '#' },
    ],
    socialLinks: [
      { id: uuidv4(), text: 'Twitter', url: '#' },
      { id: uuidv4(), text: 'GitHub', url: '#' },
      { id: uuidv4(), text: 'LinkedIn', url: '#' },
    ]
  }
};

let publicSettingsCache: Settings | null = null;
let publicSettingsCacheTime: number | null = null;

export const settingsService = {
  async getSettings(userId: string): Promise<Settings> {
    const { data, error } = await supabase
        .from('settings')
        .select('payload')
        .eq('id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
        console.error("Error fetching settings: ", error);
        return defaultSettings;
    }
    
    const userSettings = (data as any)?.payload;

    if (userSettings) {
        // Deep merge fetched settings with defaults to ensure all keys exist
        return {
            ...defaultSettings,
            ...userSettings,
            aiModels: { 
                ...defaultSettings.aiModels, 
                ...(userSettings.aiModels || {}),
                keys: {
                    ...defaultSettings.aiModels.keys,
                    ...(userSettings.aiModels?.keys || {})
                }
            },
            paymentGateways: {
                ...defaultSettings.paymentGateways,
                ...(userSettings.paymentGateways || {}),
                paypal: {
                    ...defaultSettings.paymentGateways.paypal,
                    ...(userSettings.paymentGateways?.paypal || {})
                }
            },
            textToSpeech: {
                ...defaultSettings.textToSpeech,
                ...(userSettings.textToSpeech || {}),
                keys: {
                    ...defaultSettings.textToSpeech?.keys,
                    ...(userSettings.textToSpeech?.keys || {})
                }
            },
            footer: {
                ...defaultSettings.footer!,
                ...(userSettings.footer || {}),
                ogImage: userSettings.footer?.ogImage ?? defaultSettings.footer!.ogImage,
                platformLinks: userSettings.footer?.platformLinks || defaultSettings.footer!.platformLinks,
                legalLinks: userSettings.footer?.legalLinks || defaultSettings.footer!.legalLinks,
                socialLinks: userSettings.footer?.socialLinks || defaultSettings.footer!.socialLinks
            }
        };
    }
    
    return defaultSettings;
  },

  async saveSettings(userId: string, settings: Settings): Promise<Settings> {
    const { data, error } = await supabase
        .from('settings')
        .upsert({ id: userId, payload: settings } as any)
        .select()
        .single();
    
    if (error) throw error;
    
    // Invalidate public cache if admin saves settings
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (userProfile?.role === 'ADMIN') {
        publicSettingsCache = null;
        publicSettingsCacheTime = null;
    }

    return (data as any).payload as Settings;
  },
  
  async getPublicSettings(): Promise<Settings['footer']> {
    const now = Date.now();
    // Cache for 5 minutes
    if (publicSettingsCache && publicSettingsCacheTime && (now - publicSettingsCacheTime < 5 * 60 * 1000)) {
        return publicSettingsCache.footer!;
    }

    // Find the first admin user
    const { data: admin, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1)
        .single();
    
    if (adminError || !admin) {
        // Gracefully return defaults if no admin exists, without logging an error.
        if (adminError && adminError.code !== 'PGRST116') {
             console.error("Database error while searching for admin:", adminError);
        }
        return defaultSettings.footer!;
    }

    const adminSettings = await this.getSettings(admin.id);
    publicSettingsCache = adminSettings;
    publicSettingsCacheTime = now;

    return adminSettings.footer!;
  },
};