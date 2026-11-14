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

export interface ResizeBoundsOptions {
  minW?: number;
  minH?: number;
  maxH?: number;
  maxCanvasY?: number;
}

export type BentoLayoutsState = Record<FormatIndex, TileRect[]>;

export const MIN_TILE_WIDTH_PCT = 18;
export const MIN_TILE_HEIGHT_PCT = 18;
export const MAX_TILE_HEIGHT_PCT = 150;
export const MAX_CANVAS_Y_PCT = 240;

export const MAX_OUTER_CANVAS_Y_PCT = 180;
export const OUTER_BASE_HEIGHT_PX = 810;

const COLLISION_EPS = 0.05;

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

export type OuterFrameId =
  | 'outer-topbar'
  | 'outer-sidebar'
  | 'outer-main'
  | 'outer-bottom';

export const DEFAULT_OUTER_LAYOUT: TileRect[] = [
  { id: 'outer-topbar', x: 0, y: 0, w: 100, h: 7.5, z: 1 },
  { id: 'outer-sidebar', x: 0, y: 7.5, w: 5.2, h: 73.5, z: 1 },
  { id: 'outer-main', x: 5.2, y: 7.5, w: 94.8, h: 73.5, z: 1 },
  { id: 'outer-bottom', x: 0, y: 81, w: 100, h: 19, z: 1 },
];

export const OUTER_FRAME_MIN_BOUNDS: Record<
  OuterFrameId,
  { minW: number; minH: number; maxH: number }
> = {
  'outer-topbar': { minW: 24, minH: 6.5, maxH: 35 },
  'outer-sidebar': { minW: 4.5, minH: 18, maxH: 140 },
  'outer-main': { minW: 28, minH: 28, maxH: 160 },
  'outer-bottom': { minW: 22, minH: 11, maxH: 60 },
};

export function cloneDefaultLayouts(): BentoLayoutsState {
  return {
    0: DEFAULT_SCREEN_LAYOUTS[0].map((t) => ({ ...t })),
    1: DEFAULT_SCREEN_LAYOUTS[1].map((t) => ({ ...t })),
    2: DEFAULT_SCREEN_LAYOUTS[2].map((t) => ({ ...t })),
    3: DEFAULT_SCREEN_LAYOUTS[3].map((t) => ({ ...t })),
  };
}

export function cloneDefaultOuterLayout(): TileRect[] {
  return DEFAULT_OUTER_LAYOUT.map((t) => ({ ...t }));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return Math.min(aEnd, bEnd) - Math.max(aStart, bStart) > COLLISION_EPS;
}

export function moveTile(
  tile: TileRect,
  dxPct: number,
  dyPct: number,
  others: readonly TileRect[] = [],
  maxCanvasY: number = MAX_CANVAS_Y_PCT,
): TileRect {
  const peers = others.filter((o) => o.id !== tile.id);
  const maxRightCanvas = 100;
  const maxBottomCanvas = maxCanvasY;

  let nextX = tile.x;
  if (dxPct > 0) {
    let limitRight = maxRightCanvas;
    const currentRight = tile.x + tile.w;
    for (const other of peers) {
      if (
        intervalsOverlap(tile.y, tile.y + tile.h, other.y, other.y + other.h) &&
        other.x >= currentRight - COLLISION_EPS
      ) {
        limitRight = Math.min(limitRight, other.x);
      }
    }
    const maxAllowedX = Math.max(tile.x, limitRight - tile.w);
    nextX = clamp(tile.x + dxPct, 0, Math.min(100 - tile.w, maxAllowedX));
  } else if (dxPct < 0) {
    let limitLeft = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(tile.y, tile.y + tile.h, other.y, other.y + other.h) &&
        other.x + other.w <= tile.x + COLLISION_EPS
      ) {
        limitLeft = Math.max(limitLeft, other.x + other.w);
      }
    }
    const minAllowedX = Math.min(tile.x, limitLeft);
    nextX = clamp(tile.x + dxPct, Math.max(0, minAllowedX), 100 - tile.w);
  }

  let nextY = tile.y;
  if (dyPct > 0) {
    let limitBottom = maxBottomCanvas;
    const currentBottom = tile.y + tile.h;
    for (const other of peers) {
      if (
        intervalsOverlap(nextX, nextX + tile.w, other.x, other.x + other.w) &&
        other.y >= currentBottom - COLLISION_EPS
      ) {
        limitBottom = Math.min(limitBottom, other.y);
      }
    }
    const maxAllowedY = Math.max(tile.y, limitBottom - tile.h);
    nextY = clamp(tile.y + dyPct, 0, Math.min(maxCanvasY - tile.h, maxAllowedY));
  } else if (dyPct < 0) {
    let limitTop = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(nextX, nextX + tile.w, other.x, other.x + other.w) &&
        other.y + other.h <= tile.y + COLLISION_EPS
      ) {
        limitTop = Math.max(limitTop, other.y + other.h);
      }
    }
    const minAllowedY = Math.min(tile.y, limitTop);
    nextY = clamp(tile.y + dyPct, Math.max(0, minAllowedY), maxCanvasY - tile.h);
  }

  return {
    ...tile,
    x: round1(nextX),
    y: round1(nextY),
  };
}

