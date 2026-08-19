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
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSpeechBufferRef = useRef<string>('');

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

  const clearRestartTimer = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const clearSilenceTimer = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  // Dispatch text to handler and reset buffer
  const dispatchCommand = useCallback((text: string) => {
    const clean = (text || '').trim();
    if (!clean) return;

    latestSpeechBufferRef.current = '';
    setInterimTranscript('');
    setTranscript(clean);

    if (onCompleteRef.current) {
      onCompleteRef.current(clean);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    setIsAlwaysActive(false);
    clearRestartTimer();
    clearSilenceTimer();

    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
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
    clearRestartTimer();
    clearSilenceTimer();

    // If already listening on same language, don't restart
    if (isListeningRef.current && recognitionRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setVoiceState('listening');
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

        const activeText = (currentFinal || currentInterim).trim();
        if (activeText) {
          latestSpeechBufferRef.current = activeText;
          setInterimTranscript(activeText);

          // Reset silence debounce timer: If user pauses for 1200ms, immediately dispatch!
          clearSilenceTimer();
          silenceTimeoutRef.current = setTimeout(() => {
            if (latestSpeechBufferRef.current) {
              dispatchCommand(latestSpeechBufferRef.current);
            }
          }, 1200);
        }

        // If browser directly emitted final chunk, dispatch immediately
        if (currentFinal.trim()) {
          clearSilenceTimer();
          dispatchCommand(currentFinal.trim());
        }
      };

      recognition.onerror = (event: any) => {
        // Silently ignore normal lifecycle aborts or silence gaps
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed') {
          shouldKeepListeningRef.current = false;
          setIsAlwaysActive(false);
          isListeningRef.current = false;
          setVoiceState('error');
          setFeedback({
            status: 'error',
            message: 'Microphone permission denied. Please allow microphone access in browser settings.',
            timestamp: Date.now(),
          });
          return;
        }

        console.warn('Speech recognition warning:', event.error);
      };

      recognition.onend = () => {
        isListeningRef.current = false;

        // If we had speech in buffer when socket closed, dispatch it!
        if (latestSpeechBufferRef.current) {
          dispatchCommand(latestSpeechBufferRef.current);
        }

        // Auto-restart seamlessly if always-active is enabled
        if (shouldKeepListeningRef.current) {
          clearRestartTimer();
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldKeepListeningRef.current && !isListeningRef.current) {
              try {
                recognition.start();
              } catch (err: any) {
                if (err.name !== 'InvalidStateError') {
                  startListening();
                }
              }
            }
          }, 300);
        } else {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      if (err.name !== 'InvalidStateError') {
        console.warn('Speech recognition start failed:', err);
      }
      isListeningRef.current = false;
    }
  }, [language, dispatchCommand]);

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

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      clearRestartTimer();
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

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
