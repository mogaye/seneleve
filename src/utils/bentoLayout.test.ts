import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bringTileToFront,
  cloneDefaultLayouts,
  cloneDefaultOuterLayout,
  computeCanvasHeightPx,
  createCustomTile,
  DEFAULT_OUTER_LAYOUT,
  DEFAULT_SCREEN_LAYOUTS,
  hasAnyOverlap,
  isLayoutCustomized,
  isOuterLayoutCustomized,
  loadSavedLayoutLocked,
  MIN_TILE_HEIGHT_PCT,
  MIN_TILE_WIDTH_PCT,
  moveTile,
  moveTileExact,
  moveTileFree,
  OUTER_FRAME_MIN_BOUNDS,
  OuterFrameId,
  placeTileWithoutOverlap,
  resizeTile,
  toggleSidebarExpandedLayout,
} from './bentoLayout';

test('default screen layouts cover all 4 screens within 0..100 bounds', () => {
  for (const idx of [0, 1, 2, 3] as const) {
    const tiles = DEFAULT_SCREEN_LAYOUTS[idx];
    assert.ok(tiles.length >= 4);
    for (const t of tiles) {
      assert.ok(t.x >= 0 && t.x + t.w <= 100.1);
      assert.ok(t.y >= 0 && t.y + t.h <= 100.1);
      assert.ok(t.w >= MIN_TILE_WIDTH_PCT);
      assert.ok(t.h >= MIN_TILE_HEIGHT_PCT);
    }
    assert.equal(isLayoutCustomized(tiles, idx), false);
  }
});

test('default outer layout covers all 4 workspace frames cleanly without overlap', () => {
  assert.equal(DEFAULT_OUTER_LAYOUT.length, 4);
  for (const t of DEFAULT_OUTER_LAYOUT) {
    const bounds = OUTER_FRAME_MIN_BOUNDS[t.id as OuterFrameId];
    assert.ok(t.x >= 0 && t.x + t.w <= 100.1);
    assert.ok(t.y >= 0 && t.y + t.h <= 100.1);
    assert.ok(t.w >= bounds.minW);
    assert.ok(t.h >= bounds.minH);
  }
  assert.equal(isOuterLayoutCustomized(DEFAULT_OUTER_LAYOUT), false);
});

test('moveTile clamps position inside canvas boundaries cleanly', () => {
  const tile = { id: 'a', x: 20, y: 20, w: 30, h: 40 };
  const movedRight = moveTile(tile, 90, 0);
  assert.equal(movedRight.x, 70);
  const movedLeft = moveTile(tile, -50, -50);
  assert.equal(movedLeft.x, 0);
  assert.equal(movedLeft.y, 0);
});

test('moveTile and moveTileExact stop cleanly when reaching another tile', () => {
  const a = { id: 'a', x: 0, y: 0, w: 30, h: 40 };
  const b = { id: 'b', x: 50, y: 0, w: 30, h: 40 };
  const c = { id: 'c', x: 0, y: 60, w: 40, h: 30 };
  const all = [a, b, c];

  // Push right toward b -> stops at x=20 (right=50)
  const pushedRight = moveTile(a, 45, 0, all);
  assert.equal(pushedRight.x, 20);
  assert.equal(pushedRight.x + pushedRight.w, b.x);

  // Push down toward c -> stops at y=20 (bottom=60)
  const pushedDown = moveTileExact(a, 0, 50, all);
  assert.equal(pushedDown.y, 20);
  assert.equal(pushedDown.y + pushedDown.h, c.y);

  // Push b left toward a -> stops at x=30
  const pushedLeft = moveTile(b, -40, 0, all);
  assert.equal(pushedLeft.x, 30);
});

test('moveTile does not snag on corner-touching tiles on adjacent row', () => {
  const topLeft = { id: 'tl', x: 0, y: 0, w: 50, h: 50 };
  const bottomRight = { id: 'br', x: 60, y: 50, w: 40, h: 50 };
  const moved = moveTile(topLeft, 30, 0, [topLeft, bottomRight]);
  // y: [0..50] does not overlap [50..100], so topLeft slides freely to x=30
  assert.equal(moved.x, 30);
});

test('resizeTile adjusts edges and corners while respecting minimum dimensions and neighbor collisions', () => {
  const tile = { id: 'a', x: 20, y: 20, w: 40, h: 40 };
  const resizedEast = resizeTile(tile, 'e', 15, 0);
  assert.equal(resizedEast.w, 55);
  assert.equal(resizedEast.x, 20);

  const resizedWest = resizeTile(tile, 'w', -10, 0);
  assert.equal(resizedWest.x, 10);
  assert.equal(resizedWest.w, 50);

  const shrunkTooMuch = resizeTile(tile, 'se', -100, -100);
  assert.equal(shrunkTooMuch.w, MIN_TILE_WIDTH_PCT);
  assert.equal(shrunkTooMuch.h, MIN_TILE_HEIGHT_PCT);

  // With neighbors on east and south
  const rightNeighbor = { id: 'r', x: 70, y: 20, w: 20, h: 40 };
  const bottomNeighbor = { id: 'b', x: 20, y: 72, w: 40, h: 20 };
  const resizedCorner = resizeTile(tile, 'se', 50, 50, [tile, rightNeighbor, bottomNeighbor]);
  assert.equal(resizedCorner.x + resizedCorner.w, 70);
  assert.equal(resizedCorner.y + resizedCorner.h, 72);
});

