import {
  AlertTriangle,
  AlignHorizontalDistributeCenter,
  Box,
  DoorOpen,
  Layers,
  LayoutGrid,
  LogIn,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BLOCK_UI_SCHEMAS,
  type BlockType,
} from "@/lib/types/layout-editor/attribute-registry";
import { cn } from "@/lib/utils";
import type { StorageEntity } from "@/store/layout-editor-store";
import { useLayoutStore } from "@/store/layout-editor-store";
import { TreeView, type TreeDataItem } from '@/components/tree-view'
import { logEntitySelected } from "@/store/editor-console-store";

// ============================================================================
// Icons Map
// ============================================================================

const BLOCK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  floor: Layers,
  rack: LayoutGrid,
  shelf: AlignHorizontalDistributeCenter,
  bin: Box,
  obstacle: AlertTriangle,
  entrypoint: LogIn,
  doorpoint: DoorOpen,
};

// ============================================================================
// Main Component
// ============================================================================

export function EntityBrowser() {
  // State for right-clicked item context
  const [contextItem, setContextItem] = useState<StorageEntity | null>(null);

  // Store state
  const entities = useLayoutStore((s) => s.entities);
  const selectedEntityId = useLayoutStore((s) => s.selectedEntityId);
  const selectEntity = useLayoutStore((s) => s.selectEntity);

  // Build tree data from entities
  const treeData = useMemo(() => {
    const buildTree = (parentId: string | null): TreeDataItem[] => {
      return Array.from(entities.values())
        .filter((entity) => entity.parentId === parentId && !entity.isDeleted)
        .map((entity) => {
          const Icon = BLOCK_ICONS[entity.storageBlockType] ?? Box;
          const schema = BLOCK_UI_SCHEMAS[entity.storageBlockType as BlockType];
          const name =
            (entity.zoneAttributes.name as string) ||
            `${schema?.displayName || entity.storageBlockType}`;

          const children = buildTree(entity.tempId || null);
          return {
            id: entity.tempId,
            name,
            type: entity.storageBlockType,
            icon: Icon,
            children: children.length > 0 ? children : undefined,
          };
        });
    };
    return buildTree(null);
  }, [entities]);

  // Handle tree selection
  const handleTreeSelect = useCallback((item: TreeDataItem | undefined) => {
    if (item) {
      selectEntity(item.id);
    }
  }, [selectEntity]);

  // Get allowed child types based on entity type
  const getAllowedChildTypes = useCallback((entity: StorageEntity | null): BlockType[] => {
    if (!entity) {
      // Root level - can only create floor/zone
      return ["floor"];
    }
    const parentType = entity.storageBlockType;
    switch (parentType) {
      case "floor":
        return ["rack", "obstacle", "entrypoint"];
      case "rack":
        return ["shelf"];
      case "shelf":
        return ["bin"];
      default:
        return [];
    }
  }, []);

  // Create new entity handler
  const setGhostEntity = useLayoutStore((s) => s.setGhostEntity);

  const handleCreateEntity = useCallback(
    (blockType: BlockType) => {
      const parentId = contextItem?._id || null;
      setGhostEntity(blockType, parentId);
    },
    [setGhostEntity, contextItem],
  );

  // Custom render item for TreeView with context menu
  const renderTreeItem = useCallback((params: any) => {
    const { item, isSelected } = params;
    const entity = entities.get(item.id);

    return (
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1 cursor-pointer rounded",
          isSelected && "bg-accent"
        )}
        onContextMenu={() => {
          if (entity) {
            setContextItem(entity);
          }
        }}
      >
        {item.icon && <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <span className="text-sm truncate">{item.name}</span>
      </div>
    );
  }, [entities]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-3 py-2">
        <h3 className="font-semibold text-sm">Entity Browser</h3>
      </div>

      <Separator />

      {/* Tree View with Context Menu */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <ScrollArea
            className="flex-1"
            onContextMenu={() => setContextItem(null)}
          >
            {treeData.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">No zones defined</h4>
                  <p className="text-muted-foreground text-xs">
                    Right-click here to create your first floor zone
                  </p>
                </div>
                <div className="mt-2 rounded-md border border-muted-foreground/50 border-dashed px-3 py-2 text-muted-foreground text-xs">
                  💡 Tip: Create a <strong>Floor</strong> zone first, then add
                  racks and obstacles inside it
                </div>
              </div>
            ) : (
              <TreeView
                data={treeData}
                initialSelectedItemId={selectedEntityId || undefined}
                onSelectChange={handleTreeSelect}
                renderItem={renderTreeItem}
                expandAll={false}
              />
            )}
          </ScrollArea>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {getAllowedChildTypes(contextItem).length > 0 ? (
            getAllowedChildTypes(contextItem).map((blockType) => {
              const Icon = BLOCK_ICONS[blockType] ?? Box;
              const label =
                blockType.charAt(0).toUpperCase() + blockType.slice(1);
              return (
                <ContextMenuItem
                  key={blockType}
                  onClick={() => handleCreateEntity(blockType)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  New {label}
                </ContextMenuItem>
              );
            })
          ) : (
            <ContextMenuItem disabled>
              No items can be created here
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Footer with count */}
      <div className="border-t bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
        {entities.size} items total
      </div>
    </div>
  );
}

export default EntityBrowser;
