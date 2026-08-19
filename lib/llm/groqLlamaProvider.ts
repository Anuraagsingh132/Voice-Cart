import Groq from 'groq-sdk';
import { LLMProvider, LLMInterpretationResult } from './llmInterface';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { withTimeout } from '@/lib/resilience/timeout';
import { entityResolver } from '@/lib/entities/entityResolver';

export class GroqLlamaProvider implements LLMProvider {
  public readonly name = 'GroqLlama3.1-8B';
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('GroqLlama-LLM', {
      failureThreshold: 3,
      recoveryTimeoutMs: 15000,
    });
  }

  public async interpret(transcript: string, locale = 'en-US'): Promise<LLMInterpretationResult> {
    return this.circuitBreaker.execute<LLMInterpretationResult>(
      async () => {

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
          throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
        }

        const groq = new Groq({ apiKey, timeout: 6000, maxRetries: 1 });

        const prompt = `You are a grocery shopping intent parser. Convert spoken commands into JSON.
Language locale: ${locale}

ACTIONS:
- "ADD": Add one or more grocery items
- "REMOVE": Delete items
- "MODIFY": Update quantity
- "SEARCH": Search products or price ranges
- "CLEAR": Clear list
- "UNDO": Undo action
- "UNKNOWN": Non-grocery speech or noise

SCHEMA:
{
  "action": "ADD" | "REMOVE" | "MODIFY" | "SEARCH" | "CLEAR" | "UNDO" | "UNKNOWN",
  "items": [
    { "name": string, "quantity": number, "unit": string }
  ],
  "target_item": string | null,
  "confidence": number,
  "explanation": string
}

Spoken command: "${transcript}"
Return ONLY valid JSON.`;

        const parseCall = groq.chat.completions.create({
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: transcript },
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.05,
          max_tokens: 300,
          response_format: { type: 'json_object' },
        });

        const chatCompletion = await withTimeout(parseCall, 5000, undefined, 'Groq LLM Request');
        const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        const parsed = JSON.parse(content);

        const rawAction = (parsed.action || 'UNKNOWN').toUpperCase();
        const action = ['ADD', 'REMOVE', 'MODIFY', 'SEARCH', 'CLEAR', 'UNDO', 'UNKNOWN'].includes(rawAction)
          ? rawAction
          : 'UNKNOWN';

        const entities = Array.isArray(parsed.items)
          ? parsed.items.map((it: any) =>
              entityResolver.resolve(
                it.name || transcript,
                locale,
                Number(it.quantity) || 1,
                it.unit || 'pieces'
              )
            )
          : [];

        return {
          action: action as any,
          entities,
          target_item: parsed.target_item || (entities[0] ? entities[0].name : null),
          confidence: Math.min(1.0, Math.max(0.0, Number(parsed.confidence) || 0.8)),
          explanation: parsed.explanation || `Interpreted ${action} intent`,
        };
      },
      // Safe fallback when breaker is OPEN or call fails
      async (): Promise<LLMInterpretationResult> => {
        return {
          action: 'UNKNOWN',
          entities: [],
          target_item: null,
          confidence: 0.1,
          explanation: 'LLM Gateway unavailable; offline fallback active',
        };
      }
    );
  }
}


export const groqLlamaProvider = new GroqLlamaProvider();
