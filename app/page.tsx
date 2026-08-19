'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceStatus } from '@/components/VoiceStatus';
import { ShoppingList } from '@/components/ShoppingList';
import { Suggestions } from '@/components/Suggestions';
import { SearchResults } from '@/components/SearchResults';
import { ManualInput } from '@/components/ManualInput';
import { VoiceCommandGuide } from '@/components/VoiceCommandGuide';
import { DiagnosticsModal } from '@/components/DiagnosticsModal';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useShoppingList } from '@/context/ShoppingListContext';
import { voiceFeedbackService } from '@/lib/tts/voiceFeedback';
import { SupportedLanguage } from '@/types';
import { Mic, Zap, ShoppingCart } from 'lucide-react';


export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const { executeOrchestratedCommand, undoLastCommand, items } = useShoppingList();

  const handleProcessCommand = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;

      setVoiceState('processing');
      setFeedback({
        status: 'processing',
        transcript: text,
        message: `Analyzing: "${text}"...`,
        timestamp: Date.now(),
      });

      try {
        const result = await executeOrchestratedCommand(text, language, 'voice_whisper');

        if (result.success) {
          setVoiceState('success');
          setFeedback({
            status: 'success',
            transcript: text,
            message: result.message,
            intent: result.action as any,
            timestamp: Date.now(),
          });

          // Conversational TTS audio reply
          voiceFeedbackService.speak(result.message, language);

          setTimeout(() => {
            setVoiceState('listening');
          }, 3000);
        } else {
          setVoiceState('error');
          setFeedback({
            status: 'error',
            transcript: text,
            message: result.message,
            intent: result.action as any,
            timestamp: Date.now(),
          });

          voiceFeedbackService.speak(result.message, language);

          setTimeout(() => {
            setVoiceState('listening');
          }, 3000);
        }

      } catch (err: any) {
        console.error('Error processing command:', err);
        setVoiceState('error');
        setFeedback({
          status: 'error',
          transcript: text,
          message: 'Something went wrong while processing that command. Please try again.',
          timestamp: Date.now(),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executeOrchestratedCommand]
  );

  const {
    voiceState,
    setVoiceState,
    interimTranscript,
    feedback,
    setFeedback,
    isSupported,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetState,
  } = useSpeechRecognition({
    onTranscriptComplete: handleProcessCommand,
    defaultLanguage: 'en-US',
    alwaysActive: true,
  });

  useEffect(() => {
    if (isSupported && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          startListening();
        } catch {}
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isSupported, startListening]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    resetState();
    setTimeout(() => startListening(), 200);
  };

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;

  return (
    <>
      {/* Fixed Navigation */}
      <Header
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        voiceState={voiceState}
        onToggleVoice={() => {
          if (voiceState === 'listening') {
            stopListening();
          } else {
            startListening();
          }
        }}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto pt-20 pb-56 px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
        {/* Hero / Onboarding Section — shown only when list is empty and no search active */}
        {totalItems === 0 && !feedback.transcript && (
          <section className="text-center py-8 sm:py-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 badge-cyan text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <Zap className="w-3.5 h-3.5" />
              Voice-First AI Shopping
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-display font-extrabold text-vc-text tracking-tight mb-3">
              Speak naturally.{' '}
              <span className="text-gradient-cyan">Shop intelligently.</span>
            </h1>
            <p className="text-base sm:text-lg text-vc-text-secondary max-w-xl mx-auto mb-6">
              Add items, search products, and manage your shopping list — all with your voice. 
              Just speak, and Voice Cart handles the rest.
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-vc-text-muted">
              <div className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-vc-cyan" />
                <span>6 Languages</span>
              </div>
              <div className="w-px h-4 bg-vc-border" />
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-vc-emerald" />
                <span>27k+ Products</span>
              </div>
              <div className="w-px h-4 bg-vc-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-vc-violet" />
                <span>AI-Powered</span>
              </div>
            </div>
          </section>
        )}

        {/* Session Stats Bar — shown when user has items */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between glass-card rounded-xl px-4 py-2.5 text-xs animate-fade-in">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-vc-cyan" />
                <span className="text-vc-text-secondary">
                  <span className="font-bold text-vc-text tabular-nums">{totalItems}</span> items
                </span>
              </div>
              <div className="w-px h-4 bg-vc-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-vc-text-secondary">
                  <span className="font-bold text-vc-emerald tabular-nums">{checkedItems}</span> bought
                </span>
              </div>
            </div>
            <div className="text-vc-text-muted">
              {voiceState === 'listening' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-vc-cyan animate-pulse-soft" />
                  Listening
                </span>
              )}
            </div>
          </div>
        )}

        {/* Voice Status Toast */}
        <VoiceStatus
          voiceState={voiceState}
          interimTranscript={interimTranscript}
          feedback={feedback}
          onRetry={startListening}
          onUndo={async () => {
            await undoLastCommand();
            setFeedback((prev) => ({ ...prev, status: 'idle' }));
          }}
        />

        {/* Search Results */}
        <SearchResults />

        {/* Suggestions */}
        <Suggestions />

        {/* Shopping List */}
        <ShoppingList />
      </main>

      {/* Fixed Bottom Voice & Input Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-vc-bg via-vc-bg/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          {/* Voice Hint */}
          <div className="glass text-xs text-vc-text-secondary font-medium rounded-full px-3.5 py-1 text-center max-w-md">
            {voiceState === 'listening'
              ? '🎙️ Listening — speak shopping commands anytime'
              : voiceState === 'processing'
              ? '⏳ Analyzing command...'
              : 'Tap the mic or speak: "Add 5 apples" · "Find juice under $5"'}
          </div>

          {/* Voice Button */}
          <VoiceButton
            voiceState={voiceState}
            isSupported={isSupported}
            onStart={startListening}
            onStop={stopListening}
          />

          {/* Manual Input */}
          <ManualInput
            onProcessText={handleProcessCommand}
            isProcessing={voiceState === 'processing'}
          />
        </div>
      </div>

      {/* Modals */}
      <VoiceCommandGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onTriggerUndo={async () => {
          await undoLastCommand();
        }}
      />
    </>
  );
}
