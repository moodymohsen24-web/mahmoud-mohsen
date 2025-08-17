import { createClient } from '@supabase/supabase-js';
import type { UserRole, Settings, SubscriptionPlan } from './types';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: UserRole;
          email: string;
          subscription_plan_id: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          subscription_plan_id?: string | null;
        };
        Update: {
          name?: string;
          role?: UserRole;
          email?: string;
          subscription_plan_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_subscription_plan_id_fkey",
            columns: ["subscription_plan_id"],
            referencedRelation: "subscription_plans",
            referencedColumns: ["id"]
          }
        ]
      };
      dictionaries: {
        Row: {
          user_id: string;
          original_word: string;
          replacement_word: string;
        };
        Insert: {
          user_id: string;
          original_word: string;
          replacement_word: string;
        };
        Update: {
          replacement_word?: string;
        };
        Relationships: []
      };
      settings: {
        Row: {
          id: string;
          payload: Settings;
        };
        Insert: {
          id: string;
          payload: Settings;
        };
        Update: {
          payload?: Settings;
        };
        Relationships: []
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          features: string[];
          is_default: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          features: string[];
          is_default: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          features?: string[];
          is_default?: boolean;
        };
        Relationships: []
      };
      text_analysis_log: {
        Row: {
          id: number;
          user_id: string;
          created_at: string;
          corrections_made: number;
          step: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          corrections_made: number;
          step: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          created_at?: string;
          corrections_made?: number;
          step?: number;
        };
        Relationships: []
      };
      tts_usage_log: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          api_key_used_suffix: string;
          characters_converted: number;
          voice_id_used: string;
          model_id_used: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          api_key_used_suffix: string;
          characters_converted: number;
          voice_id_used: string;
          model_id_used: string;
        };
        Update: {};
        Relationships: []
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user_by_id: {
        Args: {
          user_id: string;
        };
        Returns: void;
      };
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      create_paypal_order: {
        Args: {
          plan_id: string;
        };
        Returns: {
          approval_url: string;
        };
      };
      test_paypal_credentials: {
        Args: {
          client_id: string;
          client_secret: string;
        };
        Returns: {
          success: boolean;
        };
      };
      get_daily_usage: {
        Args: {
          user_id_param: string;
        };
        Returns: { date: string; count: number }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

const supabaseUrl = 'https://hfhfjtpcmcqobbytjldj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaGZqdHBjbWNxb2JieXRqbGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDkxNjcsImV4cCI6MjA3MDgyNTE2N30.U-WWzGQi2qzi3TJJnrWOk_KcByDtXgo2NCdbO7nbipQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);