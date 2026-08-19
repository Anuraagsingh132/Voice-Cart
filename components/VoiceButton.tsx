'use client';

import React from 'react';
import { Mic, Square, Loader2, MicOff } from 'lucide-react';
import { VoiceState } from '@/types';

interface VoiceButtonProps {
  voiceState: VoiceState;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({
  voiceState,
  isSupported,
  onStart,
  onStop,
}: VoiceButtonProps) {
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isSuccess = voiceState === 'success';

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center">
        <button
          disabled
          className="relative flex items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] rounded-full glass opacity-50 cursor-not-allowed border border-vc-border-subtle"
          title="Speech recognition not supported in this browser. Use manual typing below."
        >
          <MicOff className="w-6 h-6 text-vc-text-muted" />
        </button>
        <span className="mt-2 text-xs font-medium text-vc-warning badge-amber">
          Voice unavailable in this browser
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Listening Rings */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-vc-cyan-muted voice-ring pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-vc-cyan-muted voice-ring-delayed pointer-events-none" />
        </>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        className={`relative flex items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] rounded-full transition-all duration-300 z-10 active:scale-95 focus-ring ${
          isListening
            ? 'bg-vc-cyan-muted border-2 border-vc-cyan shadow-glow-cyan text-vc-cyan scale-105'
            : isProcessing
            ? 'glass border-2 border-vc-warning shadow-glow-warning text-vc-warning'
            : isSuccess
            ? 'glass border-2 border-vc-emerald shadow-glow-emerald text-vc-emerald'
            : 'glass border border-vc-border-accent shadow-glass text-vc-text hover:border-vc-cyan hover:shadow-glow-cyan hover:text-vc-cyan mic-pulse'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
        ) : isListening ? (
          <Square className="w-5 h-5 md:w-6 md:h-6 fill-current" />
        ) : (
          <Mic className="w-6 h-6 md:w-8 md:h-8" />
        )}
      </button>
    </div>
  );
}
