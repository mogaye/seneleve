import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import { CustomVerbatimCourse } from '../data/pdfCourses';
import {
  ClassLevel,
  getClassExperience,
  SerieOption,
  SubjectStatus,
} from '../data/studyData';
import {
  BentoLayoutsState,
  bringTileToFront,
  cloneDefaultOuterLayout,
  createCustomTile,
  DEFAULT_SCREEN_LAYOUTS,
  isLayoutCustomized,
  isOuterLayoutCustomized,
  TileRect,
  toggleSidebarExpandedLayout,
} from '../utils/bentoLayout';
import {
  NoveltyAnalysisResult,
  SubjectTutorPersona,
} from '../utils/tutorAgent';
import {
  DashboardState,
  FORMAT_META,
  FormatIndex,
  setActiveClass,
  setFormat,
  toggleUtilityNav,
} from '../utils/wireframeState';
import { OuterBentoCanvas, OuterFrameSlot } from './OuterBentoCanvas';
import { SectionBottomStrip } from './SectionBottomStrip';
import { SidebarRail } from './SidebarRail';
import { TopClassBar } from './TopClassBar';
import { CoursScreen } from './screens/CoursScreen';
import {
  ExerciseFilterCommand,
  ExercicesScreen,
} from './screens/ExercicesScreen';
import { PreparationExamenScreen } from './screens/PreparationExamenScreen';
import { RevisionsScreen, RevisionTab } from './screens/RevisionsScreen';

