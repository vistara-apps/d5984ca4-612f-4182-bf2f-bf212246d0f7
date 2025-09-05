export interface User {
  user_id: string;
  wallet_address: string;
  subscription_status: 'free' | 'premium';
  selected_state?: string;
  created_at: string;
  updated_at: string;
}

export interface StateRightsGuide {
  guide_id: string;
  state_name: string;
  title: string;
  content: {
    dos: string[];
    donts: string[];
    scripts: {
      english: string[];
      spanish: string[];
    };
    scenarios: {
      traffic_stop: string;
      search: string;
      arrest: string;
    };
  };
  languages: string[];
  last_updated: string;
}

export interface InteractionLog {
  log_id: string;
  user_id: string;
  timestamp: string;
  location: string;
  recorded_media_url?: string;
  notes?: string;
  interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
  created_at: string;
}

export interface ShareableCard {
  card_id: string;
  interaction_log_id: string;
  generated_content: {
    title: string;
    summary: string;
    timestamp: string;
    location: string;
    rights_referenced: string[];
  };
  generated_url?: string;
  created_at: string;
}

export type SubscriptionStatus = 'free' | 'premium';
export type InteractionType = 'traffic_stop' | 'search' | 'arrest' | 'other';
export type Language = 'english' | 'spanish';
