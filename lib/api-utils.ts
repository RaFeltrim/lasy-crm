import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AppError, AuthenticationError, ErrorResponse } from './errors';

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
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);
  
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
  
  // Unknown error
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
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
