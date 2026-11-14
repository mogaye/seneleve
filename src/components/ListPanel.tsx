import React from 'react';
import { type CurriculumClassItem } from '../data/senegalCurriculum';

interface ListPanelProps {
  cycleLabel: string;
  classes: CurriculumClassItem[];
  activeRow: number;
  filterActive: boolean;
  onSelectRow: (index: number) => void;
  onToggleFilter: () => void;
  onConfirm: () => void;
}

export const ListPanel: React.FC<ListPanelProps> = ({
  cycleLabel,
  classes,
  activeRow,
  filterActive,
  onSelectRow,
  onToggleFilter,
  onConfirm,
}) => {
  return (
    <section
      aria-label={`Classes du cycle ${cycleLabel}`}
      className="sg-card-l1 flex flex-col justify-between rounded-[18px] p-3.5 md:h-full md:min-h-0 md:p-4"
    >
      {/* Top row: filter chip + class count */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleFilter}
          aria-pressed={filterActive}
          className={`sg-focus-ring h-[22px] shrink-0 whitespace-nowrap rounded-full px-3 text-[11px] font-semibold transition-all duration-150 active:scale-[0.97] ${
            filterActive
              ? 'bg-[#66686C] text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
              : 'border border-[#B0B1AD] bg-[#DCDCD7] text-[#3A3C40] hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6]'
          }`}
        >
          {cycleLabel}
        </button>

        <span className="text-[11px] font-medium text-[#66686C] tabular-nums">
          {activeRow + 1} / {classes.length}
        </span>
      </div>

      {/* Scrollable class list */}
      <div
        className="sg-scroll my-2 flex flex-1 min-h-0 flex-col gap-[7px] overflow-y-auto pr-0.5"
        role="listbox"
        aria-label="Niveaux disponibles"
      >
        {classes.map((item, index) => {
          const isActive = activeRow === index;
          if (isActive) {
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={true}
                onClick={() => onSelectRow(index)}
                className="sg-focus-ring flex min-h-[42px] w-full shrink-0 items-center justify-between gap-2 rounded-full border-[1.5px] border-[#2B66DC] bg-[#DCE6FA] p-[4px] pr-3 shadow-[0_0_22px_rgba(37,99,235,0.34),0_4px_14px_rgba(14,79,214,0.22)] transition-all duration-150 hover:bg-[#D0DDF8]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#0E4FD6] text-[10px] font-bold text-white ring-[3px] ring-[#60A5FA]/45 shadow-[0_0_16px_rgba(37,99,235,0.65)]">
                    {item.shortCode}
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="truncate text-[12px] font-bold text-[#0A2E7A]">
                      {item.title}
                    </div>
                    {!filterActive && (
                      <div className="truncate text-[10.5px] text-[#2A4C9B]">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-[10.5px] font-semibold text-[#0E4FD6] tabular-nums">
                  {item.badge}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => onSelectRow(index)}
              className="sg-focus-ring group flex min-h-[40px] w-full shrink-0 items-center justify-between gap-2 rounded-full px-1 pr-2.5 transition-colors duration-150 hover:bg-[#E7E9ED]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[#BDBDB8] bg-[#E2E2DD] text-[10px] font-bold text-[#1C1E22] transition-colors group-hover:border-[#2B66DC] group-hover:bg-[#DCE6FA] group-hover:text-[#0E4FD6]">
                  {item.shortCode}
                </span>
                <div className="min-w-0 text-left">
                  <div className="truncate text-[12px] font-semibold text-[#141414]">
                    {item.title}
                  </div>
                  {!filterActive && (
                    <div className="truncate text-[10.5px] text-[#66686C]">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[10.5px] font-medium text-[#66686C] tabular-nums group-hover:text-[#0E4FD6]">
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom full-width secondary action */}
      <button
        type="button"
        onClick={onConfirm}
        className="sg-focus-ring sg-btn-secondary h-[28px] w-full shrink-0 whitespace-nowrap rounded-full text-xs font-semibold text-[#0E4FD6] transition-all duration-150 hover:text-[#0A3DAA] active:text-white"
      >
        Niveau suivant
      </button>
    </section>
  );
};
