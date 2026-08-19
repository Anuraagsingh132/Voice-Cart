'use client';

import React, { useState, useCallback } from 'react';
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

  // Core Intent Processing function
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
        // 1. NLP Parse Intent via Groq LLM (with heuristic fallback)
        const parsed = await parseIntent(text, language);

        // 2. Execute List Action based on parsed intent
        const outcome = processParsedIntent(parsed);

        // 3. Update feedback state
        if (outcome.success) {
          setVoiceState('success');
          setFeedback({
            status: 'success',
            transcript: text,
            message: outcome.message,
            intent: parsed.intent,
            timestamp: Date.now(),
          });

          // Reset to idle after 4 seconds
          setTimeout(() => {
            setVoiceState((prev) => (prev === 'success' ? 'idle' : prev));
          }, 4000);
        } else {
          setVoiceState('error');
          setFeedback({
            status: 'error',
            transcript: text,
            message: outcome.message,
            intent: parsed.intent,
            timestamp: Date.now(),
          });
        }
      } catch (err: any) {
        console.error('Error processing command:', err);
        setVoiceState('error');
        setFeedback({
          status: 'error',
          transcript: text,
          message: 'Failed to process voice command. Please try again.',
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
  });

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    resetState();
  };

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <Header
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto pt-20 pb-56 px-4 md:px-8 space-y-6 relative z-10">
        {/* Floating Voice Status Toast (Sticky below header) */}
        <VoiceStatus
          voiceState={voiceState}
          interimTranscript={interimTranscript}
          feedback={feedback}
          onRetry={startListening}
        />

        {/* Voice Search Results Tray (Active when SEARCH intent triggered) */}
        <SearchResults />

        {/* Smart Suggestions Horizontal Carousel Shelf */}
        <Suggestions />

        {/* Current Shopping List Card */}
        <ShoppingList />
      </main>

      {/* Bottom Action Area (Voice Centerpiece + Manual Input) */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2.5">
          {/* Voice Prompt Hint */}
          <p className="text-xs md:text-sm text-on-surface-variant font-medium animate-pulse opacity-75 text-center">
            {voiceState === 'listening'
              ? 'Listening to your speech...'
              : voiceState === 'processing'
              ? 'Processing command...'
              : 'Try saying: "Add 5 apples to my list" or "Find toothpaste under $5"'}
          </p>

          {/* Centerpiece Voice Button */}
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

      {/* Voice Command Reference Modal */}
      <VoiceCommandGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
