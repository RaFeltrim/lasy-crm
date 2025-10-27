# Kanban Board Implementation

This directory contains the Kanban board implementation for the Lasy AI CRM System.

## Components

### KanbanBoard
The main Kanban board component that displays leads across five stages:
- New
- Contacted
- Qualified
- Pending
- Lost

**Features:**
- Drag-and-drop functionality using @dnd-kit
- Touch support for mobile devices
- Visual feedback during drag operations
- Responsive grid layout

### KanbanColumn
Individual column component for each stage with:
- Droppable zone for lead cards
- Stage analytics showing lead count
- Color-coded borders based on stage
- Visual feedback when hovering with a dragged card

### LeadCard
Draggable card component displaying lead information:
- Lead name and status badge
- Contact information (email, phone)
- Company name
- Notes preview
- Color-coded status badges

### StageAnalytics
Simple component showing the count of leads in each stage.

### KanbanBoardContainer
Container component that:
- Fetches leads data using React Query
- Handles drag-and-drop events
- Updates lead status via API with optimistic updates
- Implements real-time synchronization via Supabase
- Displays loading and error states

## Usage

```tsx
import { KanbanBoardContainer } from '@/components/KanbanBoardContainer';

export default function DashboardPage() {
  return <KanbanBoardContainer />;
}
```

## Real-time Synchronization

The Kanban board automatically syncs changes across all active sessions using Supabase real-time subscriptions. When a lead is created, updated, or deleted, all connected clients receive the update within 2 seconds.

## Mobile Support

The Kanban board is fully responsive and supports:
- Touch-based drag-and-drop on mobile devices
- Single-column layout on small screens (< 480px)
- Optimized touch targets for mobile interaction
- Smooth animations and transitions

## Performance

- Optimistic updates for instant feedback
- React Query caching with 5-minute stale time
- Automatic rollback on API failures
- Efficient re-rendering using useMemo
