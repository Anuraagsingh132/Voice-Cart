'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceState, SupportedLanguage, VoiceFeedback } from '@/types';

interface UseSpeechRecognitionProps {
  onTranscriptComplete?: (transcript: string) => void;
  defaultLanguage?: SupportedLanguage;
}

export function useSpeechRecognition({
  onTranscriptComplete,
  defaultLanguage = 'en-US',
}: UseSpeechRecognitionProps = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<VoiceFeedback>({
    status: 'idle',
    timestamp: Date.now(),
  });

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Check browser support on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
    isListeningRef.current = false;
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setFeedback({
        status: 'error',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome/Edge or manual typing below.',
        timestamp: Date.now(),
      });
      setVoiceState('error');
      return;
    }

    // Stop any existing instance
    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false; // Capture complete sentence
      recognition.interimResults = true; // Real-time feedback
      recognition.maxAlternatives = 1;

      setTranscript('');
      setInterimTranscript('');
      setVoiceState('listening');
      isListeningRef.current = true;

      setFeedback({
        status: 'listening',
        message: `Listening... (${language})`,
        timestamp: Date.now(),
      });

      let finalResultReceived = '';

      recognition.onstart = () => {
        setVoiceState('listening');
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (currentFinal) {
          finalResultReceived = currentFinal;
          setTranscript(currentFinal);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        isListeningRef.current = false;

        let errorMsg = 'Could not process audio. Please try again.';
        if (event.error === 'not-allowed') {
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Tap the mic and speak clearly.';
        } else if (event.error === 'network') {
          errorMsg = 'Network error with speech recognition service.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'No microphone was found on your device.';
        }

        setVoiceState('error');
        setFeedback({
          status: 'error',
          message: errorMsg,
          timestamp: Date.now(),
        });
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        const textToProcess = finalResultReceived || transcript || interimTranscript;

        if (textToProcess && textToProcess.trim()) {
          setVoiceState('processing');
          setFeedback({
            status: 'processing',
            transcript: textToProcess.trim(),
            message: `Processing: "${textToProcess.trim()}"...`,
            timestamp: Date.now(),
          });

          if (onCompleteRef.current) {
            onCompleteRef.current(textToProcess.trim());
          }
        } else {
          // If ended without any words captured and not in error state
          setVoiceState((prev) => (prev === 'error' ? 'error' : 'idle'));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('error');
      setFeedback({
        status: 'error',
        message: err?.message || 'Could not access microphone.',
        timestamp: Date.now(),
      });
      isListeningRef.current = false;
    }
  }, [language, stopListening, transcript, interimTranscript]);

  const resetState = useCallback(() => {
    stopListening();
    setVoiceState('idle');
    setTranscript('');
    setInterimTranscript('');
    setFeedback({
      status: 'idle',
      timestamp: Date.now(),
    });
  }, [stopListening]);

  return {
    voiceState,
    setVoiceState,
    transcript,
    interimTranscript,
    feedback,
    setFeedback,
    isSupported,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetState,
  };
}
