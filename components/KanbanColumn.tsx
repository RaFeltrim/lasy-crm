'use client';

import { Lead, LeadStatus } from '@/types/database';
import { StageAnalytics } from '@/components/StageAnalytics';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  status: LeadStatus;
  title: string;
  leads: Lead[];
  children: React.ReactNode;
  className?: string;
}

const columnColors: Record<LeadStatus, string> = {
  new: 'border-blue-500/20 bg-blue-500/5',
  contacted: 'border-yellow-500/20 bg-yellow-500/5',
  qualified: 'border-green-500/20 bg-green-500/5',
  pending: 'border-orange-500/20 bg-orange-500/5',
  lost: 'border-red-500/20 bg-red-500/5',
  won: 'border-emerald-500/20 bg-emerald-500/5',
};

export function KanbanColumn({
  status,
  title,
  leads,
  children,
  className,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border-2 bg-muted/30 transition-colors',
        'min-h-[300px] tablet:min-h-[400px] desktop:min-h-[500px]',
        columnColors[status],
        isOver && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      <div className="flex items-center justify-between p-3 tablet:p-4 border-b bg-background/50">
        <h2 className="font-semibold text-sm uppercase tracking-wide">
          {title}
        </h2>
        <StageAnalytics status={status} count={leads.length} />
      </div>
      <div className="flex-1 p-2 tablet:p-3 space-y-2 tablet:space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
