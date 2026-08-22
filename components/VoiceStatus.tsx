import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  return (
    <div className="w-full max-w-lg mx-auto sticky top-16 z-40">
      <AnimatePresence mode="wait">
        {/* Live streaming transcript while user is speaking */}
        {voiceState === 'listening' && interimTranscript ? (
          <motion.div
            key="listening-streaming"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="glass-card border-l-4 border-l-vc-cyan py-3 px-4 flex items-center justify-between gap-3 shadow-glow-cyan gpu-accelerate"
          >
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
          </motion.div>
        ) : feedback && feedback.status === 'processing' ? (
          <motion.div
            key="status-processing"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="glass-card border-l-4 border-l-vc-warning py-3 px-4 flex items-center justify-between gap-2 shadow-glow-warning gpu-accelerate"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Loader2 className="w-5 h-5 text-vc-warning animate-spin flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-vc-text truncate">
                  {feedback.transcript ? `🎙️ "${feedback.transcript}"` : 'Analyzing command...'}
                </p>
              </div>
            </div>
            <span className="badge-amber flex-shrink-0">
              Parsing
            </span>
          </motion.div>
        ) : feedback && feedback.status === 'success' ? (
          <motion.div
            key="status-success"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="glass-card border-l-4 border-l-vc-emerald py-3 px-4 flex items-center justify-between gap-2 shadow-glow-emerald gpu-accelerate"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-vc-emerald-muted flex items-center justify-center text-vc-emerald flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {feedback.transcript && (
                  <p className="text-xs font-medium text-vc-text-muted truncate mb-0.5">
                    🎙️ &ldquo;{feedback.transcript}&rdquo;
                  </p>
                )}
                <p className="text-sm font-semibold text-vc-text truncate">
                  {feedback.message || 'Executed successfully'}
                </p>
              </div>
            </div>
            {onUndo && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onUndo}
                className="btn-glass flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </motion.button>
            )}
          </motion.div>
        ) : feedback && feedback.status === 'error' ? (
          <motion.div
            key="status-error"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="glass-card border-l-4 border-l-vc-error py-3 px-4 flex items-center justify-between gap-2 shadow-glow-error gpu-accelerate"
          >
            <div className="flex items-center gap-3 overflow-hidden pr-2">
              <div className="w-8 h-8 rounded-full bg-vc-error/10 flex items-center justify-center text-vc-error flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {feedback.transcript && (
                  <p className="text-xs font-medium text-vc-text-muted truncate mb-0.5">
                    🎙️ &ldquo;{feedback.transcript}&rdquo;
                  </p>
                )}
                <p className="text-sm font-semibold text-vc-text truncate">
                  {feedback.message || 'Could not understand command'}
                </p>
              </div>
            </div>
            {onRetry && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onRetry}
                className="btn-glass !text-vc-error hover:!bg-vc-error/10 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </motion.button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

