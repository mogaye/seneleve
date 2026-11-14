import React from 'react';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import {
  CLASS_LEVELS_FULL,
  ClassLevel,
  getSeriesForClass,
  SchoolCycle,
  SerieOption,
} from '../data/studyData';

interface TopClassBarProps {
  screenLabel: string;
  selectedClass: ClassLevel;
  selectedSerie: SerieOption | null;
  cycle: SchoolCycle;
  onSelectClass: (nextClass: ClassLevel) => void;
  onStepClass: (delta: -1 | 1) => void;
  onSelectSerie: (nextSerie: SerieOption) => void;
}

export const TopClassBar: React.FC<TopClassBarProps> = ({
  screenLabel,
  selectedClass,
  selectedSerie,
  cycle,
  onSelectClass,
  onStepClass,
  onSelectSerie,
}) => {
  const availableSeries = getSeriesForClass(selectedClass);
  const classIndex = CLASS_LEVELS_FULL.indexOf(selectedClass);

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
          <span className="truncate text-[13.5px] font-bold tracking-tight text-[#121417]">
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

      {/* Center/Right: Class Dropdown + Serie Dropdown (when applicable) + Step Class Button */}
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
            {CLASS_LEVELS_FULL.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
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

        {/* Class-by-class stepper buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStepClass(-1)}
            aria-label="Classe précédente"
            title="Classe précédente"
            className="sg-focus-ring sg-nav-idle flex h-[32px] w-[32px] items-center justify-center rounded-full text-[#1C1E22] transition-transform duration-150 active:scale-95"
          >
            <ChevronLeft className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={() => onStepClass(1)}
            aria-label="Classe suivante"
            className="sg-focus-ring sg-btn-primary flex h-[32px] items-center gap-1 rounded-full px-3.5 text-[11.5px] font-semibold text-white whitespace-nowrap transition-[transform,box-shadow] duration-150 active:scale-95"
          >
            <span>Classe suivante</span>
            <ChevronRight className="h-[14px] w-[14px] shrink-0" strokeWidth={2.3} />
          </button>

          <span className="hidden font-mono text-[11px] font-semibold text-[#4B4E54] tabular-nums lg:inline">
            {classIndex + 1}/{CLASS_LEVELS_FULL.length}
          </span>
        </div>
      </div>
    </header>
  );
};
