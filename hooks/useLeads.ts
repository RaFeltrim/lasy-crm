'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadInsert } from '@/types/database';
import { toast } from 'sonner';
import { measurePerformance } from '@/lib/performance';

interface LeadsQueryParams {
  status?: string;
  company?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch leads with optional filters
 */
async function fetchLeads(params: LeadsQueryParams = {}): Promise<LeadsResponse> {
  return measurePerformance('fetch-leads', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.company) queryParams.append('company', params.company);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`/api/leads?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch leads');
    }

    return response.json();
  }, { filters: Object.keys(params).length });
}

/**
 * Hook to fetch all leads with optional filters
 */
export function useLeads(params: LeadsQueryParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
  });
}

/**
 * Fetch a single lead by ID
 */
async function fetchLead(id: string): Promise<Lead> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/leads/${id}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch lead');
  }

  return response.json();
}

/**
 * Hook to fetch a single lead by ID
 */
export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });
}

/**
 * Create a new lead
 */
async function createLead(data: Omit<LeadInsert, 'user_id'>): Promise<Lead> {
  return measurePerformance('create-lead', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create lead');
    }

    return response.json();
  });
}

/**
 * Hook to create a new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: (newLead) => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
}

/**
 * Update an existing lead
 */
async function updateLead({ id, data }: { id: string; data: Partial<Omit<Lead, 'id' | 'created_at' | 'user_id'>> }): Promise<Lead> {
  return measurePerformance('update-lead', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update lead');
    }

    return response.json();
  }, { statusChange: !!data.status });
}

/**
 * Hook to update a lead with optimistic updates
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLead,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot previous values
      const previousLeads = queryClient.getQueryData(['leads']);
      const previousLead = queryClient.getQueryData(['leads', id]);

      // Optimistically update the lead
      queryClient.setQueryData(['leads', id], (old: Lead | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Optimistically update in the leads list
      queryClient.setQueriesData({ queryKey: ['leads'] }, (old: LeadsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          leads: old.leads.map((lead) =>
            lead.id === id ? { ...lead, ...data } : lead
          ),
        };
      });

      return { previousLeads, previousLead };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      if (context?.previousLead) {
        queryClient.setQueryData(['leads', variables.id], context.previousLead);
      }
      toast.error(error.message || 'Failed to update lead');
    },
    onSuccess: (updatedLead) => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
  });
}

/**
 * Delete a lead
 */
async function deleteLead(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/leads/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete lead');
  }
}

/**
 * Hook to delete a lead with optimistic updates
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot previous values
      const previousLeads = queryClient.getQueryData(['leads']);

      // Optimistically remove the lead
      queryClient.setQueriesData({ queryKey: ['leads'] }, (old: LeadsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          leads: old.leads.filter((lead) => lead.id !== id),
          total: old.total - 1,
        };
      });

      return { previousLeads };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      toast.error(error.message || 'Failed to delete lead');
    },
    onSuccess: () => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
  });
}
