import React, { useEffect, useRef, useState } from 'react';
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
  const navRef = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 64,
    height: 580,
  });

  useEffect(() => {
    const el = navRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isHorizontal = size.width > size.height * 1.35 && size.width >= 160;
  const showLabels = isHorizontal ? size.width >= 420 : sidebarExpanded || size.width >= 112;
  const isCompactWidth = !isHorizontal && size.width > 0 && size.width < 48;

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className={`sg-glass-bar relative flex h-full w-full min-w-0 items-center transition-[border-radius] duration-200 ${
        isHorizontal
          ? 'flex-row flex-wrap justify-between gap-2 rounded-[26px] px-3 py-2'
          : 'flex-col justify-start rounded-[28px] px-1.5 py-2.5 lg:px-2 lg:py-3.5'
      }`}
    >
      {/* Top indicator + edge handle */}
      <div
        className={`relative flex shrink-0 items-center justify-center ${
          isHorizontal ? '' : 'w-full'
        }`}
      >
        <button
          type="button"
          onClick={onToggleProfile}
          aria-label="Profil élève"
          aria-pressed={profileActive}
          className={`sg-focus-ring flex items-center justify-center rounded-full text-[11px] font-bold transition-[transform,box-shadow] duration-150 active:scale-95 ${
            isCompactWidth ? 'h-[26px] w-[26px]' : 'h-[30px] w-[30px]'
          } ${
            profileActive
              ? 'sg-nav-active text-white'
              : 'bg-white/85 text-[#121417] shadow-xs hover:bg-white'
          }`}
        >
          É
        </button>

        {/* Right-edge expand toggle (desktop vertical mode) */}
        {!isHorizontal && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={sidebarExpanded ? 'Réduire la barre latérale' : 'Déplier la barre latérale'}
            aria-expanded={sidebarExpanded}
            className={`sg-focus-ring hidden md:block absolute -right-[11px] top-1/2 z-30 -translate-y-1/2 h-[10px] w-[10px] rounded-full border-[1.5px] border-white transition-colors duration-150 ${
              sidebarExpanded || showLabels ? 'sg-accent-bar' : 'bg-[#66686C]'
            }`}
          />
        )}
      </div>

      {/* Scrollable body so shrinking sidebar vertically never clips controls */}
      <div
        className={`flex min-h-0 min-w-0 flex-1 items-center ${
          isHorizontal
            ? 'flex-row flex-wrap justify-between gap-2 overflow-x-auto'
            : 'mt-2 w-full flex-col gap-2 overflow-y-auto overflow-x-hidden'
        }`}
      >
        {!isHorizontal && (
          <div
            aria-hidden="true"
            className="h-[1.5px] w-full max-w-[28px] shrink-0 rounded-full bg-white/70"
          />
        )}

        {/* 4 main page buttons matching the 4 screens */}
        <div
          className={`flex items-center ${
            isHorizontal
              ? 'flex-row flex-wrap gap-[6px]'
              : 'w-full flex-col gap-[8px]'
          }`}
        >
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
                className={`sg-focus-ring flex shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-150 active:scale-95 ${
                  showLabels
                    ? isHorizontal
                      ? 'h-[34px] justify-start gap-2 px-3'
                      : 'h-[34px] w-full justify-start gap-2 px-2.5 lg:h-[36px] lg:gap-2.5 lg:px-3'
                    : isCompactWidth
                      ? 'h-[28px] w-[28px]'
                      : 'h-[32px] w-[32px] lg:h-[36px] lg:w-[36px]'
                } ${
                  isActive
                    ? 'sg-nav-active text-white'
                    : 'sg-nav-idle text-[#30343B]'
                }`}
              >
                <Icon className="h-[14px] w-[14px] shrink-0 lg:h-[15px] lg:w-[15px]" strokeWidth={2} />
                {showLabels && (
                  <span className="truncate text-[11.5px] font-semibold whitespace-nowrap">
                    {meta.sidebarLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!isHorizontal && (
          <div
            aria-hidden="true"
            className="h-[1.5px] w-full max-w-[28px] shrink-0 rounded-full bg-white/70"
          />
        )}

        {/* Utility button (Focus Fullscreen) */}
        <div
          className={`flex items-center ${
            isHorizontal ? 'flex-row gap-[6px]' : 'w-full flex-col'
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleUtility(0)}
            aria-label={
              activeUtility === 0
                ? 'Quitter le plein écran Focus'
                : 'Mode concentration — Plein écran'
            }
            aria-pressed={activeUtility === 0}
            title={
              activeUtility === 0
                ? 'Quitter le plein écran Focus'
                : 'Mode concentration (plein écran)'
            }
            className={`sg-focus-ring flex shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-150 active:scale-95 ${
              showLabels
                ? isHorizontal
                  ? 'h-[32px] justify-start gap-2 px-3'
                  : 'h-[32px] w-full justify-start gap-2 px-2.5 lg:h-[34px] lg:gap-2.5 lg:px-3'
                : isCompactWidth
                  ? 'h-[26px] w-[26px]'
                  : 'h-[30px] w-[30px] lg:h-[34px] lg:w-[34px]'
            } ${
              activeUtility === 0
                ? 'sg-nav-active text-white'
                : 'sg-nav-idle text-[#4B4E54]'
            }`}
          >
            <Sparkles className="h-[13.5px] w-[13.5px] shrink-0 lg:h-[14px] lg:w-[14px]" strokeWidth={2} />
            {showLabels && (
              <span className="truncate text-[11.5px] font-medium whitespace-nowrap">
                Focus
              </span>
            )}
          </button>
        </div>

        {/* Bottom circle */}
        <div className={isHorizontal ? 'shrink-0' : 'mt-auto shrink-0 pt-1'}>
          <button
            type="button"
            onClick={() => onSelectFormat(0)}
            aria-label="Revenir à l’accueil Cours"
            title="Accueil Cours"
            className={`sg-focus-ring rounded-full border border-white/80 bg-[#5C6068]/75 transition-colors duration-150 hover:bg-[#141414] active:scale-95 ${
              isCompactWidth ? 'h-[22px] w-[22px]' : 'h-[26px] w-[26px]'
            }`}
          />
        </div>
      </div>
    </nav>
  );
};
