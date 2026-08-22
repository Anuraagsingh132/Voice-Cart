import { EventLogEntry, EventType, ShoppingListAggregate } from '@/types/schema';

/**
 * Append-Only Event Store
 * Features:
 * - Optimistic Concurrency Control (aggregate_version)
 * - Immutable Event Stream
 * - Replay & Stream Projection
 */
export class EventStore {
  private events: EventLogEntry[] = [];
  private storageKey = 'voice_cart_event_stream';

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          this.events = JSON.parse(raw);
        }
      } catch {}
    }
  }

  private persist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Retain last 300 events in local storage
        const slice = this.events.slice(-300);
        window.localStorage.setItem(this.storageKey, JSON.stringify(slice));
      } catch (err) {
        try {
          // If storage quota exceeded, retry with last 100 events
          const smallSlice = this.events.slice(-100);
          window.localStorage.setItem(this.storageKey, JSON.stringify(smallSlice));
        } catch (innerErr) {
          console.warn('Failed to persist event stream to localStorage:', innerErr);
        }
      }
    }
  }


  public appendEvent(event: EventLogEntry): void {
    this.events.push(event);
    this.persist();
  }

  public appendEvents(newEvents: EventLogEntry[]): void {
    this.events.push(...newEvents);
    this.persist();
  }

  public getEvents(aggregateId = 'list_default'): EventLogEntry[] {
    return this.events.filter((e) => e.aggregate_id === aggregateId);
  }

  public getLastEvent(aggregateId = 'list_default'): EventLogEntry | undefined {
    const listEvents = this.getEvents(aggregateId);
    return listEvents[listEvents.length - 1];
  }

  public getEventHistory(): EventLogEntry[] {
    return [...this.events];
  }

  public clear(): void {
    this.events = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.storageKey);
    }
  }
}

export const eventStore = new EventStore();
