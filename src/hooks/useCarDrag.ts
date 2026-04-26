import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';

export interface Point {
  x: number;
  y: number;
}

interface UseCarDragOptions {
  carWidth: number;
  carHeight: number;
  initial: Point;
}

export function useCarDrag(
  mapRef: RefObject<HTMLElement | null>,
  { carWidth, carHeight, initial }: UseCarDragOptions,
) {
  const [position, setPosition] = useState<Point>(initial);
  const [target, setTarget] = useState<Point>(initial);
  const [dragging, setDragging] = useState(false);
  const targetRef = useRef(target);
  const posRef = useRef(position);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    posRef.current = position;
  }, [position]);

  const clampToMap = (next: Point): Point => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return next;
    return {
      x: Math.min(Math.max(next.x, 8), Math.max(8, rect.width - carWidth - 8)),
      y: Math.min(Math.max(next.y, 42), Math.max(42, rect.height - carHeight - 8)),
    };
  };

  const pointFromEvent = (e: PointerEvent): Point | null => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return clampToMap({
      x: e.clientX - rect.left - carWidth / 2,
      y: e.clientY - rect.top - carHeight / 2,
    });
  };

  useEffect(() => {
    const animate = () => {
      const cur = posRef.current;
      const dest = targetRef.current;
      const next = {
        x: cur.x + (dest.x - cur.x) * 0.34,
        y: cur.y + (dest.y - cur.y) * 0.34,
      };
      if (Math.abs(next.x - cur.x) > 0.1 || Math.abs(next.y - cur.y) > 0.1) {
        posRef.current = next;
        setPosition(next);
      }
      rafRef.current = window.requestAnimationFrame(animate);
    };
    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    const next = pointFromEvent(e);
    if (!next) return;
    setDragging(true);
    setTarget(next);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const next = pointFromEvent(e);
    if (next) setTarget(next);
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

  const jump = () => {
    const cur = posRef.current;
    setPosition({ x: cur.x, y: Math.max(42, cur.y - 10) });
    window.setTimeout(() => setPosition(posRef.current), 120);
  };

  return {
    position,
    target,
    dragging,
    setTarget: (next: Point) => setTarget(clampToMap(next)),
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    jump,
  };
}
