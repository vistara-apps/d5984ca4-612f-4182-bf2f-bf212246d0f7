'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check, Globe } from 'lucide-react';
import { Language } from '@/lib/types';

interface ScriptButtonProps {
  script: string;
  variant?: 'primary' | 'secondary' | 'languageToggle';
  language?: Language;
  onLanguageToggle?: (language: Language) => void;
  className?: string;
}

export function ScriptButton({
  script,
  variant = 'primary',
  language = 'english',
  onLanguageToggle,
  className,
}: ScriptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (variant === 'languageToggle') {
    return (
      <button
        onClick={() =>
          onLanguageToggle?.(language === 'english' ? 'spanish' : 'english')
        }
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all duration-200',
          className
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {language === 'english' ? 'EN' : 'ES'}
        </span>
      </button>
    );
  }

  const baseClasses =
    'flex items-center justify-between p-4 rounded-lg transition-all duration-200 group';
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
    secondary: 'bg-white bg-opacity-20 text-white hover:bg-opacity-30',
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      <span className="text-left flex-1 font-medium">{script}</span>
      <div className="ml-3 flex-shrink-0">
        {copied ? (
          <Check className="w-5 h-5 text-green-300" />
        ) : (
          <Copy className="w-5 h-5 opacity-70 group-hover:opacity-100" />
        )}
      </div>
    </button>
  );
}
