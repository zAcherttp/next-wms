"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { CheckCircle2, Layers, Percent, PlayCircle } from "lucide-react";
import { CycleCountSessionsTable } from "@/components/table/cycle-count-sessions-table";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  valueColor?: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = "text-foreground",
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      {isLoading ? (
        <div className="h-9 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <div className={`font-bold text-3xl ${valueColor}`}>{value}</div>
      )}
      <span className="text-muted-foreground text-xs">{subtitle}</span>
    </div>
  );
}

export default function Page() {
  const { organizationId } = useCurrentUser();

  const { currentBranch } = useBranches({
    organizationId: organizationId as Id<"organizations"> | undefined,
    includeDeleted: false,
  });

  const { data: stats, isLoading } = useQuery({
    ...convexQuery(api.cycleCount.getStats, {
      organizationId: organizationId as string,
      branchId: currentBranch?._id as string,
    }),
    enabled: !!organizationId && !!currentBranch,
  });

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions ?? 0}
          subtitle="Currently active"
          icon={<PlayCircle className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Zones"
          value={stats?.totalZones ?? 0}
          subtitle="Across all sessions"
          icon={<Layers className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed"
          value={stats?.completedSessions ?? 0}
          subtitle="Sessions finished"
          icon={<CheckCircle2 className="h-5 w-5" />}
          valueColor="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Verification Rate"
          value={`${stats?.verificationRate ?? 0}%`}
          subtitle="Average accuracy"
          icon={<Percent className="h-5 w-5" />}
          valueColor="text-green-600"
          isLoading={isLoading}
        />
      </div>

      {/* Sessions Table */}
      <CycleCountSessionsTable />
    </div>
  );
}
