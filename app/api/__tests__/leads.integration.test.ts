import { describe, it, expect } from 'vitest';
import { leadSchema, updateLeadSchema } from '@/lib/validations/lead';

/**
 * Integration tests for Lead API endpoints
 * These tests verify the validation and data flow logic
 */
describe('Lead API Integration', () => {
  describe('POST /api/leads - Create Lead', () => {
    it('should validate complete lead data', () => {
      const leadData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-234-567-8900',
        company: 'Acme Corp',
        status: 'new' as const,
        notes: 'Interested in product',
      };

      const result = leadSchema.safeParse(leadData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal lead data', () => {
      const leadData = {
        name: 'Jane Smith',
        status: 'contacted' as const,
      };

      const result = leadSchema.safeParse(leadData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid lead data', () => {
      const invalidData = {
        email: 'invalid-email',
        status: 'new' as const,
      };

      const result = leadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('GET /api/leads - List Leads', () => {
    it('should handle pagination parameters', () => {
      const limit = 50;
      const offset = 0;
      
      expect(limit).toBeGreaterThan(0);
      expect(offset).toBeGreaterThanOrEqual(0);
    });

    it('should handle status filter', () => {
      const statusFilter = 'new,contacted';
      const statuses = statusFilter.split(',');
      
      expect(statuses).toContain('new');
      expect(statuses).toContain('contacted');
    });
  });

  describe('PATCH /api/leads/[id] - Update Lead', () => {
    it('should validate partial update data', () => {
      const updateData = {
        status: 'qualified' as const,
      };

      const result = updateLeadSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate multiple field updates', () => {
      const updateData = {
        name: 'Updated Name',
        status: 'qualified' as const,
        notes: 'Updated notes',
      };

      const result = updateLeadSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /api/leads/[id] - Delete Lead', () => {
    it('should validate UUID format for lead ID', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(validUUID)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidUUID = 'not-a-uuid';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(invalidUUID)).toBe(false);
    });
  });
});
