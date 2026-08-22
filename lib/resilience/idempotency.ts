import { LRUCache } from './lruCache';
import { CommandResult } from '@/types/schema';

/**
 * Persistent Idempotency Manager
 * Prevents double execution when network retries occur with the same command_id.
 */
class IdempotencyManager {
  private cache = new LRUCache<string, CommandResult>(1000);
  private storageKey = 'voice_cart_idempotency_log';

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(([k, v]) => this.cache.set(k, v, 24 * 60 * 60 * 1000));
          }
        }
      } catch {}
    }
  }

  private persistToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Retain last 100 entries in localStorage
        const entries = this.cache.entries().slice(-100);
        window.localStorage.setItem(this.storageKey, JSON.stringify(entries));
      } catch (err) {
        console.warn('Failed to persist idempotency log to localStorage:', err);
      }
    }
  }


  public get(commandId: string): CommandResult | undefined {
    return this.cache.get(commandId);
  }

  public set(commandId: string, result: CommandResult, ttlMs = 24 * 60 * 60 * 1000): void {
    this.cache.set(commandId, result, ttlMs);
    this.persistToStorage();
  }

  public has(commandId: string): boolean {
    return this.cache.has(commandId);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const idempotencyManager = new IdempotencyManager();
