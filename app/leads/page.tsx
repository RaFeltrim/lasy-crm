'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { LeadList } from '@/components/LeadList';
import { LeadDialog } from '@/components/LeadDialog';
import { DeleteLeadDialog } from '@/components/DeleteLeadDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { ExportButton } from '@/components/ExportButton';
import type { Lead } from '@/types/database';

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const { data, isLoading, error, refetch } = useLeads();
  const deleteLead = useDeleteLead();

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleDelete = (lead: Lead) => {
    setDeletingLead(lead);
  };

  const handleConfirmDelete = async () => {
    if (deletingLead) {
      try {
        await deleteLead.mutateAsync(deletingLead.id);
        setDeletingLead(null);
      } catch (error) {
        // Error handling is done in the hook
        console.error('Failed to delete lead:', error);
      }
    }
  };

  return (
    <div className="p-4 tablet:p-6 space-y-4 tablet:space-y-6">
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
        <div>
          <h1 className="text-2xl tablet:text-3xl font-bold">Leads</h1>
          <p className="mt-1 tablet:mt-2 text-sm tablet:text-base text-muted-foreground">
            Manage your leads and pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setIsImportDialogOpen(true)}
            className="h-11 tablet:h-10 text-base tablet:text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden mobile:inline">Import</span>
          </Button>
          <ExportButton />
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-11 tablet:h-10 text-base tablet:text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load leads. Please try again.</p>
        </div>
      )}

      {data && (
        <LeadList
          leads={data.leads}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={() => {}}
        />
      )}

      <LeadDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <LeadDialog
        lead={editingLead}
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
      />

      <DeleteLeadDialog
        lead={deletingLead}
        open={!!deletingLead}
        onOpenChange={(open) => !open && setDeletingLead(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteLead.isPending}
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => refetch()}
      />
    </div>
  );
}
