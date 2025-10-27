'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Mail, Phone, Building2 } from 'lucide-react';
import type { Lead } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LeadListProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

const statusColors: Record<Lead['status'], string> = {
  new: 'bg-blue-500/10 text-blue-500',
  contacted: 'bg-yellow-500/10 text-yellow-500',
  qualified: 'bg-green-500/10 text-green-500',
  pending: 'bg-orange-500/10 text-orange-500',
  lost: 'bg-red-500/10 text-red-500',
  won: 'bg-emerald-500/10 text-emerald-500',
};

const statusLabels: Record<Lead['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  pending: 'Pending',
  lost: 'Lost',
  won: 'Won',
};

export function LeadList({ leads, onEdit, onDelete, onView }: LeadListProps) {
  const router = useRouter();

  const handleRowClick = (lead: Lead) => {
    router.push(`/leads/${lead.id}`);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No leads found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table view with horizontal scroll */}
      <div className="hidden tablet:block overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[768px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Contact</th>
              <th className="text-left py-3 px-4 font-medium">Company</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Created</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(lead)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{lead.name}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1 text-sm">
                    {lead.email && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {lead.company && (
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[lead.status]
                    }`}
                  >
                    {statusLabels[lead.status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </td>
                <td className="py-3 px-4 text-right">
                  <LeadActions lead={lead} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="tablet:hidden space-y-3">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation"
            onClick={() => handleRowClick(lead)}
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-base">{lead.name}</h3>
                {lead.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{lead.company}</span>
                  </p>
                )}
              </div>
              <LeadActions lead={lead} onEdit={onEdit} onDelete={onDelete} />
            </div>
            
            <div className="space-y-1.5 text-sm mb-3">
              {lead.email && (
                <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[lead.status]
                }`}
              >
                {statusLabels[lead.status]}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface LeadActionsProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

function LeadActions({ lead, onEdit, onDelete }: LeadActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-9 w-9 tablet:h-8 tablet:w-8 touch-manipulation">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(lead);
          }}
          className="h-11 tablet:h-auto text-base tablet:text-sm"
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(lead);
          }}
          className="text-destructive focus:text-destructive h-11 tablet:h-auto text-base tablet:text-sm"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
