'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, Building2, Calendar, Edit, Trash2, ArrowLeft, Plus } from 'lucide-react';
import type { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timeline } from './Timeline';
import { InteractionForm } from './InteractionForm';
import { useInteractions, useCreateInteraction } from '@/hooks/useInteractions';
import type { InteractionFormData } from '@/lib/validations/interaction';

interface LeadDetailProps {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
  onBack?: () => void;
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

export function LeadDetail({ lead, onEdit, onDelete, onBack }: LeadDetailProps) {
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const { data: interactionsData, isLoading: isLoadingInteractions } = useInteractions(lead.id);
  const createInteraction = useCreateInteraction();

  const handleAddInteraction = async (data: InteractionFormData) => {
    await createInteraction.mutateAsync(data);
    setIsInteractionDialogOpen(false);
  };

  return (
    <div className="space-y-4 tablet:space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-start tablet:justify-between gap-4">
        <div className="space-y-1">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2 h-9 tablet:h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-2xl tablet:text-3xl font-bold">{lead.name}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[lead.status]
            }`}
          >
            {statusLabels[lead.status]}
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="h-11 tablet:h-10 text-base tablet:text-sm flex-1 tablet:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="h-11 tablet:h-10 text-base tablet:text-sm flex-1 tablet:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader className="p-4 tablet:p-6">
          <CardTitle className="text-base tablet:text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 tablet:space-y-4 p-4 tablet:p-6 pt-0">
          {lead.email && (
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="flex h-9 w-9 tablet:h-10 tablet:w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <Mail className="h-4 w-4 tablet:h-5 tablet:w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs tablet:text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${lead.email}`}
                  className="font-medium hover:underline text-sm tablet:text-base truncate block"
                >
                  {lead.email}
                </a>
              </div>
            </div>
          )}

          {lead.phone && (
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="flex h-9 w-9 tablet:h-10 tablet:w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <Phone className="h-4 w-4 tablet:h-5 tablet:w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs tablet:text-sm text-muted-foreground">Phone</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="font-medium hover:underline text-sm tablet:text-base"
                >
                  {lead.phone}
                </a>
              </div>
            </div>
          )}

          {lead.company && (
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="flex h-9 w-9 tablet:h-10 tablet:w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <Building2 className="h-4 w-4 tablet:h-5 tablet:w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs tablet:text-sm text-muted-foreground">Company</p>
                <p className="font-medium text-sm tablet:text-base truncate">{lead.company}</p>
              </div>
            </div>
          )}

          {!lead.email && !lead.phone && !lead.company && (
            <p className="text-sm text-muted-foreground">
              No contact information available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {lead.notes && (
        <Card>
          <CardHeader className="p-4 tablet:p-6">
            <CardTitle className="text-base tablet:text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 tablet:p-6 pt-0">
            <p className="text-sm tablet:text-base whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader className="p-4 tablet:p-6">
          <CardTitle className="text-base tablet:text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 tablet:p-6 pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium text-right">
              {format(new Date(lead.created_at), 'PPP p')}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium text-right">
              {format(new Date(lead.updated_at), 'PPP p')}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-muted-foreground flex-shrink-0">Lead ID</span>
            <span className="font-mono text-xs truncate">{lead.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Timeline */}
      <Card>
        <CardHeader className="p-4 tablet:p-6">
          <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-3">
            <CardTitle className="text-base tablet:text-lg">Interaction Timeline</CardTitle>
            <Button 
              onClick={() => setIsInteractionDialogOpen(true)}
              className="h-11 tablet:h-10 text-base tablet:text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Interaction
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 tablet:p-6 pt-0">
          {isLoadingInteractions ? (
            <div className="text-center py-8 text-sm tablet:text-base text-muted-foreground">
              Loading interactions...
            </div>
          ) : (
            <Timeline interactions={interactionsData?.interactions || []} />
          )}
        </CardContent>
      </Card>

      {/* Add Interaction Dialog */}
      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="w-[95vw] tablet:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg tablet:text-xl">Add Interaction</DialogTitle>
          </DialogHeader>
          <InteractionForm
            leadId={lead.id}
            onSubmit={handleAddInteraction}
            onCancel={() => setIsInteractionDialogOpen(false)}
            isSubmitting={createInteraction.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
