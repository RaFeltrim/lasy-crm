'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadStatus } from '@/types/database';
import { isRetryableError } from '@/lib/retry';

export interface SearchParams {
  query?: string;
  status?: LeadStatus[];
  company?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

interface SearchResponse {
  leads: Lead[];
  total: number;
  limit: number;
  offset: number;
  query?: string;
}

/**
 * Search leads with full-text search and filters
 */
async function searchLeads(params: SearchParams): Promise<SearchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('query', params.query);
  if (params.status && params.status.length > 0) {
    queryParams.append('status', params.status.join(','));
  }
  if (params.company) queryParams.append('company', params.company);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`/api/leads/search?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to search leads');
  }

  return response.json();
}

/**
 * Hook to search leads with debouncing handled by the component
 */
export function useLeadSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['leads', 'search', params],
    queryFn: () => searchLeads(params),
    // Only run query if there's a search query or filters
    enabled: !!(
      params.query ||
      (params.status && params.status.length > 0) ||
      params.company ||
      params.dateFrom ||
      params.dateTo
    ),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      if (failureCount < 2 && isRetryableError(error)) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
}
