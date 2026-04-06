"use client"

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-bg-tertiary rounded-xl overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-bg-secondary/40 to-transparent" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card-depth p-4 w-full">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full animate-stagger-in">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
