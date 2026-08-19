import { CanonicalCommand, CommandResult, CommandSource } from '@/types/schema';
import { intentInterpreter } from '@/lib/intent/intentInterpreter';
import { commandExecutor } from '@/lib/commands/commandExecutor';
import { projectShoppingList, ShoppingListProjection } from '@/lib/events/projections';
import { eventStore } from '@/lib/events/eventStore';
import { telemetry } from '@/lib/observability/telemetry';
import { consoleLogger } from '@/lib/observability/consoleLogger';

export interface OrchestrationInput {
  transcript: string;
  locale?: string;
  source?: CommandSource;
  aggregate_id?: string;
  aggregate_version?: number;
  request_id?: string;
  trace_id?: string;
}

export interface OrchestrationOutput {
  command: CanonicalCommand;
  result: CommandResult;
  projection: ShoppingListProjection;
  telemetry_metrics: any;
}

export class VoiceOrchestrator {
  public async orchestrate(input: OrchestrationInput): Promise<OrchestrationOutput> {
    const e2eStartTime = performance.now();
    const requestId = input.request_id || 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const traceId = input.trace_id || 'tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // 0. Log Speech Input
    consoleLogger.logVoiceInput(input.transcript, input.locale || 'en-US', input.source || 'text_manual');

    // 1. Separation of Interpretation
    const { command, parser_latency_ms } = await intentInterpreter.interpret({
      transcript: input.transcript,
      locale: input.locale,
      source: input.source,
      aggregate_id: input.aggregate_id,
      aggregate_version: input.aggregate_version,
      request_id: requestId,
      trace_id: traceId,
    });

    // Log Intent Parser Stage
    consoleLogger.logIntent({
      route: command.route,
      action: command.action,
      entities: command.entities,
      confidence: command.confidence,
      parser_latency_ms,
    });

    // 2. Separation of Command Execution & Event Sourcing
    const { result, projection } = commandExecutor.execute(command);

    const totalLatencyMs = performance.now() - e2eStartTime;

    // Log Execution & State Mutation
    consoleLogger.logExecution({
      success: result.success,
      action: command.action,
      message: result.message,
      aggregate_version: result.aggregate_version,
      events: result.event_ids,
      total_latency_ms: totalLatencyMs,
    });

    // 3. Centralized Telemetry Logging
    telemetry.recordCommandExecution({
      route: command.route,
      parserLatencyMs: parser_latency_ms,
      totalLatencyMs,
      traceId,
      error: !result.success ? result.message : undefined,
    });

    result.telemetry_summary = {
      parser_latency_ms: Math.round(parser_latency_ms * 100) / 100,
      total_latency_ms: Math.round(totalLatencyMs * 100) / 100,
    };

    return {
      command,
      result,
      projection,
      telemetry_metrics: telemetry.getSnapshot(),
    };
  }


  public getLiveProjection(aggregateId = 'list_default'): ShoppingListProjection {
    const events = eventStore.getEvents(aggregateId);
    return projectShoppingList(events, aggregateId);
  }
}

export const voiceOrchestrator = new VoiceOrchestrator();
