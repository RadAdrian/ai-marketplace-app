
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AIAssistant {
  id: string; // UUID from Supabase
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string; // Corresponds to 'image_url' in Supabase; mapped in service layer
  features: string[];
  systemPrompt: string; // Corresponds to 'system_prompt' in Supabase; mapped in service layer
  accentColor: string; // Corresponds to 'accent_color' in Supabase; mapped in service layer
  created_at?: string; // ISO date string from Supabase, auto-generated
  user_id?: string | null; // UUID from auth.users, null for public/template assistants
}

// For creating new assistants, id, created_at, and user_id are handled by Supabase/service layer
export type NewAIAssistant = Omit<AIAssistant, 'id' | 'created_at' | 'user_id'>;


export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// Re-export SupabaseUser for use in the app
export type User = SupabaseUser;