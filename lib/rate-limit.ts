/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}`;
  
  // Get or create rate limit entry
  let entry = rateLimitStore[key];
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + config.windowSeconds * 1000,
    };
    rateLimitStore[key] = entry;
  }
  
  // Increment request count
  entry.count++;
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;
  
  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Standard API endpoints: 100 requests per minute
  standard: {
    maxRequests: 100,
    windowSeconds: 60,
  },
  
  // Strict endpoints (auth, sensitive operations): 10 requests per minute
  strict: {
    maxRequests: 10,
    windowSeconds: 60,
  },
  
  // Import/Export operations: 5 requests per 5 minutes
  bulk: {
    maxRequests: 5,
    windowSeconds: 300,
  },
  
  // Search operations: 30 requests per minute
  search: {
    maxRequests: 30,
    windowSeconds: 60,
  },
} as const;

/**
 * Get client identifier from request
 * Uses user ID if authenticated, otherwise falls back to IP address
 */
export function getClientIdentifier(userId?: string, ipAddress?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  if (ipAddress) {
    return `ip:${ipAddress}`;
  }
  
  return 'anonymous';
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(headers: Headers): string | undefined {
  // Check common headers for IP address (in order of preference)
  const ipHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ];
  
  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }
  
  return undefined;
}
