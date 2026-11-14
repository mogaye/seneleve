import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import {
  CustomVerbatimCourse,
  formatCourseDocumentAsPlainText,
  getPdfCourseDocument,
} from '../../data/pdfCourses';
import { ClassExperience, LessonItem } from '../../data/studyData';
import { requestLessonExplanation } from '../../services/tutorClient';
import { TileRect } from '../../utils/bentoLayout';
import { getSubjectTutor, NoveltyAnalysisResult } from '../../utils/tutorAgent';
import { BentoTileCanvas, BuiltInTileSlot } from '../BentoTileCanvas';

interface CoursScreenProps {
  experience: ClassExperience;
  selectedSubject?: string;
  customCourses?: CustomVerbatimCourse[];
  tiles: TileRect[];
  baseHeightPx?: number;
  locked?: boolean;
  openTileId?: string | null;
  onSelectOpenTileId?: (tileId: string | null) => void;
  onOpenTilePage?: (tile: TileRect) => void;
  onOpenTutor?: () => void;
  onSubjectChange?: (subject: string) => void;
  onOpenCourseReader?: (subject: string, customCourseId?: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onChangeTiles: (next: TileRect[]) => void;
  onBringToFront: (tileId: string) => void;
  onGoToExercices: (subject: string) => void;
}

export const CoursScreen: React.FC<CoursScreenProps> = ({
  experience,
  selectedSubject: controlledSubject,
  customCourses = [],
  tiles,
  baseHeightPx,
  locked = false,
  openTileId = null,
  onSelectOpenTileId,
  onOpenTilePage,
  onOpenTutor,
  onSubjectChange,
  onOpenCourseReader,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
  onGoToExercices,
}) => {
  const { subjects, lessons } = experience;

  const [selectedSubject, setSelectedSubject] = useState<string>(
    controlledSubject && subjects.includes(controlledSubject)
      ? controlledSubject
      : subjects[0] ?? 'Français',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [selectedNotionIdx, setSelectedNotionIdx] = useState<number | null>(null);
  const [consultedIds, setConsultedIds] = useState<string[]>(() =>
    lessons[0] ? [lessons[0].id] : [],
  );
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [lessonExplain, setLessonExplain] = useState<{
    lessonId: string;
    loading: boolean;
    error?: string;
    data?: { explanation: string; example: string; quickCheck: string };
  } | null>(null);

  const tutor = useMemo(() => getSubjectTutor(selectedSubject), [selectedSubject]);

  useEffect(() => {
    if (controlledSubject && subjects.includes(controlledSubject)) {
      setSelectedSubject(controlledSubject);
    }
  }, [controlledSubject, subjects]);

  useEffect(() => {
    onSubjectChange?.(selectedSubject);
  }, [selectedSubject, onSubjectChange]);

  useEffect(() => {
    const nextDefault =
      controlledSubject && subjects.includes(controlledSubject)
        ? controlledSubject
        : subjects[0] ?? 'Français';
    setSelectedSubject(nextDefault);
    setSearchQuery('');
    setAppliedQuery('');
    setActiveStep(1);
    setOpenLessonId(null);
    setSelectedNotionIdx(null);
    setLessonExplain(null);
    setConsultedIds(lessons[0] ? [lessons[0].id] : []);
  }, [experience.classLevel, experience.serie, subjects, lessons]);

  const classCustomCourses = useMemo(
    () =>
      customCourses.filter(
        (c) =>
          c.classLevel === experience.classLevel &&
          (c.serie ?? null) === (experience.serie ?? null),
      ),
    [customCourses, experience.classLevel, experience.serie],
  );

  const filteredLessons = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesSubject =
        q.length > 0 || lesson.subject === selectedSubject;
      const matchesQuery =
        q.length === 0 ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.objectif.toLowerCase().includes(q) ||
        lesson.subject.toLowerCase().includes(q) ||
        lesson.notions.some((n) => n.toLowerCase().includes(q));
      return matchesSubject && matchesQuery;
    });
  }, [lessons, selectedSubject, appliedQuery]);

  const displayedLessons = filteredLessons.length > 0 ? filteredLessons : lessons;

  const currentLesson: LessonItem =
    lessons.find((l) => l.id === openLessonId) ?? displayedLessons[0] ?? lessons[0];

  const subjectLessons = useMemo(
    () => lessons.filter((l) => l.subject === selectedSubject),
    [lessons, selectedSubject],
  );
  const activeSubjectLesson = subjectLessons[0] ?? currentLesson;

  const currentIndexInAll = Math.max(
    0,
    lessons.findIndex((l) => l.id === currentLesson?.id),
  );
  const nextLesson = lessons[(currentIndexInAll + 1) % lessons.length] ?? currentLesson;
  const prevLesson =
    lessons[(currentIndexInAll - 1 + lessons.length) % lessons.length] ?? currentLesson;

  const progressPercent =
    lessons.length > 0 ? Math.round((consultedIds.length / lessons.length) * 100) : 0;

  const ringRadius = 21;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressPercent / 100);

  const openLesson = (lesson: LessonItem, notionIdx: number | null = null) => {
    setSelectedSubject(lesson.subject);
    setSelectedNotionIdx(notionIdx);
    setActiveStep(4);
    setConsultedIds((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
    if (onOpenCourseReader) {
      onOpenCourseReader(lesson.subject);
      return;
    }
    setOpenLessonId(lesson.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchQuery);
    setActiveStep(3);
  };

  const handleExplainLesson = async (lesson: LessonItem) => {
    const lessonTutor = getSubjectTutor(lesson.subject);
    setLessonExplain({ lessonId: lesson.id, loading: true });
    try {
      const doc = getPdfCourseDocument({
        classLevel: experience.classLevel,
        serie: experience.serie,
        subject: lesson.subject,
        fallbackTitle: lesson.title,
        fallbackObjectif: lesson.objectif,
        fallbackNotions: lesson.notions,
      });
      const data = await requestLessonExplanation({
        tutorName: lessonTutor.name,
        subject: lesson.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: lesson.title,
        objectif: lesson.objectif,
        notions: lesson.notions,
        courseContent: formatCourseDocumentAsPlainText(doc),
      });
      setLessonExplain({ lessonId: lesson.id, loading: false, data });
    } catch (err) {
      setLessonExplain({
        lessonId: lesson.id,
        loading: false,
        error: err instanceof Error ? err.message : 'Explication indisponible.',
      });
    }
  };

  const slots: BuiltInTileSlot[] = [
    {
      id: 'cours-main',
      render: () => (
        <section
          aria-label="COURS"
          className="sg-card-l2 flex h-full min-h-[240px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-5 md:min-h-0"
        >
          {/* Top bar: COURS context + 4 step pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
                COURS · {experience.classLevel}
                {experience.serie ? ` (${experience.serie})` : ''}
              </span>
              {openLessonId && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenLessonId(null);
                    setSelectedNotionIdx(null);
                    setActiveStep(2);
                  }}
                  className="sg-focus-ring sg-nav-idle h-[24px] rounded-full px-3 text-[11px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  Retour au programme
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Étapes du cours">
              {[1, 2, 3, 4].map((step) => {
                const isSelected = activeStep === step;
                return (
                  <div key={step} className="flex flex-col items-center gap-[3px]">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => {
                        setActiveStep(step);
                        if (step === 4 && currentLesson) {
                          openLesson(currentLesson, selectedNotionIdx);
                        } else {
                          setOpenLessonId(null);
                        }
                      }}
                      className={`sg-focus-ring h-[24px] rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap transition-[transform,box-shadow] duration-150 ${
                        isSelected ? 'sg-btn-primary text-white' : 'sg-nav-idle text-[#1C1E22]'
                      }`}
                    >
                      Étape {step}
                    </button>
                    <span
                      aria-hidden="true"
                      className={`h-[2.5px] w-[24px] rounded-full ${
                        isSelected ? 'sg-accent-bar' : 'bg-transparent'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center content: Overview OR Open Lesson */}
          {!openLessonId ? (
            <div className="my-1.5 flex min-h-0 flex-1 flex-col justify-start gap-2 overflow-y-auto pr-1">
              <div>
                <h1 className="text-[19px] font-bold leading-snug text-[#121417] text-balance md:text-[20.5px]">
                  Apprends chaque leçon pas à pas
                </h1>
                <p className="mt-0.5 max-w-2xl text-[12.5px] leading-snug text-[#4B4E54]">
                  Choisis une matière de {experience.classLevel}
                  {experience.serie ? ` (${experience.serie})` : ''} pour consulter le programme officiel et les notions à maîtriser.
                </p>
              </div>

              {/* Search bar inside frosted pill */}
              <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un thème ou une notion…"
                  aria-label="Rechercher une leçon"
                  className="sg-focus-ring sg-glass-subtile h-[34px] min-w-0 w-full flex-1 rounded-full px-4 text-[12.5px] text-[#121417] placeholder:text-[#666A72] @xs:w-auto @xs:min-w-[140px]"
                />
                <button
                  type="submit"
                  className="sg-focus-ring sg-btn-primary h-[34px] rounded-full px-5 text-[12px] font-semibold text-white whitespace-nowrap shrink-0"
                >
                  Rechercher
                </button>
              </form>

              {/* Custom verbatim courses added for this class */}
              {classCustomCourses.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--accent)]">
                    <span>Tes cours ajoutés ({classCustomCourses.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
                    {classCustomCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onOpenCourseReader?.(course.subject, course.id)}
                        className="sg-focus-ring sg-selected-capsule flex flex-col items-start gap-1 rounded-[16px] px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
                            <BookOpen className="h-[11.5px] w-[11.5px]" />
                            {course.subject}
                          </span>
                          <span className="text-[10.5px] font-medium text-[#4B4E54]">
                            Texte intégral
                          </span>
                        </div>
                        <span className="text-[12.5px] font-bold text-[#121417] line-clamp-1">
                          {course.title}
                        </span>
                        <span className="text-[11px] text-[#4B4E54] line-clamp-1">
                          {course.content}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Class-specific lessons grid */}
              <div
                className={`grid grid-cols-1 gap-2 ${
                  displayedLessons.length === 1
                    ? '@sm:grid-cols-1'
                    : displayedLessons.length === 2
                      ? '@sm:grid-cols-2'
                      : '@sm:grid-cols-2 @lg:grid-cols-3'
                }`}
              >
                {displayedLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => openLesson(lesson)}
                    className="sg-focus-ring sg-glass-subtile flex flex-col items-start gap-1 rounded-[16px] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[var(--accent)]">
                        {lesson.subject}
                      </span>
                      <span className="text-[10.5px] font-medium text-[#55585F] tabular-nums">
                        {lesson.notions.length} leçon(s)
                      </span>
                    </div>
                    <span className="text-[12.5px] font-semibold text-[#121417] line-clamp-2">
                      {lesson.title}
                    </span>
                    {displayedLessons.length === 1 && (
                      <span className="text-[11.5px] leading-snug text-[#4B4E54] line-clamp-2">
                        {lesson.objectif}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="my-2 flex min-h-0 flex-1 flex-col justify-start gap-2.5 overflow-y-auto pr-1">
              <div>
                <h1 className="text-[18px] font-bold leading-snug text-[#121417] text-balance md:text-[19px]">
                  {currentLesson.title}
                </h1>
                <p className="mt-0.5 text-[12.5px] text-[#4B4E54]">
                  <span className="font-semibold text-[var(--accent)]">Objectif :</span>{' '}
                  {currentLesson.objectif}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 @md:grid-cols-2">
                <div className="sg-glass-subtile rounded-[16px] p-3.5">
                  <h2 className="text-[12px] font-bold text-[#121417]">Leçons &amp; notions au programme</h2>
                  <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed text-[#36393F]">
                    {currentLesson.notions.map((notion, i) => {
                      const isFocused = selectedNotionIdx === i;
                      return (
                        <li
                          key={i}
                          className={
                            isFocused
                              ? 'rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 font-semibold text-[var(--accent)]'
                              : ''
                          }
                        >
                          • {notion}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="sg-glass-subtile rounded-[16px] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[12px] font-bold text-[#121417]">Espace du cours détaillé</h2>
                    <button
                      type="button"
                      disabled={lessonExplain?.loading}
                      onClick={() => void handleExplainLesson(currentLesson)}
                      className="sg-focus-ring sg-btn-secondary flex h-[24px] items-center gap-1 rounded-full px-2.5 text-[10.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
                    >
                      {lessonExplain?.loading ? (
                        <Loader2 className="h-[11px] w-[11px] animate-spin" />
                      ) : (
                        <Sparkles className="h-[11px] w-[11px]" />
                      )}
                      <span>Expliquer avec {getSubjectTutor(currentLesson.subject).name}</span>
                    </button>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#36393F]">
                    {currentLesson.courseStatusNote}
                  </p>
                  <p className="mt-2 text-[11.5px] font-medium text-[var(--accent)]">
                    Repère : {currentLesson.summary}
                  </p>
                  {lessonExplain && lessonExplain.lessonId === currentLesson.id && !lessonExplain.loading && (
                    <div className="mt-2.5 rounded-[12px] border border-[var(--accent-border)]/40 bg-white/75 p-2.5 text-[11.5px] leading-snug text-[#121417]">
                      {lessonExplain.error ? (
                        <p className="font-medium text-[#991B1B]">{lessonExplain.error}</p>
                      ) : (
                        lessonExplain.data && (
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-[var(--accent)]">
                              Explication de {getSubjectTutor(currentLesson.subject).name}
                            </div>
                            <p>{lessonExplain.data.explanation}</p>
                            {lessonExplain.data.example && (
                              <p className="text-[#36393F]">
                                <span className="font-semibold">Exemple :</span> {lessonExplain.data.example}
                              </p>
                            )}
                            {lessonExplain.data.quickCheck && (
                              <p className="font-medium text-[var(--accent)]">
                                Mini défi : {lessonExplain.data.quickCheck}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          {!openLessonId ? (
            <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => currentLesson && openLesson(currentLesson)}
                  className="sg-focus-ring sg-btn-primary h-[30px] w-fit rounded-full px-4 text-[11.5px] font-semibold text-white whitespace-nowrap"
                >
                  Reprendre mon cours
                </button>
                <span className="text-[11px] italic text-[#55585F]">
                  Continue là où tu t’étais arrêté.
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11.5px] font-medium text-[#4B4E54] tabular-nums">
                <span>
                  Cours {currentIndexInAll + 1} sur {lessons.length}
                </span>
                <span className="sg-accent-bar inline-block h-[3px] w-[24px] rounded-full" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => prevLesson && openLesson(prevLesson)}
                className="sg-focus-ring sg-btn-secondary h-[30px] rounded-full px-3.5 text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
              >
                Leçon précédente
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[11.5px] font-medium text-[#4B4E54] tabular-nums">
                  Cours {currentIndexInAll + 1} sur {lessons.length}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToExercices(currentLesson.subject)}
                  className="sg-focus-ring sg-btn-primary h-[30px] rounded-full px-4 text-[11.5px] font-semibold text-white whitespace-nowrap"
                >
                  Faire les exercices
                </button>
              </div>
            </div>
          )}
        </section>
      ),
    },
    {
      id: 'cours-subjects',
      render: () => (
        <section
          aria-label="Choisir une matière"
          className="sg-card-l1 flex h-full min-h-[220px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-4 md:min-h-0"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold text-[#121417]">Choisir une matière</h2>
            <span className="text-[11px] font-semibold text-[var(--accent)]">
              {experience.classLevel}
              {experience.serie ? ` (${experience.serie})` : ''}
            </span>
          </div>

          <div
            className="my-2 flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto pr-1"
            role="listbox"
            aria-label="Matières"
          >
            {subjects.map((subject) => {
              const isSelected = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setAppliedQuery('');
                    setOpenLessonId(null);
                    setSelectedNotionIdx(null);
                    setActiveStep(2);
                  }}
                  className={`sg-focus-ring flex h-[31px] shrink-0 w-full items-center gap-2.5 rounded-full px-2.5 text-left transition-colors duration-150 ${
                    isSelected
                      ? 'sg-selected-capsule'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                      isSelected
                        ? 'sg-halo-ring'
                        : 'border border-white/80 bg-white/55'
                    }`}
                  >
                    {isSelected && <span className="sg-halo-core h-[9px] w-[9px] rounded-full" />}
                  </span>
                  <span
                    className={`truncate text-[11.5px] font-semibold ${
                      isSelected ? 'text-[var(--accent)]' : 'text-[#1C1E22]'
                    }`}
                  >
                    {subject}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenLessonId(null);
              setActiveStep(3);
              setAppliedQuery('');
            }}
            className="sg-focus-ring sg-btn-secondary h-[32px] w-full rounded-full text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
          >
            Voir les leçons
          </button>
        </section>
      ),
    },
    {
      id: 'cours-progress',
      render: () => (
        <section
          aria-label="Progression du cours"
          className="sg-card-l1 flex h-full min-h-[145px] w-full min-w-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 @sm:p-4 md:min-h-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold text-[#121417]">Progression du cours</h2>
              <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
                {consultedIds.length} cours consulté(s) sur {lessons.length}.
              </p>
            </div>

            <div className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center">
              <svg className="h-[50px] w-[50px] -rotate-90" viewBox="0 0 50 50" aria-hidden="true">
                <circle
                  cx="25"
                  cy="25"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(180,184,192,0.38)"
                  strokeWidth="4.5"
                />
                <circle
                  cx="25"
                  cy="25"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute font-mono text-[10.5px] font-bold text-[#121417] tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => prevLesson && openLesson(prevLesson)}
                className="sg-focus-ring sg-nav-idle rounded-full px-3 py-1 text-[11px] font-medium text-[#1C1E22] whitespace-nowrap"
              >
                Leçon précédente
              </button>
              <span className="font-mono text-[11px] font-semibold text-[var(--accent)] tabular-nums">
                {consultedIds.length}/{lessons.length}
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Progression des leçons consultées"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="h-[4px] w-full overflow-hidden rounded-full bg-white/60"
            >
              <div
                className="sg-accent-bar h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'cours-next',
      render: () => (
        <section
          aria-label="Leçon suivante"
          className="sg-card-l3 flex h-full min-h-[145px] w-full min-w-0 flex-col justify-between gap-1 overflow-y-auto overflow-x-hidden rounded-[22px] md:min-h-0"
        >
          <div className="p-4 pb-2">
            <h2 className="text-[13px] font-bold text-[#121417]">Leçon suivante</h2>
            <p className="mt-0.5 text-[11.5px] font-medium text-[#4B4E54] line-clamp-2">
              {nextLesson?.title}
            </p>
          </div>

          <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col justify-between gap-2.5 rounded-[18px] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-[#36393F]">
                {nextLesson?.subject}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={autoAdvance}
                aria-label="Suivi automatique des leçons"
                onClick={() => setAutoAdvance((v) => !v)}
                className={`sg-focus-ring flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-150 ${
                  autoAdvance
                    ? 'sg-accent-switch'
                    : 'border border-white/70 bg-[#B6BAC2]'
                }`}
              >
                <span
                  className={`h-[12px] w-[12px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                    autoAdvance ? 'translate-x-[14px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const target = openLessonId ? nextLesson : currentLesson;
                if (target) openLesson(target);
              }}
              className="sg-focus-ring sg-btn-primary h-[34px] w-full rounded-full px-3 text-[12px] font-semibold text-white whitespace-nowrap transition-[transform,box-shadow] duration-150"
            >
              Continuer la leçon
            </button>
          </div>
        </section>
      ),
    },
    {
      id: 'cours-lessons',
      render: () => (
        <section
          aria-label={`Leçons de ${selectedSubject}`}
          className="sg-card-l1 flex h-full min-h-[165px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-4 md:min-h-0"
        >
          <div className="flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-bold text-[#121417]">
                Leçons · {selectedSubject}
              </h2>
              {activeSubjectLesson && (
                <p className="truncate text-[10.5px] font-medium text-[var(--accent)]">
                  {activeSubjectLesson.title}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-[10.5px] font-semibold text-[#55585F] tabular-nums">
              {activeSubjectLesson?.notions.length ?? 0}
            </span>
          </div>

          <div
            className="my-1.5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1"
            role="list"
            aria-label={`Liste des leçons de ${selectedSubject}`}
          >
            {activeSubjectLesson?.notions.map((notion, idx) => {
              const isSelected =
                openLessonId === activeSubjectLesson.id && selectedNotionIdx === idx;
              return (
                <button
                  key={`${activeSubjectLesson.id}-${idx}`}
                  type="button"
                  onClick={() => openLesson(activeSubjectLesson, idx)}
                  aria-pressed={isSelected}
                  className={`sg-focus-ring flex w-full shrink-0 items-start gap-2 rounded-[12px] px-2.5 py-1 text-left text-[11px] leading-snug transition-colors ${
                    isSelected
                      ? 'sg-selected-capsule font-semibold text-[var(--accent)]'
                      : 'border border-white/75 bg-white/60 text-[#1C1E22] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]'
                  }`}
                >
                  <span className="mt-[1px] shrink-0 font-mono text-[10px] font-bold text-[var(--accent)] tabular-nums">
                    {idx + 1}.
                  </span>
                  <span className="min-w-0 flex-1 line-clamp-2">{notion}</span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-between pt-1 text-[11px] font-medium text-[#4B4E54] tabular-nums">
            <span>
              Cours {currentIndexInAll + 1} sur {lessons.length}
            </span>
            <button
              type="button"
              onClick={() => activeSubjectLesson && onGoToExercices(activeSubjectLesson.subject)}
              className="sg-focus-ring font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
            >
              Faire les exercices
            </button>
          </div>
        </section>
      ),
    },
  ];

  return (
    <BentoTileCanvas
      tiles={tiles}
      slots={slots}
      baseHeightPx={baseHeightPx}
      locked={locked}
      tutorName={tutor.name}
      tutor={tutor}
      formatIndex={0}
      experience={experience}
      availableSubjects={subjects}
      openTileId={openTileId}
      onSelectOpenTileId={onSelectOpenTileId}
      onOpenTilePage={onOpenTilePage}
      onOpenTutor={onOpenTutor}
      onAnalyzeTile={onAnalyzeTile}
      onChangeTiles={onChangeTiles}
      onBringToFront={onBringToFront}
    />
  );
};
