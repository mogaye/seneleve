import React, { useMemo, useRef, useState } from 'react';
import { GripHorizontal, Trash2 } from 'lucide-react';
import {
  bringTileToFront,
  computeCanvasHeightPx,
  moveTile,
  ResizeDirection,
  resizeTile,
  TileRect,
} from '../utils/bentoLayout';

export interface BuiltInTileSlot {
  id: string;
  render: () => React.ReactNode;
}

interface BentoTileCanvasProps {
  tiles: TileRect[];
  slots: BuiltInTileSlot[];
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

export const BentoTileCanvas: React.FC<BentoTileCanvasProps> = ({
  tiles,
  slots,
  onChangeTiles,
  onBringToFront,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);

  const slotMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    slots.forEach((s) => map.set(s.id, s.render()));
    return map;
  }, [slots]);

  const canvasHeightPx = useMemo(() => computeCanvasHeightPx(tiles, 556), [tiles]);

  const startInteraction = (
    event: React.PointerEvent<HTMLElement>,
    tile: TileRect,
    mode: 'move' | ResizeDirection,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    onBringToFront(tile.id);
    setActiveTileId(tile.id);

    const rect = container.getBoundingClientRect();
    const baseWidth = Math.max(1, rect.width);
    const baseHeight = 556;
    const startX = event.clientX;
    const startY = event.clientY;
    const startTile = { ...tile };
    const latestTilesRef = { current: bringTileToFront(tiles, tile.id) };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dxPct = ((moveEvent.clientX - startX) / baseWidth) * 100;
      const dyPct = ((moveEvent.clientY - startY) / baseHeight) * 100;

      const updatedTile =
        mode === 'move'
          ? moveTile(startTile, dxPct, dyPct)
          : resizeTile(startTile, mode, dxPct, dyPct);

      const nextList = latestTilesRef.current.map((item) =>
        item.id === tile.id ? { ...updatedTile, z: item.z } : item,
      );
      latestTilesRef.current = nextList;
      onChangeTiles(nextList);
    };

    const onPointerUp = () => {
      setActiveTileId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const renderCustomTile = (tile: TileRect) => (
    <section
      aria-label={tile.title || 'Carreau personnalisé'}
      className="sg-card-l1 flex h-full w-full flex-col justify-between overflow-hidden rounded-[22px] p-4"
    >
      <div className="flex items-center justify-between gap-2">
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
        <button
          type="button"
          onClick={() => onChangeTiles(tiles.filter((t) => t.id !== tile.id))}
          aria-label={`Supprimer ${tile.title || 'ce carreau'}`}
          title="Supprimer ce carreau"
          className="sg-focus-ring flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[#55585F] transition-colors hover:bg-white/80 hover:text-[#DC2626]"
        >
          <Trash2 className="h-[13px] w-[13px]" strokeWidth={2} />
        </button>
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
        className="sg-focus-ring sg-glass-subtile mt-2 min-h-0 flex-1 resize-none rounded-[14px] p-3 text-[12px] leading-relaxed text-[#1C1E22] placeholder:text-[#666A72]"
      />
    </section>
  );

  return (
    <>
      {/* Desktop: Free-resizable & draggable bento canvas */}
      <div
        ref={containerRef}
        className="relative hidden w-full md:block"
        style={{ height: `${canvasHeightPx}px` }}
      >
        {tiles.map((tile) => {
          const content = tile.isCustom ? renderCustomTile(tile) : slotMap.get(tile.id);
          if (!content) return null;
          const isInteracting = activeTileId === tile.id;

          return (
            <div
              key={tile.id}
              data-tile-id={tile.id}
              data-no-swipe="true"
              className="group absolute p-[5px]"
              style={{
                left: `${tile.x}%`,
                top: `${Math.round((tile.y / 100) * 556)}px`,
                width: `${tile.w}%`,
                height: `${Math.round((tile.h / 100) * 556)}px`,
                zIndex: isInteracting ? 40 : (tile.z ?? 1),
              }}
            >
              <div
                className={`relative h-full w-full rounded-[22px] transition-shadow duration-150 ${
                  isInteracting
                    ? 'ring-2 ring-[var(--accent)] shadow-[0_14px_36px_rgba(var(--accent-dark-rgb),0.22)]'
                    : ''
                }`}
              >
                {content}

                {/* Discreet top-center drag handle for repositioning any tile */}
                <button
                  type="button"
                  data-no-swipe="true"
                  onPointerDown={(e) => startInteraction(e, tile, 'move')}
                  aria-label="Déplacer ce cadre"
                  title="Glisser pour déplacer ce cadre"
                  className="sg-focus-ring absolute top-[6px] left-1/2 z-20 flex h-[16px] w-[36px] -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#55585F] opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100 active:cursor-grabbing focus-visible:opacity-100"
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Clean responsive vertical stack */}
      <div className="flex flex-col gap-[12px] md:hidden">
        {tiles.map((tile) => {
          const content = tile.isCustom ? renderCustomTile(tile) : slotMap.get(tile.id);
          if (!content) return null;
          return (
            <div key={tile.id} className={tile.isCustom ? 'min-h-[180px] w-full' : 'w-full'}>
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
};
