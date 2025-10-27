'use client';

import { LeadStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface StageAnalyticsProps {
  status: LeadStatus;
  count: number;
  className?: string;
}

export function StageAnalytics({ status, count, className }: StageAnalyticsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs tablet:text-sm font-medium min-w-[24px] tablet:min-w-[28px]',
        className
      )}
    >
      {count}
    </div>
  );
}
