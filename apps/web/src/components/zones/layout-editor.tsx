"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import EntityBrowser from "@/components/zones/entity-browser";
import { SchemaPropertyPanel } from "@/components/zones/properties";
import { useBranches } from "@/hooks/use-branches";
import { useConvexLayoutSync } from "@/hooks/use-convex-layout-sync";
import { useCurrentUser } from "@/hooks/use-current-user";

export function LayoutEditor() {
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  const { data: zones } = useQuery({
    ...convexQuery(
      api.storageZones.getByBranch,
      currentBranch?._id
        ? { branchId: currentBranch._id, includeDeleted: false }
        : "skip",
    ),
    enabled: !!currentBranch,
  });
  const createZone = useMutation(api.storageZones.create);
  const updateZone = useMutation(api.storageZones.update);
  const deleteZone = useMutation(api.storageZones.softDelete);

  const currentBranchId = currentBranch?._id ?? null;

  const { isLoading, isConnected } = useConvexLayoutSync(
    currentBranchId,
    zones,
    {
      onMutateCreate: async (entity) => {
        if (!currentBranchId) {
          throw new Error("No current branch selected");
        }
        const id = await createZone({
          branchId: currentBranchId,
          parentId: entity.parentId as Id<"storage_zones"> | undefined,
          name: entity.name,
          path: entity.path,
          storageBlockType: entity.storageBlockType,
          zoneAttributes: entity.zoneAttributes,
        });
        return id;
      },
      onMutateUpdate: async (id, attributes) => {
        await updateZone({
          id: id as Id<"storage_zones">,
          zoneAttributes: attributes,
        });
      },
      onMutateDelete: async (id) => {
        await deleteZone({ id: id as Id<"storage_zones"> });
      },
    },
  );

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full grow">
      {/* Main 3D Canvas */}
      <ResizablePanel defaultSize={75} minSize={50}>
        <div className="p-4">
          <pre className="whitespace-pre-wrap break-all text-xs bg-muted rounded-md p-2">
            {JSON.stringify(zones, null, 2)}
          </pre>
        </div>
        <div>3d canvas</div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Sidebar: Entity List + Properties */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <ResizablePanelGroup direction="vertical" className="h-full border-l">
          {/* Entity List */}
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="bg-primary/50 font-mono">{currentBranch?.name}</div>
            <EntityBrowser />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Properties Panel */}
          <ResizablePanel defaultSize={50} minSize={20}>
            <SchemaPropertyPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
