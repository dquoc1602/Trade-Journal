import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-40 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="max-w-xl space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
