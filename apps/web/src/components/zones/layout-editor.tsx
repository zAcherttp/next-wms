"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useBranches } from "@/hooks/use-branches";
import { useCurrentUser } from "@/hooks/use-current-user";

export function LayoutEditor() {
  const { organizationId } = useCurrentUser();
  const { currentBranch } = useBranches({ organizationId });

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full grow">
      {/* Main 3D Canvas */}
      <ResizablePanel defaultSize={75} minSize={50}>
        <div>3d canvas</div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Sidebar: Entity List + Properties */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <ResizablePanelGroup direction="vertical" className="h-full border-l">
          {/* Entity List */}
          <ResizablePanel defaultSize={50} minSize={20}>
            <div> {currentBranch?.name}</div>
            <div>Entity List</div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Properties Panel */}
          <ResizablePanel defaultSize={50} minSize={20}>
            <div>Properties Panel</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
