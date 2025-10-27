# Import/Export Guide

## Overview

The Lasy AI CRM System supports importing and exporting leads in CSV and XLSX formats. This allows you to:
- Bulk import leads from other systems
- Export your leads for backup or analysis
- Share lead data with team members

## Import Functionality

### Supported Formats
- CSV (.csv)
- Excel (.xlsx)

### Import Limits
- Maximum 1000 rows per import
- File size should be reasonable (< 10MB recommended)

### Required Fields
- **name**: Lead's full name (required, max 100 characters)

### Optional Fields
- **email**: Email address (must be valid email format)
- **phone**: Phone number (digits, spaces, dashes, parentheses, and plus signs allowed)
- **company**: Company name (max 100 characters)
- **status**: Lead status (one of: new, contacted, qualified, pending, lost, won) - defaults to "new"
- **notes**: Additional notes (max 1000 characters)

### CSV Format Example

```csv
name,email,phone,company,status,notes
John Doe,john@example.com,+1-555-0100,Acme Corp,new,Interested in enterprise plan
Jane Smith,jane@example.com,555-0101,Tech Solutions,contacted,Follow up next week
Bob Johnson,bob@example.com,,Startup Inc,qualified,Ready to close
```

### XLSX Format

Excel files should have the same column headers as the CSV format. The first row should contain the column names, and subsequent rows should contain the lead data.

### Import Process

1. Click the "Import" button on the Dashboard or Leads page
2. Select your CSV or XLSX file
3. The system will validate each row
4. Valid leads will be imported
5. You'll see a summary showing:
   - Number of successful imports
   - Number of failed imports
   - Detailed error messages for failed rows

### Validation Errors

If any rows fail validation, you'll see:
- Row number (starting from row 2, as row 1 is the header)
- Specific error messages for each field

Common validation errors:
- Missing required field (name)
- Invalid email format
- Invalid phone format
- Invalid status value
- Field exceeds maximum length

## Export Functionality

### Export Formats
- CSV (.csv)
- Excel (.xlsx)

### Export Process

1. Click the "Export" dropdown button
2. Select your preferred format (CSV or XLSX)
3. The file will download automatically with a filename like:
   - `leads-export-2025-10-27.csv`
   - `leads-export-2025-10-27.xlsx`

### Exported Data

All your leads will be exported with the following fields:
- Name
- Email
- Phone
- Company
- Status
- Notes
- Created At (timestamp)

### Use Cases

- **Backup**: Regularly export your leads for backup purposes
- **Analysis**: Import into spreadsheet software for analysis
- **Migration**: Export from one system and import into another
- **Reporting**: Share lead data with stakeholders

## Tips

1. **Test with small files first**: Start with a small sample file to ensure your data format is correct
2. **Check validation errors**: Review any validation errors and fix them in your source file
3. **Use consistent formatting**: Keep email and phone formats consistent
4. **Default status**: If you don't specify a status, leads will default to "new"
5. **Empty fields**: Leave fields empty if you don't have data (don't use "N/A" or similar placeholders)

## Troubleshooting

### Import Issues

**Problem**: File type not accepted
- **Solution**: Ensure your file has a .csv or .xlsx extension

**Problem**: All rows failing validation
- **Solution**: Check that your first row contains the correct column headers (name, email, phone, company, status, notes)

**Problem**: Email validation errors
- **Solution**: Ensure emails are in valid format (user@domain.com)

**Problem**: Status validation errors
- **Solution**: Use only these values: new, contacted, qualified, pending, lost, won

### Export Issues

**Problem**: Export button not working
- **Solution**: Ensure you're logged in and have an active session

**Problem**: Empty export file
- **Solution**: This is normal if you have no leads in the system

## Security

- All imports are associated with your user account
- You can only export your own leads
- Row Level Security (RLS) ensures data isolation between users
- Files are processed server-side and not stored permanently
