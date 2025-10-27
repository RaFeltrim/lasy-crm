import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, validateRequestBody, applyRateLimit, createRateLimitResponse } from '@/lib/api-utils';
import { createInteractionSchema } from '@/lib/validations/interaction';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import { RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeInteractionInput } from '@/lib/sanitize';
import type { Interaction } from '@/types/database';

/**
 * POST /api/interactions - Create a new interaction
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
    const data = await validateRequestBody(request, createInteractionSchema);
    
    // Sanitize input
    const sanitizedData = sanitizeInteractionInput(data);
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Verify the lead exists and belongs to the user
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', sanitizedData.lead_id)
      .eq('user_id', user.id)
      .single();
    
    if (leadError || !lead) {
      throw new NotFoundError('Lead');
    }
    
    // Insert interaction with sanitized data
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert({
        lead_id: sanitizedData.lead_id,
        type: sanitizedData.type,
        description: sanitizedData.description,
        user_id: user.id,
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating interaction:', error);
      throw new DatabaseError('Failed to create interaction');
    }
    
    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/interactions - List interactions for a specific lead
 * Query parameters:
 * - lead_id: Required - Filter by lead ID
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
    const leadId = searchParams.get('lead_id');
    
    if (!leadId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'lead_id parameter is required' } },
        { status: 400 }
      );
    }
    
    // Verify the lead exists and belongs to the user
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single();
    
    if (leadError || !lead) {
      throw new NotFoundError('Lead');
    }
    
    // Fetch interactions for the lead
    const { data: interactions, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error fetching interactions:', error);
      throw new DatabaseError('Failed to fetch interactions');
    }
    
    return NextResponse.json({
      interactions: interactions || [],
      total: interactions?.length || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
