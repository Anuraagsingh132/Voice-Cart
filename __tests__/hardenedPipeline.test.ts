import { describe, it, expect } from 'vitest';
import { idempotencyManager } from '@/lib/resilience/idempotency';
import { commandValidator } from '@/lib/validation/commandValidator';
import { withTimeout } from '@/lib/resilience/timeout';
import { deterministicRuleEngine } from '@/lib/intent/deterministicEngine';
import { entityResolver } from '@/lib/entities/entityResolver';
import { projectShoppingList } from '@/lib/events/projections';
import { CanonicalCommand, CommandResult } from '@/types/schema';

describe('Production Hardened Pipeline & Invariants', () => {
  it('idempotency manager caches and retrieves command results accurately', () => {
    const dummyResult: CommandResult = {
      success: true,
      command_id: 'cmd-test-123',
      aggregate_version: 2,
      action: 'ADD',
      message: 'Added 2 Milk',
      route: 'deterministic_fast_path',
      confidence: { intent: 1.0, entity: 1.0, overall: 1.0 },
      applied_entities: [],
      event_ids: ['evt-1'],
      request_id: 'req-1',
      trace_id: 'tr-1',
      duration_ms: 1.2,
    };

    idempotencyManager.set('cmd-test-123', dummyResult);
    expect(idempotencyManager.has('cmd-test-123')).toBe(true);
    expect(idempotencyManager.get('cmd-test-123')?.message).toBe('Added 2 Milk');
  });

  it('commandValidator validates without mutating the input command entity', () => {
    const originalCommand: CanonicalCommand = {
      command_id: 'cmd-val-1',
      aggregate_id: 'list_default',
      aggregate_version: 1,
      locale: 'en-US',
      source: 'text_manual',
      action: 'ADD',
      entities: [
        {
          canonical_id: 'grocery.apple',
          name: 'Apple',
          raw_name: 'apple',
          quantity: 3,
          unit: 'custom_unit',
          category: 'Fruits & Vegetables',
          confidence: 0.95,
        },
      ],
      confidence: { intent: 1.0, entity: 0.95, overall: 0.95 },
      route: 'deterministic_fast_path',
      request_id: 'req-v1',
      trace_id: 'tr-v1',
      schema_version: '1.0',
      timestamp: Date.now(),
      raw_transcript: 'add 3 apples',
      normalized_text: 'add 3 apples',
    };

    const cloneBefore = JSON.parse(JSON.stringify(originalCommand));
    const result = commandValidator.validate(originalCommand);

    expect(result.isValid).toBe(true);
    expect(originalCommand.entities[0].unit).toBe(cloneBefore.entities[0].unit);
  });

  it('withTimeout prevents unhandled rejections on delayed failure', async () => {
    const slowRejectingPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('late error'));
      }, 50);
    });

    const fallbackResult = await withTimeout(slowRejectingPromise, 15, () => 'safe_fallback');
    expect(fallbackResult).toBe('safe_fallback');

    await new Promise((r) => setTimeout(r, 60));
  });

  it('deterministicRuleEngine parses complex compound items with decimal quantities', () => {
    const output = deterministicRuleEngine.parse('add 1.5 kg tomatoes and 2 bottles of water', 'en-US');
    expect(output.action).toBe('ADD');
    expect(output.entities.length).toBe(2);
    expect(output.entities[0].name).toBe('Tomato');
    expect(output.entities[0].quantity).toBe(1.5);
    expect(output.entities[0].unit).toBe('kg');
    expect(output.entities[1].name).toBe('Water');
    expect(output.entities[1].quantity).toBe(2);
    expect(output.entities[1].unit).toBe('bottles');
  });

  it('entityResolver translates cross-lingual and transliterated grocery items', () => {
    expect(entityResolver.resolve('doodh', 'hi-IN').name).toBe('Milk');
    expect(entityResolver.resolve('aalu', 'hi-IN').name).toBe('Potato');
    expect(entityResolver.resolve('manzanas', 'es-ES').name).toBe('Apple');
    expect(entityResolver.resolve('pain', 'fr-FR').name).toBe('Bread');
    expect(entityResolver.resolve('milch', 'de-DE').name).toBe('Milk');
  });

  it('event store and projection handle event sequence and aggregate versioning', () => {
    const testAggId = 'list_test_harness';
    const ev1 = {
      event_id: 'evt-test-1',
      command_id: 'cmd-t1',
      aggregate_id: testAggId,
      aggregate_version: 1,
      type: 'ITEM_ADDED' as const,
      payload: {
        item_id: 'i-1',
        canonical_id: 'grocery.milk',
        name: 'Milk',
        quantity: 2,
        unit: 'liters',
        category: 'Dairy & Eggs',
      },
      timestamp: Date.now(),
      metadata: { source: 'text_manual' as const, route: 'deterministic_fast_path' as const, locale: 'en-US', request_id: 'r1', trace_id: 't1' },
    };

    const ev2 = {
      event_id: 'evt-test-2',
      command_id: 'cmd-t2',
      aggregate_id: testAggId,
      aggregate_version: 2,
      type: 'ITEM_MODIFIED' as const,
      payload: {
        item_id: 'i-1',
        name: 'Milk',
        previous_quantity: 2,
        quantity: 4,
        unit: 'liters',
      },
      timestamp: Date.now(),
      metadata: { source: 'text_manual' as const, route: 'deterministic_fast_path' as const, locale: 'en-US', request_id: 'r2', trace_id: 't2' },
    };

    const projection = projectShoppingList([ev1, ev2], testAggId);
    expect(projection.items.length).toBe(1);
    expect(projection.items[0].quantity).toBe(4);
    expect(projection.version).toBe(2);
  });
});
