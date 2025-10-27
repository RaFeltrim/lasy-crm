import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, validateRequestBody } from '@/lib/api-utils';
import { updateLeadSchema } from '@/lib/validations/lead';
import { DatabaseError, NotFoundError } from '@/lib/errors';

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
    
    // Validate request body
    const data = await validateRequestBody(request, updateLeadSchema);
    
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
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.company !== undefined) updateData.company = data.company || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

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
