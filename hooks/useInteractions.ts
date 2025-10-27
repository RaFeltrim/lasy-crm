'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Interaction, InteractionInsert } from '@/types/database';
import { toast } from 'sonner';
import { isRetryableError } from '@/lib/retry';

interface InteractionsResponse {
  interactions: Interaction[];
  total: number;
}

/**
 * Fetch interactions for a specific lead
 */
async function fetchInteractions(leadId: string): Promise<InteractionsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/interactions?lead_id=${leadId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch interactions');
  }

  return response.json();
}

/**
 * Hook to fetch interactions for a specific lead
 */
export function useInteractions(leadId: string | null) {
  return useQuery({
    queryKey: ['interactions', leadId],
    queryFn: () => fetchInteractions(leadId!),
    enabled: !!leadId,
    retry: (failureCount, error) => {
      if (failureCount < 2 && isRetryableError(error)) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
}

/**
 * Create a new interaction
 */
async function createInteraction(data: Omit<InteractionInsert, 'user_id'>): Promise<Interaction> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create interaction');
  }

  return response.json();
}

/**
 * Hook to create a new interaction
 */
export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInteraction,
    onSuccess: (newInteraction) => {
      // Invalidate and refetch interactions for this lead
      queryClient.invalidateQueries({ queryKey: ['interactions', newInteraction.lead_id] });
      toast.success('Interaction added successfully', { description: 'The interaction has been recorded' });
    },
    onError: (error: Error) => {
      const isRetryable = isRetryableError(error);
      toast.error(error.message || 'Failed to add interaction', { 
        description: isRetryable ? 'Please try again' : undefined 
      });
    },
    retry: (failureCount, error) => {
      if (failureCount < 2 && isRetryableError(error)) {
        return true;
      }
      return false;
    },
  });
}