export function moveTileExact(
  tile: TileRect,
  dxPct: number,
  dyPct: number,
  others: readonly TileRect[] = [],
  maxCanvasY: number = MAX_CANVAS_Y_PCT,
): TileRect {
  const peers = others.filter((o) => o.id !== tile.id);
  let nextX = tile.x;
  if (dxPct > 0) {
    let limitRight = 100;
    const currentRight = tile.x + tile.w;
    for (const other of peers) {
      if (
        intervalsOverlap(tile.y, tile.y + tile.h, other.y, other.y + other.h) &&
        other.x >= currentRight - COLLISION_EPS
      ) {
        limitRight = Math.min(limitRight, other.x);
      }
    }
    const maxAllowedX = Math.max(tile.x, limitRight - tile.w);
    nextX = clamp(tile.x + dxPct, 0, Math.min(100 - tile.w, maxAllowedX));
  } else if (dxPct < 0) {
    let limitLeft = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(tile.y, tile.y + tile.h, other.y, other.y + other.h) &&
        other.x + other.w <= tile.x + COLLISION_EPS
      ) {
        limitLeft = Math.max(limitLeft, other.x + other.w);
      }
    }
    const minAllowedX = Math.min(tile.x, limitLeft);
    nextX = clamp(tile.x + dxPct, Math.max(0, minAllowedX), 100 - tile.w);
  }

  let nextY = tile.y;
  if (dyPct > 0) {
    let limitBottom = maxCanvasY;
    const currentBottom = tile.y + tile.h;
    for (const other of peers) {
      if (
        intervalsOverlap(nextX, nextX + tile.w, other.x, other.x + other.w) &&
        other.y >= currentBottom - COLLISION_EPS
      ) {
        limitBottom = Math.min(limitBottom, other.y);
      }
    }
    const maxAllowedY = Math.max(tile.y, limitBottom - tile.h);
    nextY = clamp(tile.y + dyPct, 0, Math.min(maxCanvasY - tile.h, maxAllowedY));
  } else if (dyPct < 0) {
    let limitTop = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(nextX, nextX + tile.w, other.x, other.x + other.w) &&
        other.y + other.h <= tile.y + COLLISION_EPS
      ) {
        limitTop = Math.max(limitTop, other.y + other.h);
      }
    }
    const minAllowedY = Math.min(tile.y, limitTop);
    nextY = clamp(tile.y + dyPct, Math.max(0, minAllowedY), maxCanvasY - tile.h);
  }

  return {
    ...tile,
    x: nextX,
    y: nextY,
  };
}

export function rectsOverlap(a: TileRect, b: TileRect): boolean {
  return (
    intervalsOverlap(a.x, a.x + a.w, b.x, b.x + b.w) &&
    intervalsOverlap(a.y, a.y + a.h, b.y, b.y + b.h)
  );
}

