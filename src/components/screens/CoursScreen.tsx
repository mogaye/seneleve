import React, { useEffect, useMemo, useState } from 'react';
import { ClassExperience, LessonItem } from '../../data/studyData';

interface CoursScreenProps {
  experience: ClassExperience;
  onGoToExercices: (subject: string) => void;
}

export const CoursScreen: React.FC<CoursScreenProps> = ({
  experience,
  onGoToExercices,
}) => {
  const { subjects, lessons } = experience;

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0] ?? 'Français');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [consultedIds, setConsultedIds] = useState<string[]>(() =>
    lessons[0] ? [lessons[0].id] : [],
  );
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  useEffect(() => {
    setSelectedSubject(subjects[0] ?? 'Français');
    setSearchQuery('');
    setAppliedQuery('');
    setActiveStep(1);
    setOpenLessonId(null);
    setConsultedIds(lessons[0] ? [lessons[0].id] : []);
  }, [experience.classLevel, experience.serie, subjects, lessons]);

  const filteredLessons = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesSubject =
        q.length > 0 || lesson.subject === selectedSubject;
      const matchesQuery =
        q.length === 0 ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.objectif.toLowerCase().includes(q) ||
        lesson.subject.toLowerCase().includes(q);
      return matchesSubject && matchesQuery;
    });
  }, [lessons, selectedSubject, appliedQuery]);

  const displayedLessons = filteredLessons.length > 0 ? filteredLessons : lessons;

  const currentLesson: LessonItem =
    lessons.find((l) => l.id === openLessonId) ?? displayedLessons[0] ?? lessons[0];

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

  const openLesson = (lesson: LessonItem) => {
    setOpenLessonId(lesson.id);
    setSelectedSubject(lesson.subject);
    setActiveStep(4);
    setConsultedIds((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchQuery);
    setActiveStep(3);
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-[2.15fr_1fr] md:grid-rows-[1.32fr_1fr]">
      {/* Grand Panneau Central — Top Left */}
      <section
        aria-label="COURS"
        className="sg-card-l2 flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:h-full md:min-h-0 md:p-5"
      >
        {/* Top bar: COURS context + 4 step pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold tracking-wider text-[var(--accent)]">
              COURS · {experience.classLevel}
              {experience.serie ? ` (${experience.serie})` : ''}
            </span>
            {openLessonId && (
              <button
                type="button"
                onClick={() => {
                  setOpenLessonId(null);
                  setActiveStep(2);
                }}
                className="sg-focus-ring sg-nav-idle h-[24px] rounded-full px-3 text-[11px] font-semibold text-[#1C1E22] whitespace-nowrap"
              >
                Retour au programme
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5" role="tablist" aria-label="Étapes du cours">
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
                        openLesson(currentLesson);
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
          <div className="my-2 flex flex-1 flex-col justify-center gap-3 overflow-y-auto pr-1">
            <div>
              <h1 className="text-[20px] font-bold tracking-tight text-[#121417] text-balance md:text-[22px]">
                Apprends chaque leçon pas à pas
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#4B4E54]">
                Choisis une matière de {experience.classLevel}
                {experience.serie ? ` (${experience.serie})` : ''} pour découvrir le programme, les explications et les exemples.
              </p>
            </div>

            {/* Search bar inside frosted pill */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une leçon…"
                aria-label="Rechercher une leçon"
                className="sg-focus-ring sg-glass-subtile h-[36px] min-w-[200px] flex-1 rounded-full px-4 text-[12.5px] text-[#121417] placeholder:text-[#666A72]"
              />
              <button
                type="submit"
                className="sg-focus-ring sg-btn-primary h-[36px] rounded-full px-5 text-[12px] font-semibold text-white whitespace-nowrap shrink-0"
              >
                Rechercher
              </button>
            </form>

            {/* Class-specific lessons grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {displayedLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => openLesson(lesson)}
                  className="sg-focus-ring sg-glass-subtile flex flex-col items-start gap-1 rounded-[16px] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]"
                >
                  <span className="text-[11px] font-semibold text-[var(--accent)]">
                    {lesson.subject}
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#121417] line-clamp-2">
                    {lesson.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="my-2 flex flex-1 flex-col justify-center gap-2.5 overflow-y-auto pr-1">
            <div>
              <h1 className="text-[18px] font-bold tracking-tight text-[#121417] text-balance md:text-[20px]">
                {currentLesson.title}
              </h1>
              <p className="mt-0.5 text-[12.5px] text-[#4B4E54]">
                <span className="font-semibold text-[var(--accent)]">Objectif :</span>{' '}
                {currentLesson.objectif}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <div className="sg-glass-subtile rounded-[16px] p-3.5">
                <h2 className="text-[12px] font-bold text-[#121417]">La leçon</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-[#36393F]">
                  {currentLesson.lecon}
                </p>
              </div>
              <div className="sg-glass-subtile rounded-[16px] p-3.5">
                <h2 className="text-[12px] font-bold text-[#121417]">Exemples expliqués</h2>
                <ul className="mt-1 space-y-1 text-[12px] leading-relaxed text-[#36393F]">
                  {currentLesson.exemples.map((ex, i) => (
                    <li key={i}>• {ex}</li>
                  ))}
                </ul>
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
                Leçon {currentIndexInAll + 1} sur {lessons.length}
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
                Leçon {currentIndexInAll + 1} sur {lessons.length}
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

      {/* Panneau Vertical Droit — Choisir une matière */}
      <section
        aria-label="Choisir une matière"
        className="sg-card-l1 flex h-full flex-col justify-between rounded-[22px] p-3.5 md:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-bold text-[#121417]">Choisir une matière</h2>
          <span className="text-[11px] font-semibold text-[var(--accent)]">
            {experience.classLevel}
          </span>
        </div>

        <div className="my-2 flex flex-col gap-[6px]" role="listbox" aria-label="Matières">
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
                  setActiveStep(2);
                }}
                className={`sg-focus-ring flex h-[35px] w-full items-center gap-2.5 rounded-full px-2.5 text-left transition-colors duration-150 ${
                  isSelected
                    ? 'sg-selected-capsule'
                    : 'hover:bg-white/60'
                }`}
              >
                <span
                  className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full ${
                    isSelected
                      ? 'sg-halo-ring'
                      : 'border border-white/80 bg-white/55'
                  }`}
                >
                  {isSelected && <span className="sg-halo-core h-[10px] w-[10px] rounded-full" />}
                </span>
                <span
                  className={`truncate text-[12px] font-semibold ${
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

      {/* Bottom Left + Bottom Center Split */}
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1.35fr_1fr]">
        {/* Panneau Inférieur Gauche — Progression du cours with Circular Glass Ring */}
        <section
          aria-label="Progression du cours"
          className="sg-card-l1 flex min-h-[155px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold text-[#121417]">Progression du cours</h2>
              <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
                {consultedIds.length} leçon(s) consultée(s) sur {lessons.length}.
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

        {/* Carte Inférieure du Milieu — Leçon suivante (Level 3 glowing border) */}
        <section
          aria-label="Leçon suivante"
          className="sg-card-l3 flex min-h-[155px] flex-col justify-between overflow-hidden rounded-[22px] md:h-full md:min-h-0"
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
      </div>

      {/* Panneau Inférieur Droit — À retenir */}
      <section
        aria-label="À retenir"
        className="sg-card-l1 flex min-h-[155px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
      >
        <div className="overflow-y-auto pr-1">
          <h2 className="text-[13px] font-bold text-[#121417]">À retenir</h2>
          {openLessonId ? (
            <ul className="mt-1.5 space-y-1.5 text-[11.5px] leading-relaxed text-[#36393F]">
              {currentLesson.aRetenir.map((point, idx) => (
                <li key={idx}>• {point}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#4B4E54]">
              Les notions essentielles de cette leçon apparaîtront ici.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 text-[11px] font-medium text-[#4B4E54] tabular-nums">
          <span>
            Leçon {currentIndexInAll + 1} sur {lessons.length}
          </span>
          <button
            type="button"
            onClick={() => currentLesson && onGoToExercices(currentLesson.subject)}
            className="sg-focus-ring font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            Faire les exercices
          </button>
        </div>
      </section>
    </div>
  );
};
