import { CLASS_LEVELS_FULL, ClassLevel, getDefaultSerieForClass, SerieOption } from '../data/studyData';

export type FormatIndex = 0 | 1 | 2 | 3;

export interface FormatMeta {
  index: FormatIndex;
  id: 'cours' | 'exercice' | 'revision' | 'examen';
  sidebarLabel: string;
  bottomLabel: string;
  badge: string;
  title: string;
  themeClass: string;
}

export const FORMAT_META: readonly FormatMeta[] = [
  {
    index: 0,
    id: 'cours',
    sidebarLabel: 'Cours',
    bottomLabel: 'Cours',
    badge: 'COURS',
    title: 'Apprends chaque leçon pas à pas',
    themeClass: 'theme-cours',
  },
  {
    index: 1,
    id: 'exercice',
    sidebarLabel: 'Entraînement',
    bottomLabel: 'Exercices & Examens',
    badge: 'EXERCICES & EXAMENS',
    title: 'À toi de t’entraîner !',
    themeClass: 'theme-exercice',
  },
  {
    index: 2,
    id: 'revision',
    sidebarLabel: 'Révisions',
    bottomLabel: 'Révisions',
    badge: 'RÉVISIONS',
    title: 'Révise à ta façon',
    themeClass: 'theme-revision',
  },
  {
    index: 3,
    id: 'examen',
    sidebarLabel: 'Examens',
    bottomLabel: 'Préparation Examen',
    badge: 'PRÉPARATION EXAMEN',
    title: 'Prépare ton examen avec méthode',
    themeClass: 'theme-examen',
  },
] as const;

export const TOTAL_FORMATS = FORMAT_META.length;

export interface DashboardState {
  activeFormat: FormatIndex;
  activeUtilityNav: number | null;
  sidebarExpanded: boolean;
  profileActive: boolean;
  selectedClass: ClassLevel;
  selectedSerie: SerieOption | null;
}

export function createInitialDashboardState(): DashboardState {
  return {
    activeFormat: 0,
    activeUtilityNav: null,
    sidebarExpanded: false,
    profileActive: false,
    selectedClass: 'CI',
    selectedSerie: getDefaultSerieForClass('CI'),
  };
}

export function stepFormat(current: FormatIndex, delta: 1 | -1): FormatIndex {
  const next = (current + delta + TOTAL_FORMATS) % TOTAL_FORMATS;
  return next as FormatIndex;
}

export function setFormat(state: DashboardState, index: number): DashboardState {
  const clamped = Math.max(0, Math.min(TOTAL_FORMATS - 1, Math.round(index))) as FormatIndex;
  return {
    ...state,
    activeFormat: clamped,
  };
}

export function stepClassLevel(current: ClassLevel, delta: 1 | -1): ClassLevel {
  const idx = CLASS_LEVELS_FULL.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  const nextIdx = (safeIdx + delta + CLASS_LEVELS_FULL.length) % CLASS_LEVELS_FULL.length;
  return CLASS_LEVELS_FULL[nextIdx];
}

export function setActiveClass(state: DashboardState, nextClass: ClassLevel): DashboardState {
  return {
    ...state,
    selectedClass: nextClass,
    selectedSerie: getDefaultSerieForClass(nextClass),
  };
}

export function resolveSwipeDirection(dx: number, containerWidth: number): -1 | 0 | 1 {
  const threshold = Math.max(56, Math.round(containerWidth * 0.12));
  if (dx >= threshold) return 1;
  if (dx <= -threshold) return -1;
  return 0;
}

export function clampPercentage(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function computePreparationPercent(
  statuses: readonly ('À commencer' | 'En cours' | 'Révisée')[],
): number {
  if (statuses.length === 0) return 0;
  const totalPoints = statuses.reduce((sum, status) => {
    if (status === 'Révisée') return sum + 100;
    if (status === 'En cours') return sum + 50;
    return sum;
  }, 0);
  return clampPercentage(totalPoints / statuses.length);
}

export function computeDaysRemaining(
  examDateIso: string,
  referenceDate: Date = new Date(),
): number | null {
  if (!examDateIso) return null;
  const target = new Date(`${examDateIso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const todayMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const diffMs = target.getTime() - todayMidnight.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function toggleUtilityNav(state: DashboardState, index: number): DashboardState {
  const safeIndex = Math.max(0, Math.min(1, index));
  return {
    ...state,
    activeUtilityNav: state.activeUtilityNav === safeIndex ? null : safeIndex,
  };
}
