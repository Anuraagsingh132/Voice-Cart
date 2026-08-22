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
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
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
  const lastDispatchedRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  // MediaRecorder refs for Whisper audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    onCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  useEffect(() => {
    shouldKeepListeningRef.current = isAlwaysActive;
  }, [isAlwaysActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
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

  // Dispatch text to handler and guard against rapid duplicate emissions
  const dispatchCommand = useCallback((text: string) => {
    const clean = (text || '').trim();
    if (!clean || clean.length < 2) return;

    const now = Date.now();
    if (
      lastDispatchedRef.current.text.toLowerCase() === clean.toLowerCase() &&
      now - lastDispatchedRef.current.time < 2500
    ) {
      // Ignore duplicate within 2.5s window
      return;
    }

    lastDispatchedRef.current = { text: clean, time: now };
    latestSpeechBufferRef.current = '';
    setInterimTranscript('');
    setTranscript(clean);

    if (onCompleteRef.current) {
      onCompleteRef.current(clean);
    }
  }, []);

  // Transcribe recorded audio with Groq Whisper
  const transcribeAudioBlob = useCallback(
    async (blob: Blob, fallbackText: string) => {
      // If audio blob is too small to contain valid speech audio (< 500 bytes), use fallback WebSpeech transcript
      if (blob.size < 500) {
        if (fallbackText) {
          dispatchCommand(fallbackText);
        }
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        formData.append('language', language);

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.transcript && data.transcript.trim()) {
            dispatchCommand(data.transcript.trim());
            return;
          }
        }
      } catch (err) {
        console.warn('Whisper API call failed, falling back to WebSpeech transcript:', err);
      }

      // Fallback to WebSpeech transcript if Whisper failed or was skipped
      if (fallbackText) {
        dispatchCommand(fallbackText);
      }
    },
    [language, dispatchCommand]
  );


  const startAudioRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }

      audioChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecordingAudio(false);
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          transcribeAudioBlob(audioBlob, latestSpeechBufferRef.current);
        } else if (latestSpeechBufferRef.current) {
          dispatchCommand(latestSpeechBufferRef.current);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecordingAudio(true);
    } catch (err) {
      console.warn('Microphone audio stream recording initialization error:', err);
    }
  }, [transcribeAudioBlob, dispatchCommand]);

  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecordingAudio(false);
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    setIsAlwaysActive(false);
    clearRestartTimer();
    clearSilenceTimer();

    stopAudioRecording();

    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    isListeningRef.current = false;
    setVoiceState('idle');
  }, [stopAudioRecording]);

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
        startAudioRecording();
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

          // Reset silence debounce timer: If user pauses for 750ms, finalize command
          clearSilenceTimer();
          silenceTimeoutRef.current = setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            } else if (latestSpeechBufferRef.current) {
              dispatchCommand(latestSpeechBufferRef.current);
            }
          }, 750);
        }


        if (currentFinal.trim()) {
          clearSilenceTimer();
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          } else {
            dispatchCommand(currentFinal.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
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
          }, 350);
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
  }, [language, startAudioRecording, dispatchCommand]);

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

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      clearRestartTimer();
      clearSilenceTimer();
      stopAudioRecording();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [stopAudioRecording]);

  return {
    voiceState,
    setVoiceState,
    transcript,
    interimTranscript,
    feedback,
    setFeedback,
    isSupported,
    isAlwaysActive,
    isRecordingAudio,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetState,
  };
}
