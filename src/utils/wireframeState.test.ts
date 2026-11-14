import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPercentage,
  createInitialDashboardState,
  FORMAT_META,
  resolveSwipeDirection,
  selectHeroPill,
  selectListRow,
  selectSidebarNav,
  setFormat,
  stepFormat,
  stepProgress,
  toggleModuleSwitch,
  togglePlayback,
  toggleTransportSwitch,
  toggleUtilityNav,
} from './wireframeState';

test('initial state matches reference wireframe defaults', () => {
  const state = createInitialDashboardState();
  assert.equal(state.activeFormat, 0);
  assert.equal(FORMAT_META.length, 4);
  assert.equal(state.activeListRow, 2); // Row 3 active capsule
  assert.equal(state.moduleSwitchOn, true);
  assert.equal(state.transportSwitchOn, true);
  assert.equal(state.timelineProgress, 64);
  assert.equal(state.mediaProgress, 48);
});

test('stepFormat cycles through all 4 formats cleanly in both directions', () => {
  assert.equal(stepFormat(0, 1), 1);
  assert.equal(stepFormat(1, 1), 2);
  assert.equal(stepFormat(2, 1), 3);
  assert.equal(stepFormat(3, 1), 0);
  assert.equal(stepFormat(0, -1), 3);
  assert.equal(stepFormat(3, -1), 2);
});

test('setFormat clamps index to 0..3', () => {
  const initial = createInitialDashboardState();
  assert.equal(setFormat(initial, 2).activeFormat, 2);
  assert.equal(setFormat(initial, 3).activeFormat, 3);
  assert.equal(setFormat(initial, 9).activeFormat, 3);
  assert.equal(setFormat(initial, -2).activeFormat, 0);
});

test('resolveSwipeDirection detects right push, left push, and deadzone', () => {
  assert.equal(resolveSwipeDirection(200, 1440), 1);
  assert.equal(resolveSwipeDirection(-200, 1440), -1);
  assert.equal(resolveSwipeDirection(40, 1440), 0);
  assert.equal(resolveSwipeDirection(-40, 1440), 0);
});

test('selectListRow updates active row within bounds', () => {
  const initial = createInitialDashboardState();
  const next = selectListRow(initial, 0);
  assert.equal(next.activeListRow, 0);
  assert.equal(selectListRow(initial, 99).activeListRow, 3);
  assert.equal(selectListRow(initial, -5).activeListRow, 0);
});

test('selectSidebarNav and toggleUtilityNav handle selection cleanly', () => {
  const initial = createInitialDashboardState();
  assert.equal(selectSidebarNav(initial, 3).activeSidebarNav, 3);

  const toggledOn = toggleUtilityNav(initial, 1);
  assert.equal(toggledOn.activeUtilityNav, 1);

  const toggledOff = toggleUtilityNav(toggledOn, 1);
  assert.equal(toggledOff.activeUtilityNav, null);
});

test('selectHeroPill clamps to 0..3', () => {
  const initial = createInitialDashboardState();
  assert.equal(selectHeroPill(initial, 2).activeHeroPill, 2);
  assert.equal(selectHeroPill(initial, 10).activeHeroPill, 3);
});

test('switches and playback toggle state cleanly', () => {
  const initial = createInitialDashboardState();
  assert.equal(toggleModuleSwitch(initial).moduleSwitchOn, false);
  assert.equal(toggleTransportSwitch(initial).transportSwitchOn, false);
  assert.equal(togglePlayback(initial).isPlaying, true);
});

test('stepProgress and clampPercentage stay within 0..100', () => {
  assert.equal(stepProgress(64, 20), 84);
  assert.equal(stepProgress(90, 25), 100);
  assert.equal(stepProgress(10, -25), 0);
  assert.equal(clampPercentage(Number.NaN), 0);
});
