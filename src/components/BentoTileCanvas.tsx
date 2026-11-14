import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GripHorizontal, Loader2, ScanSearch, Trash2 } from 'lucide-react';
import {
  bringTileToFront,
  computeCanvasHeightPx,
  moveTileFree,
  placeTileWithoutOverlap,
  ResizeDirection,
  resizeTile,
  TileRect,
} from '../utils/bentoLayout';
import { NoveltyAnalysisResult } from '../utils/tutorAgent';

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

export const BentoTileCanvas: React.FC<BentoTileCanvasProps> = ({
  tiles,
  slots,
  baseHeightPx = 556,
  locked = false,
  tutorName,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
}) => {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  const renderCustomTile = (tile: TileRect) => {
    const analysisState = tileAnalysis[tile.id];
    return (
      <section
        aria-label={tile.title || 'Carreau personnalisé'}
        className="sg-card-l1 flex h-full w-full min-w-0 flex-col justify-between gap-2 overflow-hidden rounded-[22px] p-4"
      >
        <div className="flex min-w-0 items-center justify-between gap-1.5">
          <input
            type="text"
            value={tile.title ?? ''}
            onChange={(e) => {
              onChangeTiles(
                tiles.map((t) => (t.id === tile.id ? { ...t, title: e.target.value } : t)),
              );
            }}
            aria-label="Titre du carreau"
            placeholder="Titre du carreau…"
            className="sg-focus-ring min-w-0 flex-1 rounded-md bg-transparent px-1 text-[13px] font-bold text-[#121417] placeholder:text-[#7A7D84]"
          />
          {onAnalyzeTile && (
            <button
              type="button"
              disabled={analysisState?.loading}
              onClick={() => void handleAnalyzeCustomTile(tile)}
              aria-label={`Analyser ${tile.title || 'ce carreau'} avec ${tutorName ?? 'le tuteur'}`}
              title={`Analyser avec ${tutorName ?? 'le tuteur'}`}
              className="sg-focus-ring sg-btn-secondary flex h-[24px] shrink-0 items-center gap-1 rounded-full px-2 text-[10.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
            >
              {analysisState?.loading ? (
                <Loader2 className="h-[11px] w-[11px] animate-spin" />
              ) : (
                <ScanSearch className="h-[11px] w-[11px]" strokeWidth={2.2} />
              )}
              <span>{tutorName ?? 'Analyser'}</span>
            </button>
          )}
          {!locked && (
            <button
              type="button"
              onClick={() => onChangeTiles(tiles.filter((t) => t.id !== tile.id))}
              aria-label={`Supprimer ${tile.title || 'ce carreau'}`}
              title="Supprimer ce carreau"
              className="sg-focus-ring flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[#55585F] transition-colors hover:bg-white/80 hover:text-[#DC2626]"
            >
              <Trash2 className="h-[13px] w-[13px]" strokeWidth={2} />
            </button>
          )}
        </div>

        <textarea
          value={tile.note ?? ''}
          onChange={(e) => {
            onChangeTiles(
              tiles.map((t) => (t.id === tile.id ? { ...t, note: e.target.value } : t)),
            );
          }}
          aria-label="Contenu du carreau"
          placeholder="Écris tes notes, rappels ou points de cours ici…"
          className="sg-focus-ring sg-glass-subtile min-h-0 flex-1 resize-none rounded-[14px] p-3 text-[12px] leading-relaxed text-[#1C1E22] placeholder:text-[#666A72]"
        />

        {analysisState?.error && (
          <p className="shrink-0 text-[11px] font-medium text-[#991B1B]">
            {analysisState.error}
          </p>
        )}

        {analysisState?.result && (
          <div className="sg-glass-subtile shrink-0 rounded-[12px] px-2.5 py-2 text-[11px] leading-snug text-[#121417]">
            <div className="font-bold text-[var(--accent)]">
              Analyse de {tutorName ?? 'ton tuteur'}
            </div>
            <p className="mt-0.5 line-clamp-2">{analysisState.result.summary}</p>
          </div>
        )}
      </section>
    );
  };

  if (!isDesktop) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-[12px]">
        {tiles.map((tile) => {
          const content = tile.isCustom ? renderCustomTile(tile) : slotMap.get(tile.id);
          if (!content) return null;
          return (
            <div
              key={tile.id}
              className={`@container w-full min-w-0 ${tile.isCustom ? 'min-h-[180px]' : ''}`}
            >
              {content}
            </div>
          );
        })}
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
        const content = tile.isCustom ? renderCustomTile(tile) : slotMap.get(tile.id);
        if (!content) return null;
        const isInteracting = activeTileId === tile.id;
        const activeTile =
          dragPreview && dragPreview.id === tile.id ? dragPreview.rect : tile;

        return (
          <div
            key={tile.id}
            data-tile-id={tile.id}
            data-no-swipe="true"
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

              {!locked && (
                <>
                  {/* Discreet top-center drag handle for repositioning any tile */}
                  <button
                    type="button"
                    data-no-swipe="true"
                    onPointerDown={(e) => startInteraction(e, tile, 'move')}
                    aria-label="Déplacer ce cadre"
                    title="Glisser pour déplacer ce cadre"
                    className="sg-focus-ring absolute top-[6px] left-1/2 z-30 flex h-[16px] w-[36px] -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#55585F] opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100 active:cursor-grabbing focus-visible:opacity-100"
                  >
                    <GripHorizontal className="h-[11px] w-[11px]" strokeWidth={2.2} />
                  </button>

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
  );
};
