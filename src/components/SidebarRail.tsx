import React from 'react';
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FORMAT_META, FormatIndex } from '../utils/wireframeState';

interface SidebarRailProps {
  activeFormat: FormatIndex;
  activeUtility: number | null;
  sidebarExpanded: boolean;
  profileActive: boolean;
  onSelectFormat: (index: FormatIndex) => void;
  onToggleUtility: (index: number) => void;
  onToggleExpand: () => void;
  onToggleProfile: () => void;
}

const SCREEN_ICONS = [BookOpen, ClipboardCheck, Layers, GraduationCap] as const;

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeFormat,
  activeUtility,
  sidebarExpanded,
  profileActive,
  onSelectFormat,
  onToggleUtility,
  onToggleExpand,
  onToggleProfile,
}) => {
  return (
    <nav
      aria-label="Navigation principale"
      className={`sg-glass-bar relative flex w-full flex-row items-center justify-between rounded-full px-3 py-2 md:h-full md:shrink-0 md:flex-col md:justify-start md:px-2 md:py-3.5 transition-[width] duration-200 ${
        sidebarExpanded ? 'md:w-[152px]' : 'md:w-[60px]'
      }`}
    >
      {/* Top indicator + edge handle */}
      <div className="relative flex items-center justify-center md:w-full">
        <button
          type="button"
          onClick={onToggleProfile}
          aria-label="Profil élève"
          aria-pressed={profileActive}
          className={`sg-focus-ring flex h-[30px] w-[30px] items-center justify-center rounded-full text-[11px] font-bold transition-[transform,box-shadow] duration-150 active:scale-95 ${
            profileActive
              ? 'sg-nav-active text-white'
              : 'bg-white/85 text-[#121417] shadow-xs hover:bg-white'
          }`}
        >
          É
        </button>

        {/* Right-edge expand toggle */}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={sidebarExpanded ? 'Réduire la barre latérale' : 'Déplier la barre latérale'}
          aria-expanded={sidebarExpanded}
          className={`sg-focus-ring hidden md:block absolute -right-[11px] top-1/2 -translate-y-1/2 h-[10px] w-[10px] rounded-full border-[1.5px] border-white transition-colors duration-150 ${
            sidebarExpanded ? 'sg-accent-bar' : 'bg-[#66686C]'
          }`}
        />
      </div>

      {/* Divider 1 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-full max-w-[28px] rounded-full bg-white/70 md:my-2.5 md:block"
      />

      {/* 4 main page buttons matching the 4 screens */}
      <div className="flex flex-row items-center gap-[8px] md:w-full md:flex-col md:gap-[8px]">
        {FORMAT_META.map((meta) => {
          const Icon = SCREEN_ICONS[meta.index];
          const isActive = activeFormat === meta.index;
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => onSelectFormat(meta.index)}
              aria-label={meta.sidebarLabel}
              aria-current={isActive ? 'page' : undefined}
              title={meta.sidebarLabel}
              className={`sg-focus-ring flex items-center justify-center rounded-full transition-[transform,box-shadow] duration-150 active:scale-95 ${
                sidebarExpanded
                  ? 'h-[36px] w-full justify-start gap-2.5 px-3'
                  : 'h-[36px] w-[36px]'
              } ${
                isActive
                  ? 'sg-nav-active text-white'
                  : 'sg-nav-idle text-[#30343B]'
              }`}
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
              {sidebarExpanded && (
                <span className="truncate text-[11.5px] font-semibold whitespace-nowrap">
                  {meta.sidebarLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider 2 */}
      <div
        aria-hidden="true"
        className="hidden h-[1.5px] w-full max-w-[28px] rounded-full bg-white/70 md:my-2.5 md:block"
      />

      {/* Utility button */}
      <div className="hidden flex-row items-center gap-[8px] sm:flex md:w-full md:flex-col">
        <button
          type="button"
          onClick={() => onToggleUtility(0)}
          aria-label="Mode concentration"
          aria-pressed={activeUtility === 0}
          title="Mode concentration"
          className={`sg-focus-ring flex items-center justify-center rounded-full transition-[transform,box-shadow] duration-150 active:scale-95 ${
            sidebarExpanded ? 'h-[34px] w-full justify-start gap-2.5 px-3' : 'h-[34px] w-[34px]'
          } ${
            activeUtility === 0
              ? 'sg-nav-active text-white'
              : 'sg-nav-idle text-[#4B4E54]'
          }`}
        >
          <Sparkles className="h-[14px] w-[14px] shrink-0" strokeWidth={2} />
          {sidebarExpanded && (
            <span className="truncate text-[11.5px] font-medium whitespace-nowrap">
              Focus
            </span>
          )}
        </button>
      </div>

      {/* Bottom circle */}
      <div className="md:mt-auto">
        <button
          type="button"
          onClick={() => onSelectFormat(0)}
          aria-label="Revenir à l’accueil Cours"
          title="Accueil Cours"
          className="sg-focus-ring h-[26px] w-[26px] rounded-full border border-white/80 bg-[#5C6068]/75 transition-colors duration-150 hover:bg-[#141414] active:scale-95"
        />
      </div>
    </nav>
  );
};
