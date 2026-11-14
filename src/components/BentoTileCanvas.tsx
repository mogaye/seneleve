import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GripHorizontal, Maximize2 } from 'lucide-react';
import { ClassExperience } from '../data/studyData';
import {
  bringTileToFront,
  computeCanvasHeightPx,
  moveTileFree,
  placeTileWithoutOverlap,
  ResizeDirection,
  resizeTile,
  TileRect,
} from '../utils/bentoLayout';
import { NoveltyAnalysisResult, SubjectTutorPersona } from '../utils/tutorAgent';
import { FormatIndex } from '../utils/wireframeState';
import { CustomTileCard } from './CustomTileCard';
import { TileFullPageView } from './TileFullPageView';

export interface BuiltInTileSlot {
  id: string;
  render: () => React.ReactNode;
}

interface BentoTileCanvasProps {
  tiles: TileRect[];
  slots: BuiltInTileSlot[];
  baseHeightPx?: number;
  locked?: boolean;
  tutorName?: string;
  tutor?: SubjectTutorPersona;
  formatIndex?: FormatIndex;
  experience?: ClassExperience;
  availableSubjects?: string[];
  openTileId?: string | null;
  onSelectOpenTileId?: (tileId: string | null) => void;
  onOpenTilePage?: (tile: TileRect) => void;
  onOpenTutor?: () => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onChangeTiles: (next: TileRect[]) => void;
  onBringToFront: (tileId: string) => void;
}

const RESIZE_HANDLES: {
  dir: ResizeDirection;
  className: string;
  label: string;
}[] = [
  { dir: 'n', className: 'top-0 left-3 right-3 h-[7px] cursor-ns-resize', label: 'Redimensionner par le haut' },
  { dir: 's', className: 'bottom-0 left-3 right-3 h-[7px] cursor-ns-resize', label: 'Redimensionner par le bas' },
  { dir: 'e', className: 'top-3 bottom-3 right-0 w-[7px] cursor-ew-resize', label: 'Redimensionner par la droite' },
  { dir: 'w', className: 'top-3 bottom-3 left-0 w-[7px] cursor-ew-resize', label: 'Redimensionner par la gauche' },
  { dir: 'nw', className: 'top-0 left-0 h-[12px] w-[12px] cursor-nwse-resize', label: 'Redimensionner coin haut gauche' },
  { dir: 'ne', className: 'top-0 right-0 h-[12px] w-[12px] cursor-nesw-resize', label: 'Redimensionner coin haut droit' },
  { dir: 'sw', className: 'bottom-0 left-0 h-[12px] w-[12px] cursor-nesw-resize', label: 'Redimensionner coin bas gauche' },
  { dir: 'se', className: 'bottom-0 right-0 h-[12px] w-[12px] cursor-nwse-resize', label: 'Redimensionner coin bas droit' },
];

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

