/**
 * Wrap a promise with an enforced timeout threshold.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback?: () => Promise<T> | T,
  operationName = 'Operation'
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  // Attach safe handler to prevent unhandled rejection if promise resolves/rejects after timeout
  promise.catch(() => {});

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch (error) {
    if (fallback) {
      return await fallback();
    }
    throw error;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

