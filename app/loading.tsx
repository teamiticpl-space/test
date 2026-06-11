import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-72" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-[460px] lg:col-span-2" />
          <div className="space-y-5">
            <Skeleton className="h-64" />
            <Skeleton className="h-72" />
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 min-w-[148px]" />
          ))}
        </div>
        <Skeleton className="h-[320px]" />
      </div>
    </div>
  );
}
