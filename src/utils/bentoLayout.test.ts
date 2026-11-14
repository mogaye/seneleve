import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bringTileToFront,
  cloneDefaultLayouts,
  computeCanvasHeightPx,
  createCustomTile,
  DEFAULT_SCREEN_LAYOUTS,
  isLayoutCustomized,
  MIN_TILE_HEIGHT_PCT,
  MIN_TILE_WIDTH_PCT,
  moveTile,
  resizeTile,
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

test('moveTile clamps position inside canvas boundaries cleanly', () => {
  const tile = { id: 'a', x: 20, y: 20, w: 30, h: 40 };
  const movedRight = moveTile(tile, 90, 0);
  assert.equal(movedRight.x, 70);
  const movedLeft = moveTile(tile, -50, -50);
  assert.equal(movedLeft.x, 0);
  assert.equal(movedLeft.y, 0);
});

test('resizeTile adjusts edges and corners while respecting minimum dimensions', () => {
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
