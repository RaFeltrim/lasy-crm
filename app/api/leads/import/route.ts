import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError } from '@/lib/api-utils';
import { DatabaseError, ValidationError } from '@/lib/errors';
import { leadSchema } from '@/lib/validations/lead';
import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';

interface ImportError {
  row: number;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
}

/**
 * Parse CSV file and return rows
 */
async function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (error) => reject(error));
  });
}

/**
 * Parse XLSX file and return rows
 */
function parseXLSX(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  
  if (!sheetName) {
    throw new Error('No sheets found in XLSX file');
  }
  
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);
  
  return rows;
}

/**
 * Validate and normalize a single row
 */
function validateRow(row: any, rowNumber: number): { valid: boolean; data?: any; errors?: string[] } {
  try {
    // Normalize field names (case-insensitive)
    const normalizedRow: any = {};
    Object.keys(row).forEach((key) => {
      const normalizedKey = key.toLowerCase().trim();
      normalizedRow[normalizedKey] = row[key];
    });
    
    // Map to expected schema
    const leadData = {
      name: normalizedRow.name || '',
      email: normalizedRow.email || null,
      phone: normalizedRow.phone || null,
      company: normalizedRow.company || null,
      status: normalizedRow.status || 'new',
      notes: normalizedRow.notes || null,
    };
    
    // Validate with Zod schema
    const validated = leadSchema.parse(leadData);
    
    return { valid: true, data: validated };
  } catch (error: any) {
    const errors: string[] = [];
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        errors.push(`${err.path.join('.')}: ${err.message}`);
      });
    } else {
      errors.push(error.message || 'Validation failed');
    }
    
    return { valid: false, errors };
  }
}

/**
 * POST /api/leads/import - Import leads from CSV or XLSX file
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new ValidationError('No file provided', { file: ['File is required'] });
    }
    
    // Validate file type
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isXLSX = fileName.endsWith('.xlsx');
    
    if (!isCSV && !isXLSX) {
      throw new ValidationError('Invalid file type', { 
        file: ['Only CSV and XLSX files are supported'] 
      });
    }
    
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse file based on type
    let rows: any[];
    try {
      if (isCSV) {
        rows = await parseCSV(buffer);
      } else {
        rows = parseXLSX(buffer);
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new ValidationError('Failed to parse file', { 
        file: ['File format is invalid or corrupted'] 
      });
    }
    
    // Limit to 1000 rows
    if (rows.length > 1000) {
      throw new ValidationError('Too many rows', { 
        file: ['Maximum 1000 rows allowed per import'] 
      });
    }
    
    if (rows.length === 0) {
      throw new ValidationError('Empty file', { 
        file: ['File contains no data rows'] 
      });
    }
    
    // Validate and prepare leads
    const validLeads: any[] = [];
    const errors: ImportError[] = [];
    
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and row 1 is header
      const validation = validateRow(row, rowNumber);
      
      if (validation.valid && validation.data) {
        validLeads.push({
          ...validation.data,
          user_id: user.id,
        });
      } else if (validation.errors) {
        errors.push({
          row: rowNumber,
          errors: validation.errors,
        });
      }
    });
    
    // Insert valid leads in bulk
    const supabase = createServerSupabaseClient(request);
    let insertedCount = 0;
    
    if (validLeads.length > 0) {
      const { data, error } = await supabase
        .from('leads')
        .insert(validLeads)
        .select();
      
      if (error) {
        console.error('Database error inserting leads:', error);
        throw new DatabaseError('Failed to insert leads');
      }
      
      insertedCount = data?.length || 0;
    }
    
    const result: ImportResult = {
      success: insertedCount,
      failed: errors.length,
      errors: errors,
    };
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
