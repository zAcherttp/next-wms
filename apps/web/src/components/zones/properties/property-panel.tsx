/**
 * SchemaPropertyPanel - Auto-generated property panel from attribute schema
 * Renders form fields based on BLOCK_UI_SCHEMAS registry
 */

import { useCallback, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { AttributeField } from "@/components/zones/properties";
import {
  BLOCK_UI_SCHEMAS,
  type BlockType,
} from "@/lib/types/layout-editor/attribute-registry";
import type { StorageEntity } from "@/store/layout-editor-store";
import { useLayoutStore } from "@/store/layout-editor-store";

// ============================================================================
// Types
// ============================================================================

interface SchemaPropertyPanelProps {
  /** The entity to edit (if using external entity) */
  entity?: StorageEntity;
  /** Whether fields are read-only */
  readOnly?: boolean;
  /** Custom onChange handler (if not using store) */
  onChange?: (updates: Record<string, unknown>) => void;
}

// ============================================================================
// Component
// ============================================================================

export function SchemaPropertyPanel({
  entity: externalEntity,
  readOnly = false,
  onChange: externalOnChange,
}: SchemaPropertyPanelProps) {
  // Get selected entity from store if not provided
  const selectedEntityId = useLayoutStore((s) => s.selectedEntityId);
  const storeEntity = useLayoutStore((s) =>
    selectedEntityId ? s.entities.get(selectedEntityId) : undefined,
  );
  const updateEntity = useLayoutStore((s) => s.updateEntity);

  // Use external entity or store entity
  const entity = externalEntity ?? storeEntity;

  // Get UI schema for this entity type
  const uiSchema = useMemo(() => {
    if (!entity) return null;
    return BLOCK_UI_SCHEMAS[entity.storageBlockType as BlockType];
  }, [entity?.storageBlockType, entity]);

  // Handle attribute change
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!entity) return;

      const updates = { [key]: value };

      if (externalOnChange) {
        externalOnChange(updates);
      } else {
        updateEntity(entity.id, updates);
      }
    },
    [entity, updateEntity, externalOnChange],
  );

  // No entity selected
  if (!entity) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No entity selected</p>
        <p className="mt-1 text-xs">
          Click on an entity in the 3D view to edit its properties
        </p>
      </div>
    );
  }

  // No schema for this type
  if (!uiSchema) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Unknown entity type: {entity.storageBlockType}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <h3 className="font-semibold">{uiSchema.displayName}</h3>
          <p className="text-muted-foreground text-xs">
            {entity.id.slice(0, 8)}...
          </p>
        </div>
        <span className="rounded bg-muted px-2 py-1 text-xs">
          {entity.path}
        </span>
      </div>

      <Separator />

      {/* Attribute Fields */}
      <div className="space-y-4">
        {uiSchema.attributes.map((attrConfig) => (
          <AttributeField
            key={attrConfig.key}
            config={attrConfig}
            value={entity.zoneAttributes[attrConfig.key]}
            onChange={(value) => handleChange(attrConfig.key, value)}
            disabled={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

export default SchemaPropertyPanel;
