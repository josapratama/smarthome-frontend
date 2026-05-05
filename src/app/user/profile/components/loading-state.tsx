"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-[200px]" />
      <Skeleton className="h-[400px]" />
    </div>
  );
}
