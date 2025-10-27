# Import/Export Feature

## Quick Start

### Importing Leads

1. Navigate to the **Dashboard** or **Leads** page
2. Click the **Import** button
3. Select your CSV or XLSX file
4. Review the import results
5. Close the dialog - your leads will appear immediately

### Exporting Leads

1. Navigate to the **Dashboard** or **Leads** page
2. Click the **Export** dropdown button
3. Select **CSV** or **XLSX** format
4. Your file will download automatically

## File Format

### CSV Example
```csv
name,email,phone,company,status,notes
John Doe,john@example.com,+1-555-0100,Acme Corp,new,Interested in enterprise plan
Jane Smith,jane@example.com,555-0101,Tech Solutions,contacted,Follow up next week
```

### Required Fields
- **name**: Lead's full name (required)

### Optional Fields
- **email**: Valid email address
- **phone**: Phone number (flexible format)
- **company**: Company name
- **status**: One of: new, contacted, qualified, pending, lost, won (defaults to "new")
- **notes**: Additional information

## Sample Files

A sample import template is available at:
- `docs/sample-import-template.csv`

## Limits

- Maximum **1000 rows** per import
- Supported formats: **CSV** and **XLSX** only

## Validation

The system validates each row and will:
- ✅ Import all valid leads
- ❌ Report errors for invalid rows with specific details
- 📊 Show a summary of successful and failed imports

## Common Issues

### "Invalid file type"
- Ensure your file has a `.csv` or `.xlsx` extension

### "Name is required"
- Every row must have a name field

### "Invalid email"
- Check that email addresses are in the format: user@domain.com

### "Invalid status"
- Use only these values: new, contacted, qualified, pending, lost, won

## Need Help?

See the complete guide at `docs/import-export-guide.md` for:
- Detailed field specifications
- Troubleshooting tips
- Advanced usage examples
- Security information
