import { FormatIndex } from './wireframeState';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface TileRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  isCustom?: boolean;
  title?: string;
  note?: string;
}

export type BentoLayoutsState = Record<FormatIndex, TileRect[]>;

export const MIN_TILE_WIDTH_PCT = 18;
export const MIN_TILE_HEIGHT_PCT = 18;
export const MAX_TILE_HEIGHT_PCT = 150;
export const MAX_CANVAS_Y_PCT = 240;

export const DEFAULT_SCREEN_LAYOUTS: BentoLayoutsState = {
  0: [
    { id: 'cours-main', x: 0, y: 0, w: 68, h: 57, z: 1 },
    { id: 'cours-subjects', x: 68, y: 0, w: 32, h: 57, z: 1 },
    { id: 'cours-progress', x: 0, y: 57, w: 38, h: 43, z: 1 },
    { id: 'cours-next', x: 38, y: 57, w: 30, h: 43, z: 1 },
    { id: 'cours-lessons', x: 68, y: 57, w: 32, h: 43, z: 1 },
  ],
  1: [
    { id: 'ex-filters', x: 0, y: 0, w: 31.5, h: 100, z: 1 },
    { id: 'ex-session', x: 31.5, y: 0, w: 29, h: 33, z: 1 },
    { id: 'ex-progress', x: 60.5, y: 0, w: 39.5, h: 33, z: 1 },
    { id: 'ex-main', x: 31.5, y: 33, w: 43, h: 67, z: 1 },
    { id: 'ex-nav', x: 74.5, y: 33, w: 25.5, h: 67, z: 1 },
  ],
  2: [
    { id: 'rev-main', x: 0, y: 0, w: 100, h: 55, z: 1 },
    { id: 'rev-lessons', x: 0, y: 55, w: 33.33, h: 45, z: 1 },
    { id: 'rev-tool', x: 33.33, y: 55, w: 33.33, h: 45, z: 1 },
    { id: 'rev-session', x: 66.66, y: 55, w: 33.34, h: 45, z: 1 },
  ],
  3: [
    { id: 'exam-target', x: 0, y: 0, w: 33.33, h: 30, z: 1 },
    { id: 'exam-date', x: 33.33, y: 0, w: 33.33, h: 30, z: 1 },
    { id: 'exam-days', x: 66.66, y: 0, w: 33.34, h: 30, z: 1 },
    { id: 'exam-plan', x: 0, y: 30, w: 68, h: 70, z: 1 },
    { id: 'exam-subjects', x: 68, y: 30, w: 32, h: 70, z: 1 },
  ],
};

