import { createClient } from '@supabase/supabase-js';
import type { UserRole, Settings, SubscriptionPlan, AnalysisResponse } from './types';

export interface Database {
  public: {
    Tables: {
      generated_images: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          prompt: string | null;
          negative_prompt: string | null;
          model_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          prompt?: string | null;
          negative_prompt?: string | null;
          model_used?: string | null;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "generated_images_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ]
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_text: string;
          analysis_results: (AnalysisResponse | null)[];
          current_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_text: string;
          analysis_results?: (AnalysisResponse | null)[];
          current_step?: number;
        };
        Update: {
          name?: string;
          original_text?: string;
          analysis_results?: (AnalysisResponse | null)[];
          current_step?: number;
          updated_at?: string;
        };
        Relationships: []
      };
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

const supabaseUrl = 'https://qaslrglvxoqvptmshaeg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2xyZ2x2eG9xdnB0bXNoYWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODYzNzQsImV4cCI6MjA4MDg2MjM3NH0.gA_02kGd_-qQQf5nUOAam3zUTDFZuwJaTb-MVFXLEy8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  }
});