import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BentoFormatView } from './components/BentoFormatView';
import { RevisionTab } from './components/screens/RevisionsScreen';
import { TutorAssistantDrawer } from './components/TutorAssistantDrawer';
import { getClassExperience, getClassMeta, getDefaultSerieForClass } from './data/studyData';
import { analyzeSiteNovelties } from './services/tutorClient';
import {
  BentoLayoutsState,
  createCustomTile,
  loadSavedLayoutLocked,
  loadSavedLayouts,
  loadSavedOuterLayout,
  saveLayoutLocked,
  saveLayouts,
  saveOuterLayout,
  TileRect,
} from './utils/bentoLayout';
import {
  enterBrowserFullscreen,
  exitBrowserFullscreen,
  getFullscreenElement,
  subscribeFullscreenChange,
} from './utils/fullscreen';
import {
  extractSiteNovelties,
  getSubjectTutor,
  SiteControlAction,
} from './utils/tutorAgent';
import {
  createInitialDashboardState,
  FORMAT_META,
  FormatIndex,
  resolveSwipeDirection,
  setActiveClass,
  setFormat,
  stepFormat,
} from './utils/wireframeState';

interface SlideTransition {
  from: FormatIndex;
  to: FormatIndex;
  direction: 'right' | 'left';
  startPx: number;
  settled: boolean;
}