export function cloneDefaultLayouts(): BentoLayoutsState {
  return {
    0: DEFAULT_SCREEN_LAYOUTS[0].map((t) => ({ ...t })),
    1: DEFAULT_SCREEN_LAYOUTS[1].map((t) => ({ ...t })),
    2: DEFAULT_SCREEN_LAYOUTS[2].map((t) => ({ ...t })),
    3: DEFAULT_SCREEN_LAYOUTS[3].map((t) => ({ ...t })),
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function moveTile(tile: TileRect, dxPct: number, dyPct: number): TileRect {
  const nextX = round1(clamp(tile.x + dxPct, 0, Math.max(0, 100 - tile.w)));
  const nextY = round1(clamp(tile.y + dyPct, 0, MAX_CANVAS_Y_PCT - tile.h));
  return {
    ...tile,
    x: nextX,
    y: nextY,
  };
}

export function resizeTile(
  tile: TileRect,
  dir: ResizeDirection,
  dxPct: number,
  dyPct: number,
): TileRect {
  let { x, y, w, h } = tile;
  const right = x + w;
  const bottom = y + h;

  if (dir.includes('e')) {
    w = round1(clamp(w + dxPct, MIN_TILE_WIDTH_PCT, 100 - x));
  }
  if (dir.includes('w')) {
    const nextX = round1(clamp(x + dxPct, 0, right - MIN_TILE_WIDTH_PCT));
    w = round1(right - nextX);
    x = nextX;
  }
  if (dir.includes('s')) {
    h = round1(clamp(h + dyPct, MIN_TILE_HEIGHT_PCT, MAX_TILE_HEIGHT_PCT));
  }
  if (dir.includes('n')) {
    const nextY = round1(clamp(y + dyPct, 0, bottom - MIN_TILE_HEIGHT_PCT));
    h = round1(clamp(bottom - nextY, MIN_TILE_HEIGHT_PCT, MAX_TILE_HEIGHT_PCT));
    y = round1(bottom - h);
  }

  return {
    ...tile,
    x,
    y,
    w,
    h,
  };
}

export function computeCanvasHeightPx(
  tiles: readonly TileRect[],
  baseHeightPx = 560,
): number {
  const maxBottomPct = Math.max(100, ...tiles.map((t) => t.y + t.h));
  return Math.round((maxBottomPct / 100) * baseHeightPx);
}

export function createCustomTile(
  existingTiles: readonly TileRect[],
  customIndex: number,
): TileRect {
  const maxZ = existingTiles.reduce((m, t) => Math.max(m, t.z ?? 1), 1);
  const maxBottom = existingTiles.reduce((m, t) => Math.max(m, t.y + t.h), 100);
  const colSlot = (customIndex % 3) * 33;
  const startY = maxBottom >= 100 ? round1(maxBottom) : 100;

  return {
    id: `custom-${Date.now()}-${customIndex}`,
    x: colSlot,
    y: Math.min(startY, MAX_CANVAS_Y_PCT - 34),
    w: 33,
    h: 34,
    z: maxZ + 1,
    isCustom: true,
    title: `Carreau ${customIndex + 1}`,
    note: '',
  };
}

export function bringTileToFront(
  tiles: readonly TileRect[],
  targetId: string,
): TileRect[] {
  const maxZ = tiles.reduce((m, t) => Math.max(m, t.z ?? 1), 1);
  return tiles.map((t) => (t.id === targetId ? { ...t, z: maxZ + 1 } : t));
}

export function isLayoutCustomized(
  tiles: readonly TileRect[],
  formatIndex: FormatIndex,
): boolean {
  const defaults = DEFAULT_SCREEN_LAYOUTS[formatIndex];
  if (tiles.length !== defaults.length) return true;
  return tiles.some((t, i) => {
    const d = defaults[i];
    if (!d) return true;
    return (
      t.id !== d.id ||
      Math.abs(t.x - d.x) > 0.2 ||
      Math.abs(t.y - d.y) > 0.2 ||
      Math.abs(t.w - d.w) > 0.2 ||
      Math.abs(t.h - d.h) > 0.2
    );
  });
}

const STORAGE_KEY = 'sg-bento-layouts-v1';

export function loadSavedLayouts(): BentoLayoutsState {
  const fallback = cloneDefaultLayouts();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Record<string, TileRect[]>>;
    ([0, 1, 2, 3] as FormatIndex[]).forEach((idx) => {
      const savedList = parsed[String(idx)];
      if (Array.isArray(savedList) && savedList.length > 0) {
        fallback[idx] = savedList.map((item) => ({
          ...item,
          x: clamp(Number(item.x) || 0, 0, 82),
          y: clamp(Number(item.y) || 0, 0, MAX_CANVAS_Y_PCT - MIN_TILE_HEIGHT_PCT),
          w: clamp(Number(item.w) || 30, MIN_TILE_WIDTH_PCT, 100),
          h: clamp(Number(item.h) || 30, MIN_TILE_HEIGHT_PCT, MAX_TILE_HEIGHT_PCT),
        }));
      }
    });
  } catch {
    return fallback;
  }
  return fallback;
}

export function saveLayouts(layouts: BentoLayoutsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // Ignore storage quota errors
  }
}
