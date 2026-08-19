import Groq from 'groq-sdk';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { withTimeout } from '@/lib/resilience/timeout';

export interface STTTranscriptionResult {
  transcript: string;
  model_used: 'whisper-large-v3-turbo' | 'whisper-large-v3' | 'client_webspeech_fallback';
  confidence: number;
  duration_ms: number;
}

const STT_MODELS = [
  'whisper-large-v3-turbo', // Primary: Lowest latency, ultra-fast
  'whisper-large-v3',       // Secondary: High multilingual precision fallback
] as const;

export class STTGateway {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('Groq-STT-Gateway', {
      failureThreshold: 3,
      recoveryTimeoutMs: 15000,
    });
  }

  public async transcribe(
    audioFile: File | Blob,
    language = 'en',
    clientFallbackTranscript = ''
  ): Promise<STTTranscriptionResult> {
    const startTime = performance.now();

    return this.circuitBreaker.execute<STTTranscriptionResult>(
      async () => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GROQ_API_KEY') {
          return {
            transcript: clientFallbackTranscript,
            model_used: 'client_webspeech_fallback',
            confidence: 0.8,
            duration_ms: performance.now() - startTime,
          };
        }

        const groq = new Groq({ apiKey, timeout: 8000, maxRetries: 1 });
        const groceryPrompt =
          'Grocery list shopping commands: milk, eggs, apples, leek, ginger, adrak, atta, paneer, oil, tel, rice, dal, chawal, toothpaste, soap, bananas, carrots, spinach, tomatoes, onions, butter, cheese, sugar, salt, coffee, tea.';

        const targetLang = language.startsWith('hi')
          ? 'hi'
          : language.startsWith('es')
          ? 'es'
          : language.startsWith('fr')
          ? 'fr'
          : language.startsWith('de')
          ? 'de'
          : 'en';

        // Try primary model (whisper-large-v3-turbo), then cascade to secondary (whisper-large-v3) if rate-limited
        let lastError: any;
        for (const model of STT_MODELS) {
          try {
            const transcriptionCall = groq.audio.transcriptions.create({
              file: audioFile as any,
              model,
              prompt: groceryPrompt,
              response_format: 'json',
              temperature: 0.0,
              language: targetLang,
            });

            const transcription = await withTimeout(transcriptionCall, 6000, undefined, `Groq STT [${model}]`);
            const transcript = transcription.text?.trim() || '';

            if (transcript) {
              return {
                transcript,
                model_used: model,
                confidence: model === 'whisper-large-v3-turbo' ? 0.98 : 0.95,
                duration_ms: performance.now() - startTime,
              };
            }
          } catch (err: any) {
            lastError = err;
            const isRateLimit = err?.status === 429 || /rate|quota|limit/i.test(err?.message || '');
            console.warn(`STT Model ${model} failed (${isRateLimit ? 'Rate Limit 429' : err?.message}), cascading to next provider...`);
          }
        }

        // If both Groq models failed / rate-limited, gracefully use parallel client WebSpeech transcript
        if (clientFallbackTranscript) {
          return {
            transcript: clientFallbackTranscript,
            model_used: 'client_webspeech_fallback',
            confidence: 0.85,
            duration_ms: performance.now() - startTime,
          };
        }

        throw lastError || new Error('All STT models in cascade failed');
      },
      // Circuit-breaker fallback
      async () => {
        return {
          transcript: clientFallbackTranscript,
          model_used: 'client_webspeech_fallback',
          confidence: 0.8,
          duration_ms: performance.now() - startTime,
        };
      }
    );
  }
}

export const sttGateway = new STTGateway();
