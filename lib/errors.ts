/**
 * Custom error classes for the CRM application
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DB_ERROR', 500);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Error logging context
 */
export interface ErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Log error with context for debugging and monitoring
 */
export function logError(error: Error | AppError, context?: ErrorContext): void {
  const timestamp = new Date().toISOString();
  const logContext = {
    timestamp,
    ...context,
  };
  
  if (error instanceof AppError) {
    console.error('[AppError]', {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      context: logContext,
    });
  } else {
    console.error('[UnexpectedError]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: logContext,
    });
  }
}

/**
 * Create a user-friendly error message from an error object
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Don't expose internal error details to users
    return 'An unexpected error occurred. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}
