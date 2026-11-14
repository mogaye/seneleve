import React from 'react';

interface ModuleTogglePanelProps {
  switchOn: boolean;
  onToggleSwitch: () => void;
  onApply: () => void;
}

export const ModuleTogglePanel: React.FC<ModuleTogglePanelProps> = ({
  switchOn,
  onToggleSwitch,
  onApply,
}) => {
  return (
    <section
      aria-label="Module control card"
      className="sg-card-l3 flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[18px] md:h-full md:min-h-0"
    >
      {/* Top area */}
      <div className="p-4">
        <button
          type="button"
          onClick={onApply}
          aria-label="Module header pill"
          className="sg-focus-ring h-[16px] w-[66px] rounded-full bg-[#141414] transition-all duration-150 hover:bg-[#2F3136] active:scale-95"
        />
      </div>

      {/* Inset warm-stone sub-card */}
      <div className="mx-[3px] mb-[3px] flex flex-col justify-between gap-3.5 rounded-[15px] border border-[#D4D4CF] bg-[#EBEBE6] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-[5px]">
            <span className="h-[6.5px] w-[34px] rounded-full bg-[#1C1E22]" />
            <span className="h-[6.5px] w-[34px] rounded-full bg-[#7A7C80]" />
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            aria-label="Toggle primary module"
            onClick={onToggleSwitch}
            className={`sg-focus-ring flex h-[17px] w-[30px] shrink-0 items-center rounded-full p-[2px] transition-all duration-150 ${
              switchOn
                ? 'sg-accent-switch'
                : 'border border-[#A4A5A2] bg-[#C8C9C5]'
            }`}
          >
            <span
              className={`h-[11px] w-[11px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                switchOn ? 'translate-x-[13px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onApply}
          aria-label="Execute module action"
          className="sg-focus-ring sg-btn-primary h-[34px] w-full rounded-full transition-all duration-150"
        />
      </div>
    </section>
  );
};
