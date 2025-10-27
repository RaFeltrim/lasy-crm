import { KanbanBoardSkeleton } from "@/components/LoadingSkeletons"

export default function LeadsLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your leads and pipeline
        </p>
      </div>
      <KanbanBoardSkeleton />
    </div>
  )
}
