'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel, type FilterValues } from '@/components/FilterPanel';
import { SearchResults } from '@/components/SearchResults';
import { useLeadSearch } from '@/hooks/useLeadSearch';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});

  // Use the search hook with current query and filters
  const { data, isLoading } = useLeadSearch({
    query: searchQuery,
    status: filters.status,
    company: filters.company,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  return (
    <div className="container mx-auto py-4 tablet:py-6 px-4 space-y-4 tablet:space-y-6">
      <div>
        <h1 className="text-2xl tablet:text-3xl font-bold mb-1 tablet:mb-2">Search Leads</h1>
        <p className="text-sm tablet:text-base text-muted-foreground">
          Search and filter your leads to find exactly what you need
        </p>
      </div>

      <div className="space-y-3 tablet:space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, company, or notes..."
        />

        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>

      <SearchResults
        leads={data?.leads || []}
        isLoading={isLoading}
        searchQuery={searchQuery}
        total={data?.total || 0}
      />
    </div>
  );
}
