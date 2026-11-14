import React from 'react';

interface ListPanelProps {
  activeRow: number;
  filterActive: boolean;
  onSelectRow: (index: number) => void;
  onToggleFilter: () => void;
  onConfirm: () => void;
}

export const ListPanel: React.FC<ListPanelProps> = ({
  activeRow,
  filterActive,
  onSelectRow,
  onToggleFilter,
  onConfirm,
}) => {
  return (
    <section
      aria-label="Selection list"
      className="sg-card-l1 flex h-full flex-col justify-between rounded-[18px] p-3.5 md:p-4"
    >
      {/* Top-left filter chip pill */}
      <div>
        <button
          type="button"
          onClick={onToggleFilter}
          aria-label="Filter items"
          aria-pressed={filterActive}
          className={`sg-focus-ring h-[16px] w-[42px] rounded-full transition-all duration-150 active:scale-[0.97] ${
            filterActive
              ? 'bg-[#66686C] shadow-[0_2px_6px_rgba(0,0,0,0.16)]'
              : 'sg-nav-idle'
          }`}
        />
      </div>

      {/* 4 List Rows */}
      <div className="my-2 flex flex-col gap-[7px]" role="listbox" aria-label="Items">
        {[0, 1, 2, 3].map((index) => {
          const isActive = activeRow === index;
          if (isActive) {
            return (
              <button
                key={index}
                type="button"
                role="option"
                aria-selected={true}
                aria-label={`Item ${index + 1} (selected)`}
                onClick={() => onSelectRow(index)}
                className="sg-focus-ring sg-selected-capsule flex h-[36px] w-full items-center rounded-full p-[4px] transition-all duration-150"
              >
                <span className="sg-halo-ring flex h-[28px] w-[28px] items-center justify-center rounded-full">
                  <span className="sg-halo-core h-[20px] w-[20px] rounded-full" />
                </span>
              </button>
            );
          }

          return (
            <button
              key={index}
              type="button"
              role="option"
              aria-selected={false}
              aria-label={`Select item ${index + 1}`}
              onClick={() => onSelectRow(index)}
              className="sg-focus-ring group flex h-[34px] w-full items-center justify-between rounded-full px-1 transition-colors duration-150 hover:bg-[#E7E9ED]"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-[26px] w-[26px] shrink-0 rounded-full border border-[#BDBDB8] bg-[#E2E2DD] transition-colors group-hover:border-[#9A9C9E]" />
                <span className="flex flex-col gap-[5px]">
                  <span className="h-[5.5px] w-[42px] rounded-full bg-[#1C1E22]" />
                  <span className="h-[5.5px] w-[42px] rounded-full bg-[#7A7C80]" />
                </span>
              </div>
              <span className="h-[5px] w-[11px] rounded-full bg-[#9A9C9E] transition-colors group-hover:bg-[#141414]" />
            </button>
          );
        })}
      </div>

      {/* Bottom full-width secondary action pill */}
      <button
        type="button"
        onClick={onConfirm}
        aria-label="Confirm list action"
        className="sg-focus-ring sg-btn-secondary h-[25px] w-full rounded-full transition-all duration-150"
      />
    </section>
  );
};
