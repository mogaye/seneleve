export type FormatIndex = 0 | 1 | 2;

export interface DashboardState {
  activeFormat: FormatIndex;
  activeSidebarNav: number;
  activeUtilityNav: number | null;
  sidebarExpanded: boolean;
  profileActive: boolean;
  activeHeroPill: number;
  heroPrimaryActionActive: boolean;
  listFilterActive: boolean;
  activeListRow: number;
  timelineProgress: number;
  moduleSwitchOn: boolean;
  transportSwitchOn: boolean;
  isPlaying: boolean;
  mediaProgress: number;
}

export function createInitialDashboardState(): DashboardState {
  return {
    activeFormat: 0,
    activeSidebarNav: 0,
    activeUtilityNav: null,
    sidebarExpanded: false,
    profileActive: false,
    activeHeroPill: 0,
    heroPrimaryActionActive: false,
    listFilterActive: false,
    activeListRow: 2, // 0-indexed: Row 3 is active pill in the reference model
    timelineProgress: 64,
    moduleSwitchOn: true,
    transportSwitchOn: true,
    isPlaying: false,
    mediaProgress: 48,
  };
}

export function stepFormat(current: FormatIndex, delta: 1 | -1): FormatIndex {
  const next = (current + delta + 3) % 3;
  return next as FormatIndex;
}

export function setFormat(state: DashboardState, index: number): DashboardState {
  const clamped = Math.max(0, Math.min(2, Math.round(index))) as FormatIndex;
  return {
    ...state,
    activeFormat: clamped,
  };
}

export function resolveSwipeDirection(dx: number, containerWidth: number): -1 | 0 | 1 {
  const threshold = Math.max(56, Math.round(containerWidth * 0.12));
  if (dx >= threshold) return 1; // Push right -> advance to next format
  if (dx <= -threshold) return -1; // Push left -> move to previous format
  return 0;
}

export function clampPercentage(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function stepProgress(current: number, delta: number, min = 0, max = 100): number {
  return clampPercentage(current + delta, min, max);
}

export function selectSidebarNav(state: DashboardState, index: number): DashboardState {
  const safeIndex = Math.max(0, Math.min(4, index));
  return {
    ...state,
    activeSidebarNav: safeIndex,
  };
}

export function toggleUtilityNav(state: DashboardState, index: number): DashboardState {
  const safeIndex = Math.max(0, Math.min(1, index));
  return {
    ...state,
    activeUtilityNav: state.activeUtilityNav === safeIndex ? null : safeIndex,
  };
}

export function selectHeroPill(state: DashboardState, index: number): DashboardState {
  const safeIndex = Math.max(0, Math.min(3, index));
  return {
    ...state,
    activeHeroPill: safeIndex,
  };
}

export function selectListRow(state: DashboardState, index: number): DashboardState {
  const safeIndex = Math.max(0, Math.min(3, index));
  return {
    ...state,
    activeListRow: safeIndex,
  };
}

export function toggleModuleSwitch(state: DashboardState): DashboardState {
  return {
    ...state,
    moduleSwitchOn: !state.moduleSwitchOn,
  };
}

export function toggleTransportSwitch(state: DashboardState): DashboardState {
  return {
    ...state,
    transportSwitchOn: !state.transportSwitchOn,
  };
}

export function togglePlayback(state: DashboardState): DashboardState {
  return {
    ...state,
    isPlaying: !state.isPlaying,
  };
}
