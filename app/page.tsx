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
    <main className="min-h-screen px-4 py-6 md:py-10 max-w-3xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Central Voice Control Section */}
        <section className="my-6 flex flex-col items-center justify-center">
          <VoiceButton
            voiceState={voiceState}
            isSupported={isSupported}
            onStart={startListening}
            onStop={stopListening}
          />

          <VoiceStatus
            voiceState={voiceState}
            interimTranscript={interimTranscript}
            feedback={feedback}
            onRetry={startListening}
          />
        </section>

        {/* Voice Search Results (Conditional) */}
        <SearchResults />

        {/* Smart Suggestions & Substitutes Shelf */}
        <Suggestions />

        {/* Shopping List Management */}
        <ShoppingList />
      </div>

      {/* Manual Input Fallback (Bottom Sticky Bar) */}
      <footer className="sticky bottom-2 z-20 pt-4 pb-2">
        <ManualInput
          onProcessText={handleProcessCommand}
          isProcessing={voiceState === 'processing'}
        />
      </footer>

      {/* Voice Command Reference Modal */}
      <VoiceCommandGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
}
