import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 * Requirements: 1.1, 1.2, 1.4, 1.5
 * 
 * Note: These tests require:
 * - A running Next.js application (npm run dev)
 * - Valid Supabase credentials in .env.local
 * - Test user credentials
 */

test.describe('Authentication Flow', () => {
  test.skip('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Should display login form
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test.skip('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.skip('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test.skip('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Click logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
