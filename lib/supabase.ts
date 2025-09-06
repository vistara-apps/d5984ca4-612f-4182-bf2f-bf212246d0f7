import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time
    return null as any;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
})();

// Server-side Supabase client with service role key (for API routes)
export const supabaseAdmin = (() => {
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a mock client for build time
    return null as any;
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

// Helper function to get user from wallet address
export async function getUserByWalletAddress(
  walletAddress: string
): Promise<Database['public']['Tables']['users']['Row'] | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

// Helper function to create or update user
export async function upsertUser(userData: {
  wallet_address: string;
  selected_state?: string;
  subscription_status?: 'free' | 'premium';
  stripe_customer_id?: string;
}) {
  const { data, error } = await (supabaseAdmin.from('users') as any)
    .upsert(userData, {
      onConflict: 'wallet_address',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to get state rights guide
export async function getStateRightsGuide(stateName: string) {
  const { data, error } = await supabase
    .from('state_rights_guides')
    .select('*')
    .eq('state_name', stateName)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to get all state rights guides
export async function getAllStateRightsGuides() {
  const { data, error } = await supabase
    .from('state_rights_guides')
    .select('*')
    .order('state_name');

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to create interaction log
export async function createInteractionLog(logData: {
  user_id: string;
  timestamp: string;
  location?: string;
  recorded_media_url?: string;
  notes?: string;
  interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
}) {
  const { data, error } = await (supabaseAdmin.from('interaction_logs') as any)
    .insert(logData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to get user's interaction logs
export async function getUserInteractionLogs(userId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('interaction_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to create shareable card
export async function createShareableCard(cardData: {
  interaction_log_id: string;
  generated_content: {
    title: string;
    summary: string;
    timestamp: string;
    location: string;
    rights_referenced: string[];
  };
  generated_url?: string;
}) {
  const { data, error } = await (supabaseAdmin.from('shareable_cards') as any)
    .insert(cardData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
