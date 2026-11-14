import React from 'react';
import { TOTAL_CLASSES_COUNT } from '../utils/wireframeState';

interface TimelinePanelProps {
  progress: number;
  globalOrder: number;
  cycleLabel: string;
  spiralNote: string;
  onStepClass: (delta: number) => void;
  onSetProgress: (value: number) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  progress,
  globalOrder,
  cycleLabel,
  spiralNote,
  onStepClass,
  onSetProgress,
}) => {
  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    onSetProgress(Math.round(ratio * 100));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onStepClass(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onStepClass(-1);
    }
  };

  return (
    <section
      aria-label="Parcours scolaire global"
      className="sg-card-l1 flex min-h-[160px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0"
    >
      {/* Top-left stacked title + subtitle */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#141414]">Parcours scolaire</h2>
          <span className="text-[11px] font-semibold text-[#0E4FD6] tabular-nums">
            {globalOrder}/{TOTAL_CLASSES_COUNT}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[#66686C]">{cycleLabel} · Préscolaire à Terminale</p>
        <p className="mt-2.5 text-xs leading-relaxed text-[#424449] line-clamp-3">
          {spiralNote}
        </p>
      </div>

      {/* Bottom navigation pills + glowing cobalt progress track */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onStepClass(-1)}
            aria-label="Classe précédente"
            className="sg-focus-ring h-[24px] shrink-0 whitespace-nowrap rounded-full border border-[#B0B1AD] bg-[#E3E3DE] px-3 text-[11px] font-semibold text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            ← Précédente
          </button>
          <button
            type="button"
            onClick={() => onStepClass(1)}
            aria-label="Classe suivante"
            className="sg-focus-ring h-[24px] shrink-0 whitespace-nowrap rounded-full border border-[#B0B1AD] bg-[#E3E3DE] px-3 text-[11px] font-semibold text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            Suivante →
          </button>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Progression du cursus"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          onClick={handleTrackClick}
          onKeyDown={handleKeyDown}
          className="sg-focus-ring relative flex h-[10px] w-full cursor-pointer items-center rounded-full"
        >
          <div className="h-[3.5px] w-full overflow-hidden rounded-full bg-[#D6D6D1]">
            <div
              className="h-full rounded-full bg-[#0E4FD6] shadow-[0_0_14px_rgba(37,99,235,0.75)] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
