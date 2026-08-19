import Groq from 'groq-sdk';
import { LLMInterpretationResult } from './llmInterface';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { withTimeout } from '@/lib/resilience/timeout';
import { entityResolver } from '@/lib/entities/entityResolver';

export interface LLMCascadeOutput extends LLMInterpretationResult {
  model_used: string;
}

const LLM_MODEL_CASCADE = [
  'llama-3.3-70b-versatile', // Tier 1: Highest intelligence, reasoning & multilingual parsing
  'llama-3.1-8b-instant',    // Tier 2: Ultra-fast, high TPM rate-limit headroom
] as const;

export class LLMGateway {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('Groq-LLM-Cascade', {
      failureThreshold: 3,
      recoveryTimeoutMs: 15000,
    });
  }

  public async interpret(transcript: string, locale = 'en-US'): Promise<LLMCascadeOutput> {
    return this.circuitBreaker.execute<LLMCascadeOutput>(
      async () => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
          throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
        }

        const groq = new Groq({ apiKey, timeout: 6000, maxRetries: 1 });

        const prompt = `You are a grocery shopping intent parser. Convert spoken commands into JSON.
Language locale: ${locale}

ACTIONS:
- "ADD": Add grocery items (e.g. "add 2 apples", "milk and bread")
- "REMOVE": Delete items
- "MODIFY": Update quantity/unit
- "SEARCH": Search products or price constraints
- "CLEAR": Clear shopping list
- "UNDO": Revert previous action
- "UNKNOWN": Non-grocery questions, random chatter, or incomplete fragments

CRITICAL GUARDRAILS:
1. If the input is a general question, random talk, or contains no grocery product (e.g. "what was my actress", "who is the president", "where are you", "what time is it"), return action "UNKNOWN" and items: []. NEVER create items for non-grocery chatter.
2. If the input is an incomplete fragment missing a product noun (e.g. "1 kilogram of", "add one kg"), return action "UNKNOWN" and items: [].

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

Spoken query: "${transcript}"
Return ONLY pure JSON.`;


        let lastError: any;

        // Cascade through models: try Llama 3.3 70B -> fallback to Llama 3.1 8B on 429/error
        for (const model of LLM_MODEL_CASCADE) {
          try {
            const parseCall = groq.chat.completions.create({
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: transcript },
              ],
              model,
              temperature: 0.05,
              max_tokens: 300,
              response_format: { type: 'json_object' },
            });

            const chatCompletion = await withTimeout(parseCall, 5000, undefined, `Groq LLM [${model}]`);
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
              confidence: Math.min(1.0, Math.max(0.0, Number(parsed.confidence) || 0.85)),
              explanation: parsed.explanation || `Interpreted ${action} via ${model}`,
              model_used: model,
            };
          } catch (err: any) {
            lastError = err;
            const isRateLimit = err?.status === 429 || /rate|quota|limit/i.test(err?.message || '');
            console.warn(`LLM Model ${model} failed (${isRateLimit ? 'Rate Limit 429' : err?.message}), cascading to next model...`);
          }
        }

        throw lastError || new Error('All LLM models in cascade failed');
      },
      // Safe offline fallback
      async (): Promise<LLMCascadeOutput> => {
        return {
          action: 'UNKNOWN',
          entities: [],
          target_item: null,
          confidence: 0.1,
          explanation: 'LLM Gateway unavailable; local deterministic fallback active',
          model_used: 'local_deterministic_fallback',
        };
      }
    );
  }
}

export const llmGateway = new LLMGateway();
