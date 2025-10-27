import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').optional().or(z.literal('')).nullable(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional().or(z.literal('')).nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'pending', 'lost', 'won']),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')).nullable(),
});

export const createLeadSchema = leadSchema;

export const updateLeadSchema = leadSchema.partial();

export type LeadFormData = z.infer<typeof leadSchema>;
export type CreateLeadData = z.infer<typeof createLeadSchema>;
export type UpdateLeadData = z.infer<typeof updateLeadSchema>;
