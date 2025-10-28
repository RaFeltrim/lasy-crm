import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, handleApiError, applyRateLimit, createRateLimitResponse } from '@/lib/api-utils';
import { DatabaseError } from '@/lib/errors';
import { RateLimitPresets } from '@/lib/rate-limit';
import * as XLSX from 'xlsx';
import type { Lead } from '@/types/database';

/**
 * Convert leads to CSV format
 */
function leadsToCSV(leads: Lead[]): string {
  if (leads.length === 0) {
    return 'name,email,phone,company,status,notes,created_at\n';
  }
  
  // CSV header
  const header = 'name,email,phone,company,status,notes,created_at\n';
  
  // CSV rows
  const rows = leads.map((lead) => {
    const fields = [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.status,
      lead.notes || '',
      lead.created_at,
    ];
    
    // Escape fields that contain commas, quotes, or newlines
    const escapedFields = fields.map((field) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });
    
    return escapedFields.join(',');
  });
  
  return header + rows.join('\n');
}

/**
 * Convert leads to XLSX format
 */
function leadsToXLSX(leads: Lead[]): Buffer {
  // Prepare data for XLSX
  const data = leads.map((lead) => ({
    Name: lead.name,
    Email: lead.email || '',
    Phone: lead.phone || '',
    Company: lead.company || '',
    Status: lead.status,
    Notes: lead.notes || '',
    'Created At': lead.created_at,
  }));
  
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 20 }, // Company
    { wch: 12 }, // Status
    { wch: 30 }, // Notes
    { wch: 20 }, // Created At
  ];
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * GET /api/leads/export - Export all user's leads
 * Query parameters:
 * - format: 'csv' or 'xlsx' (default: 'csv')
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    
    // Apply rate limiting (stricter for bulk operations)
    const rateLimitResult = applyRateLimit(request, RateLimitPresets.bulk, user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv' && format !== 'xlsx') {
      return NextResponse.json(
        { error: { code: 'INVALID_FORMAT', message: 'Format must be csv or xlsx' } },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient(request);
    
    // Fetch all user's leads
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error fetching leads:', error);
      throw new DatabaseError('Failed to fetch leads');
    }
    
    // Generate file based on format
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csv = leadsToCSV(leads || []);
      const filename = `leads-export-${timestamp}.csv`;
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      const xlsx = leadsToXLSX(leads || []);
      const filename = `leads-export-${timestamp}.xlsx`;
      
      return new NextResponse(xlsx as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
