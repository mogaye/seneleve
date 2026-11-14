import React from 'react';

interface TimelinePanelProps {
  progress: number;
  onStepProgress: (delta: number) => void;
  onSetProgress: (value: number) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  progress,
  onStepProgress,
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
      onStepProgress(10);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onStepProgress(-10);
    }
  };

  return (
    <section
      aria-label="Timeline card"
      className="sg-card-l1 flex min-h-[160px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0"
    >
      {/* Top-left 2 stacked bars (primary + secondary ink) */}
      <div className="flex flex-col gap-[6px]">
        <span className="h-[7px] w-[54px] rounded-full bg-[#141414]" />
        <span className="h-[6px] w-[36px] rounded-full bg-[#7A7C80]" />
      </div>

      {/* Bottom 2 chip pills + themed progress track */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onStepProgress(-12)}
            aria-label="Previous segment"
            className="sg-focus-ring sg-nav-idle h-[12px] w-[42px] rounded-full transition-all duration-150 active:scale-95"
          />
          <button
            type="button"
            onClick={() => onStepProgress(12)}
            aria-label="Next segment"
            className="sg-focus-ring sg-nav-idle h-[12px] w-[42px] rounded-full transition-all duration-150 active:scale-95"
          />
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Timeline progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          onClick={handleTrackClick}
          onKeyDown={handleKeyDown}
          className="sg-focus-ring relative flex h-[10px] w-full cursor-pointer items-center rounded-full"
        >
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#D6D6D1]">
            <div
              className="sg-accent-bar h-full rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
