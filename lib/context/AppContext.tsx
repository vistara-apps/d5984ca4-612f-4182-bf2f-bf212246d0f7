'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { User, StateRightsGuide, InteractionLog } from '@/lib/types';
import toast from 'react-hot-toast';

interface AppState {
  user: User | null;
  selectedState: string;
  currentLanguage: 'english' | 'spanish';
  stateGuides: StateRightsGuide[];
  userInteractions: InteractionLog[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SELECTED_STATE'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: 'english' | 'spanish' }
  | { type: 'SET_STATE_GUIDES'; payload: StateRightsGuide[] }
  | { type: 'SET_USER_INTERACTIONS'; payload: InteractionLog[] }
  | { type: 'ADD_INTERACTION'; payload: InteractionLog }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  user: null,
  selectedState: 'California',
  currentLanguage: 'english',
  stateGuides: [],
  userInteractions: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SELECTED_STATE':
      return { ...state, selectedState: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
    case 'SET_STATE_GUIDES':
      return { ...state, stateGuides: action.payload };
    case 'SET_USER_INTERACTIONS':
      return { ...state, userInteractions: action.payload };
    case 'ADD_INTERACTION':
      return {
        ...state,
        userInteractions: [action.payload, ...state.userInteractions],
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  authenticateUser: () => Promise<void>;
  createInteraction: (interactionData: {
    timestamp: string;
    location?: string;
    recorded_media_url?: string;
    notes?: string;
    interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
  }) => Promise<InteractionLog | null>;
  generateScript: (scenario: string, context?: string) => Promise<string[]>;
  generateSummary: (interactionId: string) => Promise<any>;
  upgradeToPremium: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: privyUser, getAccessToken, authenticated } = usePrivy();

  // Authenticate user when Privy user changes
  useEffect(() => {
    if (authenticated && privyUser?.wallet?.address) {
      authenticateUser();
    } else {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, [authenticated, privyUser]);

  // Load state guides on mount
  useEffect(() => {
    loadStateGuides();
  }, []);

  const authenticateUser = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!privyUser?.wallet?.address) {
        throw new Error('No wallet address found');
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          walletAddress: privyUser.wallet.address,
          selectedState: state.selectedState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      dispatch({ type: 'SET_USER', payload: data.user });
      
      if (data.user.selected_state) {
        dispatch({ type: 'SET_SELECTED_STATE', payload: data.user.selected_state });
      }

      // Load user interactions
      await loadUserInteractions(accessToken, privyUser.wallet.address);
    } catch (error) {
      console.error('Authentication error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Authentication failed' });
      toast.error('Authentication failed');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadStateGuides = async () => {
    try {
      const response = await fetch('/api/rights-guides');
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_STATE_GUIDES', payload: data.guides });
      }
    } catch (error) {
      console.error('Failed to load state guides:', error);
    }
  };

  const loadUserInteractions = async (accessToken: string, walletAddress: string) => {
    try {
      const response = await fetch(`/api/interactions?walletAddress=${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_USER_INTERACTIONS', payload: data.interactions });
      }
    } catch (error) {
      console.error('Failed to load user interactions:', error);
    }
  };

  const createInteraction = async (interactionData: {
    timestamp: string;
    location?: string;
    recorded_media_url?: string;
    notes?: string;
    interaction_type: 'traffic_stop' | 'search' | 'arrest' | 'other';
  }): Promise<InteractionLog | null> => {
    try {
      if (!privyUser?.wallet?.address) {
        throw new Error('No wallet address found');
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          walletAddress: privyUser.wallet.address,
          ...interactionData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create interaction');
      }

      dispatch({ type: 'ADD_INTERACTION', payload: data.interaction });
      toast.success('Interaction logged successfully');
      
      return data.interaction;
    } catch (error) {
      console.error('Create interaction error:', error);
      toast.error('Failed to log interaction');
      return null;
    }
  };

  const generateScript = async (scenario: string, context?: string): Promise<string[]> => {
    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          state: state.selectedState,
          language: state.currentLanguage,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      return data.scripts;
    } catch (error) {
      console.error('Generate script error:', error);
      toast.error('Failed to generate script');
      return [];
    }
  };

  const generateSummary = async (interactionId: string) => {
    try {
      const interaction = state.userInteractions.find(i => i.log_id === interactionId);
      if (!interaction) {
        throw new Error('Interaction not found');
      }

      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interactionLogId: interaction.log_id,
          timestamp: interaction.timestamp,
          location: interaction.location || 'Unknown',
          interactionType: interaction.interaction_type,
          notes: interaction.notes,
          state: state.selectedState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      toast.success('Summary generated successfully');
      return data;
    } catch (error) {
      console.error('Generate summary error:', error);
      toast.error('Failed to generate summary');
      return null;
    }
  };

  const upgradeToPremium = async () => {
    try {
      if (!privyUser?.wallet?.address) {
        throw new Error('No wallet address found');
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          walletAddress: privyUser.wallet.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade to premium error:', error);
      toast.error('Failed to start upgrade process');
    }
  };

  const contextValue: AppContextType = {
    ...state,
    dispatch,
    authenticateUser,
    createInteraction,
    generateScript,
    generateSummary,
    upgradeToPremium,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
