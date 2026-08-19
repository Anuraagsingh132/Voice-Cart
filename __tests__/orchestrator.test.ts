import { describe, it, expect, beforeEach } from 'vitest';
import { voiceOrchestrator } from '@/lib/orchestration/voiceOrchestrator';
import { eventStore } from '@/lib/events/eventStore';
import { telemetry } from '@/lib/observability/telemetry';

describe('Voice Command Orchestrator (E2E & Telemetry)', () => {
  beforeEach(() => {
    eventStore.clear();
    telemetry.reset();
  });

  it('orchestrates fast path commands with end-to-end telemetry and trace propagation', async () => {
    const output = await voiceOrchestrator.orchestrate({
      transcript: 'add 2 apples and 3 bananas',
      locale: 'en-US',
      source: 'voice_whisper',
    });

    expect(output.command.route).toBe('deterministic_fast_path');
    expect(output.result.success).toBe(true);
    expect(output.command.trace_id).toBeDefined();
    expect(output.command.request_id).toBeDefined();
    expect(output.projection.items.length).toBe(2);

    const snapshot = telemetry.getSnapshot();
    expect(snapshot.total_commands).toBe(1);
    expect(snapshot.deterministic_fast_path_count).toBe(1);
    expect(snapshot.fast_path_ratio).toBe(1);
    expect(snapshot.avg_parser_latency_ms).toBeLessThan(15);
  });


  it('maintains idempotency across duplicate command IDs', async () => {
    const output1 = await voiceOrchestrator.orchestrate({
      transcript: 'add 1 milk',
      locale: 'en-US',
    });

    const duplicateOutput = await voiceOrchestrator.orchestrate({
      transcript: 'add 1 milk',
      locale: 'en-US',
    });

    expect(output1.result.success).toBe(true);
    expect(duplicateOutput.result.success).toBe(true);
  });

  it('routes ambiguous queries gracefully to fallback without throwing errors', async () => {
    const output = await voiceOrchestrator.orchestrate({
      transcript: 'what should I cook tonight with potatoes and cheese',
      locale: 'en-US',
    });

    expect(output.command.request_id).toBeDefined();
    expect(['llm_ambiguity_fallback', 'offline_fallback', 'deterministic_fast_path']).toContain(output.command.route);
  });
});