export function hasAnyOverlap(tiles: readonly TileRect[]): boolean {
  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (rectsOverlap(tiles[i], tiles[j])) return true;
    }
  }
  return false;
}

export function moveTileFree(
  tile: TileRect,
  dxPct: number,
  dyPct: number,
  maxCanvasY: number = MAX_CANVAS_Y_PCT,
): TileRect {
  return {
    ...tile,
    x: round1(clamp(tile.x + dxPct, 0, Math.max(0, 100 - tile.w))),
    y: round1(clamp(tile.y + dyPct, 0, Math.max(0, maxCanvasY - tile.h))),
  };
}

/**
 * Resolves final tile placement after a free move so no two tiles remain overlapping.
 * - If the target position is empty, places the tile directly without moving others.
 * - If overlapping a single same-band neighbor horizontally, swaps/shifts horizontally when valid.
 * - Otherwise places the moved tile at its target and cascades overlapping tiles cleanly downward.
 */
export function placeTileWithoutOverlap(
  movedTile: TileRect,
  allTiles: readonly TileRect[],
  maxCanvasY: number = MAX_CANVAS_Y_PCT,
): TileRect[] {
  const origTile = allTiles.find((t) => t.id === movedTile.id);
  const clampedMoved: TileRect = {
    ...movedTile,
    x: round1(clamp(movedTile.x, 0, Math.max(0, 100 - movedTile.w))),
    y: round1(clamp(movedTile.y, 0, Math.max(0, maxCanvasY - movedTile.h))),
  };
  const peers = allTiles
    .filter((t) => t.id !== clampedMoved.id)
    .map((t) => ({ ...t }));

  const overlappingPeers = peers.filter((p) => rectsOverlap(clampedMoved, p));

  if (overlappingPeers.length === 0) {
    return allTiles.map((t) => (t.id === clampedMoved.id ? clampedMoved : t));
  }

  // Try clean horizontal shift/swap if dragging horizontally onto a single same-row neighbor
  if (origTile && overlappingPeers.length === 1 && Math.abs(origTile.y - clampedMoved.y) <= 8) {
    const target = overlappingPeers[0];
    const otherPeers = peers.filter((p) => p.id !== target.id);
    const movingRight = clampedMoved.x >= origTile.x;
    const candidateTargetX = movingRight
      ? round1(clamp(clampedMoved.x - target.w, 0, 100 - target.w))
      : round1(clamp(clampedMoved.x + clampedMoved.w, 0, 100 - target.w));
    const shiftedTarget: TileRect = { ...target, x: candidateTargetX };

    if (
      !rectsOverlap(clampedMoved, shiftedTarget) &&
      !otherPeers.some((p) => rectsOverlap(shiftedTarget, p))
    ) {
      return allTiles.map((t) => {
        if (t.id === clampedMoved.id) return clampedMoved;
        if (t.id === shiftedTarget.id) return shiftedTarget;
        return t;
      });
    }
  }

  // Small edge snap if barely grazing a neighbor (<= 4%) and adjacent edge has room
  if (overlappingPeers.length === 1) {
    const n = overlappingPeers[0];
    const candidates: TileRect[] = [
      { ...clampedMoved, x: round1(n.x - clampedMoved.w) },
      { ...clampedMoved, x: round1(n.x + n.w) },
      { ...clampedMoved, y: round1(n.y - clampedMoved.h) },
      { ...clampedMoved, y: round1(n.y + n.h) },
    ].filter(
      (c) =>
        c.x >= 0 &&
        c.x + c.w <= 100 + COLLISION_EPS &&
        c.y >= 0 &&
        c.y + c.h <= maxCanvasY + COLLISION_EPS &&
        Math.hypot(c.x - clampedMoved.x, c.y - clampedMoved.y) <= 4 &&
        !peers.some((p) => rectsOverlap(c, p)),
    );
    if (candidates.length > 0) {
      candidates.sort(
        (a, b) =>
          Math.hypot(a.x - clampedMoved.x, a.y - clampedMoved.y) -
          Math.hypot(b.x - clampedMoved.x, b.y - clampedMoved.y),
      );
      const snapped = candidates[0];
      return allTiles.map((t) => (t.id === clampedMoved.id ? snapped : t));
    }
  }

  // Cascade push overlapping tiles downward while keeping zero overlaps
  const sortedPeers = [...peers].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: TileRect[] = [clampedMoved];

  for (const peer of sortedPeers) {
    let candidate = { ...peer };
    let guard = 0;
    while (guard < 60) {
      guard += 1;
      const blocker = placed.find((b) => rectsOverlap(candidate, b));
      if (!blocker) break;
      candidate = { ...candidate, y: round1(blocker.y + blocker.h) };
    }
    if (candidate.y + candidate.h > maxCanvasY) {
      return [...allTiles];
    }
    placed.push(candidate);
  }

  const byId = new Map(placed.map((t) => [t.id, t]));
  return allTiles.map((t) => byId.get(t.id) ?? t);
}

