import { supabase } from '../supabaseClient';
import type { Settings } from '../types';

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
  }
};

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
    return (data as any).payload as Settings;
  },
};