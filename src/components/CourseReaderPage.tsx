import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  Menu,
  Plus,
  ScanSearch,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  CourseDocument,
  CustomVerbatimCourse,
  formatCourseDocumentAsPlainText,
  getPdfCourseDocument,
} from '../data/pdfCourses';
import { ClassExperience, LessonItem } from '../data/studyData';
import {
  analyzeSiteNovelties,
  requestLessonExplanation,
} from '../services/tutorClient';
import {
  getSubjectTutor,
  NoveltyAnalysisResult,
  SubjectTutorPersona,
} from '../utils/tutorAgent';
import { FORMAT_META } from '../utils/wireframeState';

type ReadingScale = 'sm' | 'md' | 'lg';

interface CourseReaderPageProps {
  open: boolean;
  experience: ClassExperience;
  selectedSubject: string;
  customCourses: CustomVerbatimCourse[];
  activeCustomCourseId: string | null;
  onSelectSubject: (subject: string) => void;
  onSelectCustomCourse: (courseId: string | null) => void;
  onAddCustomCourse: (input: {
    subject: string;
    title: string;
    content: string;
  }) => CustomVerbatimCourse;
  onDeleteCustomCourse: (courseId: string) => void;
  onClose: () => void;
  onOpenTutor: (subject?: string) => void;
  onStartQuiz: (subject: string) => void;
  onStartFlashcards: (subject: string) => void;
  onStartExercises: (subject: string) => void;
}

const SCALE_CLASSES: Record<
  ReadingScale,
  {
    title: string;
    heading: string;
    body: string;
    list: string;
  }
> = {
  sm: {
    title: 'text-[23px] md:text-[27px]',
    heading: 'text-[16px] md:text-[17px]',
    body: 'text-[14.5px] leading-[1.72]',
    list: 'text-[14.5px] leading-[1.72]',
  },
  md: {
    title: 'text-[25px] md:text-[31px]',
    heading: 'text-[17px] md:text-[19px]',
    body: 'text-[16px] md:text-[16.5px] leading-[1.8]',
    list: 'text-[15.5px] md:text-[16px] leading-[1.78]',
  },
  lg: {
    title: 'text-[28px] md:text-[34px]',
    heading: 'text-[19px] md:text-[21px]',
    body: 'text-[17.5px] md:text-[18.5px] leading-[1.85]',
    list: 'text-[17px] md:text-[18px] leading-[1.82]',
  },
};

