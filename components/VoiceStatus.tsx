'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { VoiceFeedback, VoiceState } from '@/types';

interface VoiceStatusProps {
  voiceState: VoiceState;
  interimTranscript: string;
  feedback: VoiceFeedback;
  onRetry?: () => void;
}

export function VoiceStatus({
  voiceState,
  interimTranscript,
  feedback,
  onRetry,
}: VoiceStatusProps) {
  // If user is currently speaking and interim transcript is streaming in
  if (voiceState === 'listening' && interimTranscript) {
    return (
      <div className="bg-primary/10 backdrop-blur-md border border-primary/25 rounded-full py-2 px-4 flex items-center justify-center gap-2 shadow-xs shadow-primary/10 mx-auto max-w-md sticky top-20 z-40 animate-fade-in-down">
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <p className="text-xs md:text-sm font-medium text-primary truncate">
          Listening: &ldquo;{interimTranscript}&rdquo;
        </p>
      </div>
    );
  }

  // Active or completed feedback
  if (!feedback || feedback.status === 'idle') {
    return null;
  }

  const { status, message, transcript } = feedback;

  return (
    <div className="w-full max-w-md mx-auto sticky top-20 z-40 animate-fade-in-down transition-all">
      {status === 'processing' && (
        <div className="bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-full py-2 px-4 flex items-center justify-center gap-2 shadow-xs">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-amber-900 truncate">
            {transcript ? `Parsing "${transcript}"...` : 'Analyzing your voice command...'}
          </span>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-200 rounded-full py-2 px-4 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs md:text-sm font-semibold text-emerald-950 truncate">
              {message || 'Action completed!'}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-rose-50/95 backdrop-blur-md border border-rose-200 rounded-full py-2 px-4 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-xs md:text-sm font-semibold text-rose-950 truncate">
              {message || 'Could not understand command.'}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-[11px] font-semibold bg-rose-200/80 hover:bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full transition flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
