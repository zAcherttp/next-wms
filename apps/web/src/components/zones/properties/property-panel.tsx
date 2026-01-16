/**
 * SchemaPropertyPanel - Auto-generated property panel from attribute schema
 * Renders form fields based on BLOCK_UI_SCHEMAS registry
 * Uses local draft state with Save/Cancel buttons and Zod validation
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AttributeField } from "@/components/zones/properties";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import {
  BLOCK_SCHEMAS,
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

interface ValidationError {
  path: string[];
  message: string;
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

  // Commit hook for validated updates
  const { commitUpdate } = useEntityMutation();

  // Use external entity or store entity
  const entity = externalEntity ?? storeEntity;

  // Local draft state for unsaved changes
  const [draftAttributes, setDraftAttributes] = useState<
    Record<string, unknown>
  >({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isCommitting, setIsCommitting] = useState(false);

  // Reset draft when entity changes
  useEffect(() => {
    if (entity?.zoneAttributes) {
      setDraftAttributes({ ...entity.zoneAttributes });
      setValidationErrors([]);
    }
  }, [entity?.zoneAttributes]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!entity?.zoneAttributes) return false;
    const original = JSON.stringify(entity.zoneAttributes);
    const current = JSON.stringify(draftAttributes);
    return original !== current;
  }, [entity?.zoneAttributes, draftAttributes]);

  // Get UI schema for this entity type
  const uiSchema = useMemo(() => {
    if (!entity) return null;
    return BLOCK_UI_SCHEMAS[entity.storageBlockType as BlockType];
  }, [entity?.storageBlockType, entity]);

  // Get Zod schema for validation
  const zodSchema = useMemo(() => {
    if (!entity) return null;
    return BLOCK_SCHEMAS[entity.storageBlockType as BlockType];
  }, [entity?.storageBlockType, entity]);

  // Handle attribute change (updates local draft only)
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!entity) return;

      setDraftAttributes((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Clear validation errors for this field
      setValidationErrors((prev) => prev.filter((e) => e.path[0] !== key));

      // If external onChange provided, call it (for preview purposes)
      if (externalOnChange) {
        externalOnChange({ [key]: value });
      }
    },
    [entity, externalOnChange],
  );

  // Handle Save - validate and commit
  const handleSave = useCallback(async () => {
    if (!entity?._id || !zodSchema) return;

    // Validate with Zod
    const result = zodSchema.safeParse(draftAttributes);

    if (!result.success) {
      // Extract validation errors
      const errors: ValidationError[] = result.error.issues.map((e) => ({
        path: e.path.map(String),
        message: e.message,
      }));
      setValidationErrors(errors);
      toast.error("Validation failed. Please fix the errors.");
      return;
    }

    setValidationErrors([]);
    setIsCommitting(true);

    // Compute only the changed attributes
    const changedAttrs: Record<string, unknown> = {};
    for (const key of Object.keys(draftAttributes)) {
      if (
        JSON.stringify(draftAttributes[key]) !==
        JSON.stringify(entity.zoneAttributes[key])
      ) {
        changedAttrs[key] = draftAttributes[key];
      }
    }

    // Commit through the mutation hook
    const commitResult = await commitUpdate(entity._id, changedAttrs, {
      showToast: true,
    });

    setIsCommitting(false);

    if (commitResult.success) {
      toast.success("Changes saved", { duration: 600 });
    }
  }, [entity, zodSchema, draftAttributes, commitUpdate]);

  // Handle Cancel - reset to original values
  const handleCancel = useCallback(() => {
    if (entity?.zoneAttributes) {
      setDraftAttributes({ ...entity.zoneAttributes });
      setValidationErrors([]);
    }
  }, [entity?.zoneAttributes]);

  // Get validation error for a specific field
  const getFieldError = useCallback(
    (key: string): string | undefined => {
      const error = validationErrors.find((e) => e.path[0] === key);
      return error?.message;
    },
    [validationErrors],
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{uiSchema.displayName}</h3>
            <p className="text-muted-foreground text-xs">
              {entity._id ? `${entity._id.slice(0, 8)}...` : "Creating..."}
            </p>
          </div>
          <span className="rounded bg-muted px-2 py-1 text-xs">
            {entity.path}
          </span>
        </div>

        <Separator />
      </div>

      {/* Scrollable Attribute Fields */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4">
        {/* Validation Errors Summary */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <ul className="list-inside list-disc text-sm">
                {validationErrors.map((e) => (
                  <li key={e.path.join(".")}>
                    <strong>{e.path.join(".")}</strong>: {e.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {uiSchema.attributes.map((attrConfig) => (
          <AttributeField
            key={attrConfig.key}
            config={attrConfig}
            value={draftAttributes[attrConfig.key]}
            onChange={(value) => handleChange(attrConfig.key, value)}
            disabled={readOnly || isCommitting}
            error={getFieldError(attrConfig.key)}
          />
        ))}
      </div>

      {/* Footer with Save/Cancel buttons */}
      {hasChanges && !readOnly && (
        <div className="flex gap-2 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCancel}
            disabled={isCommitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleSave}
            disabled={isCommitting}
          >
            {isCommitting ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default SchemaPropertyPanel;
