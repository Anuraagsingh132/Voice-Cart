'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Loader2, Undo2 } from 'lucide-react';
import { VoiceFeedback, VoiceState } from '@/types';

interface VoiceStatusProps {
  voiceState: VoiceState;
  interimTranscript: string;
  feedback: VoiceFeedback;
  onRetry?: () => void;
  onUndo?: () => void;
}

export function VoiceStatus({
  voiceState,
  interimTranscript,
  feedback,
  onRetry,
  onUndo,
}: VoiceStatusProps) {
  // Live streaming transcript while user is speaking
  if (voiceState === 'listening' && interimTranscript) {
    return (
      <div className="glass-card border-l-4 border-l-vc-cyan py-3 px-4 flex items-center justify-between gap-3 shadow-glow-cyan mx-auto max-w-lg sticky top-16 z-40 animate-fade-in-down transition-all duration-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-vc-cyan animate-pulse flex-shrink-0 shadow-glow-cyan" />
          <p className="text-sm font-medium text-vc-text truncate flex items-center">
            <span className="text-vc-text-secondary mr-2">🎙️</span>
            <span>&ldquo;{interimTranscript}&rdquo;</span>
          </p>
        </div>
        <span className="badge-cyan flex-shrink-0">
          Listening
        </span>
      </div>
    );
  }

  // Active or completed feedback
  if (!feedback || feedback.status === 'idle') {
    return null;
  }

  const { status, message, transcript } = feedback;

  return (
    <div className="w-full max-w-lg mx-auto sticky top-16 z-40 animate-fade-in-down transition-all duration-300">
      {status === 'processing' && (
        <div className="glass-card border-l-4 border-l-vc-warning py-3 px-4 flex items-center justify-between gap-2 shadow-glow-warning">
          <div className="flex items-center gap-3 overflow-hidden">
            <Loader2 className="w-5 h-5 text-vc-warning animate-spin flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-vc-text truncate">
                {transcript ? `🎙️ "${transcript}"` : 'Analyzing command...'}
              </p>
            </div>
          </div>
          <span className="badge-amber flex-shrink-0">
            Parsing
          </span>
        </div>
      )}

      {status === 'success' && (
        <div className="glass-card border-l-4 border-l-vc-emerald py-3 px-4 flex items-center justify-between gap-2 shadow-glow-emerald">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-vc-emerald-muted flex items-center justify-center text-vc-emerald flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {transcript && (
                <p className="text-xs font-medium text-vc-text-muted truncate mb-0.5">
                  🎙️ &ldquo;{transcript}&rdquo;
                </p>
              )}
              <p className="text-sm font-semibold text-vc-text truncate">
                {message || 'Executed successfully'}
              </p>
            </div>
          </div>
          {onUndo && (
            <button
              onClick={onUndo}
              className="btn-glass flex items-center gap-1.5 flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="glass-card border-l-4 border-l-vc-error py-3 px-4 flex items-center justify-between gap-2 shadow-glow-error">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-full bg-vc-error/10 flex items-center justify-center text-vc-error flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {transcript && (
                <p className="text-xs font-medium text-vc-text-muted truncate mb-0.5">
                  🎙️ &ldquo;{transcript}&rdquo;
                </p>
              )}
              <p className="text-sm font-semibold text-vc-text truncate">
                {message || 'Could not understand command'}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-glass !text-vc-error hover:!bg-vc-error/10 flex items-center gap-1.5 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
