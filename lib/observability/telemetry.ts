import { TelemetryMetrics } from '@/types/schema';

/**
 * Centralized Observability & Telemetry Collector
 * Tracks fast-path hit rates (target >80%), end-to-end and parser latencies,
 * circuit breaker states, and errors across the modular monolith.
 */
class TelemetryCollector {
  private totalCommands = 0;
  private fastPathCount = 0;
  private llmCount = 0;
  private parserLatencies: number[] = [];
  private totalLatencies: number[] = [];
  private circuitBreakers: Record<
    string,
    { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failure_count: number; total_trips: number }
  > = {};
  private errors: Array<{ timestamp: number; message: string; trace_id: string }> = [];

  public recordCommandExecution(params: {
    route: 'deterministic_fast_path' | 'llm_ambiguity_fallback' | 'offline_fallback';
    parserLatencyMs: number;
    totalLatencyMs: number;
    traceId: string;
    error?: string;
  }) {
    this.totalCommands++;
    if (params.route === 'deterministic_fast_path') {
      this.fastPathCount++;
    } else {
      this.llmCount++;
    }

    this.parserLatencies.push(params.parserLatencyMs);
    if (this.parserLatencies.length > 500) this.parserLatencies.shift();

    this.totalLatencies.push(params.totalLatencyMs);
    if (this.totalLatencies.length > 500) this.totalLatencies.shift();

    if (params.error) {
      this.errors.push({
        timestamp: Date.now(),
        message: params.error,
        trace_id: params.traceId,
      });
      if (this.errors.length > 50) this.errors.shift();
    }
  }

  public registerCircuitBreaker(name: string, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN', failureCount: number, trips: number) {
    this.circuitBreakers[name] = {
      state,
      failure_count: failureCount,
      total_trips: trips,
    };
  }

  public getSnapshot(): TelemetryMetrics {
    const avgParser =
      this.parserLatencies.length > 0
        ? this.parserLatencies.reduce((a, b) => a + b, 0) / this.parserLatencies.length
        : 0;

    const avgE2E =
      this.totalLatencies.length > 0
        ? this.totalLatencies.reduce((a, b) => a + b, 0) / this.totalLatencies.length
        : 0;

    const fastPathRatio = this.totalCommands > 0 ? this.fastPathCount / this.totalCommands : 1.0;

    return {
      total_commands: this.totalCommands,
      deterministic_fast_path_count: this.fastPathCount,
      llm_fallback_count: this.llmCount,
      fast_path_ratio: Math.round(fastPathRatio * 100) / 100,
      avg_parser_latency_ms: Math.round(avgParser * 10) / 10,
      avg_e2e_latency_ms: Math.round(avgE2E * 10) / 10,
      circuit_breakers: { ...this.circuitBreakers },
      recent_errors: [...this.errors],
    };
  }

  public reset() {
    this.totalCommands = 0;
    this.fastPathCount = 0;
    this.llmCount = 0;
    this.parserLatencies = [];
    this.totalLatencies = [];
    this.errors = [];
  }
}

export const telemetry = new TelemetryCollector();
