'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interactionSchema, type InteractionFormData } from '@/lib/validations/interaction';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Mail, Calendar, FileText, MoreHorizontal } from 'lucide-react';

interface InteractionFormProps {
  leadId: string;
  onSubmit: (data: InteractionFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const interactionTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  other: MoreHorizontal,
};

const interactionTypeLabels = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  other: 'Other',
};

export function InteractionForm({ leadId, onSubmit, onCancel, isSubmitting = false }: InteractionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      lead_id: leadId,
      type: 'note',
      description: '',
    },
  });

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 tablet:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm tablet:text-base">
          Interaction Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={type}
          onValueChange={(value: string) => setValue('type', value as InteractionFormData['type'])}
          disabled={isSubmitting}
        >
          <SelectTrigger id="type" className="h-11 tablet:h-10 text-base tablet:text-sm">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(interactionTypeLabels).map(([value, label]) => {
              const Icon = interactionTypeIcons[value as keyof typeof interactionTypeIcons];
              return (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm tablet:text-base">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the interaction..."
          rows={4}
          disabled={isSubmitting}
          className="text-base tablet:text-sm"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
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
          {isSubmitting ? 'Adding...' : 'Add Interaction'}
        </Button>
      </div>
    </form>
  );
}
