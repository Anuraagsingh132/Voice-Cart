import { LLMInterpretationResult } from './llmInterface';
import { entityResolver } from '@/lib/entities/entityResolver';

export interface LLMCascadeOutput extends LLMInterpretationResult {
  model_used: string;
}

export class LLMGateway {
  public async interpret(transcript: string, locale = 'en-US'): Promise<LLMCascadeOutput> {
    if (typeof window === 'undefined') {
      return {
        action: 'UNKNOWN',
        entities: [],
        target_item: null,
        confidence: 0.1,
        explanation: 'Non-browser runtime; local deterministic fallback active',
        model_used: 'local_deterministic_fallback',
      };
    }

    try {
      const response = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language: locale }),
      });


      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      // Check if backend instructed us to use client fallback due to missing API key
      if (data.error === 'GROQ_API_KEY_NOT_CONFIGURED') {
        throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
      }

      const rawAction = (data.intent || 'UNKNOWN').toUpperCase();
      const action = ['ADD', 'REMOVE', 'MODIFY', 'SEARCH', 'CLEAR', 'UNDO', 'UNKNOWN'].includes(rawAction)
        ? rawAction
        : 'UNKNOWN';

      const entities = Array.isArray(data.items)
        ? data.items.map((it: any) =>
            entityResolver.resolve(
              it.item || it.name || transcript,
              locale,
              Number(it.quantity) || 1,
              it.unit || 'pieces'
            )
          )
        : [];

      return {
        action: action as any,
        entities,
        target_item: data.targetItem || data.target_item || (entities[0] ? entities[0].name : null),
        confidence: data.confidence || 0.85,
        explanation: data.explanation || `Interpreted ${action} via backend API`,
        model_used: 'backend_cascade',
      };
    } catch (err: any) {
      console.warn('LLM Gateway API request failed, falling back to local deterministic:', err);
      return {
        action: 'UNKNOWN',
        entities: [],
        target_item: null,
        confidence: 0.1,
        explanation: 'LLM Gateway unavailable; local deterministic fallback active',
        model_used: 'local_deterministic_fallback',
      };
    }
  }
}

export const llmGateway = new LLMGateway();
