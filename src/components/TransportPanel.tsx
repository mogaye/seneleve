import React from 'react';

interface TransportPanelProps {
  switchOn: boolean;
  isPlaying: boolean;
  progress: number;
  onToggleSwitch: () => void;
  onTogglePlay: () => void;
  onStepMedia: (delta: number) => void;
  onSetMedia: (value: number) => void;
}

export const TransportPanel: React.FC<TransportPanelProps> = ({
  switchOn,
  isPlaying,
  progress,
  onToggleSwitch,
  onTogglePlay,
  onStepMedia,
  onSetMedia,
}) => {
  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    onSetMedia(Math.round(ratio * 100));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onStepMedia(10);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onStepMedia(-10);
    }
  };

  return (
    <section
      aria-label="Transport control card"
      className="sg-card-l1 flex min-h-[160px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0"
    >
      {/* Top row: 2 stacked bars on left + switch & status pill base on right */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-[6px]">
          <span className="h-[7px] w-[52px] rounded-full bg-[#141414]" />
          <span className="h-[6px] w-[36px] rounded-full bg-[#7A7C80]" />
        </div>

        <div className="flex flex-col items-center gap-[3px]">
          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            aria-label="Toggle transport option"
            onClick={onToggleSwitch}
            className={`sg-focus-ring flex h-[15px] w-[27px] items-center rounded-full p-[2px] transition-all duration-150 ${
              switchOn
                ? 'sg-accent-switch'
                : 'border border-[#A4A5A2] bg-[#C8C9C5]'
            }`}
          >
            <span
              className={`h-[9px] w-[9px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                switchOn ? 'translate-x-[12px]' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            aria-hidden="true"
            className={`h-[6px] w-[27px] rounded-full border transition-colors duration-150 ${
              switchOn
                ? 'border-[#5D9B6E] bg-[#CEE5D3] shadow-[0_0_8px_rgba(93,155,110,0.35)]'
                : 'border-[#BDBDB8] bg-[#E3E3DE]'
            }`}
          />
        </div>
      </div>

      {/* Bottom: 5 centered transport controls + bottom themed progress track */}
      <div className="flex flex-col gap-[13px]">
        <div className="flex items-center justify-center gap-[9px]">
          <button
            type="button"
            onClick={() => onStepMedia(-20)}
            aria-label="Skip back"
            className="sg-focus-ring sg-nav-idle h-[11px] w-[18px] rounded-full transition-all duration-150 active:scale-95"
          />
          <button
            type="button"
            onClick={() => onStepMedia(-8)}
            aria-label="Step back"
            className="sg-focus-ring sg-nav-idle h-[11px] w-[18px] rounded-full transition-all duration-150 active:scale-95"
          />
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
            className={`sg-focus-ring sg-btn-primary flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all duration-150 ${
              isPlaying ? 'scale-105' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => onStepMedia(8)}
            aria-label="Step forward"
            className="sg-focus-ring sg-nav-idle h-[11px] w-[18px] rounded-full transition-all duration-150 active:scale-95"
          />
          <button
            type="button"
            onClick={() => onStepMedia(20)}
            aria-label="Skip forward"
            className="sg-focus-ring sg-nav-idle h-[11px] w-[18px] rounded-full transition-all duration-150 active:scale-95"
          />
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Media progress"
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
