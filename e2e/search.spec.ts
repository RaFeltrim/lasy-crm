import { test, expect } from '@playwright/test';

/**
 * E2E tests for search and filter functionality
 * Requirements: 4.1, 4.2
 * 
 * Note: These tests require:
 * - A running Next.js application (npm run dev)
 * - Valid Supabase credentials in .env.local
 * - Authenticated user session
 * - Existing leads in the system
 */

test.describe('Search and Filter', () => {
  test.skip('should search leads by name', async ({ page }) => {
    await page.goto('/search');
    
    // Enter search query
    await page.getByPlaceholder(/search/i).fill('John');
    
    // Wait for debounce and results
    await page.waitForTimeout(500);
    
    // Should display matching results
    await expect(page.getByText(/john/i)).toBeVisible();
  });

  test.skip('should filter leads by status', async ({ page }) => {
    await page.goto('/search');
    
    // Open filter panel
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Select status filter
    await page.getByLabel(/status/i).selectOption('qualified');
    
    // Apply filter
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Should display only qualified leads
    const results = page.locator('[data-status="qualified"]');
    await expect(results.first()).toBeVisible();
  });

  test.skip('should filter leads by date range', async ({ page }) => {
    await page.goto('/search');
    
    // Open filter panel
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Set date range
    await page.getByLabel(/from/i).fill('2025-01-01');
    await page.getByLabel(/to/i).fill('2025-01-31');
    
    // Apply filter
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Should display results within date range
    await expect(page.getByText(/results/i)).toBeVisible();
  });

  test.skip('should combine search and filters', async ({ page }) => {
    await page.goto('/search');
    
    // Enter search query
    await page.getByPlaceholder(/search/i).fill('Acme');
    
    // Open filter panel
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Select status filter
    await page.getByLabel(/status/i).selectOption('new');
    
    // Apply filter
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Should display results matching both criteria
    await expect(page.getByText(/acme/i)).toBeVisible();
  });

  test.skip('should clear filters', async ({ page }) => {
    await page.goto('/search');
    
    // Apply some filters
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByLabel(/status/i).selectOption('qualified');
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Clear filters
    await page.getByRole('button', { name: /clear/i }).click();
    
    // Should display all leads
    await expect(page.getByText(/all leads/i)).toBeVisible();
  });
});
