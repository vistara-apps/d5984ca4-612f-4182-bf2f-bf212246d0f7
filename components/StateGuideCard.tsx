'use client';

import { StateRightsGuide } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronRight, Shield, AlertTriangle } from 'lucide-react';

interface StateGuideCardProps {
  guide: StateRightsGuide;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
}

export function StateGuideCard({
  guide,
  variant = 'compact',
  onClick,
  className,
}: StateGuideCardProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'glass-card p-4 cursor-pointer hover:bg-opacity-15 transition-all duration-200',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {guide.state_name} Rights
              </h3>
              <p className="text-sm text-gray-300">Tap to view guide</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6 space-y-6', className)}>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{guide.title}</h2>
          <p className="text-gray-300">
            Last updated: {new Date(guide.last_updated).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Do's Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-green-400 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Do&apos;s
        </h3>
        <ul className="space-y-2">
          {guide.content.dos.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-200">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Don'ts Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-red-400 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Don&apos;ts
        </h3>
        <ul className="space-y-2">
          {guide.content.donts.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-200">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
