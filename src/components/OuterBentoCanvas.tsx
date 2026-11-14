import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import {
  bringTileToFront,
  computeCanvasHeightPx,
  MAX_OUTER_CANVAS_Y_PCT,
  moveTileFree,
  OUTER_BASE_HEIGHT_PX,
  OUTER_FRAME_MIN_BOUNDS,
  OuterFrameId,
  placeTileWithoutOverlap,
  ResizeDirection,
  resizeTile,
  TileRect,
} from '../utils/bentoLayout';

export interface OuterFrameSlot {
  id: OuterFrameId;
  label: string;
  render: () => React.ReactNode;
}

interface OuterBentoCanvasProps {
  frames: TileRect[];
  slots: OuterFrameSlot[];
  locked?: boolean;
  onChangeFrames: (next: TileRect[]) => void;
}

const OUTER_RESIZE_HANDLES: {
  dir: ResizeDirection;
  className: string;
  labelSuffix: string;
}[] = [
  { dir: 'n', className: 'top-0 left-3 right-3 h-[7px] cursor-ns-resize', labelSuffix: 'par le haut' },
  { dir: 's', className: 'bottom-0 left-3 right-3 h-[7px] cursor-ns-resize', labelSuffix: 'par le bas' },
  { dir: 'e', className: 'top-3 bottom-3 right-0 w-[7px] cursor-ew-resize', labelSuffix: 'par la droite' },
  { dir: 'w', className: 'top-3 bottom-3 left-0 w-[7px] cursor-ew-resize', labelSuffix: 'par la gauche' },
  { dir: 'nw', className: 'top-0 left-0 h-[12px] w-[12px] cursor-nwse-resize', labelSuffix: 'coin haut gauche' },
  { dir: 'ne', className: 'top-0 right-0 h-[12px] w-[12px] cursor-nesw-resize', labelSuffix: 'coin haut droit' },
  { dir: 'sw', className: 'bottom-0 left-0 h-[12px] w-[12px] cursor-nesw-resize', labelSuffix: 'coin bas gauche' },
  { dir: 'se', className: 'bottom-0 right-0 h-[12px] w-[12px] cursor-nwse-resize', labelSuffix: 'coin bas droit' },
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export const OuterBentoCanvas: React.FC<OuterBentoCanvasProps> = ({
  frames,
  slots,
  locked = false,
  onChangeFrames,
}) => {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    id: string;
    rect: TileRect;
    dropRect: TileRect;
  } | null>(null);

  useEffect(() => {
    if (locked) {
      setActiveFrameId(null);
      setDragPreview(null);
    }
  }, [locked]);

  const slotMap = useMemo(() => {
    const map = new Map<OuterFrameId, OuterFrameSlot>();
    slots.forEach((s) => map.set(s.id, s));
    return map;
  }, [slots]);

  const canvasHeightPx = useMemo(
    () => computeCanvasHeightPx(frames, OUTER_BASE_HEIGHT_PX),
    [frames],
  );

  const startInteraction = (
    event: React.PointerEvent<HTMLElement>,
    frame: TileRect,
    mode: 'move' | ResizeDirection,
  ) => {
    if (locked) return;
    event.preventDefault();
    event.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const brought = bringTileToFront(frames, frame.id);
    onChangeFrames(brought);
    setActiveFrameId(frame.id);

    const rect = container.getBoundingClientRect();
    const baseWidth = Math.max(1, rect.width);
    const baseHeight = OUTER_BASE_HEIGHT_PX;
    const startX = event.clientX;
    const startY = event.clientY;
    const startFrame = { ...frame, z: brought.find((f) => f.id === frame.id)?.z ?? frame.z };
    const baseFramesRef = { current: brought };
    const resolvedMoveRef = { current: brought };
    const bounds = OUTER_FRAME_MIN_BOUNDS[frame.id as OuterFrameId];

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dxPct = ((moveEvent.clientX - startX) / baseWidth) * 100;
      const dyPct = ((moveEvent.clientY - startY) / baseHeight) * 100;
      if (mode === 'move') {
        const dragged = moveTileFree(startFrame, dxPct, dyPct, MAX_OUTER_CANVAS_Y_PCT);
        const resolved = placeTileWithoutOverlap(
          dragged,
          baseFramesRef.current,
          MAX_OUTER_CANVAS_Y_PCT,
        );
        const dropTarget = resolved.find((f) => f.id === frame.id) ?? dragged;
        resolvedMoveRef.current = resolved;
        setDragPreview({ id: frame.id, rect: dragged, dropRect: dropTarget });
      } else {
        const updatedFrame = resizeTile(startFrame, mode, dxPct, dyPct, baseFramesRef.current, {
          minW: bounds.minW,
          minH: bounds.minH,
          maxH: bounds.maxH,
          maxCanvasY: MAX_OUTER_CANVAS_Y_PCT,
        });
        const nextList = baseFramesRef.current.map((item) =>
          item.id === frame.id ? { ...updatedFrame, z: item.z } : item,
        );
        baseFramesRef.current = nextList;
        onChangeFrames(nextList);
      }
    };

    const onPointerUp = () => {
      if (mode === 'move') {
        setDragPreview(null);
        onChangeFrames(resolvedMoveRef.current);
      }
      setActiveFrameId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  if (!isDesktop) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-[12px]">
        {slots.map((slot) => (
          <div key={slot.id} className="@container w-full min-w-0">
            {slot.render()}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${canvasHeightPx}px` }}
    >
      {dragPreview && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-30 p-[4px] lg:p-[5px]"
          style={{
            left: `${dragPreview.dropRect.x}%`,
            top: `${Math.round((dragPreview.dropRect.y / 100) * OUTER_BASE_HEIGHT_PX)}px`,
            width: `${dragPreview.dropRect.w}%`,
            height: `${Math.round((dragPreview.dropRect.h / 100) * OUTER_BASE_HEIGHT_PX)}px`,
          }}
        >
          <div className="h-full w-full rounded-[26px] border-2 border-dashed border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)]" />
        </div>
      )}

      {frames.map((frame) => {
        const slot = slotMap.get(frame.id as OuterFrameId);
        if (!slot) return null;
        const isInteracting = activeFrameId === frame.id;
        const isSlimBar = frame.id === 'outer-topbar' || frame.id === 'outer-sidebar';
        const activeFrame =
          dragPreview && dragPreview.id === frame.id ? dragPreview.rect : frame;

        return (
          <div
            key={frame.id}
            data-outer-frame-id={frame.id}
            data-no-swipe="true"
            className="group/outer absolute p-[4px] lg:p-[5px]"
            style={{
              left: `${activeFrame.x}%`,
              top: `${Math.round((activeFrame.y / 100) * OUTER_BASE_HEIGHT_PX)}px`,
              width: `${activeFrame.w}%`,
              height: `${Math.round((activeFrame.h / 100) * OUTER_BASE_HEIGHT_PX)}px`,
              zIndex: isInteracting ? 55 : (frame.z ?? 1),
            }}
          >
            <div
              className={`@container relative h-full w-full min-w-0 rounded-[26px] transition-shadow duration-150 ${
                isInteracting
                  ? 'ring-2 ring-[var(--accent)] shadow-[0_14px_38px_rgba(var(--accent-dark-rgb),0.24)]'
                  : ''
              }`}
            >
              {slot.render()}

              {!locked && (
                <>
                  {/* Outer frame move handle */}
                  <button
                    type="button"
                    data-no-swipe="true"
                    onPointerDown={(e) => startInteraction(e, frame, 'move')}
                    aria-label={`Déplacer ${slot.label}`}
                    title={`Glisser pour déplacer ${slot.label}`}
                    className={`sg-focus-ring absolute left-1/2 z-30 flex h-[15px] w-[34px] -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-white/85 bg-white/85 text-[#55585F] opacity-0 shadow-xs transition-opacity duration-150 group-hover/outer:opacity-100 active:cursor-grabbing focus-visible:opacity-100 ${
                      isSlimBar ? '-top-[5px]' : 'top-[2px]'
                    }`}
                  >
                    <GripHorizontal className="h-[10px] w-[10px]" strokeWidth={2.2} />
                  </button>

                  {/* 8 interactive edge & corner resize zones */}
                  {OUTER_RESIZE_HANDLES.map((handle) => {
                    const handleClass =
                      frame.id === 'outer-sidebar' && handle.dir === 'e'
                        ? 'top-11 bottom-3 right-0 w-[7px] cursor-ew-resize'
                        : handle.className;
                    return (
                      <div
                        key={handle.dir}
                        role="separator"
                        data-no-swipe="true"
                        aria-label={`Redimensionner ${slot.label} ${handle.labelSuffix}`}
                        onPointerDown={(e) => startInteraction(e, frame, handle.dir)}
                        className={`absolute z-20 rounded-full transition-colors hover:bg-[rgba(var(--accent-rgb),0.26)] ${handleClass}`}
                      />
                    );
                  })}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
