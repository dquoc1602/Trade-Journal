import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-64 mb-2" />
      <Skeleton className="h-4 w-40 mb-6" />
      <div className="card mb-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
