import { describe, it, expect } from 'vitest';
import { interactionSchema, createInteractionSchema } from '../interaction';

describe('Interaction Validation Schemas', () => {
  describe('interactionSchema', () => {
    it('should validate a complete valid interaction', () => {
      const validInteraction = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'call' as const,
        description: 'Discussed product features and pricing',
      };

      const result = interactionSchema.safeParse(validInteraction);
      expect(result.success).toBe(true);
    });

    it('should validate all interaction types', () => {
      const types = ['call', 'email', 'meeting', 'note', 'other'];
      const leadId = '123e4567-e89b-12d3-a456-426614174000';

      types.forEach((type) => {
        const interaction = {
          lead_id: leadId,
          type,
          description: 'Test description',
        };
        const result = interactionSchema.safeParse(interaction);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid interaction type', () => {
      const invalidInteraction = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'invalid-type',
        description: 'Test description',
      };

      const result = interactionSchema.safeParse(invalidInteraction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeTruthy();
      }
    });

    it('should reject invalid UUID for lead_id', () => {
      const invalidInteraction = {
        lead_id: 'not-a-uuid',
        type: 'call' as const,
        description: 'Test description',
      };

      const result = interactionSchema.safeParse(invalidInteraction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid lead ID');
      }
    });

    it('should reject empty description', () => {
      const invalidInteraction = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'call' as const,
        description: '',
      };

      const result = interactionSchema.safeParse(invalidInteraction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Description is required');
      }
    });

    it('should reject description longer than 1000 characters', () => {
      const invalidInteraction = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'call' as const,
        description: 'a'.repeat(1001),
      };

      const result = interactionSchema.safeParse(invalidInteraction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 1000 characters');
      }
    });

    it('should accept description at maximum length', () => {
      const validInteraction = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'note' as const,
        description: 'a'.repeat(1000),
      };

      const result = interactionSchema.safeParse(validInteraction);
      expect(result.success).toBe(true);
    });
  });
});
