import { describe, it, expect } from 'vitest';
import { leadSchema, createLeadSchema, updateLeadSchema } from '../lead';

describe('Lead Validation Schemas', () => {
  describe('leadSchema', () => {
    it('should validate a complete valid lead', () => {
      const validLead = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-234-567-8900',
        company: 'Acme Corp',
        status: 'new' as const,
        notes: 'Interested in our product',
      };

      const result = leadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should validate lead with minimal required fields', () => {
      const minimalLead = {
        name: 'Jane Smith',
        status: 'contacted' as const,
      };

      const result = leadSchema.safeParse(minimalLead);
      expect(result.success).toBe(true);
    });

    it('should reject lead without name', () => {
      const invalidLead = {
        email: 'test@example.com',
        status: 'new' as const,
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeTruthy();
      }
    });

    it('should reject lead with invalid email', () => {
      const invalidLead = {
        name: 'Test User',
        email: 'not-an-email',
        status: 'new' as const,
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject lead with invalid phone format', () => {
      const invalidLead = {
        name: 'Test User',
        phone: 'abc-def-ghij',
        status: 'new' as const,
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid phone');
      }
    });

    it('should accept valid phone formats', () => {
      const phoneFormats = [
        '+1-234-567-8900',
        '(123) 456-7890',
        '123 456 7890',
        '+44 20 1234 5678',
      ];

      phoneFormats.forEach((phone) => {
        const lead = {
          name: 'Test User',
          phone,
          status: 'new' as const,
        };
        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });

    it('should validate all status values', () => {
      const statuses = ['new', 'contacted', 'qualified', 'pending', 'lost', 'won'];

      statuses.forEach((status) => {
        const lead = {
          name: 'Test User',
          status,
        };
        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const invalidLead = {
        name: 'Test User',
        status: 'invalid-status',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const invalidLead = {
        name: 'a'.repeat(101),
        status: 'new' as const,
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters');
      }
    });

    it('should reject notes longer than 1000 characters', () => {
      const invalidLead = {
        name: 'Test User',
        status: 'new' as const,
        notes: 'a'.repeat(1001),
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 1000 characters');
      }
    });
  });

  describe('updateLeadSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        status: 'qualified' as const,
      };

      const result = updateLeadSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty object for no updates', () => {
      const result = updateLeadSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
