'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Upload } from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

// Lazy load heavy components with loading states
const KanbanBoardContainer = dynamic(
  () => import('@/components/KanbanBoardContainer').then(mod => ({ default: mod.KanbanBoardContainer })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading board...</div>
      </div>
    ),
    ssr: false
  }
);

const ImportDialog = dynamic(
  () => import('@/components/ImportDialog').then(mod => ({ default: mod.ImportDialog })),
  {
    ssr: false
  }
);

export default function DashboardPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleImportComplete = () => {
    // Invalidate leads query to refresh the Kanban board
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 tablet:p-6 border-b">
        <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
          <div>
            <h1 className="text-2xl tablet:text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 tablet:mt-2 text-sm tablet:text-base text-muted-foreground">
              Manage your leads through the sales pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(true)}
              className="h-11 tablet:h-10 text-base tablet:text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden mobile:inline">Import</span>
            </Button>
            <ExportButton />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoardContainer />
      </div>
      
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
