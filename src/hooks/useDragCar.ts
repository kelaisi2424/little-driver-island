import { useState } from 'react';
import type { PointerEvent } from 'react';

interface UseDragCarOptions {
  minX?: number;
  maxX?: number;
  initialX?: number;
}

export function useDragCar({
  minX = 16,
  maxX = 84,
  initialX = 50,
}: UseDragCarOptions = {}) {
  const [carX, setCarX] = useState(initialX);
  const [targetX, setTargetX] = useState(initialX);
  const [dragging, setDragging] = useState(false);

  const clamp = (value: number) => Math.min(maxX, Math.max(minX, value));

  const updateFromPointer = (e: PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const next = ((e.clientX - rect.left) / rect.width) * 100;
    setTargetX(clamp(next));
  };

  const onPointerDown = (e: PointerEvent) => {
    setDragging(true);
    updateFromPointer(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    updateFromPointer(e);
  };

  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  return {
    carX,
    targetX,
    dragging,
    setCarX,
    setTargetX: (value: number) => setTargetX(clamp(value)),
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}

