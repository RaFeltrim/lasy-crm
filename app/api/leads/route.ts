import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, validateRequestBody, applyRateLimit, createRateLimitResponse } from '@/lib/api-utils';
import { createLeadSchema } from '@/lib/validations/lead';
import { DatabaseError } from '@/lib/errors';
import { RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeLeadInput } from '@/lib/sanitize';
import type { Lead } from '@/types/database';

/**
 * POST /api/leads - Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RateLimitPresets.standard, user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Validate request body
    const data = await validateRequestBody(request, createLeadSchema);
    
    // Sanitize input
    const sanitizedData = sanitizeLeadInput(data);
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Insert lead with sanitized data
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        status: sanitizedData.status,
        notes: sanitizedData.notes,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating lead:', error);
      throw new DatabaseError('Failed to create lead');
    }
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/leads - List leads with optional filtering
 * Query parameters:
 * - status: Filter by lead status (can be comma-separated)
 * - company: Filter by company name
 * - dateFrom: Filter by created_at >= dateFrom
 * - dateTo: Filter by created_at <= dateTo
 * - limit: Number of results (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RateLimitPresets.standard, user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const company = searchParams.get('company');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }
    
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: leads, error, count } = await query;
    
    if (error) {
      console.error('Database error fetching leads:', error);
      throw new DatabaseError('Failed to fetch leads');
    }
    
    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
