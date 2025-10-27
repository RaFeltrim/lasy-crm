'use client';

import { Lead, LeadStatus } from '@/types/database';
import { KanbanColumn } from '@/components/KanbanColumn';
import { LeadCard } from '@/components/LeadCard';
import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadMove?: (leadId: string, newStatus: LeadStatus) => void;
}

const STAGES: { id: LeadStatus; title: string }[] = [
  { id: 'new', title: 'New' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'pending', title: 'Pending' },
  { id: 'lost', title: 'Lost' },
];

export function KanbanBoard({ leads, onLeadMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold required for touch
        tolerance: 5,
      },
    })
  );

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      pending: [],
      lost: [],
      won: [],
    };

    leads.forEach((lead) => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });

    return grouped;
  }, [leads]);

  // Find the active lead being dragged
  const activeLead = useMemo(() => {
    if (!activeId) return null;
    return leads.find((lead) => lead.id === activeId);
  }, [activeId, leads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    // Find the lead and check if status changed
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      onLeadMove?.(leadId, newStatus);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-full w-full overflow-x-auto">
        {/* Mobile: Single column layout (< 480px) */}
        {/* Tablet: 2-3 columns (481px - 768px) */}
        {/* Desktop: 5 columns (> 769px) */}
        <div className="flex flex-col mobile:flex-col tablet:grid tablet:grid-cols-3 desktop:grid desktop:grid-cols-5 gap-4 p-4 tablet:min-w-max">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              status={stage.id}
              title={stage.title}
              leads={leadsByStatus[stage.id]}
              className="w-full tablet:w-[280px]"
            >
              {leadsByStatus[stage.id].map((lead) => (
                <DraggableLeadCard key={lead.id} lead={lead} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Separate component for draggable lead cards
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function DraggableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}
