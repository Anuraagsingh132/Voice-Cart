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
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-inner border-2 border-white"
          title="Speech recognition not supported in this browser. Use manual typing below."
        >
          <MicOff className="w-6 h-6" />
        </button>
        <span className="mt-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Voice unavailable in this browser
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Listening Ring (Active State with pulse ripple animation) */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-rose-500/20 border-2 border-rose-500/40 mic-pulse pointer-events-none" />
      )}

      {/* Primary Voice Button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-10 border-4 border-white active:scale-95 ${
          isListening
            ? 'bg-rose-600 shadow-rose-500/40 text-white scale-105'
            : isProcessing
            ? 'bg-amber-500 shadow-amber-500/40 text-white'
            : 'bg-primary hover:bg-primary-container shadow-primary/40 hover:scale-105 text-white'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isListening ? (
          <Square className="w-6 h-6 fill-white" />
        ) : (
          <Mic className="w-7 h-7" />
        )}
      </button>
    </div>
  );
}
