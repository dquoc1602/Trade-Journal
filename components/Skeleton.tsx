import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-surface2", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx("card", className)}>
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
}

export function SkeletonPage({ kpiCount = 4 }: { kpiCount?: number }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-7 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className={clsx("grid gap-4 mb-6", kpiCount === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-5")}>
        {Array.from({ length: kpiCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="card">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
