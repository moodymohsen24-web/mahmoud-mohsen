

export type UserRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_default: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  subscription_plans: SubscriptionPlan | null;
}

export interface AuthContextType {
  user: User | null;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (user: User) => void;
}

export interface Activity {
  id: number;
  created_at: string;
  corrections_made: number;
  step: number; // 1: spelling, 2: diacritics, 3: dictionary
}

export interface DashboardData {
    checksThisMonth: number;
    totalCorrections: number;
    dictionaryWords: number;
    usageLast7Days: { date: string; count: number }[];
    recentActivities: Activity[];
    totalActiveKeys?: number;
    totalBalance?: number;
}


// Type for the response from the text analysis service
export interface AnalysisResponse {
    processedText: string; // The text with <ch> tags for highlighting
    correctionsCount: number;
}

export type AiModel = 'gemini' | 'chatgpt' | 'deepseek';

export interface TTSGenerationSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface TTSResponseChunk {
  id: string;
  audioUrl: string;
  filename: string;
}

export interface Settings {
    aiModels: {
        selected: AiModel;
        keys: {
            gemini: string;
            chatgpt: string;
            deepseek: string;
        }
    };
    paymentGateways: {
      paypal: {
        clientId: string;
        clientSecret: string;
      }
    };
    textToSpeech?: {
        keys?: {
            elevenlabs: string[];
        }
    }
}

export type ModalType = 'auth' | null;

export interface ModalContextType {
  modal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  original_text: string;
  analysis_results: (AnalysisResponse | null)[];
  current_step: number;
  created_at: string;
  updated_at: string;
}