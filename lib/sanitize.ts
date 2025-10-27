/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * This is a basic sanitization - HTML encoding is handled by React by default
 */
export function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized || null;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  
  const sanitized = sanitizeString(email);
  if (!sanitized) return null;
  
  // Convert to lowercase and trim
  return sanitized.toLowerCase().trim();
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  const sanitized = sanitizeString(phone);
  if (!sanitized) return null;
  
  // Remove any characters that aren't digits, spaces, dashes, plus, or parentheses
  return sanitized.replace(/[^\d\s\-\+\(\)]/g, '').trim() || null;
}

/**
 * Sanitize text input (for notes, descriptions, etc.)
 */
export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null;
  
  const sanitized = sanitizeString(text);
  if (!sanitized) return null;
  
  // Additional sanitization for text fields
  // Remove any script tags or event handlers (defense in depth)
  let cleaned = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  return cleaned.trim() || null;
}

/**
 * Sanitize object with multiple fields
 */
export function sanitizeLeadInput(input: any): any {
  return {
    name: sanitizeString(input.name),
    email: sanitizeEmail(input.email),
    phone: sanitizePhone(input.phone),
    company: sanitizeString(input.company),
    status: input.status, // Enum, validated by Zod
    notes: sanitizeText(input.notes),
  };
}

/**
 * Sanitize interaction input
 */
export function sanitizeInteractionInput(input: any): any {
  return {
    lead_id: input.lead_id, // UUID, validated by Zod
    type: input.type, // Enum, validated by Zod
    description: sanitizeText(input.description),
  };
}