export const CourseReaderPage: React.FC<CourseReaderPageProps> = ({
  open,
  experience,
  selectedSubject,
  customCourses,
  activeCustomCourseId,
  onSelectSubject,
  onSelectCustomCourse,
  onAddCustomCourse,
  onDeleteCustomCourse,
  onClose,
  onOpenTutor,
  onStartQuiz,
  onStartFlashcards,
  onStartExercises,
}) => {
  const [scale, setScale] = useState<ReadingScale>('md');
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [draftSubject, setDraftSubject] = useState(selectedSubject);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const [explanationState, setExplanationState] = useState<{
    key: string;
    loading: boolean;
    error?: string;
    data?: { explanation: string; example: string; quickCheck: string };
  } | null>(null);

  const [analysisState, setAnalysisState] = useState<{
    key: string;
    loading: boolean;
    error?: string;
    data?: NoveltyAnalysisResult;
  } | null>(null);

  const classCustomCourses = useMemo(
    () =>
      customCourses.filter(
        (c) =>
          c.classLevel === experience.classLevel &&
          (c.serie ?? null) === (experience.serie ?? null),
      ),
    [customCourses, experience.classLevel, experience.serie],
  );

  const activeCustomCourse = useMemo(
    () =>
      activeCustomCourseId
        ? classCustomCourses.find((c) => c.id === activeCustomCourseId) ?? null
        : null,
    [activeCustomCourseId, classCustomCourses],
  );

  const effectiveSubject = activeCustomCourse?.subject ?? selectedSubject;
  const tutor: SubjectTutorPersona = useMemo(
    () => getSubjectTutor(effectiveSubject),
    [effectiveSubject],
  );

  const fallbackLesson: LessonItem | undefined = useMemo(
    () =>
      experience.lessons.find((l) => l.subject === effectiveSubject) ??
      experience.lessons[0],
    [experience.lessons, effectiveSubject],
  );

  const pdfCourseDoc: CourseDocument = useMemo(
    () =>
      getPdfCourseDocument({
        classLevel: experience.classLevel,
        serie: experience.serie,
        subject: effectiveSubject,
        fallbackTitle: fallbackLesson?.title ?? effectiveSubject,
        fallbackObjectif:
          fallbackLesson?.objectif ??
          `Programme officiel de ${effectiveSubject} en ${experience.classLevel}.`,
        fallbackNotions: fallbackLesson?.notions ?? [],
      }),
    [
      experience.classLevel,
      experience.serie,
      effectiveSubject,
      fallbackLesson,
    ],
  );

  const displayedDoc: CourseDocument = useMemo(() => {
    if (activeCustomCourse) {
      return {
        title: activeCustomCourse.title,
        subtitle: `${activeCustomCourse.classLevel}${activeCustomCourse.serie ? ` · ${activeCustomCourse.serie}` : ''} · ${activeCustomCourse.subject}`,
        sections: [],
        verbatimText: activeCustomCourse.content,
        isCustom: true,
        customId: activeCustomCourse.id,
        createdAt: activeCustomCourse.createdAt,
      };
    }
    return pdfCourseDoc;
  }, [activeCustomCourse, pdfCourseDoc]);

  const docKey = activeCustomCourse
    ? `custom:${activeCustomCourse.id}`
    : `pdf:${experience.classLevel}:${experience.serie ?? ''}:${effectiveSubject}`;

  useEffect(() => {
    setDraftSubject(effectiveSubject);
  }, [effectiveSubject]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (addModalOpen) {
          setAddModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, addModalOpen, onClose]);

  if (!open) return null;

  const subjectIdx = Math.max(0, experience.subjects.indexOf(effectiveSubject));
  const prevSubject =
    experience.subjects[
      (subjectIdx - 1 + experience.subjects.length) %
        Math.max(1, experience.subjects.length)
    ] ?? effectiveSubject;
  const nextSubject =
    experience.subjects[(subjectIdx + 1) % Math.max(1, experience.subjects.length)] ??
    effectiveSubject;

  const scaleCls = SCALE_CLASSES[scale];
  const plainCourseText = formatCourseDocumentAsPlainText(displayedDoc);

  const handleExplainCourse = async () => {
    setExplanationState({ key: docKey, loading: true });
    try {
      const notions = displayedDoc.verbatimText
        ? displayedDoc.verbatimText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 8)
        : displayedDoc.sections.flatMap((s) => s.items).slice(0, 8);

      const data = await requestLessonExplanation({
        tutorName: tutor.name,
        subject: effectiveSubject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: displayedDoc.title,
        objectif:
          displayedDoc.intro ??
          fallbackLesson?.objectif ??
          `Comprendre l’essentiel de ${displayedDoc.title}`,
        notions,
        courseContent: plainCourseText,
      });
      setExplanationState({ key: docKey, loading: false, data });
    } catch (err) {
      setExplanationState({
        key: docKey,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Explication indisponible pour le moment.',
      });
    }
  };

  const handleAnalyzeCustomCourse = async () => {
    if (!activeCustomCourse) return;
    setAnalysisState({ key: docKey, loading: true });
    try {
      const data = await analyzeSiteNovelties({
        tutorName: tutor.name,
        subject: activeCustomCourse.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        screenLabel: 'Lecteur de cours',
        items: [
          {
            id: activeCustomCourse.id,
            title: activeCustomCourse.title,
            note: activeCustomCourse.content,
            kind: 'course',
          },
        ],
      });
      setAnalysisState({ key: docKey, loading: false, data });
    } catch (err) {
      setAnalysisState({
        key: docKey,
        loading: false,
        error:
          err instanceof Error ? err.message : 'Analyse indisponible pour le moment.',
      });
    }
  };

  const handleSubmitNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftContent.trim()) return;
    const created = onAddCustomCourse({
      subject: draftSubject || effectiveSubject,
      title: draftTitle.trim(),
      content: draftContent,
    });
    onSelectSubject(created.subject);
    onSelectCustomCourse(created.id);
    setDraftTitle('');
    setDraftContent('');
    setAddModalOpen(false);
    setMobileRailOpen(false);
  };

  const renderRailContent = () => (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
      <div>
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#4B4E54]">
            Matières · {experience.classLevel}
            {experience.serie ? ` (${experience.serie})` : ''}
          </h2>
          <span className="font-mono text-[11px] font-semibold text-[#55585F] tabular-nums">
            {experience.subjects.length}
          </span>
        </div>

        <nav aria-label="Matières du lecteur" className="flex flex-col gap-1">
          {experience.subjects.map((subj) => {
            const isActive = !activeCustomCourse && effectiveSubject === subj;
            const subjDoc = getPdfCourseDocument({
              classLevel: experience.classLevel,
              serie: experience.serie,
              subject: subj,
              fallbackTitle: subj,
              fallbackObjectif: '',
              fallbackNotions: [],
            });
            const itemCount = subjDoc.sections.reduce(
              (acc, s) => acc + s.items.length,
              0,
            );
            return (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  onSelectCustomCourse(null);
                  onSelectSubject(subj);
                  setMobileRailOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`sg-focus-ring flex w-full items-center justify-between gap-2 rounded-[14px] px-3 py-2.5 text-left text-[13px] transition-colors ${
                  isActive
                    ? 'sg-selected-capsule font-bold text-[var(--accent)]'
                    : 'font-medium text-[#1C1E22] hover:bg-white/65'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{subj}</span>
                {itemCount > 0 && (
                  <span className="shrink-0 font-mono text-[11px] text-[#55585F] tabular-nums">
                    {itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/70 pt-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#4B4E54]">
            Cours ajoutés
          </h2>
          <button
            type="button"
            onClick={() => {
              setDraftSubject(effectiveSubject);
              setAddModalOpen(true);
            }}
            className="sg-focus-ring text-[11px] font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            + Ajouter
          </button>
        </div>

        {classCustomCourses.length === 0 ? (
          <p className="px-2 text-[12px] leading-relaxed text-[#55585F]">
            Ajoute un cours complet avec son titre et son texte exact pour le lire ici sans aucune modification.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {classCustomCourses.map((course) => {
              const isSelected = activeCustomCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  className={`flex items-center gap-1 rounded-[14px] pr-1 transition-colors ${
                    isSelected
                      ? 'sg-selected-capsule'
                      : 'bg-white/45 hover:bg-white/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSubject(course.subject);
                      onSelectCustomCourse(course.id);
                      setMobileRailOpen(false);
                    }}
                    className="sg-focus-ring min-w-0 flex-1 px-3 py-2 text-left"
                  >
                    <div
                      className={`truncate text-[12.5px] font-semibold ${
                        isSelected ? 'text-[var(--accent)]' : 'text-[#121417]'
                      }`}
                    >
                      {course.title}
                    </div>
                    <div className="truncate text-[10.5px] text-[#55585F]">
                      {course.subject}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomCourse(course.id)}
                    aria-label={`Supprimer ${course.title}`}
                    className="sg-focus-ring flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[#666A72] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                  >
                    <Trash2 className="h-[13px] w-[13px]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-no-swipe="true"
      role="dialog"
      aria-modal="true"
      aria-label={`Lecteur de cours — ${displayedDoc.title}`}
      className={`${FORMAT_META[0].themeClass} ${experience.cycleClass} styleguide-canvas fixed inset-0 z-[105] flex h-dvh w-screen flex-col overflow-hidden`}
    >
      {/* Top reader bar */}
      <header className="sg-glass-bar z-10 flex shrink-0 flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 md:px-6 md:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="sg-focus-ring sg-nav-idle flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-[#121417] whitespace-nowrap"
          >
            <ArrowLeft className="h-[14px] w-[14px]" />
            <span>Retour aux carreaux</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileRailOpen((v) => !v)}
            aria-label="Afficher la liste des matières"
            className="sg-focus-ring sg-nav-idle flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-[#121417] lg:hidden whitespace-nowrap"
          >
            <Menu className="h-[14px] w-[14px]" />
            <span>Matières</span>
          </button>

          <span className="hidden truncate text-[12.5px] font-semibold text-[#4B4E54] sm:inline">
            {experience.classLevel}
            {experience.serie ? ` (${experience.serie})` : ''} · {effectiveSubject}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div
            className="hidden items-center gap-0.5 rounded-full border border-[#D7DCE6] bg-white/95 p-0.5 shadow-xs sm:flex"
            role="group"
            aria-label="Taille du texte"
          >
            {(
              [
                { id: 'sm', label: 'A-' },
                { id: 'md', label: 'A' },
                { id: 'lg', label: 'A+' },
              ] as { id: ReadingScale; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setScale(opt.id)}
                aria-pressed={scale === opt.id}
                className={`sg-focus-ring h-[28px] rounded-full px-2.5 text-[11.5px] font-bold transition-colors ${
                  scale === opt.id
                    ? 'sg-btn-primary text-white'
                    : 'text-[#1C1E22] hover:bg-[#F1F5F9]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setDraftSubject(effectiveSubject);
              setAddModalOpen(true);
            }}
            className="sg-focus-ring sg-btn-secondary flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
          >
            <Plus className="h-[14px] w-[14px]" />
            <span>Ajouter un cours</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenTutor(effectiveSubject)}
            aria-label={`Ouvrir ${tutor.name}`}
            className="sg-focus-ring sg-btn-primary flex h-[34px] shrink-0 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[12px] font-semibold text-white whitespace-nowrap"
          >
            <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/25 text-[11px] font-bold">
              {tutor.initial}
            </span>
            <span>{tutor.name}</span>
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="relative mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 gap-5 px-3 py-4 md:px-6 md:py-6">
        {/* Desktop left rail */}
        <aside className="sg-card-l1 hidden w-[270px] shrink-0 flex-col overflow-hidden rounded-[24px] p-4 lg:flex">
          {renderRailContent()}
        </aside>

        {/* Mobile left drawer */}
        {mobileRailOpen && (
          <div
            className="fixed inset-0 z-20 flex bg-[#121417]/30 lg:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileRailOpen(false);
            }}
          >
            <aside className="sg-card-l2 flex h-full w-[290px] max-w-[85vw] flex-col bg-[#F7F8FC]/96 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#121417]">Programme</span>
                <button
                  type="button"
                  onClick={() => setMobileRailOpen(false)}
                  aria-label="Fermer les matières"
                  className="sg-focus-ring flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white text-[#121417]"
                >
                  <X className="h-[14px] w-[14px]" />
                </button>
              </div>
              {renderRailContent()}
            </aside>
          </div>
        )}

        {/* Spacious centered reading page */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5 md:pr-2">
          <article className="mx-auto flex w-full max-w-[800px] flex-col gap-6 rounded-[28px] border border-white bg-white/95 px-6 py-7 shadow-[0_20px_50px_rgba(18,20,23,0.09)] md:px-12 md:py-11">
            {/* Document Header */}
            <div className="border-b border-[#E5E8F0] pb-5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold text-[var(--accent)]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-[14px] w-[14px] shrink-0" />
                  <span>{effectiveSubject}</span>
                  <span aria-hidden="true" className="text-[#8E939E]">
                    ·
                  </span>
                  <span>
                    {experience.classLevel}
                    {experience.serie ? ` (${experience.serie})` : ''}
                  </span>
                </span>
                <span className="font-medium text-[#4B4E54]">
                  {activeCustomCourse
                    ? 'Cours personnel (texte intégral)'
                    : 'Programme officiel'}
                </span>
              </div>

              <h1
                className={`mt-2.5 font-bold leading-[1.2] tracking-[-0.02em] text-[#121417] text-balance ${scaleCls.title}`}
              >
                {displayedDoc.title}
              </h1>

              {displayedDoc.subtitle && (
                <p className="mt-1.5 text-[13.5px] font-medium text-[#55585F]">
                  {displayedDoc.subtitle}
                </p>
              )}

              {activeCustomCourse && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0D8A4E]">
                  <CheckCircle2 className="h-[13.5px] w-[13.5px]" />
                  <span>Texte affiché exactement tel que saisi, sans aucune modification.</span>
                </p>
              )}
            </div>

            {/* Course Body */}
            {displayedDoc.verbatimText !== undefined ? (
              <div
                data-testid="verbatim-course-content"
                className={`whitespace-pre-wrap break-words font-normal text-[#1C1E22] ${scaleCls.body}`}
              >
                {displayedDoc.verbatimText}
              </div>
            ) : (
              <div className="flex flex-col gap-7">
                {displayedDoc.intro && (
                  <p className={`text-[#262930] ${scaleCls.body}`}>
                    {displayedDoc.intro}
                  </p>
                )}

                {displayedDoc.sections.map((section, sIdx) => (
                  <section
                    key={`${section.heading}-${sIdx}`}
                    className="flex flex-col gap-3"
                  >
                    <h2
                      className={`font-bold leading-snug text-[#121417] ${scaleCls.heading}`}
                    >
                      {section.heading}
                    </h2>

                    {section.intro && (
                      <p className={`text-[#36393F] ${scaleCls.body}`}>
                        {section.intro}
                      </p>
                    )}

                    <ul className={`flex flex-col gap-2.5 text-[#1C1E22] ${scaleCls.list}`}>
                      {section.items.map((item, iIdx) => (
                        <li
                          key={`${sIdx}-${iIdx}`}
                          className="flex items-start gap-3 rounded-[14px] bg-[#F7F8FC] px-4 py-3"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent)]"
                          />
                          <span className="min-w-0 flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {section.note && (
                      <p className="rounded-[14px] bg-[var(--accent-soft)]/50 px-4 py-3 text-[13.5px] leading-relaxed text-[#262930]">
                        {section.note}
                      </p>
                    )}
                  </section>
                ))}

                {displayedDoc.footerNote && (
                  <p className="rounded-[16px] border border-[#E5E8F0] bg-[#FAFBFD] px-4 py-3.5 text-[13.5px] leading-relaxed text-[#4B4E54]">
                    {displayedDoc.footerNote}
                  </p>
                )}
              </div>
            )}

            {/* Companion interactive bar (non-intrusive, strictly separated from course text) */}
            <div className="mt-2 flex flex-col gap-4 border-t border-[#E5E8F0] pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-[14px] font-bold text-[#121417]">
                    Travailler ce cours avec {tutor.name}
                  </h3>
                  <p className="text-[12px] text-[#4B4E54]">
                    Explications, quiz, flashcards et exercices adaptés au texte ci-dessus.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={
                    explanationState?.key === docKey && explanationState.loading
                  }
                  onClick={() => void handleExplainCourse()}
                  className="sg-focus-ring sg-btn-primary flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap"
                >
                  {explanationState?.key === docKey && explanationState.loading ? (
                    <Loader2 className="h-[13.5px] w-[13.5px] animate-spin" />
                  ) : (
                    <Sparkles className="h-[13.5px] w-[13.5px]" />
                  )}
                  <span>Expliquer avec {tutor.name}</span>
                </button>

                {activeCustomCourse && (
                  <button
                    type="button"
                    disabled={
                      analysisState?.key === docKey && analysisState.loading
                    }
                    onClick={() => void handleAnalyzeCustomCourse()}
                    className="sg-focus-ring sg-btn-secondary flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                  >
                    {analysisState?.key === docKey && analysisState.loading ? (
                      <Loader2 className="h-[13.5px] w-[13.5px] animate-spin" />
                    ) : (
                      <ScanSearch className="h-[13.5px] w-[13.5px]" />
                    )}
                    <span>Analyser avec {tutor.name}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onStartQuiz(effectiveSubject)}
                  className="sg-focus-ring sg-nav-idle flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  <Layers className="h-[13.5px] w-[13.5px] text-[var(--accent)]" />
                  <span>Générer un quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartFlashcards(effectiveSubject)}
                  className="sg-focus-ring sg-nav-idle flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  <span>Créer des flashcards</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartExercises(effectiveSubject)}
                  className="sg-focus-ring sg-nav-idle flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  <span>Faire les exercices</span>
                </button>
              </div>

              {explanationState?.key === docKey && !explanationState.loading && (
                <div className="rounded-[18px] border border-[var(--accent-border)]/40 bg-[#F7F9FF] p-4 text-[13.5px] leading-relaxed text-[#121417]">
                  {explanationState.error ? (
                    <p className="font-medium text-[#991B1B]">
                      {explanationState.error}
                    </p>
                  ) : (
                    explanationState.data && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[12px] font-bold text-[var(--accent)]">
                          Éclairage de {tutor.name}
                        </div>
                        <p>{explanationState.data.explanation}</p>
                        {explanationState.data.example && (
                          <p className="text-[#36393F]">
                            <span className="font-semibold">Exemple concret :</span>{' '}
                            {explanationState.data.example}
                          </p>
                        )}
                        {explanationState.data.quickCheck && (
                          <p className="font-medium text-[var(--accent)]">
                            Mini défi : {explanationState.data.quickCheck}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {analysisState?.key === docKey && !analysisState.loading && (
                <div className="rounded-[18px] border border-[var(--accent-border)]/40 bg-[#F7F9FF] p-4 text-[13.5px] leading-relaxed text-[#121417]">
                  {analysisState.error ? (
                    <p className="font-medium text-[#991B1B]">
                      {analysisState.error}
                    </p>
                  ) : (
                    analysisState.data && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[12px] font-bold text-[var(--accent)]">
                          Analyse de {tutor.name}
                        </div>
                        <p>{analysisState.data.summary}</p>
                        {analysisState.data.keyPoints.length > 0 && (
                          <ul className="space-y-1 text-[#36393F]">
                            {analysisState.data.keyPoints.map((pt, i) => (
                              <li key={i}>• {pt}</li>
                            ))}
                          </ul>
                        )}
                        {analysisState.data.suggestedQuestion && (
                          <p className="font-medium text-[var(--accent)]">
                            Question pour réviser : {analysisState.data.suggestedQuestion}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Bottom prev / next subject navigation */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E8F0] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomCourse(null);
                    onSelectSubject(prevSubject);
                  }}
                  className="sg-focus-ring sg-nav-idle flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  <ChevronLeft className="h-[14px] w-[14px]" />
                  <span>{prevSubject}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomCourse(null);
                    onSelectSubject(nextSubject);
                  }}
                  className="sg-focus-ring sg-btn-secondary flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  <span>{nextSubject}</span>
                  <ChevronRight className="h-[14px] w-[14px]" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Add Verbatim Course Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#121417]/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ajouter un cours complet"
            className="flex max-h-[90dvh] w-full max-w-[660px] flex-col overflow-hidden rounded-[26px] border border-white bg-[#FAFBFD] p-5 shadow-2xl md:p-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E5E8F0] pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#121417]">
                  Ajouter un cours
                </h2>
                <p className="text-[12px] text-[#4B4E54]">
                  Le texte saisi sera enregistré et affiché mot pour mot, sans aucune modification ni résumé.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                aria-label="Fermer la fenêtre d’ajout"
                className="sg-focus-ring sg-nav-idle flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[#121417]"
              >
                <X className="h-[15px] w-[15px]" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitNewCourse}
              className="mt-4 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-1"
            >
              <label className="flex flex-col gap-1 text-[12px] font-semibold text-[#36393F]">
                <span>Matière ({experience.classLevel})</span>
                <select
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  className="sg-focus-ring h-[38px] rounded-[12px] border border-[#D7DCE6] bg-white px-3 text-[13px] font-medium text-[#121417]"
                >
                  {experience.subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[12px] font-semibold text-[#36393F]">
                <span>Titre du cours</span>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Ex : Chapitre 4 — Les fonctions affines"
                  className="sg-focus-ring h-[38px] rounded-[12px] border border-[#D7DCE6] bg-white px-3 text-[13.5px] font-medium text-[#121417] placeholder:text-[#7A7F8A]"
                />
              </label>

              <label className="flex min-h-0 flex-1 flex-col gap-1 text-[12px] font-semibold text-[#36393F]">
                <span>Contenu complet du cours</span>
                <textarea
                  required
                  rows={10}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Colle ou écris ton cours complet ici. Il sera affiché exactement tel quel…"
                  className="sg-focus-ring min-h-[210px] w-full flex-1 resize-y rounded-[14px] border border-[#D7DCE6] bg-white p-3.5 text-[14px] leading-relaxed text-[#121417] placeholder:text-[#7A7F8A]"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="sg-focus-ring sg-nav-idle h-[36px] rounded-full px-4 text-[12.5px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!draftTitle.trim() || !draftContent.trim()}
                  className="sg-focus-ring sg-btn-primary h-[36px] rounded-full px-5 text-[12.5px] font-semibold text-white whitespace-nowrap disabled:opacity-50"
                >
                  Enregistrer le cours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
