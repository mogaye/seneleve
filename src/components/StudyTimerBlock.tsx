import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';

interface StudyTimerBlockProps {
  label: string;
  minutes: number;
  compact?: boolean;
  onChange?: (next: { label: string; minutes: number }) => void;
}

export const StudyTimerBlock: React.FC<StudyTimerBlockProps> = ({
  label,
  minutes,
  compact = false,
  onChange,
}) => {
  const safeMinutes = Math.max(1, Math.min(180, minutes || 25));
  const [secondsLeft, setSecondsLeft] = useState(safeMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(safeMinutes * 60);
    }
  }, [safeMinutes, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalSecs = safeMinutes * 60;
  const progressPct = totalSecs > 0 ? Math.round(((totalSecs - secondsLeft) / totalSecs) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-[12px] border border-white/80 bg-white/75 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Timer className="h-[13px] w-[13px] shrink-0 text-[var(--accent)]" />
          {onChange && !compact ? (
            <input
              type="text"
              value={label}
              onChange={(e) => onChange({ label: e.target.value, minutes: safeMinutes })}
              aria-label="Intitulé du minuteur"
              className="sg-focus-ring min-w-0 flex-1 rounded bg-transparent text-[12px] font-semibold text-[#121417]"
            />
          ) : (
            <span className="truncate text-[11.5px] font-semibold text-[#121417]">
              {label || 'Séance d’étude'}
            </span>
          )}
        </div>

        <span className="font-mono text-[14px] font-bold text-[var(--accent)] tabular-nums">
          {formatted}
        </span>
      </div>

      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="sg-accent-bar h-full rounded-full transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          {[15, 25, 45].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(preset * 60);
                onChange?.({ label, minutes: preset });
              }}
              className={`sg-focus-ring rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                safeMinutes === preset
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'bg-[#F1F5F9] text-[#4B4E54] hover:bg-[#E2E8F0]'
              }`}
            >
              {preset}m
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (secondsLeft === 0) setSecondsLeft(safeMinutes * 60);
              setRunning((v) => !v);
            }}
            className="sg-focus-ring sg-btn-primary flex h-[24px] items-center gap-1 rounded-full px-2.5 text-[10.5px] font-semibold text-white whitespace-nowrap"
          >
            {running ? <Pause className="h-[10px] w-[10px]" /> : <Play className="h-[10px] w-[10px]" />}
            <span>{running ? 'Pause' : 'Démarrer'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(safeMinutes * 60);
            }}
            aria-label="Réinitialiser le minuteur"
            className="sg-focus-ring flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] text-[#36393F] hover:bg-[#E2E8F0]"
          >
            <RotateCcw className="h-[10.5px] w-[10.5px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
