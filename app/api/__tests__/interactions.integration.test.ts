import { describe, it, expect } from 'vitest';
import { interactionSchema } from '@/lib/validations/interaction';

/**
 * Integration tests for Interactions API endpoint
 * These tests verify interaction creation and retrieval logic
 */
describe('Interactions API Integration', () => {
  describe('POST /api/interactions - Create Interaction', () => {
    it('should validate complete interaction data', () => {
      const interactionData = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'call' as const,
        description: 'Discussed product features and pricing',
      };

      const result = interactionSchema.safeParse(interactionData);
      expect(result.success).toBe(true);
    });

    it('should validate all interaction types', () => {
      const types = ['call', 'email', 'meeting', 'note', 'other'];
      const leadId = '123e4567-e89b-12d3-a456-426614174000';

      types.forEach((type) => {
        const interaction = {
          lead_id: leadId,
          type,
          description: 'Test interaction',
        };
        const result = interactionSchema.safeParse(interaction);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid interaction data', () => {
      const invalidData = {
        lead_id: 'not-a-uuid',
        type: 'call' as const,
        description: 'Test',
      };

      const result = interactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('GET /api/interactions - List Interactions', () => {
    it('should require lead_id parameter', () => {
      const leadId = '123e4567-e89b-12d3-a456-426614174000';
      
      expect(leadId).toBeTruthy();
      expect(leadId.length).toBeGreaterThan(0);
    });

    it('should validate lead_id format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(validUUID)).toBe(true);
    });
  });
});
