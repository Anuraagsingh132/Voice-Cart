'use client';

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
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
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-inner"
          title="Speech recognition not supported in this browser. Use manual input below."
        >
          <MicOff className="w-8 h-8" />
        </button>
        <span className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Voice unavailable (use text input)
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer pulsing rings when active listening */}
      {isListening && (
        <>
          <span className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping opacity-75 pointer-events-none" />
          <span className="absolute w-28 h-28 rounded-full bg-red-500/10 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Main Microphone Button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform active:scale-95 shadow-lg ${
          isListening
            ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/40 ring-4 ring-red-200 scale-105 animate-bounce-subtle'
            : isProcessing
            ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-amber-500/30'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-200'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-9 h-9 animate-spin" />
        ) : isListening ? (
          <div className="relative flex items-center justify-center">
            <Mic className="w-9 h-9 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        ) : (
          <Mic className="w-9 h-9" />
        )}
      </button>

      {/* Dynamic Status Label under button */}
      <div className="mt-3 text-center">
        {isListening ? (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Listening... Tap to stop</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Understanding intent...</span>
          </div>
        ) : (
          <p className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition">
            Tap mic and speak naturally
          </p>
        )}
      </div>
    </div>
  );
}
