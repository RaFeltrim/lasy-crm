import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, isRetryableError } from '../retry';

describe('Retry Utilities', () => {
  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const networkError = new Error('fetch failed');
      expect(isRetryableError(networkError)).toBe(true);
    });

    it('should identify timeout errors as retryable', () => {
      const timeoutError = new Error('network timeout');
      expect(isRetryableError(timeoutError)).toBe(true);
    });

    it('should identify 5xx errors as retryable', () => {
      const serverError = { status: 500 };
      expect(isRetryableError(serverError)).toBe(true);
      
      const serviceError = { status: 503 };
      expect(isRetryableError(serviceError)).toBe(true);
    });

    it('should identify 429 rate limit as retryable', () => {
      const rateLimitError = { status: 429 };
      expect(isRetryableError(rateLimitError)).toBe(true);
    });

    it('should not identify 4xx errors as retryable', () => {
      const badRequestError = { status: 400 };
      expect(isRetryableError(badRequestError)).toBe(false);
      
      const notFoundError = { status: 404 };
      expect(isRetryableError(notFoundError)).toBe(false);
    });

    it('should not identify validation errors as retryable', () => {
      const validationError = new Error('Validation failed');
      expect(isRetryableError(validationError)).toBe(false);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));
      
      await expect(
        retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10 })
      ).rejects.toThrow('persistent failure');
      
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const onRetry = vi.fn();
      
      await retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10, onRetry });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
  });
});
