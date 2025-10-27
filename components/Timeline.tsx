'use client';

import { Interaction } from '@/types/database';
import { InteractionCard } from './InteractionCard';
import { cn } from '@/lib/utils';

interface TimelineProps {
  interactions: Interaction[];
  className?: string;
}

export function Timeline({ interactions, className }: TimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">No interactions yet. Add your first interaction above.</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical timeline line */}
      <div className="absolute left-[16px] tablet:left-[20px] top-0 bottom-0 w-[2px] bg-border" />
      
      {/* Timeline items */}
      <div className="space-y-3 tablet:space-y-4">
        {interactions.map((interaction, index) => (
          <div key={interaction.id} className="relative pl-10 tablet:pl-12">
            {/* Timeline dot */}
            <div className="absolute left-[10px] tablet:left-[14px] top-[16px] tablet:top-[20px] h-[12px] w-[12px] tablet:h-[14px] tablet:w-[14px] rounded-full border-2 border-border bg-background" />
            
            {/* Interaction card */}
            <InteractionCard interaction={interaction} />
          </div>
        ))}
      </div>
    </div>
  );
}
