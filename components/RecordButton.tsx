'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mic, Square, Clock, AlertCircle } from 'lucide-react';

interface RecordButtonProps {
  variant?: 'start' | 'stop' | 'pending';
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  recordingTime?: number;
  className?: string;
}

export function RecordButton({
  variant = 'start',
  onStartRecording,
  onStopRecording,
  isRecording = false,
  recordingTime = 0,
  className,
}: RecordButtonProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleClick = async () => {
    if (isRecording) {
      onStopRecording?.();
      return;
    }

    try {
      // Request permissions
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setPermissionDenied(false);
      onStartRecording?.();
    } catch (error) {
      console.error('Permission denied:', error);
      setPermissionDenied(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Permission Required
        </h3>
        <p className="text-gray-300 mb-4">
          Please allow camera and microphone access to record interactions.
        </p>
        <button onClick={handleClick} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Square className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-red-400" />
          <span className="text-xl font-mono text-white">
            {formatTime(recordingTime)}
          </span>
        </div>
        <p className="text-gray-300 mb-4">Recording in progress...</p>
        <button
          onClick={handleClick}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
        >
          Stop Recording
        </button>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6 text-center', className)}>
      <button
        onClick={handleClick}
        className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Mic className="w-8 h-8 text-white" />
      </button>
      <h3 className="text-lg font-semibold text-white mb-2">Start Recording</h3>
      <p className="text-gray-300">Tap to begin documenting your interaction</p>
    </div>
  );
}
