import { test, expect } from '@playwright/test';

/**
 * E2E tests for Kanban board drag-and-drop
 * Requirements: 2.2, 2.3
 * 
 * Note: These tests require:
 * - A running Next.js application (npm run dev)
 * - Valid Supabase credentials in .env.local
 * - Authenticated user session
 * - Existing leads in the system
 */

test.describe('Kanban Board', () => {
  test.skip('should display Kanban board with columns', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should display all stage columns
    await expect(page.getByText('New')).toBeVisible();
    await expect(page.getByText('Contacted')).toBeVisible();
    await expect(page.getByText('Qualified')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Lost')).toBeVisible();
  });

  test.skip('should drag and drop lead between columns', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find a lead card in the "New" column
    const leadCard = page.locator('[data-status="new"]').first();
    const leadName = await leadCard.textContent();
    
    // Drag to "Contacted" column
    const contactedColumn = page.locator('[data-column="contacted"]');
    await leadCard.dragTo(contactedColumn);
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Should show success message
    await expect(page.getByText(/lead updated/i)).toBeVisible();
    
    // Lead should now be in "Contacted" column
    const movedLead = page.locator('[data-status="contacted"]', { hasText: leadName || '' });
    await expect(movedLead).toBeVisible();
  });

  test.skip('should update stage analytics after drag', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial count for "New" column
    const newColumnCount = await page.locator('[data-column="new"] [data-count]').textContent();
    const initialCount = parseInt(newColumnCount || '0');
    
    // Drag a lead from "New" to "Contacted"
    const leadCard = page.locator('[data-status="new"]').first();
    const contactedColumn = page.locator('[data-column="contacted"]');
    await leadCard.dragTo(contactedColumn);
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Count should decrease by 1
    const updatedCount = await page.locator('[data-column="new"] [data-count]').textContent();
    expect(parseInt(updatedCount || '0')).toBe(initialCount - 1);
  });
});
