'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeadStatus } from '@/types/database';
import { cn } from '@/lib/utils';

export interface FilterValues {
  status?: LeadStatus[];
  company?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FilterPanelProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  className?: string;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'pending', label: 'Pending' },
  { value: 'lost', label: 'Lost' },
  { value: 'won', label: 'Won' },
];

export function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusToggle = (status: LeadStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleCompanyChange = (company: string) => {
    onFiltersChange({
      ...filters,
      company: company || undefined,
    });
  };

  const handleDateFromChange = (dateFrom: string) => {
    onFiltersChange({
      ...filters,
      dateFrom: dateFrom || undefined,
    });
  };

  const handleDateToChange = (dateTo: string) => {
    onFiltersChange({
      ...filters,
      dateTo: dateTo || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.status?.length,
    filters.company,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 h-10 tablet:h-9"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden mobile:inline">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2 h-10 tablet:h-9"
          >
            <X className="h-4 w-4" />
            <span className="hidden tablet:inline">Clear all</span>
          </Button>
        )}
      </div>

      {isExpanded && (
        <Card>
          <CardHeader className="p-4 tablet:p-6">
            <CardTitle className="text-base tablet:text-lg">Filter Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 tablet:p-6 pt-0">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm tablet:text-base">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const isSelected = filters.status?.includes(option.value);
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer touch-manipulation h-8 tablet:h-auto px-3 tablet:px-2.5 text-sm"
                      onClick={() => handleStatusToggle(option.value)}
                    >
                      {option.label}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <Label htmlFor="company-filter" className="text-sm tablet:text-base">Company</Label>
              <Input
                id="company-filter"
                type="text"
                value={filters.company || ''}
                onChange={(e) => handleCompanyChange(e.target.value)}
                placeholder="Filter by company name"
                className="h-11 tablet:h-10 text-base tablet:text-sm"
              />
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm tablet:text-base">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="h-11 tablet:h-10 text-base tablet:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm tablet:text-base">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="h-11 tablet:h-10 text-base tablet:text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1 h-8 tablet:h-auto px-3 tablet:px-2.5 text-sm touch-manipulation">
              {statusOptions.find((opt) => opt.value === status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}
          {filters.company && (
            <Badge variant="secondary" className="gap-1 h-8 tablet:h-auto px-3 tablet:px-2.5 text-sm touch-manipulation">
              Company: {filters.company}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCompanyChange('')}
              />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1 h-8 tablet:h-auto px-3 tablet:px-2.5 text-sm touch-manipulation">
              From: {filters.dateFrom}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateFromChange('')}
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1 h-8 tablet:h-auto px-3 tablet:px-2.5 text-sm touch-manipulation">
              To: {filters.dateTo}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateToChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
