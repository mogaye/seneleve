import React from 'react';
import {
  BookOpen,
  Compass,
  GraduationCap,
  Info,
  Layers,
  Library,
  Search,
  Shapes,
} from 'lucide-react';
import { CURRICULUM_CYCLES } from '../data/senegalCurriculum';

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

const CYCLE_ICONS = [Shapes, BookOpen, Compass, GraduationCap, Library];

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
      aria-label="Cycles scolaires"
      className="sg-card-l1 relative flex w-full flex-row items-center justify-between rounded-[18px] px-3 py-2.5 md:h-full md:w-[62px] md:shrink-0 md:flex-col md:justify-start md:px-0 md:py-3.5"
    >
      {/* Top emblem circle + right-edge notch */}
      <div className="relative flex items-center justify-center md:w-full">
        <button
          type="button"
          onClick={onToggleProfile}
          title="Comment lire ce document"
          aria-label="Comment lire ce document"
          aria-pressed={profileActive}
          className={`sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-full transition-all duration-150 active:scale-95 ${
            profileActive
              ? 'bg-[#0E4FD6] text-white ring-[3px] ring-[#3B82F6]/35 shadow-[0_0_18px_rgba(37,99,235,0.65)]'
              : 'bg-[#141414] text-white hover:bg-[#0E4FD6] hover:shadow-[0_0_14px_rgba(37,99,235,0.45)]'
          }`}
        >
          <GraduationCap className="h-[14px] w-[14px]" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          title="Basculer les repères de cycle"
          aria-label="Basculer les repères de cycle"
          aria-pressed={sidebarExpanded}
          className={`sg-focus-ring hidden md:block absolute -right-[4px] top-1/2 -translate-y-1/2 h-[9px] w-[9px] rounded-[2.5px] border-[1.5px] border-white transition-colors duration-150 ${
            sidebarExpanded
              ? 'bg-[#0E4FD6] shadow-[0_0_12px_rgba(37,99,235,0.7)]'
              : 'bg-[#66686C] hover:bg-[#0E4FD6]'
          }`}
        />
      </div>

      {/* Divider 1 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-[28px] rounded-full bg-[#CECECA] md:my-2.5 md:block"
      />

      {/* 5 Cycle squares */}
      <div className="flex flex-row items-center gap-[7px] md:flex-col md:gap-[9px]">
        {CURRICULUM_CYCLES.map((cycle, index) => {
          const isActive = activeNav === index;
          const Icon = CYCLE_ICONS[index] ?? BookOpen;
          return (
            <button
              key={cycle.id}
              type="button"
              onClick={() => onSelectNav(index)}
              title={cycle.label}
              aria-label={cycle.label}
              aria-pressed={isActive}
              className={`sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-[7px] transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-[#0E4FD6] text-white shadow-[0_0_18px_rgba(37,99,235,0.58)] ring-[3px] ring-[#3B82F6]/30'
                  : 'border border-[#BDBDB8] bg-[#E3E3DE] text-[#3A3C40] hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6] hover:shadow-[0_0_10px_rgba(37,99,235,0.28)]'
              }`}
            >
              <Icon className="h-[14px] w-[14px]" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {/* Divider 2 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-[28px] rounded-full bg-[#CECECA] md:my-2.5 md:block"
      />

      {/* 2 Utility squares: Recherche & Vue spirale */}
      <div className="hidden flex-row items-center gap-[7px] sm:flex md:flex-col md:gap-[9px]">
        <button
          type="button"
          onClick={() => onToggleUtility(0)}
          title="Rechercher dans le cycle"
          aria-label="Rechercher dans le cycle"
          aria-pressed={activeUtility === 0}
          className={`sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-[7px] transition-all duration-150 active:scale-95 ${
            activeUtility === 0
              ? 'bg-[#0E4FD6] text-white shadow-[0_0_16px_rgba(37,99,235,0.55)] ring-2 ring-[#3B82F6]/30'
              : 'border border-[#BDBDB8] bg-[#E3E3DE] text-[#3A3C40] hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6]'
          }`}
        >
          <Search className="h-[13px] w-[13px]" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onToggleUtility(1)}
          title="Afficher les domaines communs"
          aria-label="Afficher les domaines communs"
          aria-pressed={activeUtility === 1}
          className={`sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-[7px] transition-all duration-150 active:scale-95 ${
            activeUtility === 1
              ? 'bg-[#0E4FD6] text-white shadow-[0_0_16px_rgba(37,99,235,0.55)] ring-2 ring-[#3B82F6]/30'
              : 'border border-[#BDBDB8] bg-[#E3E3DE] text-[#3A3C40] hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6]'
          }`}
        >
          <Layers className="h-[13px] w-[13px]" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom info circle */}
      <div className="md:mt-auto">
        <button
          type="button"
          onClick={onToggleProfile}
          title="Note de mise à jour — 14 nov. 2026"
          aria-label="Note de mise à jour"
          className="sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[#9E9F9B] bg-[#66686C] text-white transition-all duration-150 hover:border-[#0E4FD6] hover:bg-[#0E4FD6] active:scale-95"
        >
          <Info className="h-[14px] w-[14px]" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
