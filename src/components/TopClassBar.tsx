import React from 'react';
import { GraduationCap, Plus, RotateCcw } from 'lucide-react';
import {
  CLASS_CATALOG,
  ClassLevel,
  getSeriesForClass,
  SchoolCycle,
  SerieOption,
} from '../data/studyData';

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
  onSelectClass: (nextClass: ClassLevel) => void;
  onSelectSerie: (nextSerie: SerieOption) => void;
  onAddTile: () => void;
  onResetLayout: () => void;
}

export const TopClassBar: React.FC<TopClassBarProps> = ({
  screenLabel,
  selectedClass,
  selectedSerie,
  cycle,
  isLayoutCustomized,
  onSelectClass,
  onSelectSerie,
  onAddTile,
  onResetLayout,
}) => {
  const availableSeries = getSeriesForClass(selectedClass);

  return (
    <header className="sg-glass-bar flex w-full flex-wrap items-center justify-between gap-2 rounded-[22px] px-3 py-2 md:h-[52px] md:flex-nowrap md:rounded-full md:px-4">
      {/* Left: Student emblem + current screen + active cycle */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          aria-hidden="true"
          className="sg-btn-primary flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        >
          É
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[13.5px] font-bold tracking-normal text-[#121417]">
            {screenLabel}
          </span>
          <span aria-hidden="true" className="hidden text-[#7A7D84] sm:inline">
            ·
          </span>
          <span className="hidden text-[12px] font-medium text-[#4B4E54] sm:inline whitespace-nowrap">
            {cycle}
          </span>
        </div>
      </div>

      {/* Center/Right: Class Dropdown + Serie Dropdown + Tile Layout Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dropdown menu for selecting the active class */}
        <div className="sg-glass-subtile flex h-[34px] items-center gap-2 rounded-full px-3">
          <GraduationCap className="h-[14px] w-[14px] shrink-0 text-[var(--accent)]" strokeWidth={2.2} />
          <label
            htmlFor="global-class-select"
            className="text-[11.5px] font-semibold text-[#4B4E54] whitespace-nowrap"
          >
            Classe
          </label>
          <select
            id="global-class-select"
            aria-label="Sélectionner une classe"
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value as ClassLevel)}
            className="sg-focus-ring cursor-pointer bg-transparent pr-1 text-[12.5px] font-bold text-[#121417] outline-none"
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
          <div className="sg-glass-subtile flex h-[34px] items-center gap-1.5 rounded-full px-3">
            <label
              htmlFor="global-serie-select"
              className="text-[11.5px] font-semibold text-[#4B4E54] whitespace-nowrap"
            >
              Série
            </label>
            <select
              id="global-serie-select"
              aria-label="Sélectionner une série"
              value={selectedSerie}
              onChange={(e) => onSelectSerie(e.target.value as SerieOption)}
              className="sg-focus-ring cursor-pointer bg-transparent pr-1 text-[12.5px] font-bold text-[var(--accent)] outline-none"
            >
              {availableSeries.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={onAddTile}
          aria-label="Ajouter un carreau"
          title="Ajouter un carreau libre"
          className="sg-focus-ring sg-btn-secondary flex h-[34px] items-center gap-1.5 rounded-full px-3 text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
        >
          <Plus className="h-[13.5px] w-[13.5px] shrink-0" strokeWidth={2.3} />
          <span>Carreau</span>
        </button>

        {isLayoutCustomized && (
          <button
            type="button"
            onClick={onResetLayout}
            aria-label="Réinitialiser la disposition"
            title="Rétablir la disposition par défaut"
            className="sg-focus-ring sg-nav-idle flex h-[34px] items-center gap-1.5 rounded-full px-3 text-[11.5px] font-semibold text-[#30343B] whitespace-nowrap"
          >
            <RotateCcw className="h-[13px] w-[13px] shrink-0" strokeWidth={2.1} />
            <span className="hidden lg:inline">Réinitialiser</span>
          </button>
        )}
      </div>
    </header>
  );
};
