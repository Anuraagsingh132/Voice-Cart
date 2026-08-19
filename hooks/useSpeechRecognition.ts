'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceState, SupportedLanguage, VoiceFeedback } from '@/types';

interface UseSpeechRecognitionProps {
  onTranscriptComplete?: (transcript: string) => void;
  defaultLanguage?: SupportedLanguage;
  alwaysActive?: boolean;
}

export function useSpeechRecognition({
  onTranscriptComplete,
  defaultLanguage = 'en-US',
  alwaysActive = true,
}: UseSpeechRecognitionProps = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isAlwaysActive, setIsAlwaysActive] = useState<boolean>(alwaysActive);
  const [feedback, setFeedback] = useState<VoiceFeedback>({
    status: 'idle',
    timestamp: Date.now(),
  });

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const shouldKeepListeningRef = useRef<boolean>(alwaysActive);
  const onCompleteRef = useRef(onTranscriptComplete);
  const lastProcessedTranscriptRef = useRef<string>('');
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  useEffect(() => {
    shouldKeepListeningRef.current = isAlwaysActive;
  }, [isAlwaysActive]);

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
    shouldKeepListeningRef.current = false;
    setIsAlwaysActive(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
    isListeningRef.current = false;
    setVoiceState('idle');
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setFeedback({
        status: 'error',
        message: 'Speech recognition is not supported in this browser. Please use Chrome/Edge or manual typing.',
        timestamp: Date.now(),
      });
      setVoiceState('error');
      return;
    }

    shouldKeepListeningRef.current = true;
    setIsAlwaysActive(true);

    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true; // Always active & continuous listening
      recognition.interimResults = true; // Real-time feedback
      recognition.maxAlternatives = 1;

      setTranscript('');
      setInterimTranscript('');
      setVoiceState('listening');
      isListeningRef.current = true;

      setFeedback({
        status: 'listening',
        message: `Listening always active (${language})`,
        timestamp: Date.now(),
      });

      let finalBuffer = '';

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
            currentFinal += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim.trim());
        }

        if (currentFinal) {
          const trimmedFinal = currentFinal.trim();
          setInterimTranscript('');
          setTranscript(trimmedFinal);
          finalBuffer = trimmedFinal;

          // Dispatch command if not duplicate
          if (trimmedFinal && trimmedFinal !== lastProcessedTranscriptRef.current) {
            lastProcessedTranscriptRef.current = trimmedFinal;
            if (onCompleteRef.current) {
              onCompleteRef.current(trimmedFinal);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);

        if (event.error === 'no-speech') {
          // Normal silence gap in continuous mode - do not show scary error, keep listening
          return;
        }

        if (event.error === 'not-allowed') {
          shouldKeepListeningRef.current = false;
          setIsAlwaysActive(false);
          isListeningRef.current = false;
          setVoiceState('error');
          setFeedback({
            status: 'error',
            message: 'Microphone permission denied. Please enable mic access.',
            timestamp: Date.now(),
          });
          return;
        }

        // For transient errors, attempt seamless auto-restart if always active
        if (shouldKeepListeningRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          }, 400);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;

        // In continuous mode, browsers periodically close socket on silence. Auto-restart immediately!
        if (shouldKeepListeningRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          }, 200);
        } else {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('error');
      isListeningRef.current = false;
    }
  }, [language]);

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
    isAlwaysActive,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetState,
  };
}