test('toggleSidebarExpandedLayout expands sidebar without overlapping outer-main', () => {
  const initial = cloneDefaultOuterLayout();
  const expanded = toggleSidebarExpandedLayout(initial, true);
  const sidebar = expanded.find((t) => t.id === 'outer-sidebar')!;
  const main = expanded.find((t) => t.id === 'outer-main')!;
  assert.ok(sidebar.w > 10);
  assert.equal(sidebar.x + sidebar.w, main.x);
  assert.equal(isOuterLayoutCustomized(expanded), true);

  const collapsed = toggleSidebarExpandedLayout(expanded, false);
  const sidebarAfter = collapsed.find((t) => t.id === 'outer-sidebar')!;
  const mainAfter = collapsed.find((t) => t.id === 'outer-main')!;
  assert.equal(sidebarAfter.x + sidebarAfter.w, mainAfter.x);
});

test('createCustomTile adds editable tile below existing grid and expands canvas height', () => {
  const defaults = cloneDefaultLayouts()[0];
  assert.equal(computeCanvasHeightPx(defaults, 560), 560);

  const custom = createCustomTile(defaults, 0);
  assert.equal(custom.isCustom, true);
  assert.equal(custom.y, 100);
  const updated = [...defaults, custom];
  assert.equal(isLayoutCustomized(updated, 0), true);
  assert.ok(computeCanvasHeightPx(updated, 560) > 560);

  const brought = bringTileToFront(updated, 'cours-main');
  const mainZ = brought.find((t) => t.id === 'cours-main')?.z ?? 0;
  const customZ = brought.find((t) => t.id === custom.id)?.z ?? 0;
  assert.ok(mainZ > customZ);
});

test('loadSavedLayoutLocked defaults safely to false when storage is unavailable', () => {
  assert.equal(loadSavedLayoutLocked(), false);
});

test('moveTileFree crosses over blocking tiles and placeTileWithoutOverlap resolves zero-overlap layout', () => {
  // 1. Passing across a middle wall into empty space on the other side leaves other tiles untouched
  const tiles = [
    { id: 'a', x: 0, y: 0, w: 30, h: 40 },
    { id: 'wall', x: 35, y: 0, w: 20, h: 100 },
  ];
  const draggedRight = moveTileFree(tiles[0], 60, 0);
  assert.equal(draggedRight.x, 60);
  const resolvedEmpty = placeTileWithoutOverlap(draggedRight, tiles);
  assert.equal(hasAnyOverlap(resolvedEmpty), false);
  assert.equal(resolvedEmpty.find((t) => t.id === 'a')?.x, 60);
  assert.equal(resolvedEmpty.find((t) => t.id === 'wall')?.x, 35);

  // 2. Moving Carreau 1 from bottom of full Révisions grid up to y=0 pushes overlapping rows down cleanly
  const revBase = cloneDefaultLayouts()[2];
  const custom = createCustomTile(revBase, 0);
  const revWithCustom = [...revBase, custom];
  const draggedTop = moveTileFree(custom, 33, -100);
  assert.equal(draggedTop.y, 0);
  const resolvedTop = placeTileWithoutOverlap(draggedTop, revWithCustom);
  assert.equal(hasAnyOverlap(resolvedTop), false);
  assert.equal(resolvedTop.find((t) => t.id === custom.id)?.y, 0);
  assert.equal(resolvedTop.find((t) => t.id === 'rev-main')?.y, 34);
  assert.equal(resolvedTop.find((t) => t.id === 'rev-tool')?.y, 89);

  // 3. Moving outer-sidebar horizontally across outer-main swaps cleanly to right side without overlap
  const outer = cloneDefaultOuterLayout();
  const sidebar = outer.find((f) => f.id === 'outer-sidebar')!;
  const draggedSidebar = moveTileFree(sidebar, 94.8, 0, 180);
  const resolvedOuter = placeTileWithoutOverlap(draggedSidebar, outer, 180);
  assert.equal(hasAnyOverlap(resolvedOuter), false);
  assert.equal(resolvedOuter.find((f) => f.id === 'outer-sidebar')?.x, 94.8);
  assert.equal(resolvedOuter.find((f) => f.id === 'outer-main')?.x, 0);
});
