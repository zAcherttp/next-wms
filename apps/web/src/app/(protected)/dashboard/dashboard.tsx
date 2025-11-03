"use client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function Dashboard() {
  const { data: privateData, isLoading } = useQuery(
    trpc.privateData.queryOptions(),
  );

  return isLoading ? (
    <Skeleton className="h-8 w-full" />
  ) : (
    <pre>{JSON.stringify(privateData, null, 2)}</pre>
  );
}
