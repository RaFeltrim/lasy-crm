import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, validateRequestBody, applyRateLimit, createRateLimitResponse } from '@/lib/api-utils';
import { updateLeadSchema } from '@/lib/validations/lead';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import { RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeLeadInput } from '@/lib/sanitize';

/**
 * GET /api/leads/[id] - Fetch a single lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Fetch lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    
    if (error || !lead) {
      throw new NotFoundError('Lead');
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/leads/[id] - Update a lead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RateLimitPresets.standard, user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Validate request body
    const data = await validateRequestBody(request, updateLeadSchema);
    
    // Sanitize input
    const sanitizedData = sanitizeLeadInput(data);
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Build update object with only provided fields
    type LeadUpdate = {
      name?: string;
      email?: string | null;
      phone?: string | null;
      company?: string | null;
      status?: string;
      notes?: string | null;
    };
    
    const updateData: LeadUpdate = {};
    if (sanitizedData.name !== undefined) updateData.name = sanitizedData.name;
    if (sanitizedData.email !== undefined) updateData.email = sanitizedData.email;
    if (sanitizedData.phone !== undefined) updateData.phone = sanitizedData.phone;
    if (sanitizedData.company !== undefined) updateData.company = sanitizedData.company;
    if (sanitizedData.status !== undefined) updateData.status = sanitizedData.status;
    if (sanitizedData.notes !== undefined) updateData.notes = sanitizedData.notes;

    const { data: lead, error } = await (supabase as any)
      .from('leads')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error updating lead:', error);
      
      // Check if lead exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();
      
      if (!existingLead) {
        throw new NotFoundError('Lead');
      }
      
      throw new DatabaseError('Failed to update lead');
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/leads/[id] - Delete a lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Delete lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Database error deleting lead:', error);
      
      // Check if lead exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();
      
      if (!existingLead) {
        throw new NotFoundError('Lead');
      }
      
      throw new DatabaseError('Failed to delete lead');
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
