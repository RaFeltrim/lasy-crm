import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AppError, AuthenticationError, ErrorResponse, logError, ErrorContext } from './errors';
import { checkRateLimit, getClientIdentifier, getIpAddress, RateLimitConfig, RateLimitResult } from './rate-limit';

/**
 * Create a Supabase client for API routes with the user's session
 */
export function createServerSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { authorization: authHeader } : {},
    },
  });
}

/**
 * Get the authenticated user from the request
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new AuthenticationError('Authentication required');
  }
  
  return user;
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleApiError(error: unknown, context?: ErrorContext): NextResponse<ErrorResponse> {
  // Log error with context
  if (error instanceof Error) {
    logError(error, context);
  } else {
    console.error('Non-Error object thrown:', error, 'Context:', context);
  }
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: 'errors' in error ? (error as any).errors : undefined,
        },
      },
      { status: error.statusCode }
    );
  }
  
  // Unknown error - don't expose internal details
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    },
    { status: 500 }
  );
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error: any) {
    if (error.errors) {
      // Zod validation error
      const formattedErrors: Record<string, string[]> = {};
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      throw new (await import('./errors')).ValidationError('Validation failed', formattedErrors);
    }
    throw error;
  }
}

/**
 * Apply rate limiting to an API endpoint
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for authenticated requests
 * @returns Rate limit result
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): RateLimitResult {
  const ipAddress = getIpAddress(request.headers);
  const identifier = getClientIdentifier(userId, ipAddress);
  
  return checkRateLimit(identifier, config);
}

/**
 * Create a rate-limited response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: {
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        },
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset * 1000 - Date.now()) / 1000).toString(),
      },
    }
  );
}
