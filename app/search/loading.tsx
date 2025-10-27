import { LeadListSkeleton } from "@/components/LoadingSkeletons"

export default function SearchLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Search and filter your leads
        </p>
      </div>
      <LeadListSkeleton />
    </div>
  )
}
