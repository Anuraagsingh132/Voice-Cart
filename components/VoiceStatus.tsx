'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Search } from 'lucide-react';
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
      <div className="w-full max-w-md mx-auto my-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl shadow-sm text-center transition-all animate-fade-in">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live Voice Stream
        </p>
        <p className="text-base font-medium text-neutral-800 italic">
          &ldquo;{interimTranscript}&rdquo;
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
    <div className="w-full max-w-md mx-auto my-2 transition-all">
      {status === 'processing' && (
        <div className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl shadow-sm text-center">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span className="text-sm font-medium text-amber-900">
            {transcript ? `Parsing "${transcript}"...` : 'Analyzing your voice command...'}
          </span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <p className="text-sm font-semibold text-emerald-950 truncate">
                {message || 'Action completed!'}
              </p>
              {transcript && (
                <p className="text-xs text-emerald-700 truncate opacity-80">
                  Heard: &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div className="truncate pr-2">
              <p className="text-sm font-semibold text-rose-950">
                {message || 'Could not understand command.'}
              </p>
              {transcript && (
                <p className="text-xs text-rose-700 truncate opacity-80">
                  Heard: &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-1 text-xs font-semibold bg-rose-200/70 hover:bg-rose-200 text-rose-800 px-2.5 py-1 rounded-lg transition"
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
