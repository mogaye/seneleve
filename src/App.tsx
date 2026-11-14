import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BentoFormatView } from './components/BentoFormatView';
import {
  createInitialDashboardState,
  FORMAT_META,
  FormatIndex,
  resolveSwipeDirection,
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
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<SlideTransition | null>(null);

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
    if (!state.isPlaying) return;
    const timer = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        mediaProgress: prev.mediaProgress >= 100 ? 0 : prev.mediaProgress + 2,
      }));
    }, 350);
    return () => window.clearInterval(timer);
  }, [state.isPlaying]);

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

  // Keyboard navigation (ArrowRight pushes to next format, ArrowLeft to previous)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.getAttribute('role') === 'slider') return;
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
  }, [state.activeFormat, transition, triggerSlideTo]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (transition) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('[role="slider"]')) return;

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

  return (
    <main
      ref={containerRef}
      data-active-format={state.activeFormat}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onWheel={handleWheel}
      className={`${activeThemeClass} styleguide-canvas relative h-screen w-screen touch-pan-y select-none overflow-hidden`}
    >
      {/* Active or Transitioning Format Layers */}
      {transition ? (
        <>
          {/* Outgoing format sliding off-screen */}
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
            />
          </div>

          {/* Incoming format sliding into place */}
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
            />
          </div>
        </>
      ) : (
        <>
          {/* Incoming peek layer during live horizontal drag */}
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
              />
            </div>
          )}

          {/* Current active format */}
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
            />
          </div>
        </>
      )}

      {/* Subtle bottom 4-format indicator */}
      <nav
        aria-label="Formats"
        className="fixed bottom-[5px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2"
      >
        {FORMAT_META.map((meta) => {
          const isActive = state.activeFormat === meta.index;
          return (
            <button
              key={meta.id}
              type="button"
              aria-label={`Format ${meta.index + 1} : ${meta.shortLabel}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (meta.index === state.activeFormat || transition) return;
                const dir =
                  meta.index === stepFormat(state.activeFormat, 1) ? 'right' : 'left';
                triggerSlideTo(meta.index, dir, 0);
              }}
              className={`${meta.themeClass} sg-focus-ring h-[5px] rounded-full transition-all duration-200 ${
                isActive
                  ? 'sg-accent-bar w-[26px]'
                  : 'w-[8px] bg-[#B4B5B3] hover:opacity-80'
              }`}
            />
          );
        })}
      </nav>
    </main>
  );
}
