'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Lead } from '@/types/database';

interface DeleteLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteLeadDialog({
  lead,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteLeadDialogProps) {
  if (!lead) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] tablet:w-full">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg tablet:text-xl">Delete Lead</AlertDialogTitle>
          <AlertDialogDescription className="text-sm tablet:text-base">
            Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be
            undone and will also delete all associated interactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse tablet:flex-row gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="h-11 tablet:h-10 text-base tablet:text-sm m-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 tablet:h-10 text-base tablet:text-sm m-0"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
