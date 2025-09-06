'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { AppShell } from '@/components/AppShell';
import { StateGuideCard } from '@/components/StateGuideCard';
import { ScriptButton } from '@/components/ScriptButton';
import { RecordButton } from '@/components/RecordButton';
import { Modal } from '@/components/Modal';
import { InputField } from '@/components/InputFields';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { US_STATES, INTERACTION_TYPES } from '@/lib/constants';
import { Language, InteractionType } from '@/lib/types';
import {
  Shield,
  FileText,
  Mic,
  Settings2,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { setFrameReady } = useMiniKit();
  const {
    user,
    selectedState,
    currentLanguage,
    stateGuides,
    dispatch,
    createInteraction,
  } = useApp();
  const { authenticated, login } = usePrivy();

  const [showStateModal, setShowStateModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interactionNotes, setInteractionNotes] = useState('');
  const [interactionType, setInteractionType] =
    useState<InteractionType>('traffic_stop');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const currentGuide = stateGuides.find(
    guide => guide.state_name.toLowerCase() === selectedState.toLowerCase()
  );

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);

    if (authenticated && user) {
      await createInteraction({
        timestamp: new Date().toISOString(),
        location: location || undefined,
        notes: interactionNotes || undefined,
        interaction_type: interactionType,
      });
    }

    // Reset form
    setInteractionNotes('');
    setLocation('');
    setInteractionType('traffic_stop');
  };

  const handleStateChange = (state: string) => {
    dispatch({ type: 'SET_SELECTED_STATE', payload: state });
    setShowStateModal(false);
  };

  const handleLanguageToggle = (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Pocket Rights</h1>
        <p className="text-gray-300 mb-6">
          Know your rights, document your interactions, instantly.
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          {!authenticated ? (
            <button onClick={login} className="btn-primary">
              Connect Wallet
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="btn-primary flex items-center">
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <button
                onClick={() => setShowStateModal(true)}
                className="btn-secondary"
              >
                📍 {selectedState}
              </button>
            </>
          )}
        </div>

        {!authenticated && (
          <p className="text-sm text-gray-400">
            Connect your wallet to access personalized features and save your
            interactions
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            State Strict Rights
          </h3>
          <p className="text-2xl font-bold text-white">30,28</p>
          <p className="text-sm text-gray-300">rights rights</p>
        </div>

        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Record Rights.com
          </h3>
          <p className="text-2xl font-bold text-white">20%</p>
          <p className="text-sm text-gray-300">Accuracy</p>
        </div>

        <div className="glass-card p-4">
          <h4 className="font-medium text-white mb-3">
            State specific rights guide
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Traffic violations, stop interactions
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Client by brass for</span>
              <span className="text-sm text-white">8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Clarence Blan</span>
              <span className="text-sm text-white">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Walters rice Chain</span>
              <span className="text-sm text-white">68%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="space-y-6">
        {/* Rights Guide */}
        {currentGuide && (
          <StateGuideCard
            guide={currentGuide}
            variant="detailed"
            className="animate-fade-in"
          />
        )}

        {/* Scripts Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Quick Scripts
            </h3>
            <ScriptButton
              script=""
              variant="languageToggle"
              language={currentLanguage}
              onLanguageToggle={handleLanguageToggle}
            />
          </div>

          <div className="space-y-3">
            {currentGuide?.content.scripts[currentLanguage].map(
              (script, index) => (
                <ScriptButton
                  key={index}
                  script={script}
                  variant={index === 0 ? 'primary' : 'secondary'}
                />
              )
            )}
          </div>
        </div>

        {/* Recording Section */}
        <RecordButton
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
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
              onClick={() => handleStateChange(state.toLowerCase())}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                selectedState === state.toLowerCase()
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </Modal>

      {/* Recording Details Modal */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title="Interaction Details"
        variant="dialog"
      >
        <div className="space-y-4">
          <InputField
            variant="select"
            label="Interaction Type"
            value={interactionType}
            onChange={value => setInteractionType(value as InteractionType)}
            options={INTERACTION_TYPES}
          />

          <InputField
            variant="locationPicker"
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Enter location or use GPS"
          />

          <InputField
            variant="textarea"
            label="Notes"
            value={interactionNotes}
            onChange={setInteractionNotes}
            placeholder="Add any additional details..."
          />

          <div className="flex space-x-3">
            <button
              onClick={() => setShowRecordModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleStopRecording();
                setShowRecordModal(false);
              }}
              className="flex-1 btn-primary"
            >
              Save Interaction
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
