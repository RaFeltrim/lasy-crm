'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeadForm } from '@/components/LeadForm';
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import type { Lead } from '@/types/database';
import type { LeadFormData } from '@/lib/validations/lead';

interface LeadDialogProps {
  lead?: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDialog({ lead, open, onOpenChange }: LeadDialogProps) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const isEditing = !!lead;
  const isSubmitting = createLead.isPending || updateLead.isPending;

  // Reset mutation states when dialog closes
  useEffect(() => {
    if (!open) {
      createLead.reset();
      updateLead.reset();
    }
  }, [open, createLead, updateLead]);

  const handleSubmit = async (data: LeadFormData) => {
    try {
      if (isEditing) {
        await updateLead.mutateAsync({
          id: lead.id,
          data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            status: data.status,
            notes: data.notes || null,
          },
        });
      } else {
        await createLead.mutateAsync({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          status: data.status,
          notes: data.notes || null,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Failed to save lead:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] tablet:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg tablet:text-xl">
            {isEditing ? 'Edit Lead' : 'Create New Lead'}
          </DialogTitle>
          <DialogDescription className="text-sm tablet:text-base">
            {isEditing
              ? 'Update the lead information below.'
              : 'Fill in the details to create a new lead.'}
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          lead={lead || undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
