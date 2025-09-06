'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { AppShell } from '@/components/AppShell';
import { StateGuideCard } from '@/components/StateGuideCard';
import { Modal } from '@/components/Modal';
import { InputField } from '@/components/InputFields';
import { US_STATES, INTERACTION_TYPES } from '@/lib/constants';
import { InteractionType } from '@/lib/types';
import {
  Shield,
  FileText,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Settings,
  CreditCard,
  History,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const {
    user,
    selectedState,
    stateGuides,
    userInteractions,
    dispatch,
    createInteraction,
    upgradeToPremium,
  } = useApp();
  const { authenticated, login } = usePrivy();

  const [showStateModal, setShowStateModal] = useState(false);
  const [showNewInteractionModal, setShowNewInteractionModal] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    interaction_type: 'traffic_stop' as InteractionType,
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (!authenticated) {
      login();
    }
  }, [authenticated, login]);

  if (!authenticated || !user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Pocket Rights
            </h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access your dashboard
            </p>
            <button onClick={login} className="btn-primary">
              Connect Wallet
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentGuide = stateGuides.find(
    guide => guide.state_name.toLowerCase() === selectedState.toLowerCase()
  );

  const handleStateChange = (state: string) => {
    dispatch({ type: 'SET_SELECTED_STATE', payload: state });
    setShowStateModal(false);
  };

  const handleCreateInteraction = async () => {
    const interaction = await createInteraction({
      timestamp: new Date().toISOString(),
      location: interactionForm.location,
      notes: interactionForm.notes,
      interaction_type: interactionForm.interaction_type,
    });

    if (interaction) {
      setShowNewInteractionModal(false);
      setInteractionForm({
        interaction_type: 'traffic_stop',
        location: '',
        notes: '',
      });
    }
  };

  const recentInteractions = userInteractions.slice(0, 5);
  const isPremium = user.subscription_status === 'premium';

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">
            Welcome back! Stay informed about your rights in {selectedState}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStateModal(true)}
            className="btn-secondary flex items-center"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {selectedState}
          </button>

          {!isPremium && (
            <button
              onClick={upgradeToPremium}
              className="btn-primary flex items-center"
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Interactions</p>
              <p className="text-2xl font-bold text-white">
                {userInteractions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Subscription</p>
              <p className="text-2xl font-bold text-white capitalize">
                {user.subscription_status}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              {isPremium ? (
                <Star className="w-6 h-6 text-white" />
              ) : (
                <CreditCard className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Rights Guides</p>
              <p className="text-2xl font-bold text-white">
                {stateGuides.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">This Month</p>
              <p className="text-2xl font-bold text-white">
                {
                  userInteractions.filter(
                    i =>
                      new Date(i.timestamp).getMonth() === new Date().getMonth()
                  ).length
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current State Guide */}
          {currentGuide && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Your Rights in {selectedState}
              </h2>
              <StateGuideCard guide={currentGuide} variant="detailed" />
            </div>
          )}

          {/* Recent Interactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Recent Interactions
              </h2>
              <button
                onClick={() => setShowNewInteractionModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Interaction
              </button>
            </div>

            {recentInteractions.length > 0 ? (
              <div className="space-y-3">
                {recentInteractions.map(interaction => (
                  <div key={interaction.log_id} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {interaction.interaction_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(
                              new Date(interaction.timestamp),
                              'MMM d, yyyy h:mm a'
                            )}
                          </span>
                        </div>

                        {interaction.location && (
                          <p className="text-sm text-gray-300 mb-1">
                            📍 {interaction.location}
                          </p>
                        )}

                        {interaction.notes && (
                          <p className="text-sm text-gray-300">
                            {interaction.notes.substring(0, 100)}
                            {interaction.notes.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>

                      <Clock className="w-4 h-4 text-gray-400 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No interactions yet
                </h3>
                <p className="text-gray-300 mb-4">
                  Start logging your interactions to keep track of important
                  encounters.
                </p>
                <button
                  onClick={() => setShowNewInteractionModal(true)}
                  className="btn-primary"
                >
                  Log Your First Interaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Subscription
            </h3>
            <div className="text-center">
              {isPremium ? (
                <>
                  <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-white mb-2">
                    Premium Member
                  </p>
                  <p className="text-sm text-gray-300">
                    Unlimited interactions, AI scripts, and priority support
                  </p>
                </>
              ) : (
                <>
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-white mb-2">
                    Free Plan
                  </p>
                  <p className="text-sm text-gray-300 mb-4">
                    Basic rights information and limited documentation
                  </p>
                  <button
                    onClick={upgradeToPremium}
                    className="btn-primary w-full"
                  >
                    Upgrade to Premium
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowNewInteractionModal(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <Plus className="w-4 h-4 mr-3" />
                Log New Interaction
              </button>

              <button
                onClick={() => setShowStateModal(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <MapPin className="w-4 h-4 mr-3" />
                Change State
              </button>

              <button className="w-full btn-secondary text-left flex items-center">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* State Selection Modal */}
      <Modal
        isOpen={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select Your State"
        variant="drawer"
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {US_STATES.map(state => (
            <button
              key={state}
              onClick={() => handleStateChange(state)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                selectedState === state
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </Modal>

      {/* New Interaction Modal */}
      <Modal
        isOpen={showNewInteractionModal}
        onClose={() => setShowNewInteractionModal(false)}
        title="Log New Interaction"
        variant="dialog"
      >
        <div className="space-y-4">
          <InputField
            variant="select"
            label="Interaction Type"
            value={interactionForm.interaction_type}
            onChange={value =>
              setInteractionForm(prev => ({
                ...prev,
                interaction_type: value as InteractionType,
              }))
            }
            options={INTERACTION_TYPES}
          />

          <InputField
            variant="text"
            label="Location"
            value={interactionForm.location}
            onChange={value =>
              setInteractionForm(prev => ({ ...prev, location: value }))
            }
            placeholder="Enter location (optional)"
          />

          <InputField
            variant="textarea"
            label="Notes"
            value={interactionForm.notes}
            onChange={value =>
              setInteractionForm(prev => ({ ...prev, notes: value }))
            }
            placeholder="Add any additional details..."
          />

          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewInteractionModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInteraction}
              className="flex-1 btn-primary"
            >
              Log Interaction
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
