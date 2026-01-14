import { cn } from '@/lib/utils'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}

export function FeedSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden bg-card">
          {/* Image skeleton */}
          <Skeleton className="w-full aspect-square" />
          
          {/* Header skeleton */}
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 flex-shrink-0" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="px-2 space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-full" />
          </div>

          {/* Footer skeleton */}
          <div className="p-2 flex gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