export default function App() {
  const [state, setState] = useState(createInitialDashboardState);
  const [layouts, setLayouts] = useState<BentoLayoutsState>(loadSavedLayouts);
  const [outerLayout, setOuterLayout] = useState<TileRect[]>(loadSavedOuterLayout);
  const [isLayoutLocked, setIsLayoutLocked] = useState<boolean>(loadSavedLayoutLocked);
  const [activeSubject, setActiveSubject] = useState<string>('Langue et communication');
  const [tutorDrawerOpen, setTutorDrawerOpen] = useState(false);
  const [requestedRevisionTab, setRequestedRevisionTab] = useState<RevisionTab | null>(null);
  const [exerciseSubjectPrefill, setExerciseSubjectPrefill] = useState<string | undefined>(
    undefined,
  );
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<SlideTransition | null>(null);

  useEffect(() => {
    saveLayouts(layouts);
  }, [layouts]);

  useEffect(() => {
    saveOuterLayout(outerLayout);
  }, [outerLayout]);

  useEffect(() => {
    saveLayoutLocked(isLayoutLocked);
  }, [isLayoutLocked]);

  const isFocusMode = state.activeUtilityNav === 0;
  const wasNativeFullscreenRef = useRef(false);

  const activeExperience = useMemo(
    () => getClassExperience(state.selectedClass, state.selectedSerie),
    [state.selectedClass, state.selectedSerie],
  );
  const activeTutor = useMemo(() => getSubjectTutor(activeSubject), [activeSubject]);
  const novelties = useMemo(() => extractSiteNovelties(layouts), [layouts]);

  const toggleLayoutLock = useCallback(() => {
    setIsLayoutLocked((prev) => !prev);
  }, []);

  const handleToggleFocus = useCallback(() => {
    const entering = state.activeUtilityNav !== 0;
    if (entering) {
      wasNativeFullscreenRef.current = Boolean(getFullscreenElement(document));
      setState((prev) => ({ ...prev, activeUtilityNav: 0 }));
      void enterBrowserFullscreen(document.documentElement).then((entered) => {
        if (entered) {
          wasNativeFullscreenRef.current = true;
        }
      });
    } else {
      wasNativeFullscreenRef.current = false;
      setState((prev) => ({ ...prev, activeUtilityNav: null }));
      void exitBrowserFullscreen(document);
    }
  }, [state.activeUtilityNav]);

  useEffect(() => {
    return subscribeFullscreenChange(document, () => {
      const fsEl = getFullscreenElement(document);
      if (fsEl) {
        wasNativeFullscreenRef.current = true;
      } else if (wasNativeFullscreenRef.current) {
        wasNativeFullscreenRef.current = false;
        setState((prev) =>
          prev.activeUtilityNav === 0 ? { ...prev, activeUtilityNav: null } : prev,
        );
      }
    });
  }, []);

  const containerRef = useRef<HTMLElement | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef<number>(0);
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    currentX: number;
    lockedHorizontal: boolean;
    aborted: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    lockedHorizontal: false,
    aborted: false,
  });

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const triggerSlideTo = useCallback(
    (targetFormat: FormatIndex, direction: 'right' | 'left', startPx = 0) => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      const fromFormat = state.activeFormat;
      if (targetFormat === fromFormat) {
        setDragOffsetX(0);
        setIsDragging(false);
        return;
      }

      setDragOffsetX(0);
      setIsDragging(false);
      setState((prev) => setFormat(prev, targetFormat));
      setTransition({
        from: fromFormat,
        to: targetFormat,
        direction,
        startPx,
        settled: false,
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransition((prev) => (prev ? { ...prev, settled: true } : null));
        });
      });

      transitionTimerRef.current = window.setTimeout(() => {
        setTransition(null);
        transitionTimerRef.current = null;
      }, 330);
    },
    [state.activeFormat],
  );

  const navigateToFormat = useCallback(
    (target: FormatIndex) => {
      if (target === state.activeFormat || transition) return;
      const dir =
        target === stepFormat(state.activeFormat, 1) || target > state.activeFormat
          ? 'right'
          : 'left';
      triggerSlideTo(target, dir, 0);
    },
    [state.activeFormat, transition, triggerSlideTo],
  );

  const handleAnalyzeTile = useCallback(
    async (tile: TileRect) => {
      return analyzeSiteNovelties({
        tutorName: activeTutor.name,
        subject: activeTutor.subject,
        classLevel: state.selectedClass,
        serie: state.selectedSerie,
        screenLabel: FORMAT_META[state.activeFormat].bottomLabel,
        items: [
          {
            id: tile.id,
            title: tile.title?.trim() || 'Nouveau carreau',
            note: tile.note?.trim() || '',
          },
        ],
      });
    },
    [activeTutor, state.selectedClass, state.selectedSerie, state.activeFormat],
  );

  const handleExecuteSiteActions = useCallback(
    (actions: SiteControlAction[]) => {
      let targetFormatForTile: FormatIndex = state.activeFormat;

      for (const action of actions) {
        if (action.type === 'navigate') {
          targetFormatForTile = action.formatIndex;
          setState((prev) => setFormat(prev, action.formatIndex));
        } else if (action.type === 'set_class') {
          setState((prev) => {
            const updated = setActiveClass(prev, action.classLevel);
            return {
              ...updated,
              selectedSerie:
                action.serie !== undefined
                  ? action.serie
                  : getDefaultSerieForClass(action.classLevel),
            };
          });
        } else if (action.type === 'open_revision_tab') {
          targetFormatForTile = 2;
          setRequestedRevisionTab(action.tab);
          setState((prev) => setFormat(prev, 2));
        } else if (action.type === 'add_note_tile') {
          const fmt = targetFormatForTile;
          setLayouts((prev) => {
            const current = prev[fmt];
            const customCount = current.filter((t) => t.isCustom).length;
            const created = createCustomTile(current, customCount);
            return {
              ...prev,
              [fmt]: [
                ...current,
                {
                  ...created,
                  title: action.title,
                  note: action.note,
                },
              ],
            };
          });
        } else if (action.type === 'toggle_focus') {
          if (action.enabled && state.activeUtilityNav !== 0) {
            setState((prev) => ({ ...prev, activeUtilityNav: 0 }));
            void enterBrowserFullscreen(document.documentElement);
          } else if (!action.enabled && state.activeUtilityNav === 0) {
            wasNativeFullscreenRef.current = false;
            setState((prev) => ({ ...prev, activeUtilityNav: null }));
            void exitBrowserFullscreen(document);
          }
        }
      }
    },
    [state.activeFormat, state.activeUtilityNav],
  );

  // Keyboard navigation (ArrowRight pushes to next screen, ArrowLeft to previous, Escape exits Focus)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (tutorDrawerOpen) return;

      if (event.key === 'Escape' && isFocusMode) {
        wasNativeFullscreenRef.current = false;
        setState((prev) => ({ ...prev, activeUtilityNav: null }));
        void exitBrowserFullscreen(document);
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.getAttribute('role') === 'slider'
      ) {
        return;
      }
      if (transition) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        triggerSlideTo(stepFormat(state.activeFormat, 1), 'right', 0);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        triggerSlideTo(stepFormat(state.activeFormat, -1), 'left', 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, state.activeFormat, transition, triggerSlideTo, tutorDrawerOpen]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (transition) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'input, select, textarea, button, a, label, [role="slider"], [data-no-swipe="true"]',
      )
    ) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      lockedHorizontal: false,
      aborted: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId || drag.aborted || transition) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.lockedHorizontal) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        drag.aborted = true;
        return;
      }
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        drag.lockedHorizontal = true;
        setIsDragging(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore if pointer capture is unavailable
        }
      } else {
        return;
      }
    }

    drag.currentX = event.clientX;
    setDragOffsetX(dx);
  };

  const finishDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const wasLocked = drag.lockedHorizontal;
    const dx = drag.currentX - drag.startX;
    drag.pointerId = null;
    drag.lockedHorizontal = false;
    drag.aborted = false;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore if not captured
    }

    if (!wasLocked) {
      setIsDragging(false);
      setDragOffsetX(0);
      return;
    }

    const width = containerRef.current?.clientWidth || window.innerWidth || 1200;
    const swipeDir = resolveSwipeDirection(dx, width);
    if (swipeDir === 1) {
      triggerSlideTo(stepFormat(state.activeFormat, 1), 'right', dx);
    } else if (swipeDir === -1) {
      triggerSlideTo(stepFormat(state.activeFormat, -1), 'left', dx);
    } else {
      setIsDragging(false);
      setDragOffsetX(0);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (transition || isDragging) return;
    const now = Date.now();
    if (now - wheelCooldownRef.current < 460) return;

    if (
      Math.abs(event.deltaX) > 36 &&
      Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.5
    ) {
      wheelCooldownRef.current = now;
      if (event.deltaX > 0) {
        triggerSlideTo(stepFormat(state.activeFormat, 1), 'right', 0);
      } else {
        triggerSlideTo(stepFormat(state.activeFormat, -1), 'left', 0);
      }
    }
  };

  const peekFormat: FormatIndex | null =
    isDragging && dragOffsetX !== 0
      ? stepFormat(state.activeFormat, dragOffsetX > 0 ? 1 : -1)
      : null;

  const activeThemeClass = FORMAT_META[state.activeFormat].themeClass;
  const activeCycleClass = getClassMeta(state.selectedClass).cycleClass;

  return (
    <main
      ref={containerRef}
      data-active-format={state.activeFormat}
      data-active-class={state.selectedClass}
      data-focus-mode={isFocusMode ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onWheel={handleWheel}
      className={`${activeThemeClass} ${activeCycleClass} styleguide-canvas ${
        isFocusMode ? 'fixed inset-0 z-50' : 'relative'
      } h-dvh w-screen touch-pan-y overflow-hidden`}
    >
      {/* Active or Transitioning Screen Layers */}
      {transition ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              transform: transition.settled
                ? `translate3d(${transition.direction === 'right' ? '100%' : '-100%'}, 0, 0)`
                : `translate3d(${transition.startPx}px, 0, 0)`,
              transition: transition.settled
                ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none',
            }}
          >
            <BentoFormatView
              formatIndex={transition.from}
              state={state}
              setState={setState}
              layouts={layouts}
              setLayouts={setLayouts}
              outerLayout={outerLayout}
              setOuterLayout={setOuterLayout}
              isLayoutLocked={isLayoutLocked}
              isFocusMode={isFocusMode}
              tutor={activeTutor}
              noveltiesCount={novelties.length}
              requestedRevisionTab={requestedRevisionTab}
              onClearRequestedTab={() => setRequestedRevisionTab(null)}
              onSubjectChange={setActiveSubject}
              onAnalyzeTile={handleAnalyzeTile}
              onOpenTutor={() => setTutorDrawerOpen(true)}
              onToggleLayoutLock={toggleLayoutLock}
              onToggleFocus={handleToggleFocus}
              onNavigateTo={navigateToFormat}
              exerciseSubjectPrefill={exerciseSubjectPrefill}
              onPrefillExerciseSubject={(subject) => setExerciseSubjectPrefill(subject)}
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              transform: transition.settled
                ? 'translate3d(0, 0, 0)'
                : `translate3d(calc(${transition.direction === 'right' ? '-100%' : '100%'} + ${transition.startPx}px), 0, 0)`,
              transition: transition.settled
                ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none',
            }}
          >
            <BentoFormatView
              formatIndex={transition.to}
              state={state}
              setState={setState}
              layouts={layouts}
              setLayouts={setLayouts}
              outerLayout={outerLayout}
              setOuterLayout={setOuterLayout}
              isLayoutLocked={isLayoutLocked}
              isFocusMode={isFocusMode}
              tutor={activeTutor}
              noveltiesCount={novelties.length}
              requestedRevisionTab={requestedRevisionTab}
              onClearRequestedTab={() => setRequestedRevisionTab(null)}
              onSubjectChange={setActiveSubject}
              onAnalyzeTile={handleAnalyzeTile}
              onOpenTutor={() => setTutorDrawerOpen(true)}
              onToggleLayoutLock={toggleLayoutLock}
              onToggleFocus={handleToggleFocus}
              onNavigateTo={navigateToFormat}
              exerciseSubjectPrefill={exerciseSubjectPrefill}
              onPrefillExerciseSubject={(subject) => setExerciseSubjectPrefill(subject)}
            />
          </div>
        </>
      ) : (
        <>
          {peekFormat !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                transform: `translate3d(calc(${dragOffsetX > 0 ? '-100%' : '100%'} + ${dragOffsetX}px), 0, 0)`,
                transition: 'none',
              }}
            >
              <BentoFormatView
                formatIndex={peekFormat}
                state={state}
                setState={setState}
                layouts={layouts}
                setLayouts={setLayouts}
                outerLayout={outerLayout}
                setOuterLayout={setOuterLayout}
                isLayoutLocked={isLayoutLocked}
                isFocusMode={isFocusMode}
                tutor={activeTutor}
                noveltiesCount={novelties.length}
                requestedRevisionTab={requestedRevisionTab}
                onClearRequestedTab={() => setRequestedRevisionTab(null)}
                onSubjectChange={setActiveSubject}
                onAnalyzeTile={handleAnalyzeTile}
                onOpenTutor={() => setTutorDrawerOpen(true)}
                onToggleLayoutLock={toggleLayoutLock}
                onToggleFocus={handleToggleFocus}
                onNavigateTo={navigateToFormat}
                exerciseSubjectPrefill={exerciseSubjectPrefill}
                onPrefillExerciseSubject={(subject) => setExerciseSubjectPrefill(subject)}
              />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              transform: `translate3d(${dragOffsetX}px, 0, 0)`,
              transition: isDragging
                ? 'none'
                : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <BentoFormatView
              formatIndex={state.activeFormat}
              state={state}
              setState={setState}
              layouts={layouts}
              setLayouts={setLayouts}
              outerLayout={outerLayout}
              setOuterLayout={setOuterLayout}
              isLayoutLocked={isLayoutLocked}
              isFocusMode={isFocusMode}
              tutor={activeTutor}
              noveltiesCount={novelties.length}
              requestedRevisionTab={requestedRevisionTab}
              onClearRequestedTab={() => setRequestedRevisionTab(null)}
              onSubjectChange={setActiveSubject}
              onAnalyzeTile={handleAnalyzeTile}
              onOpenTutor={() => setTutorDrawerOpen(true)}
              onToggleLayoutLock={toggleLayoutLock}
              onToggleFocus={handleToggleFocus}
              onNavigateTo={navigateToFormat}
              exerciseSubjectPrefill={exerciseSubjectPrefill}
              onPrefillExerciseSubject={(subject) => setExerciseSubjectPrefill(subject)}
            />
          </div>
        </>
      )}

      <TutorAssistantDrawer
        open={tutorDrawerOpen}
        onClose={() => setTutorDrawerOpen(false)}
        tutor={activeTutor}
        activeFormat={state.activeFormat}
        screenLabel={FORMAT_META[state.activeFormat].bottomLabel}
        classLevel={state.selectedClass}
        serie={state.selectedSerie}
        subjects={activeExperience.subjects}
        novelties={novelties}
        isFocusMode={isFocusMode}
        onExecuteActions={handleExecuteSiteActions}
      />
    </main>
  );
}
