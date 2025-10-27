'use client';

import { Interaction } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Calendar, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface InteractionCardProps {
  interaction: Interaction;
  className?: string;
}

const interactionTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  other: MoreHorizontal,
};

const interactionTypeColors = {
  call: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  email: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  meeting: 'bg-green-500/10 text-green-500 border-green-500/20',
  note: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const interactionTypeLabels = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  other: 'Other',
};

export function InteractionCard({ interaction, className }: InteractionCardProps) {
  const Icon = interactionTypeIcons[interaction.type];
  const timeAgo = formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true });

  return (
    <Card className={cn('relative', className)}>
      <CardContent className="p-3 tablet:p-4">
        <div className="flex items-start gap-2 tablet:gap-3">
          <div className={cn(
            'flex h-9 w-9 tablet:h-10 tablet:w-10 items-center justify-center rounded-full border flex-shrink-0',
            interactionTypeColors[interaction.type]
          )}>
            <Icon className="h-4 w-4 tablet:h-5 tablet:w-5" />
          </div>
          <div className="flex-1 space-y-1.5 tablet:space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={cn('text-xs capitalize flex-shrink-0', interactionTypeColors[interaction.type])}
              >
                {interactionTypeLabels[interaction.type]}
              </Badge>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
            </div>
            <p className="text-sm tablet:text-base text-foreground whitespace-pre-wrap break-words">{interaction.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
