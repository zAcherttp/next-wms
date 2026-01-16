/**
 * EntityBrowser - ECS-style folder navigation for entities
 * Displays entities hierarchically with drill-down and breadcrumb navigation
 */

import type { Id } from "@wms/backend/convex/_generated/dataModel";
import {
  AlertTriangle,
  AlignHorizontalDistributeCenter,
  Box,
  ChevronRight,
  DoorOpen,
  Layers,
  LayoutGrid,
  LogIn,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
// Breadcrumb Component
// ============================================================================

interface BreadcrumbProps {
  path: string[];
  onNavigate: (index: number) => void;
}

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate(-1)}
      >
        Branch
      </Button>
      {path.map((segment, index) => (
        <React.Fragment key={`${index.toString()}-${segment}`}>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2",
              index === path.length - 1
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onNavigate(index)}
          >
            {segment}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================================
// Entity Row Component
// ============================================================================

interface EntityRowProps {
  entity: StorageEntity;
  isSelected: boolean;
  hasChildren: boolean;
  onSelect: (id: Id<"storage_zones">) => void;
  onDrillDown: (id: Id<"storage_zones">) => void;
}

function EntityRow({
  entity,
  isSelected,
  hasChildren,
  onSelect,
  onDrillDown,
}: EntityRowProps) {
  const Icon = BLOCK_ICONS[entity.storageBlockType] ?? Box;
  const schema = BLOCK_UI_SCHEMAS[entity.storageBlockType as BlockType];
  const name =
    (entity.zoneAttributes.name as string) ||
    `${schema?.displayName || entity.storageBlockType}`;

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
        isSelected
          ? "border-primary border-l-2 bg-primary/10"
          : "hover:bg-muted/50",
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault(); // prevents page scroll on Space

          if (entity._id) onDrillDown(entity._id);
        }
      }}
      onClick={() => {
        if (entity._id) onSelect(entity._id);
      }}
      onDoubleClick={() => hasChildren && entity._id && onDrillDown(entity._id)}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-sm">{name}</span>
      {hasChildren && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            if (entity._id) onDrillDown(entity._id);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EntityBrowser() {
  // Current navigation path (entity IDs)
  const [pathIds, setPathIds] = useState<Id<"storage_zones">[]>([]);

  // Store state
  const entities = useLayoutStore((s) => s.entities);
  const getEntitiesByParent = useLayoutStore((s) => s.getEntitiesByParent);
  const selectedEntityId = useLayoutStore((s) => s.selectedEntityId);
  const selectEntity = useLayoutStore((s) => s.selectEntity);
  const addEntity = useLayoutStore((s) => s.addEntity);

  // Get current parent ID (last in path, or null for root)
  const currentParentId: Id<"storage_zones"> | null =
    pathIds.length > 0 ? pathIds[pathIds.length - 1] : null;

  // Get entities at current level
  const currentEntities = useMemo(() => {
    if (currentParentId === null) {
      // Root level - show floors
      return Array.from(entities.values()).filter(
        (e) => e.parentId === null && !e.isDeleted,
      );
    }
    return getEntitiesByParent(currentParentId);
  }, [entities, currentParentId, getEntitiesByParent]);

  // Check which entities have children
  const entitiesWithChildren = useMemo(() => {
    const withChildren = new Set<string>();
    entities.forEach((e) => {
      if (e.parentId && !e.isDeleted) {
        withChildren.add(e.parentId);
      }
    });
    return withChildren;
  }, [entities]);

  // Build breadcrumb path names
  const breadcrumbNames = useMemo(() => {
    return pathIds.map((id) => {
      const entity = entities.get(id);
      if (!entity) return id.slice(0, 8);
      return (entity.zoneAttributes.name as string) || entity.storageBlockType;
    });
  }, [pathIds, entities]);

  // Navigate to a breadcrumb index (-1 = root)
  const handleBreadcrumbNavigate = (index: number) => {
    if (index < 0) {
      setPathIds([]);
    } else {
      setPathIds(pathIds.slice(0, index + 1));
    }
  };

  // Drill down into entity
  const handleDrillDown = (entityId: Id<"storage_zones">) => {
    setPathIds([...pathIds, entityId]);
  };

  // Select entity
  const handleSelect = (entityId: Id<"storage_zones">) => {
    selectEntity(entityId);
  };

  // Get current parent entity (for determining allowed child types)
  const currentParentEntity = useMemo(() => {
    if (!currentParentId) return null;
    return entities.get(currentParentId) ?? null;
  }, [currentParentId, entities]);

  // Get allowed child types based on parent type
  const allowedChildTypes = useMemo((): BlockType[] => {
    if (!currentParentEntity) {
      // Root level - can only create floor/zone
      return ["floor"];
    }
    const parentType = currentParentEntity.storageBlockType;
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
  }, [currentParentEntity]);

  // Create new entity handler
  const handleCreateEntity = useCallback(
    (blockType: BlockType) => {
      const name = `New ${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`;
      const newId = addEntity(blockType, currentParentId, name);
      // Auto-select the new entity
      if (newId) selectEntity(newId);
    },
    [addEntity, currentParentId, selectEntity],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-3 py-2">
        <h3 className="font-semibold text-sm">Entity Browser</h3>
      </div>

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30 px-3 py-2">
        <Breadcrumb
          path={breadcrumbNames}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      <Separator />

      {/* Entity List with Context Menu */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <ScrollArea className="flex-1">
            {currentEntities.length === 0 ? (
              currentParentId === null ? (
                // Root level with no zones - show helpful alert
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
                  <div className="mt-2 rounded-md border border-dashed border-muted-foreground/50 px-3 py-2 text-muted-foreground text-xs">
                    💡 Tip: Create a <strong>Floor</strong> zone first, then add
                    racks and obstacles inside it
                  </div>
                </div>
              ) : (
                // Inside a zone with no children
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No entities at this level. Right-click to create.
                </div>
              )
            ) : (
              <div className="py-1">
                {currentEntities.map((entity) => (
                  <EntityRow
                    key={entity._id}
                    entity={entity}
                    isSelected={entity._id === selectedEntityId}
                    hasChildren={
                      entity._id ? entitiesWithChildren.has(entity._id) : false
                    }
                    onSelect={handleSelect}
                    onDrillDown={handleDrillDown}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {allowedChildTypes.length > 0 ? (
            allowedChildTypes.map((blockType) => {
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
          {currentEntities.length > 0 && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                disabled
                className="text-muted-foreground text-xs"
              >
                {currentEntities.length} items in this level
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Footer with count */}
      <div className="border-t bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
        {currentEntities.length} items
      </div>
    </div>
  );
}

export default EntityBrowser;
