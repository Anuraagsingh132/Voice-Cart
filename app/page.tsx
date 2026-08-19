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
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useShoppingList } from '@/context/ShoppingListContext';
import { parseIntent } from '@/lib/intentParser';
import { SupportedLanguage } from '@/types';

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { processParsedIntent } = useShoppingList();

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
        const parsed = await parseIntent(text, language);

        if (parsed.intent === 'UNKNOWN') {
          setVoiceState('listening');
          setFeedback({
            status: 'error',
            transcript: text,
            message: `Could not recognize "${text}". Try saying "Add milk" or "Find apples".`,
            intent: 'UNKNOWN',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            setFeedback({ status: 'idle', timestamp: Date.now() });
          }, 3000);
          return;
        }

        const outcome = processParsedIntent(parsed);

        if (outcome.success) {
          setVoiceState('success');
          setFeedback({
            status: 'success',
            transcript: text,
            message: outcome.message,
            intent: parsed.intent,
            timestamp: Date.now(),
          });

          setTimeout(() => {
            setVoiceState('listening');
          }, 3000);
        } else {
          setVoiceState('error');
          setFeedback({
            status: 'error',
            transcript: text,
            message: outcome.message,
            intent: parsed.intent,
            timestamp: Date.now(),
          });

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
    [processParsedIntent]
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

  // Attempt auto-start on load if supported
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

  return (
    <>
      {/* Top Fixed Navigation Bar with Live Background Voice Status */}
      <Header
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        voiceState={voiceState}
        onToggleVoice={() => {
          if (voiceState === 'listening') {
            stopListening();
          } else {
            startListening();
          }
        }}
      />

      {/* Main Content Area with spacious wide max-w-7xl grid and generous bottom scroll clearance */}
      <main className="max-w-7xl mx-auto pt-20 pb-64 px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        {/* Floating Voice Status Toast */}
        <VoiceStatus
          voiceState={voiceState}
          interimTranscript={interimTranscript}
          feedback={feedback}
          onRetry={startListening}
        />

        {/* Voice Search Results Tray */}
        <SearchResults />

        {/* Smart Suggestions Carousel */}
        <Suggestions />

        {/* Current Shopping List */}
        <ShoppingList />
      </main>

      {/* Fixed Bottom Voice & Keyboard Control Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          {/* Subtle Voice Hint Pill */}
          <div className="bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-2xs rounded-full px-3.5 py-1 text-xs text-neutral-600 font-medium animate-pulse text-center">
            {voiceState === 'listening'
              ? '🎙️ Microphone listening • speak shopping commands anytime'
              : voiceState === 'processing'
              ? '⏳ Analyzing command...'
              : 'Tap the mic or speak: "Add 5 apples to my list" • "Find juice under $5"'}
          </div>

          {/* Center Voice Button */}
          <VoiceButton
            voiceState={voiceState}
            isSupported={isSupported}
            onStart={startListening}
            onStop={stopListening}
          />

          {/* Manual Input Bar */}
          <ManualInput
            onProcessText={handleProcessCommand}
            isProcessing={voiceState === 'processing'}
          />
        </div>
      </div>

      {/* Voice Command Cheat Sheet Modal */}
      <VoiceCommandGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
