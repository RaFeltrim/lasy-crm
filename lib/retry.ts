/**
 * Retry utility for failed network requests
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Calculate delay with exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable (network errors, 5xx errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    ) {
      return true;
    }
  }

  // Check for HTTP status codes
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429;
  }

  return false;
}

/**
 * Retry only if the error is retryable
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(fn, {
      ...options,
      maxAttempts: 1, // First attempt
    });
  } catch (error) {
    if (isRetryableError(error)) {
      return await retryWithBackoff(fn, options);
    }
    throw error;
  }
}