export const BentoTileCanvas: React.FC<BentoTileCanvasProps> = ({
  tiles,
  slots,
  baseHeightPx = 556,
  locked = false,
  tutorName,
  tutor,
  formatIndex = 0,
  experience,
  availableSubjects = [],
  openTileId = null,
  onSelectOpenTileId,
  onOpenTilePage,
  onOpenTutor,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
}) => {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverIdleTimerRef = useRef<number | null>(null);

  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);
  const [hoverIdleHidden, setHoverIdleHidden] = useState(false);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [tileAnalysis, setTileAnalysis] = useState<
    Record<string, { loading: boolean; error?: string; result?: NoveltyAnalysisResult }>
  >({});
  const [dragPreview, setDragPreview] = useState<{
    id: string;
    rect: TileRect;
    dropRect: TileRect;
  } | null>(null);

  useEffect(() => {
    if (locked) {
      setActiveTileId(null);
      setDragPreview(null);
    }
  }, [locked]);

  useEffect(() => {
    return () => {
      if (hoverIdleTimerRef.current !== null) {
        window.clearTimeout(hoverIdleTimerRef.current);
      }
    };
  }, []);

  const scheduleHoverIdleHide = (tileId: string) => {
    if (hoverIdleTimerRef.current !== null) {
      window.clearTimeout(hoverIdleTimerRef.current);
    }
    setHoveredTileId(tileId);
    setHoverIdleHidden(false);
    hoverIdleTimerRef.current = window.setTimeout(() => {
      setHoverIdleHidden(true);
      hoverIdleTimerRef.current = null;
    }, 2100);
  };

  const clearTileHover = (tileId: string) => {
    if (hoveredTileId === tileId) {
      if (hoverIdleTimerRef.current !== null) {
        window.clearTimeout(hoverIdleTimerRef.current);
        hoverIdleTimerRef.current = null;
      }
      setHoveredTileId(null);
      setHoverIdleHidden(false);
    }
  };

  const effectiveBaseHeight = Math.max(260, baseHeightPx);

  const slotMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    slots.forEach((s) => map.set(s.id, s.render()));
    return map;
  }, [slots]);

  const canvasHeightPx = useMemo(
    () => computeCanvasHeightPx(tiles, effectiveBaseHeight),
    [tiles, effectiveBaseHeight],
  );

  const startInteraction = (
    event: React.PointerEvent<HTMLElement>,
    tile: TileRect,
    mode: 'move' | ResizeDirection,
  ) => {
    if (locked) return;
    event.preventDefault();
    event.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const brought = bringTileToFront(tiles, tile.id);
    onChangeTiles(brought);
    onBringToFront(tile.id);
    setActiveTileId(tile.id);

    const startRect = container.getBoundingClientRect();
    const baseWidth = Math.max(1, startRect.width);
    const baseHeight = effectiveBaseHeight;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startContainerLeft = startRect.left;
    const startContainerTop = startRect.top;
    const startTile = { ...tile, z: brought.find((t) => t.id === tile.id)?.z ?? tile.z };
    const baseTilesRef = { current: brought };
    const resolvedMoveRef = { current: brought };
    const scrollParent = container.closest('.sg-glass-shell') as HTMLElement | null;
    let latestClientX = startClientX;
    let latestClientY = startClientY;
    let rafId: number | null = null;

    const updateMove = (clientX: number, clientY: number) => {
      const currentRect = container.getBoundingClientRect();
      const dxPct =
        ((clientX - startClientX - (currentRect.left - startContainerLeft)) / baseWidth) * 100;
      const dyPct =
        ((clientY - startClientY - (currentRect.top - startContainerTop)) / baseHeight) * 100;
      const dragged = moveTileFree(startTile, dxPct, dyPct);
      const resolved = placeTileWithoutOverlap(dragged, baseTilesRef.current);
      const dropTarget = resolved.find((t) => t.id === tile.id) ?? dragged;
      resolvedMoveRef.current = resolved;
      setDragPreview({ id: tile.id, rect: dragged, dropRect: dropTarget });
    };

    const runAutoScroll = () => {
      rafId = null;
      if (mode !== 'move' || !scrollParent) return;
      const parentRect = scrollParent.getBoundingClientRect();
      const edgePx = 46;
      let delta = 0;
      if (latestClientY < parentRect.top + edgePx) {
        delta = -Math.max(4, Math.round(((parentRect.top + edgePx - latestClientY) / edgePx) * 14));
      } else if (latestClientY > parentRect.bottom - edgePx) {
        delta = Math.max(4, Math.round(((latestClientY - (parentRect.bottom - edgePx)) / edgePx) * 14));
      }
      if (delta !== 0) {
        const prevScroll = scrollParent.scrollTop;
        scrollParent.scrollTop += delta;
        if (scrollParent.scrollTop !== prevScroll) {
          updateMove(latestClientX, latestClientY);
        }
        rafId = window.requestAnimationFrame(runAutoScroll);
      }
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      latestClientX = moveEvent.clientX;
      latestClientY = moveEvent.clientY;
      if (mode === 'move') {
        updateMove(moveEvent.clientX, moveEvent.clientY);
        if (scrollParent && rafId === null) {
          const parentRect = scrollParent.getBoundingClientRect();
          if (
            moveEvent.clientY < parentRect.top + 46 ||
            moveEvent.clientY > parentRect.bottom - 46
          ) {
            rafId = window.requestAnimationFrame(runAutoScroll);
          }
        }
      } else {
        const currentRect = container.getBoundingClientRect();
        const dxPct =
          ((moveEvent.clientX - startClientX - (currentRect.left - startContainerLeft)) /
            baseWidth) *
          100;
        const dyPct =
          ((moveEvent.clientY - startClientY - (currentRect.top - startContainerTop)) /
            baseHeight) *
          100;
        const updatedTile = resizeTile(startTile, mode, dxPct, dyPct, baseTilesRef.current);
        const nextList = baseTilesRef.current.map((item) =>
          item.id === tile.id ? { ...updatedTile, z: item.z } : item,
        );
        baseTilesRef.current = nextList;
        onChangeTiles(nextList);
      }
    };

    const onPointerUp = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (mode === 'move') {
        setDragPreview(null);
        onChangeTiles(resolvedMoveRef.current);
      }
      setActiveTileId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleAnalyzeCustomTile = async (tile: TileRect) => {
    if (!onAnalyzeTile) return;
    setTileAnalysis((prev) => ({ ...prev, [tile.id]: { loading: true } }));
    try {
      const result = await onAnalyzeTile(tile);
      setTileAnalysis((prev) => ({ ...prev, [tile.id]: { loading: false, result } }));
    } catch (err) {
      setTileAnalysis((prev) => ({
        ...prev,
        [tile.id]: {
          loading: false,
          error: err instanceof Error ? err.message : 'Analyse indisponible.',
        },
      }));
    }
  };

  const updateSingleTile = (updated: TileRect) => {
    onChangeTiles(tiles.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteSingleTile = (tileId: string) => {
    onChangeTiles(tiles.filter((t) => t.id !== tileId));
  };

  const triggerOpenTilePage = (tile: TileRect) => {
    if (onOpenTilePage) {
      onOpenTilePage(tile);
    } else {
      onSelectOpenTileId?.(tile.id);
    }
  };

  const renderTileContent = (tile: TileRect) => {
    if (tile.isCustom) {
      return (
        <CustomTileCard
          tile={tile}
          locked={locked}
          tutorName={tutorName}
          availableSubjects={availableSubjects}
          analysisState={tileAnalysis[tile.id]}
          onUpdateTile={updateSingleTile}
          onDeleteTile={() => deleteSingleTile(tile.id)}
          onAnalyzeTile={onAnalyzeTile ? () => void handleAnalyzeCustomTile(tile) : undefined}
          onOpenFullPage={() => triggerOpenTilePage(tile)}
        />
      );
    }
    return slotMap.get(tile.id) ?? null;
  };

  const matchingOpenTile = openTileId ? tiles.find((t) => t.id === openTileId) ?? null : null;

  const fullPageModal =
    experience && matchingOpenTile && onSelectOpenTileId ? (
      <TileFullPageView
        open={Boolean(matchingOpenTile)}
        formatIndex={formatIndex}
        experience={experience}
        tiles={tiles}
        activeTileId={matchingOpenTile.id}
        slots={slots}
        locked={locked}
        tutor={tutor}
        onSelectTileId={(nextId) => onSelectOpenTileId(nextId)}
        onUpdateTile={updateSingleTile}
        onDeleteTile={deleteSingleTile}
        onAnalyzeTile={onAnalyzeTile}
        onOpenTutor={onOpenTutor}
        onClose={() => onSelectOpenTileId(null)}
      />
    ) : null;

  if (!isDesktop) {
    return (
      <>
        <div className="flex w-full min-w-0 flex-col gap-[12px]">
          {tiles.map((tile) => {
            const content = renderTileContent(tile);
            if (!content) return null;
            const isHoverActive = hoveredTileId === tile.id && !hoverIdleHidden;
            return (
              <div
                key={tile.id}
                data-tile-id={tile.id}
                onPointerEnter={() => scheduleHoverIdleHide(tile.id)}
                onPointerMove={() => scheduleHoverIdleHide(tile.id)}
                onPointerLeave={() => clearTileHover(tile.id)}
                className={`@container relative w-full min-w-0 ${
                  tile.isCustom ? 'min-h-[270px]' : ''
                }`}
              >
                {content}
                {onOpenTilePage && (
                  <button
                    type="button"
                    data-no-swipe="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerOpenTilePage(tile);
                    }}
                    aria-label="Ouvrir ce carreau en page"
                    title="Ouvrir ce carreau en page"
                    className={`sg-focus-ring absolute top-[5px] left-1/2 z-30 flex h-[20px] w-[20px] -translate-x-1/2 items-center justify-center rounded-full border border-white/85 bg-white/90 text-[#55585F] shadow-xs backdrop-blur-sm transition-opacity duration-200 hover:text-[var(--accent)] focus-visible:pointer-events-auto focus-visible:opacity-100 ${
                      isHoverActive
                        ? 'pointer-events-auto opacity-95'
                        : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <Maximize2 className="h-[10px] w-[10px]" strokeWidth={2.2} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {fullPageModal}
      </>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${canvasHeightPx}px` }}
      >
        {dragPreview && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-30 p-[5px]"
            style={{
              left: `${dragPreview.dropRect.x}%`,
              top: `${Math.round((dragPreview.dropRect.y / 100) * effectiveBaseHeight)}px`,
              width: `${dragPreview.dropRect.w}%`,
              height: `${Math.round((dragPreview.dropRect.h / 100) * effectiveBaseHeight)}px`,
            }}
          >
            <div className="h-full w-full rounded-[22px] border-2 border-dashed border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)]" />
          </div>
        )}

        {tiles.map((tile) => {
          const content = renderTileContent(tile);
          if (!content) return null;
          const isInteracting = activeTileId === tile.id;
          const activeTile =
            dragPreview && dragPreview.id === tile.id ? dragPreview.rect : tile;
          const isExpandVisible =
            hoveredTileId === tile.id && !hoverIdleHidden && !isInteracting;

          return (
            <div
              key={tile.id}
              data-tile-id={tile.id}
              data-no-swipe="true"
              onPointerEnter={() => scheduleHoverIdleHide(tile.id)}
              onPointerMove={() => scheduleHoverIdleHide(tile.id)}
              onPointerLeave={() => clearTileHover(tile.id)}
              className="group absolute p-[5px]"
              style={{
                left: `${activeTile.x}%`,
                top: `${Math.round((activeTile.y / 100) * effectiveBaseHeight)}px`,
                width: `${activeTile.w}%`,
                height: `${Math.round((activeTile.h / 100) * effectiveBaseHeight)}px`,
                zIndex: isInteracting ? 50 : (tile.z ?? 1),
              }}
            >
              <div
                className={`@container relative h-full w-full min-w-0 rounded-[22px] transition-shadow duration-150 ${
                  isInteracting
                    ? 'ring-2 ring-[var(--accent)] shadow-[0_14px_36px_rgba(var(--accent-dark-rgb),0.22)]'
                    : ''
                }`}
              >
                {content}

                {/* Subtle top-center icon-only page trigger (disappears automatically on idle) */}
                {locked ? (
                  onOpenTilePage && (
                    <button
                      type="button"
                      data-no-swipe="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerOpenTilePage(tile);
                      }}
                      aria-label="Ouvrir ce carreau en page"
                      title="Ouvrir ce carreau en page"
                      className={`sg-focus-ring absolute top-[5px] left-1/2 z-30 flex h-[20px] w-[20px] -translate-x-1/2 items-center justify-center rounded-full border border-white/85 bg-white/90 text-[#55585F] shadow-xs backdrop-blur-sm transition-opacity duration-200 hover:border-[var(--accent-border)] hover:text-[var(--accent)] focus-visible:pointer-events-auto focus-visible:opacity-100 ${
                        isExpandVisible
                          ? 'pointer-events-auto opacity-95'
                          : 'pointer-events-none opacity-0'
                      }`}
                    >
                      <Maximize2 className="h-[10px] w-[10px]" strokeWidth={2.2} />
                    </button>
                  )
                ) : (
                  <>
                    <div
                      data-no-swipe="true"
                      className={`absolute top-[5px] left-1/2 z-30 flex h-[20px] -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/85 bg-white/90 px-1 shadow-xs backdrop-blur-sm transition-opacity duration-200 focus-within:pointer-events-auto focus-within:opacity-100 ${
                        isExpandVisible
                          ? 'pointer-events-auto opacity-95'
                          : 'pointer-events-none opacity-0'
                      }`}
                    >
                      <button
                        type="button"
                        data-no-swipe="true"
                        onPointerDown={(e) => startInteraction(e, tile, 'move')}
                        aria-label="Déplacer ce cadre"
                        title="Glisser pour déplacer ce cadre"
                        className="sg-focus-ring flex h-[16px] w-[22px] cursor-grab items-center justify-center rounded-full text-[#55585F] hover:text-[#121417] active:cursor-grabbing"
                      >
                        <GripHorizontal className="h-[10.5px] w-[10.5px]" strokeWidth={2.2} />
                      </button>
                      {onOpenTilePage && (
                        <>
                          <span aria-hidden="true" className="h-[10px] w-[1px] bg-[#D7DCE6]" />
                          <button
                            type="button"
                            data-no-swipe="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerOpenTilePage(tile);
                            }}
                            aria-label="Ouvrir ce carreau en page"
                            title="Ouvrir ce carreau en page"
                            className="sg-focus-ring flex h-[16px] w-[18px] items-center justify-center rounded-full text-[#55585F] hover:text-[var(--accent)]"
                          >
                            <Maximize2 className="h-[10px] w-[10px]" strokeWidth={2.2} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* 8 interactive edge & corner resize zones */}
                    {RESIZE_HANDLES.map((handle) => (
                      <div
                        key={handle.dir}
                        role="separator"
                        data-no-swipe="true"
                        aria-label={handle.label}
                        onPointerDown={(e) => startInteraction(e, tile, handle.dir)}
                        className={`absolute z-20 rounded-full transition-colors hover:bg-[rgba(var(--accent-rgb),0.22)] ${handle.className}`}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {fullPageModal}
    </>
  );
};
