'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportError {
  row: number;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const isValidExtension = fileExtension === 'csv' || fileExtension === 'xlsx';
    
    if (!validTypes.includes(selectedFile.type) && !isValidExtension) {
      setError('Invalid file type. Please upload a CSV or XLSX file.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Import failed');
      }

      const data = await response.json();
      setResult(data);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] tablet:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg tablet:text-xl">Import Leads</DialogTitle>
          <DialogDescription className="text-sm tablet:text-base">
            Upload a CSV or XLSX file to import leads. Maximum 1000 rows per import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!file && !result && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 tablet:p-8 text-center cursor-pointer transition-colors touch-manipulation',
                'hover:border-primary hover:bg-accent/50 active:bg-accent',
                error && 'border-destructive'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="mx-auto h-10 w-10 tablet:h-12 tablet:w-12 text-muted-foreground mb-3 tablet:mb-4" />
              <p className="text-sm tablet:text-base font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs tablet:text-sm text-muted-foreground">CSV or XLSX files only</p>
            </div>
          )}

          {/* Selected File */}
          {file && !result && (
            <div className="border rounded-lg p-3 tablet:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 tablet:gap-3 min-w-0 flex-1">
                  <FileSpreadsheet className="h-7 w-7 tablet:h-8 tablet:w-8 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm tablet:text-base font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-9 w-9 tablet:h-10 tablet:w-10 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-4 border border-destructive rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Importing leads...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Import Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-green-500/10 border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium">Successful</p>
                  </div>
                  <p className="text-2xl font-bold">{result.success}</p>
                </div>
                <div className="border rounded-lg p-4 bg-destructive/10 border-destructive/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm font-medium">Failed</p>
                  </div>
                  <p className="text-2xl font-bold">{result.failed}</p>
                </div>
              </div>

              {/* Validation Errors */}
              {result.errors.length > 0 && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium mb-3">Validation Errors</p>
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-destructive/5 rounded border border-destructive/20"
                      >
                        <p className="font-medium text-destructive mb-1">Row {error.row}</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse tablet:flex-row justify-end gap-2 pt-4">
            {!result && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isUploading}
                  className="h-11 tablet:h-10 text-base tablet:text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                  className="h-11 tablet:h-10 text-base tablet:text-sm"
                >
                  {isUploading ? 'Importing...' : 'Import'}
                </Button>
              </>
            )}
            {result && (
              <Button 
                onClick={handleClose}
                className="h-11 tablet:h-10 text-base tablet:text-sm"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
