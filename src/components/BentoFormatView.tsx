import React from 'react';
import {
  clampPercentage,
  DashboardState,
  FORMAT_META,
  FormatIndex,
  selectHeroPill,
  selectListRow,
  selectSidebarNav,
  stepProgress,
  toggleModuleSwitch,
  togglePlayback,
  toggleTransportSwitch,
  toggleUtilityNav,
} from '../utils/wireframeState';
import { HeroPanel } from './HeroPanel';
import { ListPanel } from './ListPanel';
import { ModuleTogglePanel } from './ModuleTogglePanel';
import { SidebarRail } from './SidebarRail';
import { TimelinePanel } from './TimelinePanel';
import { TransportPanel } from './TransportPanel';

interface BentoFormatViewProps {
  formatIndex: FormatIndex;
  state: DashboardState;
  setState: React.Dispatch<React.SetStateAction<DashboardState>>;
}

export const BentoFormatView: React.FC<BentoFormatViewProps> = ({
  formatIndex,
  state,
  setState,
}) => {
  const meta = FORMAT_META[formatIndex];

  const sidebar = (
    <SidebarRail
      activeNav={state.activeSidebarNav}
      activeUtility={state.activeUtilityNav}
      sidebarExpanded={state.sidebarExpanded}
      profileActive={state.profileActive}
      onSelectNav={(index) => setState((prev) => selectSidebarNav(prev, index))}
      onToggleUtility={(index) => setState((prev) => toggleUtilityNav(prev, index))}
      onToggleExpand={() =>
        setState((prev) => ({ ...prev, sidebarExpanded: !prev.sidebarExpanded }))
      }
      onToggleProfile={() =>
        setState((prev) => ({ ...prev, profileActive: !prev.profileActive }))
      }
    />
  );

  const hero = (
    <HeroPanel
      titleLabel={meta.label}
      tabLabels={meta.tabLabels}
      activePill={state.activeHeroPill}
      primaryActionActive={state.heroPrimaryActionActive}
      onSelectPill={(index) => setState((prev) => selectHeroPill(prev, index))}
      onTriggerPrimary={() =>
        setState((prev) => ({
          ...prev,
          heroPrimaryActionActive: !prev.heroPrimaryActionActive,
        }))
      }
    />
  );

  const list = (
    <ListPanel
      activeRow={state.activeListRow}
      filterActive={state.listFilterActive}
      onSelectRow={(index) => setState((prev) => selectListRow(prev, index))}
      onToggleFilter={() =>
        setState((prev) => ({ ...prev, listFilterActive: !prev.listFilterActive }))
      }
      onConfirm={() =>
        setState((prev) => selectListRow(prev, (prev.activeListRow + 1) % 4))
      }
    />
  );

  const timeline = (
    <TimelinePanel
      progress={state.timelineProgress}
      onStepProgress={(delta) =>
        setState((prev) => ({
          ...prev,
          timelineProgress: stepProgress(prev.timelineProgress, delta),
        }))
      }
      onSetProgress={(value) =>
        setState((prev) => ({
          ...prev,
          timelineProgress: clampPercentage(value),
        }))
      }
    />
  );

  const moduleToggle = (
    <ModuleTogglePanel
      switchOn={state.moduleSwitchOn}
      onToggleSwitch={() => setState((prev) => toggleModuleSwitch(prev))}
      onApply={() => setState((prev) => toggleModuleSwitch(prev))}
    />
  );

  const transport = (
    <TransportPanel
      switchOn={state.transportSwitchOn}
      isPlaying={state.isPlaying}
      progress={state.mediaProgress}
      onToggleSwitch={() => setState((prev) => toggleTransportSwitch(prev))}
      onTogglePlay={() => setState((prev) => togglePlayback(prev))}
      onStepMedia={(delta) =>
        setState((prev) => ({
          ...prev,
          mediaProgress: stepProgress(prev.mediaProgress, delta),
        }))
      }
      onSetMedia={(value) =>
        setState((prev) => ({
          ...prev,
          mediaProgress: clampPercentage(value),
        }))
      }
    />
  );

  return (
    <div
      data-format-index={formatIndex}
      data-format-id={meta.id}
      className={`${meta.themeClass} styleguide-canvas flex h-full w-full flex-col gap-[12px] overflow-y-auto overflow-x-hidden p-[12px] pb-[22px] md:flex-row md:overflow-hidden md:pb-[20px]`}
    >
      {sidebar}

      {/* Format 1: Cours (Classic Reference Bento - Cobalt Blue) */}
      {formatIndex === 0 && (
        <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-[2.15fr_1fr] md:grid-rows-[1.28fr_1fr]">
          {hero}
          {list}
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1.35fr_1fr]">
            {timeline}
            {moduleToggle}
          </div>
          {transport}
        </div>
      )}

      {/* Format 2: Exercice & Examen (Tall Left List + Asymmetric Studio Split - Emerald Green) */}
      {formatIndex === 1 && (
        <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-[1fr_2.15fr] md:grid-rows-[1fr_1.28fr]">
          <div className="md:row-span-2">{list}</div>
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1fr_1.35fr]">
            {moduleToggle}
            {timeline}
          </div>
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1.55fr_1fr]">
            {hero}
            {transport}
          </div>
        </div>
      )}

      {/* Format 3: Quiz, Flashcard, Résumé & Planification hebdomadaire (Panoramic Top + 3-Col Deck - Warm Amber) */}
      {formatIndex === 2 && (
        <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-3 md:grid-rows-[1.15fr_1fr]">
          <div className="md:col-span-3">{hero}</div>
          {list}
          {moduleToggle}
          {transport}
        </div>
      )}

      {/* Format 4: Préparation Examen (Top 3-Card Control Row + Bottom Split - Crimson Ruby) */}
      {formatIndex === 3 && (
        <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-[2.15fr_1fr] md:grid-rows-[1fr_1.28fr]">
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-3 md:col-span-2">
            {timeline}
            {moduleToggle}
            {transport}
          </div>
          {hero}
          {list}
        </div>
      )}
    </div>
  );
};
