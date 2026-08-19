import { describe, it, expect, beforeEach } from 'vitest';
import { EventStore } from '@/lib/events/eventStore';
import { projectShoppingList, projectCategoryTotals } from '@/lib/events/projections';
import { EventLogEntry } from '@/types/schema';

describe('Event Sourcing & Projections', () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
    store.clear();
  });

  it('projects state correctly from an append-only event stream', () => {
    const events: EventLogEntry[] = [
      {
        event_id: 'evt-1',
        command_id: 'cmd-1',
        aggregate_id: 'list_default',
        aggregate_version: 1,
        type: 'ITEM_ADDED',
        payload: { item_id: 'item-1', name: 'Milk', quantity: 2, unit: 'liters', category: 'Dairy & Eggs' },
        timestamp: 1000,
        metadata: { source: 'text_manual', route: 'deterministic_fast_path', locale: 'en-US', request_id: 'r1', trace_id: 't1' },
      },
      {
        event_id: 'evt-2',
        command_id: 'cmd-2',
        aggregate_id: 'list_default',
        aggregate_version: 2,
        type: 'ITEM_ADDED',
        payload: { item_id: 'item-2', name: 'Bread', quantity: 1, unit: 'packs', category: 'Bakery & Snacks' },
        timestamp: 2000,
        metadata: { source: 'text_manual', route: 'deterministic_fast_path', locale: 'en-US', request_id: 'r2', trace_id: 't2' },
      },
    ];

    const projection = projectShoppingList(events);
    expect(projection.version).toBe(2);
    expect(projection.items.length).toBe(2);
    expect(projection.items[0].name).toBe('Bread');
    expect(projection.items[1].name).toBe('Milk');

    const categoryTotals = projectCategoryTotals(projection.items);
    expect(categoryTotals['Dairy & Eggs']).toBe(2);
    expect(categoryTotals['Bakery & Snacks']).toBe(1);
  });

  it('updates item quantities and handles removals in projections', () => {
    const events: EventLogEntry[] = [
      {
        event_id: 'evt-1',
        command_id: 'cmd-1',
        aggregate_id: 'list_default',
        aggregate_version: 1,
        type: 'ITEM_ADDED',
        payload: { item_id: 'item-1', name: 'Apples', quantity: 2, unit: 'pieces', category: 'Fruits & Vegetables' },
        timestamp: 1000,
        metadata: { source: 'text_manual', route: 'deterministic_fast_path', locale: 'en-US', request_id: 'r1', trace_id: 't1' },
      },
      {
        event_id: 'evt-2',
        command_id: 'cmd-2',
        aggregate_id: 'list_default',
        aggregate_version: 2,
        type: 'ITEM_MODIFIED',
        payload: { item_id: 'item-1', name: 'Apples', quantity: 5, unit: 'pieces' },
        timestamp: 2000,
        metadata: { source: 'text_manual', route: 'deterministic_fast_path', locale: 'en-US', request_id: 'r2', trace_id: 't2' },
      },
      {
        event_id: 'evt-3',
        command_id: 'cmd-3',
        aggregate_id: 'list_default',
        aggregate_version: 3,
        type: 'ITEM_REMOVED',
        payload: { item_id: 'item-1', name: 'Apples' },
        timestamp: 3000,
        metadata: { source: 'text_manual', route: 'deterministic_fast_path', locale: 'en-US', request_id: 'r3', trace_id: 't3' },
      },
    ];

    const projection = projectShoppingList(events);
    expect(projection.version).toBe(3);
    expect(projection.items.length).toBe(0);
  });
});
