"use client";

import {
  CheckCircle2,
  Filter,
  Layers,
  Percent,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { CreateCycleCountSessionDialog } from "@/components/create-cycle-count-session-dialog";
import { CycleCountSessionsTable } from "@/components/table/cycle-count-sessions-table";
import { Button } from "@/components/ui/button";
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

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Create Session Dialog */}
      <CreateCycleCountSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Header */}
      <div>
        <h1 className="font-semibold text-2xl">Cycle Count Management</h1>
        <p className="text-muted-foreground text-sm">
          Create and manage inventory cycle count sessions
        </p>
      </div>

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

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      {/* Sessions Table */}
      <CycleCountSessionsTable />
    </div>
  );
}

