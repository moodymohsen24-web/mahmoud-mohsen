import { supabase } from '../supabaseClient';
import type { Settings, FooterContent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const defaultFooterContentEn: FooterContent = {
  description: 'Masmoo transforms your written scripts, articles, or speeches into perfectly prepared content, ready for flawless audio performance.',
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
  socialLinks: [
    { id: uuidv4(), text: 'Twitter', url: '#' },
    { id: uuidv4(), text: 'GitHub', url: '#' },
    { id: uuidv4(), text: 'LinkedIn', url: '#' },
  ]
};

const defaultFooterContentAr: FooterContent = {
  description: 'يقوم ’مسموع‘ بتحويل نصوصك، مقالاتك، أو خطبك المكتوبة إلى محتوى مُعد بإتقان، وجاهز لأداء صوتي لا تشوبه شائبة.',
  copyright: 'مسموع. جميع الحقوق محفوظة.',
  ogImage: '',
  platformLinks: [
    { id: uuidv4(), text: 'الميزات', url: '#features' },
    { id: uuidv4(), text: 'الأسعار', url: '#pricing' },
  ],
  legalLinks: [
    { id: uuidv4(), text: 'سياسة الخصوصية', url: '#' },
    { id: uuidv4(), text: 'شروط الخدمة', url: '#' },
  ],
  socialLinks: [
    { id: uuidv4(), text: 'Twitter', url: '#' },
    { id: uuidv4(), text: 'GitHub', url: '#' },
    { id: uuidv4(), text: 'LinkedIn', url: '#' },
  ]
};


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
    },
    customVoices: []
  },
  footer: {
    en: defaultFooterContentEn,
    ar: defaultFooterContentAr,
  }
};

let publicSettingsCache: Settings['footer'] | null = null;
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
                },
                customVoices: userSettings.textToSpeech?.customVoices || []
            },
            footer: {
                en: {
                    ...defaultSettings.footer!.en,
                    ...(userSettings.footer?.en || {})
                },
                ar: {
                    ...defaultSettings.footer!.ar,
                    ...(userSettings.footer?.ar || {})
                }
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
    
    if (error) {
      if (error.message.includes('violates row-level security policy')) {
        throw new Error("Security policy error: You do not have permission to save settings.");
      }
      throw error;
    }
    
    // Invalidate public cache if admin saves settings
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (userProfile?.role === 'ADMIN') {
        publicSettingsCache = null;
        publicSettingsCacheTime = null;
    }

    return (data as any).payload as Settings;
  },
  
  async getPublicSettings(): Promise<Settings['footer'] | null> {
    const now = Date.now();
    // Cache for 5 minutes
    if (publicSettingsCache && publicSettingsCacheTime && (now - publicSettingsCacheTime < 5 * 60 * 1000)) {
        return publicSettingsCache;
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
             console.error("Database error while searching for admin:", adminError.message || adminError);
        }
        return defaultSettings.footer!;
    }

    const adminSettings = await this.getSettings(admin.id);
    publicSettingsCache = adminSettings.footer!;
    publicSettingsCacheTime = now;

    return adminSettings.footer!;
  },
};