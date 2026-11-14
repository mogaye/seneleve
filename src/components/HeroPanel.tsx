import React from 'react';

interface HeroPanelProps {
  titleLabel: string;
  tabLabels?: readonly [string, string, string, string];
  activePill: number;
  primaryActionActive: boolean;
  onSelectPill: (index: number) => void;
  onTriggerPrimary: () => void;
}

export const HeroPanel: React.FC<HeroPanelProps> = ({
  titleLabel,
  tabLabels,
  activePill,
  primaryActionActive,
  onSelectPill,
  onTriggerPrimary,
}) => {
  return (
    <section
      aria-label={titleLabel}
      className="sg-card-l2 flex min-h-[210px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0 md:p-[18px]"
    >
      {/* Top header row: 1 dark title pill + 4 tab pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onTriggerPrimary}
          aria-label={titleLabel}
          className="sg-focus-ring flex h-[24px] items-center rounded-full bg-[#141414] px-3.5 text-[11px] font-medium tracking-wide text-white whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-[#2A2C30] active:scale-[0.97]"
        >
          {titleLabel}
        </button>

        <div className="flex flex-wrap items-center gap-[7px]" role="tablist" aria-label="View modes">
          {[0, 1, 2, 3].map((index) => {
            const isSelected = activePill === index;
            const label = tabLabels ? tabLabels[index] : undefined;
            return (
              <div key={index} className="flex flex-col items-center gap-[4px]">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={label ?? `View mode ${index + 1}`}
                  onClick={() => onSelectPill(index)}
                  className={`sg-focus-ring flex h-[22px] items-center justify-center rounded-full whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.97] ${
                    label ? 'px-3 text-[11px] font-medium' : 'w-[42px] sm:w-[49px]'
                  } ${
                    isSelected
                      ? 'sg-btn-primary text-white'
                      : 'sg-nav-idle text-[#1C1E22]'
                  }`}
                >
                  {label ?? null}
                </button>
                <span
                  aria-hidden="true"
                  className={`h-[2.5px] rounded-full transition-all duration-150 ${
                    label ? 'w-[70%]' : 'w-[32px]'
                  } ${isSelected ? 'sg-accent-bar' : 'bg-transparent'}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row: primary action pill + subtle right indicator line/dots */}
      <div className="flex items-end justify-between pt-8">
        <button
          type="button"
          onClick={onTriggerPrimary}
          aria-label="Primary canvas action"
          aria-pressed={primaryActionActive}
          className={`sg-focus-ring h-[22px] w-[78px] rounded-full transition-all duration-150 ${
            primaryActionActive ? 'sg-btn-secondary' : 'sg-btn-primary'
          }`}
        />

        <div
          aria-hidden="true"
          className="flex items-center gap-[4px] pb-[2px]"
        >
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`block h-[2.5px] rounded-full transition-all duration-150 ${
                activePill === idx ? 'sg-accent-bar w-[28px]' : 'w-[3.5px] bg-[#B4B5B3]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
