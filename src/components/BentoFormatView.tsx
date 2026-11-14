import React, { useMemo } from 'react';
import { ClassLevel, getClassExperience, SerieOption } from '../data/studyData';
import {
  DashboardState,
  FORMAT_META,
  FormatIndex,
  setActiveClass,
  setFormat,
  stepClassLevel,
  toggleUtilityNav,
} from '../utils/wireframeState';
import { SidebarRail } from './SidebarRail';
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

  const experience = useMemo(
    () => getClassExperience(state.selectedClass, state.selectedSerie),
    [state.selectedClass, state.selectedSerie],
  );

  const handleSelectClass = (nextClass: ClassLevel) => {
    setState((prev) => setActiveClass(prev, nextClass));
  };

  const handleStepClass = (delta: -1 | 1) => {
    setState((prev) => setActiveClass(prev, stepClassLevel(prev.selectedClass, delta)));
  };

  const handleSelectSerie = (nextSerie: SerieOption) => {
    setState((prev) => ({ ...prev, selectedSerie: nextSerie }));
  };

  return (
    <div
      data-format-index={formatIndex}
      data-format-id={meta.id}
      data-active-class={experience.classLevel}
      data-active-cycle={experience.cycle}
      className={`${meta.themeClass} ${experience.cycleClass} styleguide-canvas flex h-full w-full flex-col gap-[10px] overflow-y-auto overflow-x-hidden p-[12px] pb-[64px] md:overflow-hidden md:p-[14px] md:pb-[56px]`}
    >
      {/* Top Floating Frosted Glass Bar (Class Dropdown + Série + Stepper) */}
      <TopClassBar
        screenLabel={meta.bottomLabel}
        selectedClass={experience.classLevel}
        selectedSerie={experience.serie}
        cycle={experience.cycle}
        onSelectClass={handleSelectClass}
        onStepClass={handleStepClass}
        onSelectSerie={handleSelectSerie}
      />

      {/* Middle Spatial Row: Floating Left Capsule Rail + Outer Frosted Glass Bento Shell */}
      <div className="flex min-h-0 flex-1 flex-col gap-[12px] md:flex-row">
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

        <div className="sg-glass-shell flex min-h-0 flex-1 flex-col rounded-[26px] p-[10px] md:p-[12px]">
          {formatIndex === 0 && (
            <CoursScreen
              experience={experience}
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
              onGoToCours={() => onNavigateTo(0)}
            />
          )}

          {formatIndex === 2 && (
            <RevisionsScreen
              experience={experience}
              onOpenFullCourse={() => onNavigateTo(0)}
            />
          )}

          {formatIndex === 3 && (
            <PreparationExamenScreen
              experience={experience}
              onGoToExamSubjects={() => onNavigateTo(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
