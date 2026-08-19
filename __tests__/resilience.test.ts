import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { withTimeout } from '@/lib/resilience/timeout';
import { withRetry } from '@/lib/resilience/retry';
import { LRUCache } from '@/lib/resilience/lruCache';

describe('Resilience Subsystem', () => {
  it('CircuitBreaker transitions CLOSED -> OPEN -> HALF_OPEN -> CLOSED on failures and recoveries', async () => {
    const breaker = new CircuitBreaker('TestBreaker', {
      failureThreshold: 2,
      recoveryTimeoutMs: 50,
      halfOpenTrialLimit: 1,
    });

    expect(breaker.getState()).toBe('CLOSED');

    // 1st failure
    await expect(breaker.execute(async () => { throw new Error('fail 1'); })).rejects.toThrow('fail 1');
    expect(breaker.getState()).toBe('CLOSED');

    // 2nd failure -> Trips OPEN
    await expect(breaker.execute(async () => { throw new Error('fail 2'); })).rejects.toThrow('fail 2');
    expect(breaker.getState()).toBe('OPEN');

    // Fast-fails when OPEN without calling action
    await expect(breaker.execute(async () => 'ok')).rejects.toThrow('CircuitBreaker[TestBreaker] is OPEN');

    // Wait for recovery timeout -> Transitions to HALF_OPEN
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(breaker.getState()).toBe('HALF_OPEN');

    // Successful trial call -> Closes circuit back to CLOSED
    const result = await breaker.execute(async () => 'recovered');
    expect(result).toBe('recovered');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('withTimeout successfully enforces promise time limits', async () => {
    const fastPromise = new Promise((resolve) => setTimeout(() => resolve('fast'), 10));
    const result = await withTimeout(fastPromise, 100);
    expect(result).toBe('fast');

    const slowPromise = new Promise((resolve) => setTimeout(() => resolve('slow'), 100));
    await expect(withTimeout(slowPromise, 20, undefined, 'SlowOp')).rejects.toThrow('SlowOp timed out after 20ms');

    // Timeout with fallback
    const resultWithFallback = await withTimeout(slowPromise, 20, () => 'fallback-result');
    expect(resultWithFallback).toBe('fallback-result');
  });

  it('withRetry retries failed operations with exponential backoff', async () => {
    let attempts = 0;
    const flakyOperation = async () => {
      attempts++;
      if (attempts < 3) throw new Error('temporary error');
      return 'success';
    };

    const res = await withRetry(flakyOperation, { maxAttempts: 4, baseDelayMs: 10, jitter: false });
    expect(res).toBe('success');
    expect(attempts).toBe(3);
  });

  it('LRUCache evicts least-recently-used items when capacity is reached', () => {
    const cache = new LRUCache<string, string>(2);
    cache.set('a', 'alpha');
    cache.set('b', 'beta');

    expect(cache.get('a')).toBe('alpha'); // 'a' accessed, 'b' is oldest

    cache.set('c', 'gamma'); // Should evict 'b'

    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe('alpha');
    expect(cache.get('c')).toBe('gamma');
  });
});
