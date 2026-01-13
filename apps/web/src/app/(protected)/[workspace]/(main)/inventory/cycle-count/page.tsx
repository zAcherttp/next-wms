"use client";

import { CheckCircle2, Layers, Percent, PlayCircle } from "lucide-react";
import { CycleCountSessionsTable } from "@/components/table/cycle-count-sessions-table";
import { MOCK_CYCLE_COUNT_STATS } from "@/mock/data/cycle-count";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  valueColor?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = "text-foreground",
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className={`font-bold text-3xl ${valueColor}`}>{value}</div>
      <span className="text-muted-foreground text-xs">{subtitle}</span>
    </div>
  );
}

export default function Page() {
  // Using mock data
  const stats = MOCK_CYCLE_COUNT_STATS;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          subtitle="1 ongoing today"
          icon={<PlayCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Total Zones"
          value={stats.totalZones}
          subtitle="Across all sessions"
          icon={<Layers className="h-5 w-5" />}
        />
        <StatCard
          title="Completed"
          value={stats.completedSessions}
          subtitle="Sessions finished"
          icon={<CheckCircle2 className="h-5 w-5" />}
          valueColor="text-blue-600"
        />
        <StatCard
          title="Verification Rate"
          value={`${stats.verificationRate}%`}
          subtitle="Average accuracy"
          icon={<Percent className="h-5 w-5" />}
          valueColor="text-green-600"
        />
      </div>

      {/* Sessions Table */}
      <CycleCountSessionsTable />
    </div>
  );
}
