import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ClassExperience } from '../../data/studyData';
import {
  generateTutorFlashcards,
  generateTutorQuiz,
} from '../../services/tutorClient';
import { TileRect } from '../../utils/bentoLayout';
import {
  GeneratedFlashcard,
  GeneratedQuizQuestion,
  getSubjectTutor,
  NoveltyAnalysisResult,
} from '../../utils/tutorAgent';
import { BentoTileCanvas, BuiltInTileSlot } from '../BentoTileCanvas';

export type RevisionTab = 'Quiz' | 'Flashcards' | 'Résumé' | 'Planning';

interface RevisionsScreenProps {
  experience: ClassExperience;
  tiles: TileRect[];
  baseHeightPx?: number;
  locked?: boolean;
  requestedTab?: RevisionTab | null;
  onClearRequestedTab?: () => void;
  onSubjectChange?: (subject: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onChangeTiles: (next: TileRect[]) => void;
  onBringToFront: (tileId: string) => void;
  onOpenFullCourse: () => void;
}

const TABS: RevisionTab[] = ['Quiz', 'Flashcards', 'Résumé', 'Planning'];

export const RevisionsScreen: React.FC<RevisionsScreenProps> = ({
  experience,
  tiles,
  baseHeightPx,
  locked = false,
  requestedTab = null,
  onClearRequestedTab,
  onSubjectChange,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
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

  // Tutor-generated quiz & flashcards state
  const [aiQuiz, setAiQuiz] = useState<{
    loading: boolean;
    error?: string;
    questions: GeneratedQuizQuestion[];
    idx: number;
    pickedChoice: number | null;
    score: number;
    done: boolean;
  }>({
    loading: false,
    questions: [],
    idx: 0,
    pickedChoice: null,
    score: 0,
    done: false,
  });

  const [aiFlashcards, setAiFlashcards] = useState<{
    loading: boolean;
    error?: string;
    cards: GeneratedFlashcard[];
  }>({
    loading: false,
    cards: [],
  });

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
      onClearRequestedTab?.();
    }
  }, [requestedTab, onClearRequestedTab]);

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
    setAiQuiz({
      loading: false,
      questions: [],
      idx: 0,
      pickedChoice: null,
      score: 0,
      done: false,
    });
    setAiFlashcards({ loading: false, cards: [] });
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
  const lessonTutor = useMemo(
    () => getSubjectTutor(activeLesson?.subject ?? subjects[0]),
    [activeLesson?.subject, subjects],
  );

  useEffect(() => {
    onSubjectChange?.(activeLesson?.subject ?? subjects[0] ?? 'Français');
  }, [activeLesson?.subject, subjects, onSubjectChange]);

  const notionsList = activeLesson?.notions ?? [];
  const activeNotion = notionsList[quizIdx % Math.max(1, notionsList.length)];
  const baseFlashcards = activeLesson?.flashcards ?? [];
  const flashcards: { question: string; answer: string; tip?: string }[] =
    aiFlashcards.cards.length > 0 ? aiFlashcards.cards : baseFlashcards;
  const activeCard = flashcards[cardIdx % Math.max(1, flashcards.length)];

  const handleGenerateAiQuiz = async () => {
    if (!activeLesson || aiQuiz.loading) return;
    setActiveTab('Quiz');
    setAiQuiz((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const questions = await generateTutorQuiz({
        tutorName: lessonTutor.name,
        subject: activeLesson.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: activeLesson.title,
        objectif: activeLesson.objectif,
        notions: activeLesson.notions,
        count: 4,
      });
      setAiQuiz({
        loading: false,
        questions,
        idx: 0,
        pickedChoice: null,
        score: 0,
        done: false,
      });
    } catch (err) {
      setAiQuiz((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Génération du quiz indisponible.',
      }));
    }
  };

  const handleGenerateAiFlashcards = async () => {
    if (!activeLesson || aiFlashcards.loading) return;
    setActiveTab('Flashcards');
    setAiFlashcards((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const cards = await generateTutorFlashcards({
        tutorName: lessonTutor.name,
        subject: activeLesson.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: activeLesson.title,
        objectif: activeLesson.objectif,
        notions: activeLesson.notions,
        count: 5,
      });
      setAiFlashcards({ loading: false, cards });
      setCardIdx(0);
      setCardFlipped(false);
      setCardsStarted(true);
    } catch (err) {
      setAiFlashcards((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : 'Génération des flashcards indisponible.',
      }));
    }
  };

  const sessionProgress = useMemo(() => {
    if (activeTab === 'Quiz') {
      if (quizDone) return 100;
      if (!quizStarted) return 20;
      return Math.round(((quizIdx + 1) / Math.max(1, notionsList.length)) * 100);
    }
    if (activeTab === 'Flashcards') {
      if (!cardsStarted) return 20;
      return Math.min(100, Math.round(((cardsReviewed + 1) / Math.max(2, flashcards.length)) * 100));
    }
    if (activeTab === 'Planning') {
      return planningCreated ? 100 : 35;
    }
    return 65;
  }, [activeTab, quizDone, quizStarted, quizIdx, notionsList.length, cardsStarted, cardsReviewed, flashcards.length, planningCreated]);

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

  const slots: BuiltInTileSlot[] = [
    {
      id: 'rev-main',
      render: () => (
        <section
          aria-label="RÉVISIONS"
          className="sg-card-l2 flex h-full min-h-[240px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-5 md:min-h-0"
        >
          {/* Top bar: RÉVISIONS label + 4 tabs (Quiz · Flashcards · Résumé · Planning) */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
              RÉVISIONS · {experience.classLevel}
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
          <div className="my-2 flex min-h-0 flex-1 flex-col justify-start gap-2.5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h1 className="text-[19px] font-bold leading-snug text-[#121417] md:text-[21px]">
                  Révise à ta façon
                </h1>
                {aiQuiz.questions.length === 0 && (
                  <p className="mt-0.5 text-[12.5px] text-[#4B4E54]">
                    Choisis un outil pour retenir l’essentiel et revenir sur les notions difficiles.
                  </p>
                )}
              </div>
              {activeLesson && (
                <span className="text-[11.5px] font-semibold text-[var(--accent)]">
                  {activeLesson.subject} · {activeLesson.title}
                </span>
              )}
            </div>

            {/* Interactive Tool Area */}
            {activeTab === 'Quiz' && activeNotion && (
              <div className="sg-glass-subtile rounded-[16px] p-3.5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-[var(--accent)]">
                    {aiQuiz.questions.length > 0
                      ? `Quiz généré par ${lessonTutor.name}`
                      : 'Auto-évaluation du programme'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {aiQuiz.questions.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setAiQuiz({
                            loading: false,
                            questions: [],
                            idx: 0,
                            pickedChoice: null,
                            score: 0,
                            done: false,
                          })
                        }
                        className="sg-focus-ring text-[11px] font-semibold text-[#4B4E54] hover:underline"
                      >
                        Auto-évaluation
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={aiQuiz.loading}
                      onClick={() => void handleGenerateAiQuiz()}
                      className="sg-focus-ring sg-btn-secondary flex h-[26px] items-center gap-1 rounded-full px-3 text-[11px] font-semibold text-[var(--accent)] whitespace-nowrap"
                    >
                      {aiQuiz.loading ? (
                        <Loader2 className="h-[11.5px] w-[11.5px] animate-spin" />
                      ) : (
                        <Sparkles className="h-[11.5px] w-[11.5px]" />
                      )}
                      <span>Nouveau quiz avec {lessonTutor.name}</span>
                    </button>
                  </div>
                </div>

                {aiQuiz.error && (
                  <p className="mb-2 text-[11px] font-medium text-[#991B1B]">{aiQuiz.error}</p>
                )}

                {aiQuiz.questions.length > 0 ? (
                  !aiQuiz.done ? (
                    (() => {
                      const q = aiQuiz.questions[aiQuiz.idx] ?? aiQuiz.questions[0];
                      return (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] font-medium text-[#4B4E54] tabular-nums">
                            <span>
                              Question {aiQuiz.idx + 1} / {aiQuiz.questions.length}
                            </span>
                            <span>Score : {aiQuiz.score}</span>
                          </div>
                          <p className="text-[13px] font-semibold text-[#121417]">{q.question}</p>
                          <div className="grid grid-cols-1 gap-1.5 @sm:grid-cols-2">
                            {q.choices.map((choice, cIdx) => {
                              const picked = aiQuiz.pickedChoice === cIdx;
                              const revealed = aiQuiz.pickedChoice !== null;
                              const isRight = cIdx === q.correctIndex;
                              return (
                                <button
                                  key={`${cIdx}-${choice}`}
                                  type="button"
                                  disabled={revealed}
                                  onClick={() =>
                                    setAiQuiz((prev) => ({
                                      ...prev,
                                      pickedChoice: cIdx,
                                      score: cIdx === q.correctIndex ? prev.score + 1 : prev.score,
                                    }))
                                  }
                                  className={`sg-focus-ring rounded-[12px] border px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                                    revealed
                                      ? isRight
                                        ? 'border-[#16A34A] bg-[#D9F3E4] text-[#096B3B]'
                                        : picked
                                          ? 'border-[#DC2626] bg-[#FEE2E2] text-[#991B1B]'
                                          : 'border-white/75 bg-white/60 text-[#4B4E54]'
                                      : 'border-white/75 bg-white/70 text-[#1C1E22] hover:border-[var(--accent-border)]'
                                  }`}
                                >
                                  {choice}
                                </button>
                              );
                            })}
                          </div>
                          {aiQuiz.pickedChoice !== null && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11.5px] text-[#36393F]">
                              <span className="min-w-0 flex-1">{q.explanation}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAiQuiz((prev) =>
                                    prev.idx + 1 < prev.questions.length
                                      ? { ...prev, idx: prev.idx + 1, pickedChoice: null }
                                      : { ...prev, done: true },
                                  )
                                }
                                className="sg-focus-ring sg-btn-primary h-[26px] shrink-0 rounded-full px-3 text-[11px] font-semibold text-white whitespace-nowrap"
                              >
                                {aiQuiz.idx + 1 < aiQuiz.questions.length ? 'Suivante' : 'Voir le score'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-[#121417]">
                          Score final avec {lessonTutor.name} : {aiQuiz.score} / {aiQuiz.questions.length}
                        </p>
                        <p className="text-[11.5px] text-[#4B4E54]">
                          Tu peux relancer ce quiz ou demander un nouveau jeu de questions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleGenerateAiQuiz()}
                        className="sg-focus-ring sg-btn-primary h-[28px] rounded-full px-4 text-[11.5px] font-semibold text-white whitespace-nowrap"
                      >
                        Nouvelle série
                      </button>
                    </div>
                  )
                ) : !quizDone ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#4B4E54] tabular-nums">
                      <span>Point du programme</span>
                      <span>
                        {quizIdx + 1} / {notionsList.length}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-[#121417]">
                      Maîtrises-tu cette notion : « {activeNotion} » ?
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 @sm:grid-cols-2">
                      {['Je maîtrise cette notion', 'À revoir dans le cours'].map((label, idx) => {
                        const picked = quizPicked === idx;
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              setQuizStarted(true);
                              setQuizPicked(idx);
                              if (idx === 1) {
                                setQuizReviewCount((n) => n + 1);
                              }
                            }}
                            className={`sg-focus-ring rounded-[12px] border px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                              picked
                                ? idx === 0
                                  ? 'border-[#16A34A] bg-[#D9F3E4] text-[#096B3B]'
                                  : 'border-[#D97706] bg-[#FDEACC] text-[#924A03]'
                                : 'border-white/75 bg-white/70 text-[#1C1E22] hover:border-[var(--accent-border)]'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {quizPicked !== null && activeLesson && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11.5px] text-[#36393F]">
                        <span>Objectif associé : {activeLesson.objectif}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (quizIdx + 1 < notionsList.length) {
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
                      <p className="text-[13px] font-bold text-[#121417]">Évaluation terminée</p>
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
                      Revoir les notions
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Flashcards' && activeCard && (
              <div className="sg-glass-subtile flex flex-col gap-2 rounded-[16px] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[var(--accent)] tabular-nums">
                    {aiFlashcards.cards.length > 0
                      ? `Cartes générées par ${lessonTutor.name} (${(cardIdx % flashcards.length) + 1}/${flashcards.length})`
                      : `Carte ${(cardIdx % flashcards.length) + 1}/${flashcards.length}`}
                  </span>
                  <button
                    type="button"
                    disabled={aiFlashcards.loading}
                    onClick={() => void handleGenerateAiFlashcards()}
                    className="sg-focus-ring sg-btn-secondary flex h-[26px] items-center gap-1 rounded-full px-3 text-[11px] font-semibold text-[var(--accent)] whitespace-nowrap"
                  >
                    {aiFlashcards.loading ? (
                      <Loader2 className="h-[11.5px] w-[11.5px] animate-spin" />
                    ) : (
                      <Sparkles className="h-[11.5px] w-[11.5px]" />
                    )}
                    <span>Générer cartes avec {lessonTutor.name}</span>
                  </button>
                </div>

                {aiFlashcards.error && (
                  <p className="text-[11px] font-medium text-[#991B1B]">{aiFlashcards.error}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCardsStarted(true);
                      setCardFlipped((f) => !f);
                    }}
                    className="sg-focus-ring min-w-0 flex-1 rounded-[12px] border border-[var(--accent-border)]/45 bg-white/75 px-4 py-2.5 text-left transition-colors hover:bg-[var(--accent-soft)]"
                  >
                    <div className="text-[11px] font-bold text-[var(--accent)]">
                      {cardFlipped ? 'Réponse' : 'Question — cliquer pour retourner'}
                    </div>
                    <div className="mt-0.5 text-[13px] font-semibold text-[#121417]">
                      {cardFlipped ? activeCard.answer : activeCard.question}
                    </div>
                    {cardFlipped && activeCard.tip && (
                      <div className="mt-1 text-[11px] font-medium text-[#4B4E54]">
                        Astuce de {lessonTutor.name} : {activeCard.tip}
                      </div>
                    )}
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
                      {activeLesson.notions.map((pt, i) => (
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
                  <div className="grid grid-cols-1 gap-2.5 @md:grid-cols-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-[11px] font-semibold text-[#4B4E54]">Matières</span>
                      <div className="flex max-h-[68px] flex-wrap gap-1 overflow-y-auto pr-1">
                        {subjects.map((subj) => {
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

                    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
                      <span>Jours disponibles</span>
                      <select
                        value={availableDays}
                        onChange={(e) => setAvailableDays(e.target.value)}
                        className="sg-focus-ring h-[30px] w-full min-w-0 rounded-[10px] border border-white/80 bg-white/75 px-2 text-[12px] text-[#121417]"
                      >
                        <option value="3 jours">3 jours / semaine</option>
                        <option value="4 jours">4 jours / semaine</option>
                        <option value="6 jours">6 jours / semaine</option>
                      </select>
                    </label>

                    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
                      <span>Temps par jour</span>
                      <select
                        value={timePerDay}
                        onChange={(e) => setTimePerDay(e.target.value)}
                        className="sg-focus-ring h-[30px] w-full min-w-0 rounded-[10px] border border-white/80 bg-white/75 px-2 text-[12px] text-[#121417]"
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
      ),
    },
    {
      id: 'rev-lessons',
      render: () => (
        <section
          aria-label="Mes leçons"
          className="sg-card-l1 flex h-full min-h-[175px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 md:min-h-0"
        >
          <div className="flex shrink-0 flex-col gap-1.5">
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
              className="sg-focus-ring sg-glass-subtile h-[28px] w-full rounded-full px-3 text-[11.5px] text-[#121417] placeholder:text-[#666A72]"
            />
          </div>

          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto pr-1" role="listbox" aria-label="Mes leçons">
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
                  className={`sg-focus-ring flex h-[30px] shrink-0 w-full items-center gap-2 rounded-full px-2.5 text-left transition-colors ${
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
      ),
    },
    {
      id: 'rev-tool',
      render: () => (
        <section
          aria-label={toolMeta.title}
          className="sg-card-l3 flex h-full min-h-[175px] w-full min-w-0 flex-col justify-between gap-1 overflow-y-auto overflow-x-hidden rounded-[22px] md:min-h-0"
        >
          <div className="p-3.5 pb-2">
            <h2 className="text-[13px] font-bold text-[#121417]">{toolMeta.title}</h2>
            <p className="mt-1 text-[11.5px] leading-snug text-[#4B4E54]">{toolMeta.body}</p>
          </div>

          <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col justify-between gap-2 rounded-[18px] p-3">
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
              className="sg-focus-ring sg-btn-primary h-[32px] w-full rounded-full px-3 text-[12px] font-semibold text-white whitespace-nowrap transition-[transform,box-shadow] duration-150"
            >
              {toolMeta.cta}
            </button>
          </div>
        </section>
      ),
    },
    {
      id: 'rev-session',
      render: () => (
        <section
          aria-label="Ma séance"
          className="sg-card-l1 flex h-full min-h-[175px] w-full min-w-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Ma séance</h2>
            <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
              {activeTab === 'Flashcards'
                ? `${cardsReviewed} carte(s) révisée(s) · ~15 min`
                : activeTab === 'Planning'
                  ? `${planSubjects.length} matière(s) · ${timePerDay}`
                  : `${notionsList.length} notion(s) · ~15 min`}
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
      ),
    },
  ];

  return (
    <BentoTileCanvas
      tiles={tiles}
      slots={slots}
      baseHeightPx={baseHeightPx}
      locked={locked}
      tutorName={lessonTutor.name}
      onAnalyzeTile={onAnalyzeTile}
      onChangeTiles={onChangeTiles}
      onBringToFront={onBringToFront}
    />
  );
};
