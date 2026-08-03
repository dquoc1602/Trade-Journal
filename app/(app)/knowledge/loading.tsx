import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-72 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <Skeleton className="h-24 w-full mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
