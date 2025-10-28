import { z } from 'zod';

export const interactionSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  type: z.enum(['call', 'email', 'meeting', 'note', 'other'], {
    message: 'Type must be one of: call, email, meeting, note, other',
  }),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
});

export const createInteractionSchema = interactionSchema;

export type InteractionFormData = z.infer<typeof interactionSchema>;
export type CreateInteractionData = z.infer<typeof createInteractionSchema>;
