'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { retryWithBackoff, isRetryableError } from '@/lib/retry';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({ variant = 'outline', size = 'default' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    
    try {
      await retryWithBackoff(
        async () => {
          const response = await fetch(`/api/leads/export?format=${format}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.error?.message || 'Export failed');
            (error as any).status = response.status;
            throw error;
          }

          // Get filename from Content-Disposition header
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `leads-export-${new Date().toISOString().split('T')[0]}.${format}`;
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }

          // Create blob and download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoff: true,
          onRetry: (attempt) => {
            toast.info(`Retrying export (attempt ${attempt})...`);
          },
        }
      );

      toast.success(`Leads exported successfully as ${format.toUpperCase()}`, 'Your file has been downloaded');
    } catch (error) {
      console.error('Export error:', error);
      const isRetryable = isRetryableError(error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to export leads',
        isRetryable ? 'Please try again' : undefined
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting} className="h-11 tablet:h-10">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="h-11 tablet:h-auto text-base tablet:text-sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('xlsx')}
          className="h-11 tablet:h-auto text-base tablet:text-sm"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
