'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Loader2, Mic, Undo2 } from 'lucide-react';
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
      <div className="bg-emerald-600 text-white border border-emerald-500 rounded-2xl py-2.5 px-5 flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/20 mx-auto max-w-lg sticky top-16 z-40 animate-fade-in-down">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-white truncate flex items-center">
            <span className="font-semibold text-emerald-100 mr-1.5">🎙️ Heard:</span>
            <span>&ldquo;{interimTranscript}&rdquo;</span>
            <span className="inline-block w-1.5 h-3.5 bg-white ml-1.5 animate-pulse rounded-xs" />
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full flex-shrink-0">
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
    <div className="w-full max-w-lg mx-auto sticky top-16 z-40 animate-fade-in-down transition-all">
      {status === 'processing' && (
        <div className="bg-amber-500 text-white border border-amber-400 rounded-2xl py-2.5 px-5 flex items-center justify-between gap-2 shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Loader2 className="w-4 h-4 text-white animate-spin flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {transcript ? `🎙️ "${transcript}"` : 'Analyzing voice command...'}
              </p>
              <p className="text-[11px] text-amber-100">Groq NLP extracting intent & entities...</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full flex-shrink-0">
            Parsing
          </span>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-white text-neutral-900 border-2 border-emerald-500 rounded-2xl py-2.5 px-5 flex items-center justify-between gap-2 shadow-lg shadow-emerald-500/10 animate-fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              {transcript && (
                <p className="text-[11px] font-semibold text-neutral-400 truncate">
                  🎙️ Spoken: &ldquo;{transcript}&rdquo;
                </p>
              )}
              <p className="text-xs sm:text-sm font-bold text-emerald-800 truncate">
                {message || 'Action executed successfully'}
              </p>
            </div>
          </div>
          {onUndo ? (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded-xl transition flex-shrink-0 shadow-xs active:scale-95 border border-neutral-300"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex-shrink-0">
              Executed
            </span>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white text-neutral-900 border-2 border-rose-400 rounded-2xl py-2.5 px-5 flex items-center justify-between gap-2 shadow-lg shadow-rose-500/10 animate-fade-in">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="min-w-0">
              {transcript && (
                <p className="text-[11px] font-semibold text-neutral-400 truncate">
                  🎙️ Spoken: &ldquo;{transcript}&rdquo;
                </p>
              )}
              <p className="text-xs sm:text-sm font-bold text-rose-800 truncate">
                {message || 'Could not understand command.'}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-xl transition flex-shrink-0 shadow-xs active:scale-95"
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
