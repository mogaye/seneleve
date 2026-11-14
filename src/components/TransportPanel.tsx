import React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

interface TransportPanelProps {
  cycleLabel: string;
  activeClassTitle: string;
  ageOrScope: string;
  switchOn: boolean;
  isPlaying: boolean;
  progress: number;
  onToggleSwitch: () => void;
  onTogglePlay: () => void;
  onStepClass: (delta: number) => void;
  onStepCycle: (delta: number) => void;
  onSetProgress: (value: number) => void;
}

export const TransportPanel: React.FC<TransportPanelProps> = ({
  cycleLabel,
  activeClassTitle,
  ageOrScope,
  switchOn,
  isPlaying,
  progress,
  onToggleSwitch,
  onTogglePlay,
  onStepClass,
  onStepCycle,
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
      aria-label="Lecture guidée des programmes"
      className="sg-card-l1 flex min-h-[160px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0"
    >
      {/* Top row: current cycle/class info on left + auto switch & status on right */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#141414]">Lecture guidée</h2>
          <p className="mt-0.5 truncate text-xs text-[#66686C]">{activeClassTitle}</p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-[3px]">
          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            aria-label="Activer le défilement continu"
            onClick={onToggleSwitch}
            className={`sg-focus-ring flex h-[15px] w-[28px] items-center rounded-full p-[2px] transition-all duration-150 ${
              switchOn
                ? 'bg-[#0E4FD6] shadow-[0_0_12px_rgba(37,99,235,0.58)] ring-2 ring-[#60A5FA]/30'
                : 'border border-[#A4A5A2] bg-[#C8C9C5]'
            }`}
          >
            <span
              className={`h-[9px] w-[9px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                switchOn ? 'translate-x-[13px]' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-[10px] font-semibold text-[#2E6F40]">
            {isPlaying ? 'En cours' : switchOn ? 'Prêt' : 'Manuel'}
          </span>
        </div>
      </div>

      {/* Middle concise scope */}
      <p className="text-xs text-[#45474D] tabular-nums">
        {cycleLabel} · {ageOrScope}
      </p>

      {/* Bottom: 5 centered transport controls + bottom cobalt progress track */}
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-center gap-[9px]">
          <button
            type="button"
            onClick={() => onStepCycle(-1)}
            aria-label="Cycle précédent"
            title="Cycle précédent"
            className="sg-focus-ring flex h-[22px] w-[28px] items-center justify-center rounded-full border border-[#B0B1AD] bg-[#E3E3DE] text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            <SkipBack className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onStepClass(-1)}
            aria-label="Niveau précédent"
            title="Niveau précédent"
            className="sg-focus-ring flex h-[22px] w-[28px] items-center justify-center rounded-full border border-[#B0B1AD] bg-[#E3E3DE] text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Mettre en pause' : 'Lancer la lecture guidée'}
            aria-pressed={isPlaying}
            className={`sg-focus-ring sg-btn-primary flex h-[36px] w-[36px] items-center justify-center rounded-full text-white ring-[3px] ring-[#60A5FA]/28 transition-all duration-150 ${
              isPlaying
                ? 'ring-[5px] ring-[#3B82F6]/45 shadow-[0_0_26px_rgba(37,99,235,0.75)]'
                : ''
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onStepClass(1)}
            aria-label="Niveau suivant"
            title="Niveau suivant"
            className="sg-focus-ring flex h-[22px] w-[28px] items-center justify-center rounded-full border border-[#B0B1AD] bg-[#E3E3DE] text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onStepCycle(1)}
            aria-label="Cycle suivant"
            title="Cycle suivant"
            className="sg-focus-ring flex h-[22px] w-[28px] items-center justify-center rounded-full border border-[#B0B1AD] bg-[#E3E3DE] text-[#3A3C40] transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] active:scale-95"
          >
            <SkipForward className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Progression dans le cycle"
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
