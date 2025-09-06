export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          wallet_address: string;
          subscription_status: 'free' | 'premium';
          selected_state: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          wallet_address: string;
          subscription_status?: 'free' | 'premium';
          selected_state?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          wallet_address?: string;
          subscription_status?: 'free' | 'premium';
          selected_state?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      state_rights_guides: {
        Row: {
          guide_id: string;
          state_name: string;
          title: string;
          content: Json;
          languages: string[];
          last_updated: string;
          created_at: string;
        };
        Insert: {
          guide_id?: string;
          state_name: string;
          title: string;
          content: Json;
          languages?: string[];
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          guide_id?: string;
          state_name?: string;
          title?: string;
          content?: Json;
          languages?: string[];
          last_updated?: string;
          created_at?: string;
        };
      };
      interaction_logs: {
        Row: {
          log_id: string;
          user_id: string;
          timestamp: string;
          location: string | null;
          recorded_media_url: string | null;
          notes: string | null;
          interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
          created_at: string;
        };
        Insert: {
          log_id?: string;
          user_id: string;
          timestamp: string;
          location?: string | null;
          recorded_media_url?: string | null;
          notes?: string | null;
          interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
          created_at?: string;
        };
        Update: {
          log_id?: string;
          user_id?: string;
          timestamp?: string;
          location?: string | null;
          recorded_media_url?: string | null;
          notes?: string | null;
          interaction_type?: 'traffic_stop' | 'search' | 'arrest' | 'other';
          created_at?: string;
        };
      };
      shareable_cards: {
        Row: {
          card_id: string;
          interaction_log_id: string;
          generated_content: Json;
          generated_url: string | null;
          created_at: string;
        };
        Insert: {
          card_id?: string;
          interaction_log_id: string;
          generated_content: Json;
          generated_url?: string | null;
          created_at?: string;
        };
        Update: {
          card_id?: string;
          interaction_log_id?: string;
          generated_content?: Json;
          generated_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
