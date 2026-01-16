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
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
        Root
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
          onDrillDown(entity.id);
        }
      }}
      onClick={() => onSelect(entity.id)}
      onDoubleClick={() => hasChildren && onDrillDown(entity.id)}
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
            onDrillDown(entity.id);
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

      {/* Entity List */}
      <ScrollArea className="flex-1">
        {currentEntities.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No entities at this level
          </div>
        ) : (
          <div className="py-1">
            {currentEntities.map((entity) => (
              <EntityRow
                key={entity.id}
                entity={entity}
                isSelected={entity.id === selectedEntityId}
                hasChildren={entitiesWithChildren.has(entity.id)}
                onSelect={handleSelect}
                onDrillDown={handleDrillDown}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
        {currentEntities.length} items
      </div>
    </div>
  );
}

export default EntityBrowser;
