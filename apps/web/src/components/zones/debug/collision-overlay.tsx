// CollisionDebugOverlay Component
// Shows fading wireframe boxes when collisions are detected for debugging

import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { OBB2D } from "@/lib/types/layout-editor";
import { setCollisionDebugCallback } from "@/lib/utils/collision";

// ============================================================================
// Collision Debug Store (simple module-level state)
// ============================================================================

interface CollisionDebugEntry {
  id: string;
  obbA: OBB2D;
  obbB: OBB2D;
  heightA: number;
  heightB: number;
  timestamp: number;
  duration: number; // in milliseconds
}

let debugEntries: CollisionDebugEntry[] = [];
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function addCollisionDebug(
  obbA: OBB2D,
  obbB: OBB2D,
  heightA = 2,
  heightB = 2,
  duration = 2000,
) {
  const entry: CollisionDebugEntry = {
    id: crypto.randomUUID(),
    obbA,
    obbB,
    heightA,
    heightB,
    timestamp: Date.now(),
    duration,
  };
  debugEntries.push(entry);
  notifyListeners();
}

function removeExpiredEntries() {
  const now = Date.now();
  const before = debugEntries.length;
  debugEntries = debugEntries.filter(
    (entry) => now - entry.timestamp < entry.duration,
  );
  if (debugEntries.length !== before) {
    notifyListeners();
  }
}

function useCollisionDebugEntries() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return debugEntries;
}

// ============================================================================
// Debug Box Component (renders a single OBB as wireframe)
// ============================================================================

interface DebugOBBBoxProps {
  obb: OBB2D;
  height: number;
  color: number;
  opacity: number;
}

function DebugOBBBox({ obb, height, color, opacity }: DebugOBBBoxProps) {
  // Calculate rotation from cos/sin
  const rotationY = Math.atan2(obb.sin, obb.cos);

  return (
    <group
      position={[obb.centerX, height / 2, obb.centerZ]}
      rotation={[0, rotationY, 0]}
    >
      <Box args={[obb.halfWidth * 2, height, obb.halfDepth * 2]}>
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={opacity}
          depthTest={false}
        />
      </Box>
    </group>
  );
}

// ============================================================================
// Collision Debug Entry Component (handles fading)
// ============================================================================

interface CollisionDebugEntryViewProps {
  entry: CollisionDebugEntry;
}

function CollisionDebugEntryView({ entry }: CollisionDebugEntryViewProps) {
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.duration - elapsed;

    if (remaining <= 0) {
      setOpacity(0);
      removeExpiredEntries();
    } else {
      // Fade out over the last 2 seconds
      const fadeStart = entry.duration - 2000;
      if (elapsed > fadeStart) {
        const fadeProgress = (elapsed - fadeStart) / 2000;
        setOpacity(1 - fadeProgress);
      } else {
        setOpacity(1);
      }
    }
  });

  if (opacity <= 0) return null;

  return (
    <>
      {/* Box A - Red (the moving box) */}
      <DebugOBBBox
        obb={entry.obbA}
        height={entry.heightA}
        color={0xff0000}
        opacity={opacity * 0.8}
      />
      {/* Box B - Orange (the stationary box) */}
      <DebugOBBBox
        obb={entry.obbB}
        height={entry.heightB}
        color={0xff8800}
        opacity={opacity * 0.8}
      />
    </>
  );
}

// ============================================================================
// Main Overlay Component
// ============================================================================

interface CollisionDebugOverlayProps {
  enabled?: boolean;
}

export function CollisionDebugOverlay({
  enabled = false,
}: CollisionDebugOverlayProps) {
  const entries = useCollisionDebugEntries();

  // Register the debug callback only when enabled
  useEffect(() => {
    if (enabled) {
      setCollisionDebugCallback((obbA, obbB, heightA, heightB) => {
        addCollisionDebug(obbA, obbB, heightA, heightB);
      });
    } else {
      setCollisionDebugCallback(null);
    }

    return () => {
      setCollisionDebugCallback(null);
    };
  }, [enabled]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(removeExpiredEntries, 1000);
    return () => clearInterval(interval);
  }, []);

  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <CollisionDebugEntryView key={entry.id} entry={entry} />
      ))}
    </>
  );
}
