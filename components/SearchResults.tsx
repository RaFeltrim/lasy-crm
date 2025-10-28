'use client';

import { useMemo } from 'react';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LeadCard } from '@/components/LeadCard';
import type { Lead } from '@/types/database';

interface EnhancedLead extends Lead {
  highlightedName?: React.ReactNode;
  highlightedEmail?: React.ReactNode;
  highlightedCompany?: React.ReactNode;
  highlightedNotes?: React.ReactNode;
}

interface SearchResultsProps {
  leads: Lead[];
  isLoading: boolean;
  searchQuery?: string;
  total: number;
}

/**
 * Highlight matching text in a string
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={index} className="bg-yellow-500/30 text-foreground">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function SearchResults({
  leads,
  isLoading,
  searchQuery,
  total,
}: SearchResultsProps) {
  // Create enhanced leads with highlighted text
  const enhancedLeads = useMemo((): EnhancedLead[] => {
    if (!searchQuery) return leads;
    
    return leads.map(lead => ({
      ...lead,
      highlightedName: highlightText(lead.name, searchQuery),
      highlightedEmail: lead.email ? highlightText(lead.email, searchQuery) : null,
      highlightedCompany: lead.company ? highlightText(lead.company, searchQuery) : null,
      highlightedNotes: lead.notes ? highlightText(lead.notes, searchQuery) : null,
    }));
  }, [leads, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-7 w-7 tablet:h-8 tablet:w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 tablet:py-12 px-4">
          <SearchIcon className="h-10 w-10 tablet:h-12 tablet:w-12 text-muted-foreground mb-3 tablet:mb-4" />
          <h3 className="text-base tablet:text-lg font-semibold mb-2">No leads found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {searchQuery
              ? `No leads match your search for "${searchQuery}". Try adjusting your search terms or filters.`
              : 'No leads match your current filters. Try adjusting your filter criteria.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 tablet:space-y-4">
      <div className="text-sm text-muted-foreground">
        Found {total} {total === 1 ? 'lead' : 'leads'}
      </div>
      <div className="grid gap-3 tablet:gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {enhancedLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow touch-manipulation">
            <CardContent className="p-3 tablet:p-4">
              <div className="space-y-1.5 tablet:space-y-2">
                <h3 className="font-semibold text-base tablet:text-lg">
                  {searchQuery ? lead.highlightedName : lead.name}
                </h3>
                {lead.email && (
                  <p className="text-sm text-muted-foreground truncate">
                    {searchQuery ? lead.highlightedEmail : lead.email}
                  </p>
                )}
                {lead.company && (
                  <p className="text-sm font-medium truncate">
                    {searchQuery ? lead.highlightedCompany : lead.company}
                  </p>
                )}
                {lead.phone && (
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                )}
                <div className="flex items-center gap-2 pt-1 tablet:pt-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    lead.status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                    lead.status === 'contacted' ? 'bg-purple-500/10 text-purple-500' :
                    lead.status === 'qualified' ? 'bg-green-500/10 text-green-500' :
                    lead.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    lead.status === 'won' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                {lead.notes && searchQuery && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-1 tablet:pt-2">
                    {lead.highlightedNotes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
