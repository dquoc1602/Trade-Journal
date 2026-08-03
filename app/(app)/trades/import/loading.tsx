import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-72 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