interface BentoFormatViewProps {
  formatIndex: FormatIndex;
  state: DashboardState;
  setState: React.Dispatch<React.SetStateAction<DashboardState>>;
  layouts: BentoLayoutsState;
  setLayouts: React.Dispatch<React.SetStateAction<BentoLayoutsState>>;
  outerLayout: TileRect[];
  setOuterLayout: React.Dispatch<React.SetStateAction<TileRect[]>>;
  isLayoutLocked: boolean;
  isFocusMode?: boolean;
  tutor?: SubjectTutorPersona;
  noveltiesCount?: number;
  selectedSubject?: string;
  customCourses?: CustomVerbatimCourse[];
  requestedRevisionTab?: RevisionTab | null;
  pendingRevisionAiTrigger?: 'quiz' | 'flashcards' | null;
  pendingExerciseAiTrigger?: 'exercise' | null;
  exerciseFilterOverride?: ExerciseFilterCommand | null;
  examDate?: string;
  subjectStatuses?: Record<string, SubjectStatus>;
  onClearRequestedTab?: () => void;
  onClearPendingRevisionAiTrigger?: () => void;
  onClearPendingExerciseAiTrigger?: () => void;
  onExamDateChange?: (date: string) => void;
  onSubjectStatusesChange?: React.Dispatch<React.SetStateAction<Record<string, SubjectStatus>>>;
  onSubjectChange?: (subject: string) => void;
  onOpenCourseReader?: (subject: string, customCourseId?: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onOpenTutor?: () => void;
  openTileId?: string | null;
  onSelectOpenTileId?: (tileId: string | null) => void;
  onToggleLayoutLock: () => void;
  onToggleFocus?: () => void;
  onNavigateTo: (target: FormatIndex) => void;
  exerciseSubjectPrefill?: string;
  onPrefillExerciseSubject: (subject: string) => void;
}

export const BentoFormatView: React.FC<BentoFormatViewProps> = ({
  formatIndex,
  state,
  setState,
  layouts,
  setLayouts,
  outerLayout,
  setOuterLayout,
  isLayoutLocked,
  isFocusMode = false,
  tutor,
  noveltiesCount = 0,
  selectedSubject,
  customCourses = [],
  requestedRevisionTab = null,
  pendingRevisionAiTrigger = null,
  pendingExerciseAiTrigger = null,
  exerciseFilterOverride = null,
  examDate,
  subjectStatuses,
  onClearRequestedTab,
  onClearPendingRevisionAiTrigger,
  onClearPendingExerciseAiTrigger,
  onExamDateChange,
  onSubjectStatusesChange,
  onSubjectChange,
  onOpenCourseReader,
  onAnalyzeTile,
  onOpenTutor,
  openTileId = null,
  onSelectOpenTileId,
  onToggleLayoutLock,
  onToggleFocus,
  onNavigateTo,
  exerciseSubjectPrefill,
  onPrefillExerciseSubject,
}) => {
  const meta = FORMAT_META[formatIndex];
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const [shellInnerHeightPx, setShellInnerHeightPx] = useState<number>(556);

  const handleShellRef = useCallback((node: HTMLDivElement | null) => {
    shellRef.current = node;
    setShellEl(node);
  }, []);

  useEffect(() => {
    if (!shellEl) return;
    const update = () => {
      const style = window.getComputedStyle(shellEl);
      const padY =
        (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      const innerH = Math.max(260, Math.round(shellEl.clientHeight - padY));
      setShellInnerHeightPx((prev) => (Math.abs(prev - innerH) > 1 ? innerH : prev));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(shellEl);
    return () => observer.disconnect();
  }, [shellEl, isFocusMode]);

  const experience = useMemo(
    () => getClassExperience(state.selectedClass, state.selectedSerie),
    [state.selectedClass, state.selectedSerie],
  );

  const activeTiles = layouts[formatIndex];
  const customized = useMemo(
    () => isLayoutCustomized(activeTiles, formatIndex) || isOuterLayoutCustomized(outerLayout),
    [activeTiles, formatIndex, outerLayout],
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
        [formatIndex]: [
          ...current,
          createCustomTile(current, customCount, selectedSubject),
        ],
      };
    });
    window.requestAnimationFrame(() => {
      if (shellRef.current) {
        shellRef.current.scrollTo({
          top: shellRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  };

  const handleResetLayout = () => {
    setLayouts((prev) => ({
      ...prev,
      [formatIndex]: DEFAULT_SCREEN_LAYOUTS[formatIndex].map((t) => ({ ...t })),
    }));
    setOuterLayout(cloneDefaultOuterLayout());
    setState((prev) => ({ ...prev, sidebarExpanded: false }));
  };

  const handleToggleSidebarExpand = () => {
    const nextExpanded = !state.sidebarExpanded;
    setState((prev) => ({ ...prev, sidebarExpanded: nextExpanded }));
    setOuterLayout((prev) => toggleSidebarExpandedLayout(prev, nextExpanded));
  };

  const classTag = `${experience.classLevel}${experience.serie ? ` · ${experience.serie}` : ''}`;

  const handleOpenTilePage = useCallback(
    (tile: TileRect) => {
      if (tile.id === 'cours-main' && onOpenCourseReader) {
        onOpenCourseReader(selectedSubject ?? experience.subjects[0] ?? 'Français');
        return;
      }
      onSelectOpenTileId?.(tile.id);
    },
    [experience.subjects, onOpenCourseReader, onSelectOpenTileId, selectedSubject],
  );

  const renderActiveScreen = () => (
    <>
      {formatIndex === 0 && (
        <CoursScreen
          experience={experience}
          selectedSubject={selectedSubject}
          customCourses={customCourses}
          tiles={activeTiles}
          baseHeightPx={shellInnerHeightPx}
          locked={isFocusMode || isLayoutLocked}
          openTileId={openTileId}
          onSelectOpenTileId={onSelectOpenTileId}
          onOpenTilePage={handleOpenTilePage}
          onOpenTutor={onOpenTutor}
          onSubjectChange={onSubjectChange}
          onOpenCourseReader={onOpenCourseReader}
          onAnalyzeTile={onAnalyzeTile}
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
          customCourses={customCourses}
          externalFilter={exerciseFilterOverride}
          pendingAiTrigger={pendingExerciseAiTrigger}
          onClearPendingAiTrigger={onClearPendingExerciseAiTrigger}
          tiles={activeTiles}
          baseHeightPx={shellInnerHeightPx}
          locked={isFocusMode || isLayoutLocked}
          openTileId={openTileId}
          onSelectOpenTileId={onSelectOpenTileId}
          onOpenTilePage={handleOpenTilePage}
          onOpenTutor={onOpenTutor}
          onSubjectChange={onSubjectChange}
          onAnalyzeTile={onAnalyzeTile}
          onChangeTiles={handleChangeTiles}
          onBringToFront={handleBringToFront}
          onGoToCours={() => onNavigateTo(0)}
        />
      )}

      {formatIndex === 2 && (
        <RevisionsScreen
          experience={experience}
          selectedSubject={selectedSubject}
          customCourses={customCourses}
          tiles={activeTiles}
          baseHeightPx={shellInnerHeightPx}
          locked={isFocusMode || isLayoutLocked}
          requestedTab={requestedRevisionTab}
          pendingAiTrigger={pendingRevisionAiTrigger}
          openTileId={openTileId}
          onSelectOpenTileId={onSelectOpenTileId}
          onOpenTilePage={handleOpenTilePage}
          onOpenTutor={onOpenTutor}
          onClearRequestedTab={onClearRequestedTab}
          onClearPendingAiTrigger={onClearPendingRevisionAiTrigger}
          onSubjectChange={onSubjectChange}
          onAnalyzeTile={onAnalyzeTile}
          onChangeTiles={handleChangeTiles}
          onBringToFront={handleBringToFront}
          onOpenFullCourse={(subject) => {
            if (onOpenCourseReader) {
              onOpenCourseReader(subject ?? selectedSubject ?? experience.subjects[0] ?? 'Français');
            } else {
              onNavigateTo(0);
            }
          }}
        />
      )}

      {formatIndex === 3 && (
        <PreparationExamenScreen
          experience={experience}
          examDate={examDate}
          onExamDateChange={onExamDateChange}
          subjectStatuses={subjectStatuses}
          onSubjectStatusesChange={onSubjectStatusesChange}
          tiles={activeTiles}
          baseHeightPx={shellInnerHeightPx}
          locked={isFocusMode || isLayoutLocked}
          openTileId={openTileId}
          onSelectOpenTileId={onSelectOpenTileId}
          onOpenTilePage={handleOpenTilePage}
          onOpenTutor={onOpenTutor}
          onSubjectChange={onSubjectChange}
          onAnalyzeTile={onAnalyzeTile}
          onChangeTiles={handleChangeTiles}
          onBringToFront={handleBringToFront}
          onGoToExamSubjects={() => onNavigateTo(1)}
        />
      )}
    </>
  );

  const outerSlots: OuterFrameSlot[] = [
    {
      id: 'outer-topbar',
      label: 'la barre supérieure',
      render: () => (
        <TopClassBar
          screenLabel={meta.bottomLabel}
          selectedClass={experience.classLevel}
          selectedSerie={experience.serie}
          cycle={experience.cycle}
          isLayoutCustomized={customized}
          isLayoutLocked={isLayoutLocked}
          tutor={tutor}
          noveltiesCount={noveltiesCount}
          onSelectClass={handleSelectClass}
          onSelectSerie={handleSelectSerie}
          onAddTile={handleAddTile}
          onResetLayout={handleResetLayout}
          onToggleLayoutLock={onToggleLayoutLock}
          onOpenTutor={onOpenTutor}
        />
      ),
    },
    {
      id: 'outer-sidebar',
      label: 'la barre latérale',
      render: () => (
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
          onToggleUtility={(index) => {
            if (index === 0 && onToggleFocus) {
              onToggleFocus();
              return;
            }
            setState((prev) => toggleUtilityNav(prev, index));
          }}
          onToggleExpand={handleToggleSidebarExpand}
          onToggleProfile={() =>
            setState((prev) => ({ ...prev, profileActive: !prev.profileActive }))
          }
        />
      ),
    },
    {
      id: 'outer-main',
      label: 'le grand cadre',
      render: () => (
        <div
          ref={handleShellRef}
          className="sg-glass-shell flex h-full w-full min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-[26px] p-[10px] md:p-[12px]"
        >
          {renderActiveScreen()}
        </div>
      ),
    },
    {
      id: 'outer-bottom',
      label: 'la synthèse de section',
      render: () => (
        <SectionBottomStrip
          formatIndex={formatIndex}
          experience={experience}
          onNavigateTo={onNavigateTo}
        />
      ),
    },
  ];

  if (isFocusMode) {
    return (
      <div
        data-format-index={formatIndex}
        data-format-id={meta.id}
        data-active-class={experience.classLevel}
        data-active-cycle={experience.cycle}
        data-focus-mode="true"
        className={`${meta.themeClass} ${experience.cycleClass} styleguide-canvas flex h-full w-full min-w-0 flex-col overflow-hidden pt-[max(10px,env(safe-area-inset-top))] pr-[max(10px,env(safe-area-inset-right))] pb-[max(10px,env(safe-area-inset-bottom))] pl-[max(10px,env(safe-area-inset-left))] md:pt-[max(12px,env(safe-area-inset-top))] md:pr-[max(16px,env(safe-area-inset-right))] md:pb-[max(14px,env(safe-area-inset-bottom))] md:pl-[max(16px,env(safe-area-inset-left))]`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2">
          <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[#4B4E54]">
            <span aria-hidden="true" className="sg-accent-bar h-[7px] w-[7px] shrink-0 rounded-full" />
            <span className="truncate">
              Focus · {meta.bottomLabel} · {classTag}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {tutor && onOpenTutor && (
              <button
                type="button"
                data-no-swipe="true"
                onClick={onOpenTutor}
                aria-label={`Parler avec ${tutor.name}`}
                className="sg-focus-ring sg-focus-exit-pill flex h-[28px] shrink-0 items-center gap-1.5 rounded-full pr-2.5 pl-1 text-[11px] font-semibold text-[#1C1E22] transition-colors"
              >
                <span className="sg-btn-primary flex h-[20px] w-[20px] items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {tutor.initial}
                </span>
                <span>{tutor.name}</span>
              </button>
            )}
            {onToggleFocus && (
              <button
                type="button"
                data-no-swipe="true"
                onClick={onToggleFocus}
                aria-label="Quitter le mode Focus"
                title="Quitter le plein écran Focus (Échap)"
                className="sg-focus-ring sg-focus-exit-pill flex h-[28px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[#1C1E22] transition-colors"
              >
                <Minimize2 className="h-[12.5px] w-[12.5px] text-[var(--accent)]" strokeWidth={2.2} />
                <span>Quitter Focus</span>
              </button>
            )}
          </div>
        </div>

        <div
          ref={handleShellRef}
          className="sg-glass-shell flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-[22px] p-[8px] md:rounded-[26px] md:p-[12px]"
        >
          {renderActiveScreen()}
        </div>
      </div>
    );
  }

  return (
    <div
      data-format-index={formatIndex}
      data-format-id={meta.id}
      data-active-class={experience.classLevel}
      data-active-cycle={experience.cycle}
      data-focus-mode="false"
      className={`${meta.themeClass} ${experience.cycleClass} styleguide-canvas flex h-full w-full flex-col gap-[8px] overflow-y-auto overflow-x-hidden p-[8px] pb-[18px] md:p-[10px] md:pb-[20px]`}
    >
      <OuterBentoCanvas
        frames={outerLayout}
        slots={outerSlots}
        locked={isLayoutLocked}
        onChangeFrames={setOuterLayout}
      />

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-2 text-[11px] font-medium text-[#4B4E54]">
        <span>
          Programme scolaire du Sénégal · {classTag} ({experience.cycle})
        </span>
        <span>
          Fais glisser vers la droite ou utilise la barre latérale pour changer d’espace
        </span>
      </footer>
    </div>
  );
};
