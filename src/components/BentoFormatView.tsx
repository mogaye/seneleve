import React, { useEffect, useMemo, useState } from 'react';
import { ClassLevel, getClassExperience, SerieOption } from '../data/studyData';
import {
  BentoLayoutsState,
  bringTileToFront,
  createCustomTile,
  DEFAULT_SCREEN_LAYOUTS,
  isLayoutCustomized,
  loadSavedLayouts,
  saveLayouts,
  TileRect,
} from '../utils/bentoLayout';
import {
  DashboardState,
  FORMAT_META,
  FormatIndex,
  setActiveClass,
  setFormat,
  toggleUtilityNav,
} from '../utils/wireframeState';
import { SidebarRail } from './SidebarRail';
import { SectionBottomStrip } from './SectionBottomStrip';
import { TopClassBar } from './TopClassBar';
import { CoursScreen } from './screens/CoursScreen';
import { ExercicesScreen } from './screens/ExercicesScreen';
import { PreparationExamenScreen } from './screens/PreparationExamenScreen';
import { RevisionsScreen } from './screens/RevisionsScreen';

interface BentoFormatViewProps {
  formatIndex: FormatIndex;
  state: DashboardState;
  setState: React.Dispatch<React.SetStateAction<DashboardState>>;
  onNavigateTo: (target: FormatIndex) => void;
  exerciseSubjectPrefill?: string;
  onPrefillExerciseSubject: (subject: string) => void;
}

export const BentoFormatView: React.FC<BentoFormatViewProps> = ({
  formatIndex,
  state,
  setState,
  onNavigateTo,
  exerciseSubjectPrefill,
  onPrefillExerciseSubject,
}) => {
  const meta = FORMAT_META[formatIndex];

  const [layouts, setLayouts] = useState<BentoLayoutsState>(loadSavedLayouts);

  useEffect(() => {
    saveLayouts(layouts);
  }, [layouts]);

  const experience = useMemo(
    () => getClassExperience(state.selectedClass, state.selectedSerie),
    [state.selectedClass, state.selectedSerie],
  );

  const activeTiles = layouts[formatIndex];
  const customized = useMemo(
    () => isLayoutCustomized(activeTiles, formatIndex),
    [activeTiles, formatIndex],
  );

  const handleSelectClass = (nextClass: ClassLevel) => {
    setState((prev) => setActiveClass(prev, nextClass));
  };

  const handleSelectSerie = (nextSerie: SerieOption) => {
    setState((prev) => ({ ...prev, selectedSerie: nextSerie }));
  };

  const handleChangeTiles = (nextTiles: TileRect[]) => {
    setLayouts((prev) => ({
      ...prev,
      [formatIndex]: nextTiles,
    }));
  };

  const handleBringToFront = (tileId: string) => {
    setLayouts((prev) => ({
      ...prev,
      [formatIndex]: bringTileToFront(prev[formatIndex], tileId),
    }));
  };

  const handleAddTile = () => {
    setLayouts((prev) => {
      const current = prev[formatIndex];
      const customCount = current.filter((t) => t.isCustom).length;
      return {
        ...prev,
        [formatIndex]: [...current, createCustomTile(current, customCount)],
      };
    });
  };

  const handleResetLayout = () => {
    setLayouts((prev) => ({
      ...prev,
      [formatIndex]: DEFAULT_SCREEN_LAYOUTS[formatIndex].map((t) => ({ ...t })),
    }));
  };

  return (
    <div
      data-format-index={formatIndex}
      data-format-id={meta.id}
      data-active-class={experience.classLevel}
      data-active-cycle={experience.cycle}
      className={`${meta.themeClass} ${experience.cycleClass} styleguide-canvas flex h-full w-full flex-col gap-[12px] overflow-y-auto overflow-x-hidden p-[12px] pb-[20px] md:p-[14px] md:pb-[22px]`}
    >
      {/* Top Floating Frosted Glass Bar (Class Dropdown + Série + Layout Controls) */}
      <div className="shrink-0">
        <TopClassBar
          screenLabel={meta.bottomLabel}
          selectedClass={experience.classLevel}
          selectedSerie={experience.serie}
          cycle={experience.cycle}
          isLayoutCustomized={customized}
          onSelectClass={handleSelectClass}
          onSelectSerie={handleSelectSerie}
          onAddTile={handleAddTile}
          onResetLayout={handleResetLayout}
        />
      </div>

      {/* Middle Spatial Row: Floating Left Capsule Rail + Outer Frosted Glass Bento Shell */}
      <div className="flex shrink-0 flex-col gap-[12px] md:min-h-[580px] md:flex-row md:items-stretch">
        <SidebarRail
          activeFormat={formatIndex}
          activeUtility={state.activeUtilityNav}
          sidebarExpanded={state.sidebarExpanded}
          profileActive={state.profileActive}
          onSelectFormat={(idx) => {
            if (idx !== state.activeFormat) {
              onNavigateTo(idx);
            } else {
              setState((prev) => setFormat(prev, idx));
            }
          }}
          onToggleUtility={(index) => setState((prev) => toggleUtilityNav(prev, index))}
          onToggleExpand={() =>
            setState((prev) => ({ ...prev, sidebarExpanded: !prev.sidebarExpanded }))
          }
          onToggleProfile={() =>
            setState((prev) => ({ ...prev, profileActive: !prev.profileActive }))
          }
        />

        <div className="sg-glass-shell flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] p-[10px] md:p-[12px]">
          {formatIndex === 0 && (
            <CoursScreen
              experience={experience}
              tiles={activeTiles}
              onChangeTiles={handleChangeTiles}
              onBringToFront={handleBringToFront}
              onGoToExercices={(subject) => {
                onPrefillExerciseSubject(subject);
                onNavigateTo(1);
              }}
            />
          )}

          {formatIndex === 1 && (
            <ExercicesScreen
              experience={experience}
              initialSubject={exerciseSubjectPrefill}
              tiles={activeTiles}
              onChangeTiles={handleChangeTiles}
              onBringToFront={handleBringToFront}
              onGoToCours={() => onNavigateTo(0)}
            />
          )}

          {formatIndex === 2 && (
            <RevisionsScreen
              experience={experience}
              tiles={activeTiles}
              onChangeTiles={handleChangeTiles}
              onBringToFront={handleBringToFront}
              onOpenFullCourse={() => onNavigateTo(0)}
            />
          )}

          {formatIndex === 3 && (
            <PreparationExamenScreen
              experience={experience}
              tiles={activeTiles}
              onChangeTiles={handleChangeTiles}
              onBringToFront={handleBringToFront}
              onGoToExamSubjects={() => onNavigateTo(1)}
            />
          )}
        </div>
      </div>

      {/* Complementary Frosted Strip below each section for breathing room & upward lift */}
      <SectionBottomStrip
        formatIndex={formatIndex}
        experience={experience}
        onNavigateTo={onNavigateTo}
      />
    </div>
  );
};
