'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLead, useDeleteLead } from '@/hooks/useLeads';
import { LeadDetail } from '@/components/LeadDetail';

// Lazy load dialog components
const LeadDialog = dynamic(
  () => import('@/components/LeadDialog').then(mod => ({ default: mod.LeadDialog })),
  { ssr: false }
);

const DeleteLeadDialog = dynamic(
  () => import('@/components/DeleteLeadDialog').then(mod => ({ default: mod.DeleteLeadDialog })),
  { ssr: false }
);

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: lead, isLoading, error } = useLead(params.id);
  const deleteLead = useDeleteLead();

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (lead) {
      try {
        await deleteLead.mutateAsync(lead.id);
        setIsDeleteDialogOpen(false);
        router.push('/leads');
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
  };

  const handleBack = () => {
    router.push('/leads');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load lead. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <LeadDetail
        lead={lead}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={handleBack}
      />

      <LeadDialog
        lead={lead}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteLeadDialog
        lead={lead}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteLead.isPending}
      />
    </div>
  );
}
