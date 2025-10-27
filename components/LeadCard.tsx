'use client';

import { Lead } from '@/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  className?: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  qualified: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  won: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export function LeadCard({ lead, isDragging, className }: LeadCardProps) {
  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        'touch-manipulation', // Optimize for touch devices
        isDragging && 'opacity-50 shadow-lg',
        className
      )}
    >
      <CardHeader className="p-3 tablet:p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm tablet:text-base line-clamp-1">{lead.name}</h3>
          <Badge
            variant="outline"
            className={cn('text-xs capitalize flex-shrink-0', statusColors[lead.status])}
          >
            {lead.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 tablet:p-4 pt-2 space-y-1.5 tablet:space-y-2">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 tablet:h-3.5 tablet:w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 tablet:h-3.5 tablet:w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.company && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 tablet:h-3.5 tablet:w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
        {lead.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
            {lead.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
