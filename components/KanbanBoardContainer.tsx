'use client';

import { KanbanBoard } from '@/components/KanbanBoard';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { LeadStatus } from '@/types/database';
import { KanbanBoardSkeleton } from '@/components/LoadingSkeletons';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';

export function KanbanBoardContainer() {
  const { data, isLoading, error } = useLeads();
  const updateLead = useUpdateLead();
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Set up real-time subscription
  useEffect(() => {
    // Create a channel for leads changes
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Invalidate leads queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
          toast.error('Real-time updates disconnected');
        } else if (status === 'TIMED_OUT') {
          console.error('Real-time subscription timed out');
          toast.error('Real-time updates timed out');
        } else if (status === 'CLOSED') {
          console.log('Real-time subscription closed');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  const handleLeadMove = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        data: { status: newStatus },
      });
    } catch (error) {
      // Error handling is done in the useUpdateLead hook
      console.error('Failed to update lead status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full p-4">
        <KanbanBoardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load leads</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const leads = data?.leads || [];

  return <KanbanBoard leads={leads} onLeadMove={handleLeadMove} />;
}
