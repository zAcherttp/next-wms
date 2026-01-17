// Rack component - wireframe visualization with shelves
// Migrated to use new SmartStore with StorageEntity

import { TransformControls, useCursor } from "@react-three/drei";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { useDebugContext } from "@/components/zones/canvas-3d";
import { LockIcon } from "@/components/zones/entity-locked";
import { RackFrame } from "@/components/zones/rack-frame";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { brightenHex } from "@/lib/utils";
import { ROTATION_SNAP, TRANSLATION_SNAP } from "@/lib/utils/constants";
import { useLayoutStore } from "@/store/layout-editor-store";

// ============================================================================
// Types for rack attributes
// ============================================================================

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// ============================================================================
// Rack Component
// ============================================================================

export const Rack: React.FC<{ rackId: string }> = ({ rackId }) => {
  // Get entity from new store (rackId is now tempId)
  const entity = useLayoutStore((s) => s.entities.get(rackId));
  const selectedEntityId = useLayoutStore((s) => s.selectedEntityId);
  const transformMode = useLayoutStore((s) => s.transformMode);
  const selectEntity = useLayoutStore((s) => s.selectEntity);

  // Use the commit hook for validated updates
  const { commitUpdate } = useEntityMutation();

  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const isSelected = selectedEntityId === rackId;

  // Debug visualization context
  const { showCollisionBounds } = useDebugContext();

  // Store original position for rollback on collision
  const originalPositionRef = useRef<Vec3 | null>(null);
  const originalRotationRef = useRef<Vec3 | null>(null);

  // Extract attributes from entity
  const { position, dimensions, rotation, isLocked, isAccessible } =
    useMemo(() => {
      if (!entity?.zoneAttributes) {
        return {
          position: { x: 0, y: 0, z: 0 },
          dimensions: { width: 1, height: 2, depth: 0.5 },
          rotation: { x: 0, y: 0, z: 0 },
          isLocked: false,
          isAccessible: true,
        };
      }
      const attrs = entity.zoneAttributes;
      return {
        position: (attrs.position as Vec3) ?? { x: 0, y: 0, z: 0 },
        dimensions: (attrs.dimensions as Dimensions) ?? {
          width: 1,
          height: 2,
          depth: 0.5,
        },
        rotation: (attrs.rotation as Vec3) ?? { x: 0, y: 0, z: 0 },
        isLocked: (attrs.isLocked as boolean) ?? false,
        isAccessible: (attrs.isAccessible as boolean) ?? true,
      };
    }, [entity]);

  // Callback to apply confirmed transforms with validation + collision + Convex sync
  // Positions are now GLOBAL - TransformControls with space="world" returns world coords
  const handleConfirm = useCallback(
    async (updates: { position?: Vec3; rotation?: Vec3 }) => {
      if (isCommitting) return;
      setIsCommitting(true);

      // Global position updates - only apply guardrails
      const globalUpdates = { ...updates };
      if (updates.position) {
        // Round to 2 decimal places to avoid floating-point precision issues
        globalUpdates.position = {
          x: Math.round(updates.position.x * 100) / 100,
          y: 0, // Guardrail: always ground level
          z: Math.round(updates.position.z * 100) / 100,
        };
      }

      // Enforce rotation guardrail: only y rotation allowed
      if (updates.rotation) {
        globalUpdates.rotation = {
          x: 0, // Guardrail: no x rotation
          y: updates.rotation.y,
          z: 0, // Guardrail: no z rotation
        };
      }

      // commitUpdate handles: validation, floor transfer detection, 4-corner bounds, collision
      const result = await commitUpdate(rackId, globalUpdates, {
        showToast: true,
      });

      if (!result.success && groupRef.current) {
        // Rollback visual position on failure
        if (originalPositionRef.current) {
          groupRef.current.position.set(
            originalPositionRef.current.x,
            dimensions.height / 2,
            originalPositionRef.current.z,
          );
        }
        if (originalRotationRef.current) {
          groupRef.current.rotation.set(
            originalRotationRef.current.x,
            originalRotationRef.current.y,
            originalRotationRef.current.z,
          );
        }
      }

      setIsCommitting(false);
    },
    [rackId, commitUpdate, dimensions, isCommitting],
  );

  // Store original position when transform starts
  // const handleTransformStart = useCallback(() => {
  //   originalPositionRef.current = position;
  //   originalRotationRef.current = rotation;
  // }, [position, rotation]);

  useCursor(hovered);

  if (!entity || entity.isDeleted) return null;

  // Check if rack is locked (from zoneAttributes)
  const isRackLocked = isLocked;

  // Disable transform controls for locked racks
  const showTranslateControls =
    isSelected && transformMode === "translate" && !isRackLocked;
  const showRotateControls =
    isSelected && transformMode === "rotate" && !isRackLocked;

  const color = isRackLocked
    ? "#EF4444" // Red for locked
    : isAccessible === false
      ? "#FFA500"
      : "#3FA9F5";

  const handleClick = (
    e: React.MouseEvent | { stopPropagation: () => void },
  ) => {
    e.stopPropagation();
    selectEntity(rackId);
  };

  const outlineColor = brightenHex(color, 0.3);

  return (
    <>
      <group
        ref={groupRef}
        position={[position.x, dimensions.height / 2, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
      >
        {/* Structural frame */}
        <RackFrame
          dimensions={dimensions}
          color={color}
          showCrossBeams={!isSelected}
        />

        {/* Shelf geometry with bins */}
        {/* {rack.shelves.length > 0 && (
          <ShelfGeometry
            rackDimensions={dimensions}
            shelves={rack.shelves}
            frameColor={isSelected ? outlineColor : "#888888"}
          />
        )} */}

        {/* Invisible hit box for selection */}
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          visible={false}
        >
          <boxGeometry
            args={[dimensions.width, dimensions.height, dimensions.depth]}
          />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Selection highlight outline */}
        {isSelected && (
          <lineSegments>
            <edgesGeometry
              args={[
                new THREE.BoxGeometry(
                  dimensions.width,
                  dimensions.height,
                  dimensions.depth,
                ),
              ]}
            />
            <lineBasicMaterial color={outlineColor} linewidth={2} />
          </lineSegments>
        )}

        {/* Lock icon for locked racks */}
        {isRackLocked && (
          <LockIcon heightOffset={dimensions.height / 2 + 0.5} />
        )}
      </group>
      {showTranslateControls && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          space="world"
          translationSnap={TRANSLATION_SNAP}
          showY={false}
          onMouseUp={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              handleConfirm({
                position: { x: pos.x, y: pos.y, z: pos.z },
              });
            }
          }}
        />
      )}
      {showRotateControls && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="rotate"
          space="world"
          rotationSnap={ROTATION_SNAP}
          showX={false}
          showZ={false}
          onMouseUp={() => {
            if (groupRef.current) {
              const rot = groupRef.current.rotation;
              handleConfirm({
                rotation: { x: rot.x, y: rot.y, z: rot.z },
              });
            }
          }}
        />
      )}

      {/* Debug: Collision bounds wireframe */}
      {showCollisionBounds && (
        <group
          position={[position.x, dimensions.height / 2, position.z]}
          rotation={[rotation.x, rotation.y, rotation.z]}
        >
          <mesh>
            <boxGeometry
              args={[dimensions.width, dimensions.height, dimensions.depth]}
            />
            <meshBasicMaterial
              color={0x00ff00}
              wireframe
              opacity={0.5}
              transparent
            />
          </mesh>
        </group>
      )}
    </>
  );
};
