import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  CLASS_CATALOG,
  ClassLevel,
  getSeriesForClass,
  SchoolCycle,
  SerieOption,
} from '../data/studyData';
import { SubjectTutorPersona } from '../utils/tutorAgent';

const CYCLES_ORDER: readonly SchoolCycle[] = [
  'Préscolaire',
  'Élémentaire',
  'Collège',
  'Lycée',
];

interface TopClassBarProps {
  screenLabel: string;
  selectedClass: ClassLevel;
  selectedSerie: SerieOption | null;
  cycle: SchoolCycle;
  isLayoutCustomized: boolean;
  isLayoutLocked: boolean;
  tutor?: SubjectTutorPersona;
  noveltiesCount?: number;
  onSelectClass: (nextClass: ClassLevel) => void;
  onSelectSerie: (nextSerie: SerieOption) => void;
  onAddTile: () => void;
  onResetLayout: () => void;
  onToggleLayoutLock: () => void;
  onOpenTutor?: () => void;
}

export const TopClassBar: React.FC<TopClassBarProps> = ({
  screenLabel,
  selectedClass,
  selectedSerie,
  cycle,
  isLayoutCustomized,
  isLayoutLocked,
  tutor,
  noveltiesCount = 0,
  onSelectClass,
  onSelectSerie,
  onAddTile,
  onResetLayout,
  onToggleLayoutLock,
  onOpenTutor,
}) => {
  const availableSeries = getSeriesForClass(selectedClass);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({
    top: 64,
    right: 16,
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateMenuPosition = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: Math.round(rect.bottom + 8),
      right: Math.max(8, Math.round(window.innerWidth - rect.right)),
    });
  };

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleReposition = () => updateMenuPosition();

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [menuOpen]);

  return (
    <header className="sg-glass-bar flex h-full w-full min-w-0 flex-wrap items-center justify-between gap-2 overflow-y-auto overflow-x-hidden rounded-[26px] px-3 py-1.5 md:px-4">
      {/* Left: Student emblem + current screen + active cycle */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          aria-hidden="true"
          className="sg-btn-primary flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white md:h-[32px] md:w-[32px]"
        >
          É
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[13px] font-bold tracking-normal text-[#121417] md:text-[13.5px]">
            {screenLabel}
          </span>
          <span aria-hidden="true" className="hidden text-[#7A7D84] @md:inline">
            ·
          </span>
          <span className="hidden text-[12px] font-medium text-[#4B4E54] @md:inline whitespace-nowrap">
            {cycle}
          </span>
        </div>
      </div>

      {/* Center/Right: Class Dropdown + Serie Dropdown + Layout Menu + Lock Button */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 md:gap-2">
        {/* Dropdown menu for selecting the active class */}
        <div className="sg-glass-subtile flex h-[32px] min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 md:h-[34px] md:gap-2 md:px-3">
          <GraduationCap className="h-[14px] w-[14px] shrink-0 text-[var(--accent)]" strokeWidth={2.2} />
          <label
            htmlFor="global-class-select"
            className="hidden text-[11.5px] font-semibold text-[#4B4E54] @sm:inline whitespace-nowrap"
          >
            Classe
          </label>
          <select
            id="global-class-select"
            aria-label="Sélectionner une classe"
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value as ClassLevel)}
            className="sg-focus-ring min-w-0 max-w-full cursor-pointer bg-transparent pr-1 text-[12px] font-bold text-[#121417] outline-none md:text-[12.5px]"
          >
            {CYCLES_ORDER.map((cycleName) => (
              <optgroup key={cycleName} label={cycleName}>
                {CLASS_CATALOG.filter((c) => c.cycle === cycleName).map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.id}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Série selector when selected class has séries (2nde, 1re, Terminale) */}
        {availableSeries.length > 0 && selectedSerie && (
          <div className="sg-glass-subtile flex h-[32px] min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 md:h-[34px] md:px-3">
            <label
              htmlFor="global-serie-select"
              className="hidden text-[11.5px] font-semibold text-[#4B4E54] @sm:inline whitespace-nowrap"
            >
              Série
            </label>
            <select
              id="global-serie-select"
              aria-label="Sélectionner une série"
              value={selectedSerie}
              onChange={(e) => onSelectSerie(e.target.value as SerieOption)}
              className="sg-focus-ring min-w-0 max-w-full cursor-pointer bg-transparent pr-1 text-[12px] font-bold text-[var(--accent)] outline-none md:text-[12.5px]"
            >
              {availableSeries.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tutor button named by current subject */}
        {tutor && onOpenTutor && (
          <button
            type="button"
            onClick={onOpenTutor}
            aria-label={`Parler avec ${tutor.name} (${tutor.subject})`}
            title={`${tutor.name} · ${tutor.roleLabel}`}
            className="sg-focus-ring sg-nav-idle relative flex h-[32px] shrink-0 items-center gap-1.5 rounded-full pr-2.5 pl-1 text-[12px] font-semibold text-[#121417] md:h-[34px]"
          >
            <span className="sg-btn-primary flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
              {tutor.initial}
            </span>
            <span className="max-w-[74px] truncate">{tutor.name}</span>
            {noveltiesCount > 0 && (
              <span
                aria-label={`${noveltiesCount} nouveauté(s) à analyser`}
                className="flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9.5px] font-bold text-white tabular-nums"
              >
                {noveltiesCount}
              </span>
            )}
          </button>
        )}

        {/* Simple Icon-Only Dropdown Trigger grouping Add Tile, Reset, and Lock */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={
            isLayoutLocked
              ? 'Menu disposition (verrouillé)'
              : 'Menu disposition'
          }
          title={
            isLayoutLocked
              ? 'Disposition (cadenas fermé)'
              : 'Disposition et cadenas'
          }
          className={`sg-focus-ring relative flex h-[32px] shrink-0 items-center justify-center gap-1 rounded-full px-2.5 transition-colors md:h-[34px] ${
            menuOpen || isLayoutLocked
              ? 'sg-btn-secondary text-[var(--accent)]'
              : 'sg-nav-idle text-[#30343B]'
          }`}
        >
          <LayoutGrid className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
          <ChevronDown
            className={`h-[12px] w-[12px] shrink-0 transition-transform duration-150 ${
              menuOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={2.2}
          />
          {isLayoutLocked && (
            <span
              aria-hidden="true"
              className="absolute -top-[2px] -right-[2px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xs"
            >
              <Lock className="h-[8px] w-[8px]" strokeWidth={2.6} />
            </span>
          )}
        </button>
      </div>

      {/* Portaled Dropdown Menu so it never clips inside header overflow */}
      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Menu disposition"
            data-no-swipe="true"
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              right: `${menuPos.right}px`,
              zIndex: 120,
            }}
            className="sg-card-l2 flex min-w-[240px] flex-col gap-1 rounded-[18px] p-1.5 shadow-[0_18px_44px_rgba(20,24,32,0.2)]"
          >
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={isLayoutLocked}
              onClick={() => {
                onToggleLayoutLock();
                setMenuOpen(false);
              }}
              className={`sg-focus-ring flex w-full items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                isLayoutLocked
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[#1C1E22] hover:bg-white/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {isLayoutLocked ? (
                  <Lock className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
                ) : (
                  <LockOpen className="h-[14px] w-[14px] shrink-0" strokeWidth={2.1} />
                )}
                <span>{isLayoutLocked ? 'Ouvrir le cadenas' : 'Fermer le cadenas'}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                  isLayoutLocked
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white/80 text-[#4B4E54]'
                }`}
              >
                {isLayoutLocked ? 'Verrouillé' : 'Libre'}
              </span>
            </button>

            <div className="my-0.5 h-px bg-white/70" aria-hidden="true" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onAddTile();
              }}
              className="sg-focus-ring flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-left text-[12px] font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              <Plus className="h-[14px] w-[14px] shrink-0" strokeWidth={2.3} />
              <span>Ajouter un carreau</span>
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={!isLayoutCustomized}
              onClick={() => {
                if (!isLayoutCustomized) return;
                setMenuOpen(false);
                onResetLayout();
              }}
              className={`sg-focus-ring flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                isLayoutCustomized
                  ? 'text-[#1C1E22] hover:bg-white/80'
                  : 'cursor-not-allowed text-[#7A7D84] opacity-60'
              }`}
            >
              <RotateCcw className="h-[13.5px] w-[13.5px] shrink-0" strokeWidth={2.1} />
              <span>Réinitialiser</span>
            </button>
          </div>,
          document.body,
        )}
    </header>
  );
};
