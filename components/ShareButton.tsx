'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { ShareableCard } from '@/lib/types';

interface ShareButtonProps {
  card: ShareableCard;
  variant?: 'iconOnly' | 'withText';
  className?: string;
}

export function ShareButton({ card, variant = 'withText', className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = card.generated_url || `${window.location.origin}/share/${card.card_id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.generated_content.title,
          text: card.generated_content.summary,
          url: shareUrl,
        });
        setShowShareMenu(false);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === 'iconOnly') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className={cn(
            'w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all duration-200',
            className
          )}
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>

        {showShareMenu && (
          <div className="absolute top-12 right-0 bg-white bg-opacity-95 backdrop-blur-lg rounded-lg shadow-lg p-2 min-w-48 z-50">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleNativeShare}
      className={cn(
        'btn-secondary flex items-center space-x-2',
        className
      )}
    >
      <Share2 className="w-5 h-5" />
      <span>Share Summary</span>
    </button>
  );
}
