import { test, expect } from '@playwright/test';

/**
 * E2E tests for lead management flows
 * Requirements: 3.1, 3.4
 * 
 * Note: These tests require:
 * - A running Next.js application (npm run dev)
 * - Valid Supabase credentials in .env.local
 * - Authenticated user session
 */

test.describe('Lead Management', () => {
  test.skip('should create a new lead', async ({ page }) => {
    // Navigate to leads page
    await page.goto('/leads');
    
    // Click create lead button
    await page.getByRole('button', { name: /create lead/i }).click();
    
    // Fill in lead form
    await page.getByLabel(/name/i).fill('Test Lead');
    await page.getByLabel(/email/i).fill('testlead@example.com');
    await page.getByLabel(/phone/i).fill('+1-234-567-8900');
    await page.getByLabel(/company/i).fill('Test Company');
    await page.getByLabel(/status/i).selectOption('new');
    await page.getByLabel(/notes/i).fill('Test notes');
    
    // Submit form
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/lead created/i)).toBeVisible();
    
    // Should display new lead in list
    await expect(page.getByText('Test Lead')).toBeVisible();
  });

  test.skip('should edit an existing lead', async ({ page }) => {
    // Navigate to leads page
    await page.goto('/leads');
    
    // Click on a lead
    await page.getByText('Test Lead').first().click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Update lead name
    await page.getByLabel(/name/i).clear();
    await page.getByLabel(/name/i).fill('Updated Lead Name');
    
    // Submit form
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/lead updated/i)).toBeVisible();
    
    // Should display updated name
    await expect(page.getByText('Updated Lead Name')).toBeVisible();
  });

  test.skip('should delete a lead', async ({ page }) => {
    // Navigate to leads page
    await page.goto('/leads');
    
    // Click on a lead
    await page.getByText('Test Lead').first().click();
    
    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Should show success message
    await expect(page.getByText(/lead deleted/i)).toBeVisible();
    
    // Should not display deleted lead
    await expect(page.getByText('Test Lead')).not.toBeVisible();
  });
});
