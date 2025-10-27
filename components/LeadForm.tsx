'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type LeadFormData } from '@/lib/validations/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Lead } from '@/types/database';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: LeadFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isSubmitting = false }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      company: lead?.company || '',
      status: lead?.status || 'new',
      notes: lead?.notes || '',
    },
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 tablet:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm tablet:text-base">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter lead name"
          disabled={isSubmitting}
          className="h-11 tablet:h-10 text-base tablet:text-sm"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm tablet:text-base">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@example.com"
          disabled={isSubmitting}
          className="h-11 tablet:h-10 text-base tablet:text-sm"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm tablet:text-base">Phone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+1 (555) 123-4567"
          disabled={isSubmitting}
          className="h-11 tablet:h-10 text-base tablet:text-sm"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm tablet:text-base">Company</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Company name"
          disabled={isSubmitting}
          className="h-11 tablet:h-10 text-base tablet:text-sm"
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm tablet:text-base">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={status}
          onValueChange={(value: string) => setValue('status', value as LeadFormData['status'])}
          disabled={isSubmitting}
        >
          <SelectTrigger id="status" className="h-11 tablet:h-10 text-base tablet:text-sm">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="won">Won</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm tablet:text-base">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any additional notes..."
          rows={4}
          disabled={isSubmitting}
          className="text-base tablet:text-sm"
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex flex-col-reverse tablet:flex-row justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 tablet:h-10 text-base tablet:text-sm"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="h-11 tablet:h-10 text-base tablet:text-sm"
        >
          {isSubmitting ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
