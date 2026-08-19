import { telemetry } from '@/lib/observability/telemetry';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // consecutive failures to trip (default: 3)
  recoveryTimeoutMs?: number; // ms to wait before probing half-open (default: 10000ms)
  halfOpenTrialLimit?: number; // successful calls required to close circuit (default: 2)
}

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private totalTrips = 0;
  private nextAttemptTimestamp = 0;
  private failureThreshold: number;
  private recoveryTimeoutMs: number;
  private halfOpenTrialLimit: number;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold ?? 3;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 10000;
    this.halfOpenTrialLimit = options.halfOpenTrialLimit ?? 2;
    this.syncTelemetry();
  }

  public getState(): CircuitBreakerState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
      this.successCount = 0;
      this.syncTelemetry();
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      if (fallback) {
        return fallback();
      }
      throw new Error(`CircuitBreaker[${this.name}] is OPEN. Fast-failing request.`);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenTrialLimit) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
    this.syncTelemetry();
  }

  private onFailure() {
    this.failureCount++;
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.totalTrips++;
      this.nextAttemptTimestamp = Date.now() + this.recoveryTimeoutMs;
    }
    this.syncTelemetry();
  }

  private syncTelemetry() {
    telemetry.registerCircuitBreaker(this.name, this.state, this.failureCount, this.totalTrips);
  }

  public reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.syncTelemetry();
  }
}