export function resizeTile(
  tile: TileRect,
  dir: ResizeDirection,
  dxPct: number,
  dyPct: number,
  others: readonly TileRect[] = [],
  options: ResizeBoundsOptions = {},
): TileRect {
  const minW = options.minW ?? MIN_TILE_WIDTH_PCT;
  const minH = options.minH ?? MIN_TILE_HEIGHT_PCT;
  const maxH = options.maxH ?? MAX_TILE_HEIGHT_PCT;
  const maxCanvasY = options.maxCanvasY ?? MAX_CANVAS_Y_PCT;

  const peers = others.filter((o) => o.id !== tile.id);
  let { x, y, w, h } = tile;
  const origRight = x + w;
  const origBottom = y + h;

  if (dir.includes('e')) {
    let limitRight = 100;
    for (const other of peers) {
      if (
        intervalsOverlap(y, origBottom, other.y, other.y + other.h) &&
        other.x >= origRight - COLLISION_EPS
      ) {
        limitRight = Math.min(limitRight, other.x);
      }
    }
    const maxW = Math.max(w, limitRight - x);
    w = round1(clamp(w + dxPct, minW, Math.min(100 - x, maxW)));
  }

  if (dir.includes('w')) {
    let limitLeft = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(y, origBottom, other.y, other.y + other.h) &&
        other.x + other.w <= x + COLLISION_EPS
      ) {
        limitLeft = Math.max(limitLeft, other.x + other.w);
      }
    }
    const minX = Math.min(x, Math.max(0, limitLeft));
    const nextX = round1(clamp(x + dxPct, minX, origRight - minW));
    w = round1(origRight - nextX);
    x = nextX;
  }

  const resolvedRight = x + w;

  if (dir.includes('s')) {
    let limitBottom = Math.min(maxCanvasY, y + maxH);
    for (const other of peers) {
      if (
        intervalsOverlap(x, resolvedRight, other.x, other.x + other.w) &&
        other.y >= origBottom - COLLISION_EPS
      ) {
        limitBottom = Math.min(limitBottom, other.y);
      }
    }
    const maxAllowedH = Math.max(h, limitBottom - y);
    h = round1(clamp(h + dyPct, minH, Math.min(maxH, maxCanvasY - y, maxAllowedH)));
  }

  if (dir.includes('n')) {
    let limitTop = 0;
    for (const other of peers) {
      if (
        intervalsOverlap(x, resolvedRight, other.x, other.x + other.w) &&
        other.y + other.h <= y + COLLISION_EPS
      ) {
        limitTop = Math.max(limitTop, other.y + other.h);
      }
    }
    const minAllowedY = Math.min(y, Math.max(0, limitTop, origBottom - maxH));
    const nextY = round1(clamp(y + dyPct, minAllowedY, origBottom - minH));
    h = round1(origBottom - nextY);
    y = nextY;
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

export function isOuterLayoutCustomized(tiles: readonly TileRect[]): boolean {
  if (tiles.length !== DEFAULT_OUTER_LAYOUT.length) return true;
  return tiles.some((t, i) => {
    const d = DEFAULT_OUTER_LAYOUT[i];
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

/**
 * Expands or collapses the sidebar frame smoothly while preventing overlap with outer-main.
 */
export function toggleSidebarExpandedLayout(
  outerTiles: readonly TileRect[],
  nextExpanded: boolean,
): TileRect[] {
  const sidebar = outerTiles.find((t) => t.id === 'outer-sidebar');
  const main = outerTiles.find((t) => t.id === 'outer-main');
  if (!sidebar || !main) return [...outerTiles];

  const targetW = nextExpanded ? 11.5 : 5.2;
  const sidebarRight = sidebar.x + sidebar.w;
  const touchingMain =
    intervalsOverlap(sidebar.y, sidebar.y + sidebar.h, main.y, main.y + main.h) &&
    Math.abs(main.x - sidebarRight) <= 0.6;

  if (nextExpanded) {
    if (sidebar.w >= targetW) return [...outerTiles];
    const delta = round1(targetW - sidebar.w);
    if (touchingMain) {
      const minMainW = OUTER_FRAME_MIN_BOUNDS['outer-main'].minW;
      const availableFromMain = Math.max(0, main.w - minMainW);
      const actualDelta = round1(Math.min(delta, availableFromMain));
      if (actualDelta <= 0) return [...outerTiles];
      return outerTiles.map((t) => {
        if (t.id === 'outer-sidebar') return { ...t, w: round1(t.w + actualDelta) };
        if (t.id === 'outer-main') {
          return {
            ...t,
            x: round1(t.x + actualDelta),
            w: round1(t.w - actualDelta),
          };
        }
        return t;
      });
    }
    const resized = resizeTile(sidebar, 'e', delta, 0, outerTiles, {
      ...OUTER_FRAME_MIN_BOUNDS['outer-sidebar'],
      maxCanvasY: MAX_OUTER_CANVAS_Y_PCT,
    });
    return outerTiles.map((t) => (t.id === 'outer-sidebar' ? resized : t));
  } else {
    if (sidebar.w <= targetW) return [...outerTiles];
    const delta = round1(sidebar.w - targetW);
    return outerTiles.map((t) => {
      if (t.id === 'outer-sidebar') return { ...t, w: targetW };
      if (t.id === 'outer-main' && touchingMain) {
        return {
          ...t,
          x: round1(Math.max(0, t.x - delta)),
          w: round1(t.w + delta),
        };
      }
      return t;
    });
  }
}

const STORAGE_KEY = 'sg-bento-layouts-v1';
const OUTER_STORAGE_KEY = 'sg-outer-layout-v1';
const LOCK_STORAGE_KEY = 'sg-layout-locked-v1';

export function loadSavedLayoutLocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveLayoutLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCK_STORAGE_KEY, locked ? 'true' : 'false');
  } catch {
    // Ignore storage quota errors
  }
}

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

export function loadSavedOuterLayout(): TileRect[] {
  const fallback = cloneDefaultOuterLayout();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(OUTER_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as TileRect[];
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_OUTER_LAYOUT.length) {
      return fallback;
    }
    const byId = new Map(parsed.map((item) => [item.id, item]));
    return DEFAULT_OUTER_LAYOUT.map((def) => {
      const saved = byId.get(def.id);
      if (!saved) return { ...def };
      const bounds = OUTER_FRAME_MIN_BOUNDS[def.id as OuterFrameId];
      const w = clamp(Number(saved.w) || def.w, bounds.minW, 100);
      const h = clamp(Number(saved.h) || def.h, bounds.minH, bounds.maxH);
      return {
        ...def,
        x: clamp(Number(saved.x) ?? def.x, 0, 100 - w),
        y: clamp(Number(saved.y) ?? def.y, 0, MAX_OUTER_CANVAS_Y_PCT - h),
        w,
        h,
        z: Number(saved.z) || 1,
      };
    });
  } catch {
    return fallback;
  }
}

export function saveOuterLayout(tiles: readonly TileRect[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OUTER_STORAGE_KEY, JSON.stringify(tiles));
  } catch {
    // Ignore storage quota errors
  }
}
