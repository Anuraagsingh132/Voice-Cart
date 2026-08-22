import { CanonicalCommand, CommandSource, ProcessingRoute } from '@/types/schema';
import { deterministicRuleEngine } from './deterministicEngine';
import { llmGateway } from '@/lib/llm/llmGateway';
import { correctTranscriptPhonetics } from '@/lib/phoneticMatcher';

export interface InterpretationRequest {
  transcript: string;
  locale?: string;
  source?: CommandSource;
  aggregate_id?: string;
  aggregate_version?: number;
  request_id: string;
  trace_id: string;
}

export class IntentInterpreter {
  public async interpret(req: InterpretationRequest): Promise<{
    command: CanonicalCommand;
    parser_latency_ms: number;
  }> {
    const startTime = performance.now();
    const locale = req.locale || 'en-US';
    const rawTranscript = (req.transcript || '').trim();
    const normalizedText = correctTranscriptPhonetics(rawTranscript);

    // 1. Deterministic Fast Path First
    const fastPathResult = deterministicRuleEngine.parse(normalizedText, locale);

    if (fastPathResult.isHighConfidence && fastPathResult.action !== 'UNKNOWN') {
      const parserLatency = performance.now() - startTime;
      const command: CanonicalCommand = {
        command_id: this.generateUUID(),
        aggregate_id: req.aggregate_id || 'list_default',
        aggregate_version: req.aggregate_version || 1,
        locale,
        source: req.source || 'text_manual',
        action: fastPathResult.action,
        entities: fastPathResult.entities,
        target_item: fastPathResult.target_item,
        filters: fastPathResult.filters,
        confidence: {
          entity: fastPathResult.entities[0]?.confidence ?? 1.0,
          intent: fastPathResult.confidence,
          overall: fastPathResult.confidence,
        },
        route: 'deterministic_fast_path',
        request_id: req.request_id,
        trace_id: req.trace_id,
        schema_version: '1.0',
        timestamp: Date.now(),
        raw_transcript: rawTranscript,
        normalized_text: normalizedText,
      };

      return { command, parser_latency_ms: parserLatency };
    }

    // 2. Ambiguity Fallback: Route to Multi-Model LLM Gateway Cascade
    let route: ProcessingRoute = 'llm_ambiguity_fallback';
    let action = fastPathResult.action;
    let entities = fastPathResult.entities;
    let targetItem = fastPathResult.target_item;
    let confidence = fastPathResult.confidence;

    try {
      const llmResult = await llmGateway.interpret(normalizedText, locale);
      if (llmResult.action === 'UNKNOWN') {
        if (fastPathResult.action !== 'UNKNOWN' && fastPathResult.entities.length > 0) {
          action = fastPathResult.action;
          entities = fastPathResult.entities;
          targetItem = fastPathResult.target_item;
          confidence = fastPathResult.confidence;
          route = 'deterministic_fast_path';
        } else {
          action = 'UNKNOWN';
          entities = [];
          targetItem = null;
          confidence = 0;
        }
      } else {
        action = llmResult.action;
        entities = llmResult.entities.length > 0 ? llmResult.entities : entities;
        targetItem = llmResult.target_item || targetItem;
        confidence = llmResult.confidence;
      }
    } catch {
      route = 'offline_fallback';
      if (fastPathResult.action !== 'UNKNOWN' && fastPathResult.entities.length > 0) {
        action = fastPathResult.action;
        entities = fastPathResult.entities;
        targetItem = fastPathResult.target_item;
        confidence = fastPathResult.confidence;
      } else {
        entities = [];
        confidence = 0;
      }
    }




    const parserLatency = performance.now() - startTime;
    const command: CanonicalCommand = {
      command_id: this.generateUUID(),
      aggregate_id: req.aggregate_id || 'list_default',
      aggregate_version: req.aggregate_version || 1,
      locale,
      source: req.source || 'text_manual',
      action,
      entities,
      target_item: targetItem,
      confidence: {
        entity: entities[0]?.confidence ?? 0.7,
        intent: confidence,
        overall: confidence,
      },
      route,
      request_id: req.request_id,
      trace_id: req.trace_id,
      schema_version: '1.0',
      timestamp: Date.now(),
      raw_transcript: rawTranscript,
      normalized_text: normalizedText,
    };

    return { command, parser_latency_ms: parserLatency };
  }

  private generateUUID(): string {
    return 'cmd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }
}

export const intentInterpreter = new IntentInterpreter();
