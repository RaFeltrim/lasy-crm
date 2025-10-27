import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, validateRequestBody } from '@/lib/api-utils';
import { createInteractionSchema } from '@/lib/validations/interaction';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type { Interaction } from '@/types/database';

/**
 * POST /api/interactions - Create a new interaction
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Validate request body
    const data = await validateRequestBody(request, createInteractionSchema);
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Verify the lead exists and belongs to the user
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', data.lead_id)
      .eq('user_id', user.id)
      .single();
    
    if (leadError || !lead) {
      throw new NotFoundError('Lead');
    }
    
    // Insert interaction
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert({
        lead_id: data.lead_id,
        type: data.type,
        description: data.description,
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
