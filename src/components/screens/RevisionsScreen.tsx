import React, { useEffect, useMemo, useState } from 'react';
import { ClassExperience } from '../../data/studyData';

type RevisionTab = 'Quiz' | 'Flashcards' | 'Résumé' | 'Planning';

interface RevisionsScreenProps {
  experience: ClassExperience;
  onOpenFullCourse: () => void;
}

const TABS: RevisionTab[] = ['Quiz', 'Flashcards', 'Résumé', 'Planning'];

export const RevisionsScreen: React.FC<RevisionsScreenProps> = ({
  experience,
  onOpenFullCourse,
}) => {
  const { lessons, subjects } = experience;

  const [activeTab, setActiveTab] = useState<RevisionTab>('Quiz');
  const [lessonSearch, setLessonSearch] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? '');

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPicked, setQuizPicked] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizReviewCount, setQuizReviewCount] = useState(0);

  // Flashcards state
  const [cardsStarted, setCardsStarted] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);

  // Planning state
  const [planSubjects, setPlanSubjects] = useState<string[]>(subjects.slice(0, 2));
  const [availableDays, setAvailableDays] = useState('4 jours');
  const [timePerDay, setTimePerDay] = useState('45 min');
  const [planningCreated, setPlanningCreated] = useState(false);
  const [editingPlanning, setEditingPlanning] = useState(false);

  useEffect(() => {
    setSelectedLessonId(lessons[0]?.id ?? '');
    setLessonSearch('');
    setQuizStarted(false);
    setQuizIdx(0);
    setQuizPicked(null);
    setQuizDone(false);
    setQuizReviewCount(0);
    setCardsStarted(false);
    setCardIdx(0);
    setCardFlipped(false);
    setCardsReviewed(0);
    setPlanSubjects(subjects.slice(0, 2));
    setPlanningCreated(false);
    setEditingPlanning(false);
  }, [experience.classLevel, experience.serie, lessons, subjects]);

  const filteredLessons = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q),
    );
  }, [lessons, lessonSearch]);

  const activeLesson = lessons.find((l) => l.id === selectedLessonId) ?? lessons[0];
  const quizList = activeLesson?.quiz ?? [];
  const activeQuizQ = quizList[quizIdx % Math.max(1, quizList.length)];
  const flashcards = activeLesson?.flashcards ?? [];
  const activeCard = flashcards[cardIdx % Math.max(1, flashcards.length)];

  const sessionProgress = useMemo(() => {
    if (activeTab === 'Quiz') {
      if (quizDone) return 100;
      if (!quizStarted) return 20;
      return Math.round(((quizIdx + 1) / Math.max(1, quizList.length)) * 100);
    }
    if (activeTab === 'Flashcards') {
      if (!cardsStarted) return 20;
      return Math.min(100, Math.round(((cardsReviewed + 1) / Math.max(2, flashcards.length)) * 100));
    }
    if (activeTab === 'Planning') {
      return planningCreated ? 100 : 35;
    }
    return 65;
  }, [activeTab, quizDone, quizStarted, quizIdx, quizList.length, cardsStarted, cardsReviewed, flashcards.length, planningCreated]);

  const renderCentralToolCardContent = () => {
    if (activeTab === 'Quiz') {
      return {
        title: 'Quiz de révision',
        body: 'Réponds à quelques questions pour vérifier ce que tu as retenu.',
        cta: quizDone ? 'Voir les notions à revoir' : 'Lancer le quiz',
        action: () => {
          if (quizDone) {
            setQuizDone(false);
            setQuizIdx(0);
            setQuizPicked(null);
            setQuizStarted(true);
          } else {
            setQuizStarted(true);
          }
        },
      };
    }
    if (activeTab === 'Flashcards') {
      return {
        title: 'Cartes mémoire',
        body: 'Lis la question, réfléchis, puis retourne la carte pour voir la réponse.',
        cta: 'Commencer les cartes',
        action: () => {
          setCardsStarted(true);
          setCardFlipped(false);
        },
      };
    }
    if (activeTab === 'Résumé') {
      return {
        title: 'Résumé de la leçon',
        body: 'Retrouve les définitions, règles et idées principales en un coup d’œil.',
        cta: 'Lire le résumé',
        action: () => setActiveTab('Résumé'),
      };
    }
    return {
      title: 'Mon planning de révision',
      body: 'Répartis tes leçons sur les jours disponibles.',
      cta: planningCreated && !editingPlanning ? 'Modifier mes séances' : 'Créer mon planning',
      action: () => {
        if (planningCreated && !editingPlanning) {
          setEditingPlanning(true);
        } else {
          setPlanningCreated(true);
          setEditingPlanning(false);
        }
      },
    };
  };

  const toolMeta = renderCentralToolCardContent();

  return (
    <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-3 md:grid-rows-[1.22fr_1fr]">
      {/* Grand Panneau Panoramique Supérieur — RÉVISER */}
      <section
        aria-label="RÉVISER"
        className="sg-card-l2 flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:col-span-3 md:h-full md:min-h-0 md:p-5"
      >
        {/* Top bar: RÉVISER label + 4 tabs (Quiz · Flashcards · Résumé · Planning) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-wider text-[var(--accent)]">
            RÉVISER · {experience.classLevel}
            {experience.serie ? ` (${experience.serie})` : ''}
          </span>

          <div className="flex flex-wrap items-center gap-[7px]" role="tablist" aria-label="Outils de révision">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <div key={tab} className="flex flex-col items-center gap-[3px]">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tab)}
                    className={`sg-focus-ring h-[25px] rounded-full px-3.5 text-[11.5px] font-semibold whitespace-nowrap transition-[transform,box-shadow] duration-150 ${
                      isSelected ? 'sg-btn-primary text-white' : 'sg-nav-idle text-[#1C1E22]'
                    }`}
                  >
                    {tab}
                  </button>
                  <span
                    aria-hidden="true"
                    className={`h-[2.5px] w-[70%] rounded-full ${
                      isSelected ? 'sg-accent-bar' : 'bg-transparent'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Header + Interactive Tool Workspace */}
        <div className="my-2 flex flex-1 flex-col justify-center gap-3 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="text-[19px] font-bold tracking-tight text-[#121417] md:text-[21px]">
                Révise à ta façon
              </h1>
              <p className="mt-0.5 text-[12.5px] text-[#4B4E54]">
                Choisis un outil pour retenir l’essentiel et revenir sur les notions difficiles.
              </p>
            </div>
            {activeLesson && (
              <span className="text-[11.5px] font-semibold text-[var(--accent)]">
                {activeLesson.subject} · {activeLesson.title}
              </span>
            )}
          </div>

          {/* Interactive Tool Area */}
          {activeTab === 'Quiz' && activeQuizQ && (
            <div className="sg-glass-subtile rounded-[16px] p-3.5">
              {!quizDone ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--accent)]">
                    <span>Quiz de révision</span>
                    <span className="tabular-nums">
                      {quizIdx + 1} / {quizList.length}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-[#121417]">
                    {activeQuizQ.question}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {activeQuizQ.choices.map((c, idx) => {
                      const picked = quizPicked === idx;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setQuizStarted(true);
                            setQuizPicked(idx);
                            if (idx !== activeQuizQ.correctIndex) {
                              setQuizReviewCount((n) => n + 1);
                            }
                          }}
                          className={`sg-focus-ring rounded-[12px] border px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                            picked
                              ? idx === activeQuizQ.correctIndex
                                ? 'border-[#16A34A] bg-[#D9F3E4] text-[#096B3B]'
                                : 'border-[#D97706] bg-[#FDEACC] text-[#924A03]'
                              : 'border-white/75 bg-white/70 text-[#1C1E22] hover:border-[var(--accent-border)]'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {quizPicked !== null && (
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11.5px] text-[#36393F]">
                      <span>{activeQuizQ.explanation}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (quizIdx + 1 < quizList.length) {
                            setQuizIdx((i) => i + 1);
                            setQuizPicked(null);
                          } else {
                            setQuizDone(true);
                          }
                        }}
                        className="sg-focus-ring sg-btn-primary h-[26px] rounded-full px-3 text-[11px] font-semibold text-white whitespace-nowrap shrink-0"
                      >
                        Continuer
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-[#121417]">Quiz terminé</p>
                    <p className="text-[12px] text-[#4B4E54] tabular-nums">
                      {quizReviewCount} notion(s) marquée(s) à revoir.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizDone(false);
                      setQuizIdx(0);
                      setQuizPicked(null);
                    }}
                    className="sg-focus-ring sg-btn-primary h-[28px] rounded-full px-4 text-[11.5px] font-semibold text-white whitespace-nowrap"
                  >
                    Voir les notions à revoir
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Flashcards' && activeCard && (
            <div className="sg-glass-subtile rounded-[16px] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCardsStarted(true);
                    setCardFlipped((f) => !f);
                  }}
                  className="sg-focus-ring flex-1 rounded-[12px] border border-[var(--accent-border)]/45 bg-white/75 px-4 py-2.5 text-left transition-colors hover:bg-[var(--accent-soft)]"
                >
                  <div className="text-[11px] font-bold text-[var(--accent)]">
                    {cardFlipped ? 'Réponse' : 'Question — cliquer pour retourner'}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#121417]">
                    {cardFlipped ? activeCard.answer : activeCard.question}
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCardsStarted(true);
                      setCardsReviewed((c) => c + 1);
                      setCardIdx((i) => (i + 1) % flashcards.length);
                      setCardFlipped(false);
                    }}
                    className="sg-focus-ring sg-btn-primary h-[30px] rounded-full px-3.5 text-[11.5px] font-semibold text-white whitespace-nowrap"
                  >
                    Je savais
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardsStarted(true);
                      setCardsReviewed((c) => c + 1);
                      setCardIdx((i) => (i + 1) % flashcards.length);
                      setCardFlipped(false);
                    }}
                    className="sg-focus-ring sg-btn-secondary h-[30px] rounded-full px-3.5 text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
                  >
                    À revoir
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Résumé' && activeLesson && (
            <div className="sg-glass-subtile rounded-[16px] p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="max-w-2xl">
                  <div className="text-[12px] font-bold text-[#121417]">Résumé de la leçon</div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#36393F]">
                    {activeLesson.summary}
                  </p>
                  <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[#4B4E54]">
                    {activeLesson.aRetenir.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={onOpenFullCourse}
                  className="sg-focus-ring sg-btn-secondary h-[28px] rounded-full px-3.5 text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  Ouvrir le cours complet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Planning' && (
            <div className="sg-glass-subtile rounded-[16px] p-3.5">
              {!planningCreated || editingPlanning ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#4B4E54]">Matières</span>
                    <div className="flex flex-wrap gap-1">
                      {subjects.slice(0, 4).map((subj) => {
                        const checked = planSubjects.includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() =>
                              setPlanSubjects((prev) =>
                                prev.includes(subj)
                                  ? prev.length > 1
                                    ? prev.filter((s) => s !== subj)
                                    : prev
                                  : [...prev, subj],
                              )
                            }
                            className={`sg-focus-ring rounded-full px-2 py-0.5 text-[10.5px] font-semibold transition-[transform,box-shadow] duration-150 ${
                              checked ? 'sg-btn-primary text-white' : 'sg-nav-idle text-[#1C1E22]'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
                    <span>Jours disponibles</span>
                    <select
                      value={availableDays}
                      onChange={(e) => setAvailableDays(e.target.value)}
                      className="sg-focus-ring h-[30px] rounded-[10px] border border-white/80 bg-white/75 px-2 text-[12px] text-[#121417]"
                    >
                      <option value="3 jours">3 jours / semaine</option>
                      <option value="4 jours">4 jours / semaine</option>
                      <option value="6 jours">6 jours / semaine</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
                    <span>Temps par jour</span>
                    <select
                      value={timePerDay}
                      onChange={(e) => setTimePerDay(e.target.value)}
                      className="sg-focus-ring h-[30px] rounded-[10px] border border-white/80 bg-white/75 px-2 text-[12px] text-[#121417]"
                    >
                      <option value="30 min">30 min / jour</option>
                      <option value="45 min">45 min / jour</option>
                      <option value="1 h 30">1 h 30 / jour</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-[#0D8A4E]">Ton planning est prêt.</p>
                    <p className="text-[12px] text-[#4B4E54]">
                      {planSubjects.join(' · ')} — {availableDays}, {timePerDay} par séance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPlanning(true)}
                    className="sg-focus-ring text-[12px] font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                  >
                    Modifier mes séances
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Panneau Inférieur Gauche — Mes leçons */}
      <section
        aria-label="Mes leçons"
        className="sg-card-l1 flex min-h-[190px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold text-[#121417]">Mes leçons</h2>
            <span className="text-[11px] font-medium text-[#4B4E54] tabular-nums">
              {filteredLessons.length}
            </span>
          </div>

          <input
            type="text"
            value={lessonSearch}
            onChange={(e) => setLessonSearch(e.target.value)}
            placeholder="Chercher une leçon…"
            aria-label="Chercher une leçon"
            className="sg-focus-ring sg-glass-subtile h-[30px] w-full rounded-full px-3 text-[11.5px] text-[#121417] placeholder:text-[#666A72]"
          />
        </div>

        <div className="my-2 flex flex-col gap-[6px] overflow-y-auto" role="listbox" aria-label="Mes leçons">
          {filteredLessons.map((lesson) => {
            const isSelected = activeLesson && lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                role="option"
                aria-selected={Boolean(isSelected)}
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setQuizIdx(0);
                  setQuizPicked(null);
                  setQuizDone(false);
                  setCardIdx(0);
                  setCardFlipped(false);
                }}
                className={`sg-focus-ring flex h-[32px] w-full items-center gap-2 rounded-full px-2.5 text-left transition-colors ${
                  isSelected ? 'sg-selected-capsule' : 'hover:bg-white/60'
                }`}
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                    isSelected ? 'sg-halo-ring' : 'border border-white/80 bg-white/55'
                  }`}
                >
                  {isSelected && <span className="sg-halo-core h-[9px] w-[9px] rounded-full" />}
                </span>
                <span
                  className={`truncate text-[11.5px] font-semibold ${
                    isSelected ? 'text-[var(--accent)]' : 'text-[#1C1E22]'
                  }`}
                >
                  {lesson.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Carte Inférieure Centrale — Outil actif (Level 3 glowing amber) */}
      <section
        aria-label={toolMeta.title}
        className="sg-card-l3 flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[22px] md:h-full md:min-h-0"
      >
        <div className="p-4 pb-2">
          <h2 className="text-[13.5px] font-bold text-[#121417]">{toolMeta.title}</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#4B4E54]">{toolMeta.body}</p>
        </div>

        <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col justify-between gap-2.5 rounded-[18px] p-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#36393F]">
            <span>Outil actif : {activeTab}</span>
            {activeTab === 'Résumé' && (
              <button
                type="button"
                onClick={onOpenFullCourse}
                className="sg-focus-ring font-semibold text-[var(--accent)] hover:underline"
              >
                Ouvrir le cours complet
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toolMeta.action}
            className="sg-focus-ring sg-btn-primary h-[34px] w-full rounded-full px-3 text-[12px] font-semibold text-white whitespace-nowrap transition-[transform,box-shadow] duration-150"
          >
            {toolMeta.cta}
          </button>
        </div>
      </section>

      {/* Panneau Inférieur Droit — Ma séance */}
      <section
        aria-label="Ma séance"
        className="sg-card-l1 flex min-h-[190px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
      >
        <div>
          <h2 className="text-[13px] font-bold text-[#121417]">Ma séance</h2>
          <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
            {activeTab === 'Flashcards'
              ? `${cardsReviewed} carte(s) révisée(s) · ~15 min`
              : activeTab === 'Planning'
                ? `${planSubjects.length} matière(s) · ${timePerDay}`
                : `${quizList.length} question(s) · ~15 min`}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`sg-focus-ring rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-[transform,box-shadow] duration-150 ${
                activeTab === t ? 'sg-btn-primary text-white' : 'sg-nav-idle text-[#1C1E22]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4B4E54] tabular-nums">
            <span>Avancement séance</span>
            <span className="font-mono font-semibold text-[var(--accent)]">{sessionProgress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Avancement de la séance de révision"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sessionProgress}
            className="h-[4px] w-full overflow-hidden rounded-full bg-white/65"
          >
            <div
              className="sg-accent-bar h-full rounded-full transition-[width] duration-200"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
