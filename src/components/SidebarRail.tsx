import React from 'react';

interface SidebarRailProps {
  activeNav: number;
  activeUtility: number | null;
  sidebarExpanded: boolean;
  profileActive: boolean;
  onSelectNav: (index: number) => void;
  onToggleUtility: (index: number) => void;
  onToggleExpand: () => void;
  onToggleProfile: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeNav,
  activeUtility,
  sidebarExpanded,
  profileActive,
  onSelectNav,
  onToggleUtility,
  onToggleExpand,
  onToggleProfile,
}) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="sg-card-l1 relative flex w-full flex-row items-center justify-between rounded-[18px] px-3 py-2.5 md:h-full md:w-[58px] md:shrink-0 md:flex-col md:justify-start md:px-0 md:py-3.5"
    >
      {/* Top profile circle + edge handle */}
      <div className="relative flex items-center justify-center md:w-full">
        <button
          type="button"
          onClick={onToggleProfile}
          aria-label="Workspace profile"
          aria-pressed={profileActive}
          className={`sg-focus-ring h-[22px] w-[22px] rounded-full transition-all duration-150 active:scale-95 ${
            profileActive
              ? 'sg-nav-active'
              : 'bg-[#141414] hover:opacity-85'
          }`}
        />

        {/* Small right-edge notch indicator */}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label="Toggle rail indicator"
          aria-pressed={sidebarExpanded}
          className={`sg-focus-ring hidden md:block absolute -right-[4px] top-1/2 -translate-y-1/2 h-[9px] w-[9px] rounded-[2.5px] border-[1.5px] border-white transition-colors duration-150 ${
            sidebarExpanded ? 'sg-accent-bar' : 'bg-[#66686C]'
          }`}
        />
      </div>

      {/* Divider 1 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-[26px] rounded-full bg-[#CECECA] md:my-2.5 md:block"
      />

      {/* 5 main square navigation items */}
      <div className="flex flex-row items-center gap-[7px] md:flex-col md:gap-[8px]">
        {[0, 1, 2, 3, 4].map((index) => {
          const isActive = activeNav === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectNav(index)}
              aria-label={`Navigation item ${index + 1}`}
              aria-pressed={isActive}
              className={`sg-focus-ring h-[22px] w-[22px] rounded-[5px] transition-all duration-150 active:scale-95 ${
                isActive ? 'sg-nav-active' : 'sg-nav-idle'
              }`}
            />
          );
        })}
      </div>

      {/* Divider 2 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-[26px] rounded-full bg-[#CECECA] md:my-2.5 md:block"
      />

      {/* 2 utility squares */}
      <div className="hidden flex-row items-center gap-[7px] sm:flex md:flex-col md:gap-[8px]">
        {[0, 1].map((index) => {
          const isActive = activeUtility === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onToggleUtility(index)}
              aria-label={`Utility tool ${index + 1}`}
              aria-pressed={isActive}
              className={`sg-focus-ring h-[22px] w-[22px] rounded-[5px] transition-all duration-150 active:scale-95 ${
                isActive ? 'sg-nav-active' : 'sg-nav-idle'
              }`}
            />
          );
        })}
      </div>

      {/* Bottom circle */}
      <div className="md:mt-auto">
        <button
          type="button"
          onClick={() => onToggleUtility(activeUtility === 0 ? 1 : 0)}
          aria-label="Account preferences"
          className="sg-focus-ring h-[22px] w-[22px] rounded-full border border-[#9E9F9B] bg-[#66686C] transition-all duration-150 hover:bg-[#141414] active:scale-95"
        />
      </div>
    </nav>
  );
};
