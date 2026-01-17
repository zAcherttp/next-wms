/**
 * GhostPreview - Transparent preview for entity placement
 * Shows a ghost mesh that follows mouse position before placement confirmation
 */

import { useFrame, useThree } from "@react-three/fiber";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLayoutStore } from "@/store/layout-editor-store";

// ============================================================================
// Ghost Mesh Component
// ============================================================================

interface GhostMeshProps {
  dimensions: { width: number; height: number; depth: number };
  color?: string;
}

function GhostMesh({ dimensions, color = "#3b82f6" }: GhostMeshProps) {
  return (
    <mesh>
      <boxGeometry
        args={[dimensions.width, dimensions.height, dimensions.depth]}
      />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================================================
// Ghost Preview Component
// ============================================================================

export const GhostPreview: React.FC = () => {
  const ghostEntity = useLayoutStore((s) => s.ghostEntity);
  const updateGhostPosition = useLayoutStore((s) => s.updateGhostPosition);
  const confirmGhost = useLayoutStore((s) => s.confirmGhost);
  const cancelGhost = useLayoutStore((s) => s.cancelGhost);
  const selectEntity = useLayoutStore((s) => s.selectEntity);

  const { raycaster, camera, gl } = useThree();
  const mouseRef = useRef(new THREE.Vector2());
  const floorPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);

  // Track mouse position
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl.domElement],
  );

  // Handle click to place
  const handleClick = useCallback(() => {
    if (!ghostEntity) return;
    const tempId = confirmGhost();
    if (tempId) {
      selectEntity(tempId);
    }
  }, [ghostEntity, confirmGhost, selectEntity]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!ghostEntity) return;

      if (event.key === "Escape") {
        cancelGhost();
      } else if (event.key === "Enter") {
        const tempId = confirmGhost();
        if (tempId) {
          selectEntity(tempId);
        }
      }
    },
    [ghostEntity, cancelGhost, confirmGhost, selectEntity],
  );

  // Add event listeners
  useEffect(() => {
    if (!ghostEntity) return;

    const domElement = gl.domElement;
    domElement.addEventListener("mousemove", handleMouseMove);
    domElement.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    // Change cursor to crosshair
    domElement.style.cursor = "crosshair";

    return () => {
      domElement.removeEventListener("mousemove", handleMouseMove);
      domElement.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      domElement.style.cursor = "auto";
    };
  }, [ghostEntity, gl.domElement, handleMouseMove, handleClick, handleKeyDown]);

  // Update position every frame
  useFrame(() => {
    if (!ghostEntity) return;

    // Raycast to floor plane
    raycaster.setFromCamera(mouseRef.current, camera);
    raycaster.ray.intersectPlane(floorPlane, intersectionPoint);

    if (intersectionPoint) {
      // Snap to grid (1 unit grid)
      const snappedX = Math.round(intersectionPoint.x);
      const snappedZ = Math.round(intersectionPoint.z);

      // Get dimensions for centering
      const dims = ghostEntity.zoneAttributes.dimensions as
        | { width: number; depth: number }
        | undefined;
      const halfWidth = (dims?.width ?? 2) / 2;
      const halfDepth = (dims?.depth ?? 2) / 2;

      updateGhostPosition({
        x: snappedX - halfWidth,
        y: 0,
        z: snappedZ - halfDepth,
      });
    }
  });

  if (!ghostEntity) return null;

  const position = ghostEntity.zoneAttributes.position as
    | { x: number; y: number; z: number }
    | undefined;
  const dimensions = ghostEntity.zoneAttributes.dimensions as
    | { width: number; height: number; depth: number }
    | undefined;

  if (!position || !dimensions) return null;

  // Get block-specific color
  const blockColors: Record<string, string> = {
    floor: "#22c55e", // green
    rack: "#3b82f6", // blue
    obstacle: "#ef4444", // red
    entrypoint: "#8b5cf6", // purple
  };
  const color = blockColors[ghostEntity.storageBlockType] ?? "#3b82f6";

  return (
    <group
      position={[
        position.x + dimensions.width / 2,
        position.y + dimensions.height / 2,
        position.z + dimensions.depth / 2,
      ]}
    >
      <GhostMesh dimensions={dimensions} color={color} />
      {/* Wireframe outline for better visibility */}
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
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
    </group>
  );
};

export default GhostPreview;
