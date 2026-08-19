/**
 * Execute an async operation with exponential backoff and randomized jitter.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
    retryIf?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const jitter = options.jitter ?? true;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (options.retryIf && !options.retryIf(error)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        break;
      }

      // Calculate exponential backoff
      let delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      if (jitter) {
        delay = delay * (0.75 + Math.random() * 0.5); // +/- 25% jitter
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
