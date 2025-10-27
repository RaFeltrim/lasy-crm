import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, applyRateLimit, createRateLimitResponse } from '@/lib/api-utils';
import { DatabaseError } from '@/lib/errors';
import { RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/sanitize';

/**
 * GET /api/leads/search - Search and filter leads
 * Query parameters:
 * - query: Full-text search query (searches name, email, company, notes)
 * - status: Filter by lead status (can be comma-separated)
 * - company: Filter by company name (exact match or partial)
 * - dateFrom: Filter by created_at >= dateFrom
 * - dateTo: Filter by created_at <= dateTo
 * - limit: Number of results (default 50, max 100)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Apply rate limiting (stricter for search)
    const rateLimitResult = applyRateLimit(request, RateLimitPresets.search, user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Parse and sanitize query parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = sanitizeString(searchParams.get('query'));
    const status = searchParams.get('status');
    const company = sanitizeString(searchParams.get('company'));
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Build base query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);
    
    // Apply full-text search if query provided
    if (searchQuery && searchQuery.trim()) {
      // Use PostgreSQL full-text search
      // Search across name, email, company, and notes fields
      const searchTerm = searchQuery.trim();
      
      // Build OR conditions for text search
      query = query.or(
        `name.ilike.%${searchTerm}%,` +
        `email.ilike.%${searchTerm}%,` +
        `company.ilike.%${searchTerm}%,` +
        `notes.ilike.%${searchTerm}%`
      );
    }
    
    // Apply status filter (AND logic with search)
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        query = query.in('status', statuses);
      }
    }
    
    // Apply company filter (AND logic with search)
    if (company && company.trim()) {
      query = query.ilike('company', `%${company.trim()}%`);
    }
    
    // Apply date range filters (AND logic)
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }
    
    // Order by relevance (most recent first)
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: leads, error, count } = await query;
    
    if (error) {
      console.error('Database error searching leads:', error);
      throw new DatabaseError('Failed to search leads');
    }
    
    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      limit,
      offset,
      query: searchQuery || undefined,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
