import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import {
  CustomVerbatimCourse,
  formatCourseDocumentAsPlainText,
  getPdfCourseDocument,
} from '../../data/pdfCourses';
import {
  ClassExperience,
  DifficultyLevel,
  ExerciseCategory,
} from '../../data/studyData';
import {
  generateTutorExercise,
  requestExerciseCorrection,
} from '../../services/tutorClient';
import { TileRect } from '../../utils/bentoLayout';
import {
  ExerciseCorrectionResult,
  GeneratedExercise,
  getSubjectTutor,
  NoveltyAnalysisResult,
} from '../../utils/tutorAgent';
import { BentoTileCanvas, BuiltInTileSlot } from '../BentoTileCanvas';

export interface ExerciseFilterCommand {
  category?: ExerciseCategory;
  difficulty?: DifficultyLevel;
  subject?: string;
  nonce: number;
}

interface ExercicesScreenProps {
  experience: ClassExperience;
  initialSubject?: string;
  customCourses?: CustomVerbatimCourse[];
  externalFilter?: ExerciseFilterCommand | null;
  pendingAiTrigger?: 'exercise' | null;
  onClearPendingAiTrigger?: () => void;
  tiles: TileRect[];
  baseHeightPx?: number;
  locked?: boolean;
  openTileId?: string | null;
  onSelectOpenTileId?: (tileId: string | null) => void;
  onOpenTilePage?: (tile: TileRect) => void;
  onOpenTutor?: () => void;
  onSubjectChange?: (subject: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onChangeTiles: (next: TileRect[]) => void;
  onBringToFront: (tileId: string) => void;
  onGoToCours: () => void;
}

const CATEGORIES: ExerciseCategory[] = [
  'Exercices par leçon',
  'Devoirs',
  'Sujets d’examen',
  'Corrigés',
];

const DIFFICULTIES: DifficultyLevel[] = ['Découverte', 'Entraînement', 'Défi'];

export const ExercicesScreen: React.FC<ExercicesScreenProps> = ({
  experience,
  initialSubject,
  customCourses = [],
  externalFilter = null,
  pendingAiTrigger = null,
  onClearPendingAiTrigger,
  tiles,
  baseHeightPx,
  locked = false,
  openTileId = null,
  onSelectOpenTileId,
  onOpenTilePage,
  onOpenTutor,
  onSubjectChange,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
  onGoToCours,
}) => {
  const { subjects, exercises, lessons } = experience;

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('Exercices par leçon');
  const [subjectFilter, setSubjectFilter] = useState<string>('Toutes');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Entraînement');

  const [moduleIndex, setModuleIndex] = useState(0);
  const [masteredPoints, setMasteredPoints] = useState<Record<string, boolean>>({});
  const [validatedModules, setValidatedModules] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [showCompetenceHint, setShowCompetenceHint] = useState(true);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [correctionState, setCorrectionState] = useState<{
    loading: boolean;
    error?: string;
    result?: ExerciseCorrectionResult;
  }>({ loading: false });
  const [generatedExercise, setGeneratedExercise] = useState<{
    loading: boolean;
    error?: string;
    data?: GeneratedExercise;
    showHints: boolean;
    showSolution: boolean;
  }>({ loading: false, showHints: false, showSolution: false });

  useEffect(() => {
    setSubjectFilter(
      initialSubject && subjects.includes(initialSubject) ? initialSubject : 'Toutes',
    );
    setModuleIndex(0);
    setMasteredPoints({});
    setValidatedModules({});
    setFinished(false);
    setStudentAnswer('');
    setCorrectionState({ loading: false });
    setGeneratedExercise({ loading: false, showHints: false, showSolution: false });
  }, [experience.classLevel, experience.serie, initialSubject, subjects]);

  useEffect(() => {
    if (!externalFilter) return;
    if (externalFilter.category) setSelectedCategory(externalFilter.category);
    if (externalFilter.difficulty) setDifficulty(externalFilter.difficulty);
    if (externalFilter.subject) {
      setSubjectFilter(
        subjects.includes(externalFilter.subject) ? externalFilter.subject : 'Toutes',
      );
    }
    setModuleIndex(0);
    setFinished(false);
    setCorrectionState({ loading: false });
  }, [externalFilter, subjects]);

  const modules = useMemo(() => {
    const bySubject =
      subjectFilter === 'Toutes'
        ? exercises
        : exercises.filter((m) => m.subject === subjectFilter);
    const exact = bySubject.filter((m) => m.category === selectedCategory);
    if (exact.length > 0) return exact;
    if (bySubject.length > 0) return bySubject;
    const byCat = exercises.filter((m) => m.category === selectedCategory);
    return byCat.length > 0 ? byCat : exercises;
  }, [exercises, selectedCategory, subjectFilter]);

  const activeModule = modules[moduleIndex % Math.max(1, modules.length)] ?? exercises[0];
  const currentSubject = subjectFilter === 'Toutes' ? (activeModule?.subject ?? 'Toutes') : subjectFilter;
  const tutor = useMemo(() => getSubjectTutor(currentSubject), [currentSubject]);

  useEffect(() => {
    onSubjectChange?.(currentSubject);
  }, [currentSubject, onSubjectChange]);

  const totalCount = modules.length;
  const validatedCount = modules.filter((m) => validatedModules[m.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((validatedCount / totalCount) * 100) : 0;

  const activeCheckpoints = activeModule?.checkpoints ?? [];
  const activeMasteredCount = activeCheckpoints.filter(
    (_, idx) => masteredPoints[`${activeModule?.id}-${idx}`],
  ).length;

  const totalCheckpointsCount = modules.reduce((sum, m) => sum + m.checkpoints.length, 0);
  const totalMasteredPointsCount = modules.reduce(
    (sum, m) =>
      sum + m.checkpoints.filter((_, idx) => masteredPoints[`${m.id}-${idx}`]).length,
    0,
  );

  const resetSession = () => {
    setModuleIndex(0);
    setMasteredPoints({});
    setValidatedModules({});
    setFinished(false);
    setCorrectionState({ loading: false });
    setGeneratedExercise({ loading: false, showHints: false, showSolution: false });
  };

  const toggleCheckpoint = (moduleId: string, idx: number) => {
    const key = `${moduleId}-${idx}`;
    setMasteredPoints((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleValidateModule = () => {
    if (!activeModule) return;
    setValidatedModules((prev) => ({
      ...prev,
      [activeModule.id]: true,
    }));
  };

  const handleNextModule = () => {
    setCorrectionState({ loading: false });
    setGeneratedExercise({ loading: false, showHints: false, showSolution: false });
    if (moduleIndex + 1 < totalCount) {
      setModuleIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const resolveCourseTextForSubject = useCallback(
    (subject: string, fallbackTitle: string, fallbackCompetence: string) => {
      const customMatch = customCourses.find(
        (c) =>
          c.classLevel === experience.classLevel &&
          (c.serie ?? null) === (experience.serie ?? null) &&
          c.subject === subject,
      );
      if (customMatch) {
        return `${customMatch.title}\n\n${customMatch.content}`;
      }
      const lessonMatch = lessons.find((l) => l.subject === subject);
      const doc = getPdfCourseDocument({
        classLevel: experience.classLevel,
        serie: experience.serie,
        subject,
        fallbackTitle,
        fallbackObjectif: lessonMatch?.objectif ?? fallbackCompetence,
        fallbackNotions: lessonMatch?.notions ?? [],
      });
      return formatCourseDocumentAsPlainText(doc);
    },
    [customCourses, experience.classLevel, experience.serie, lessons],
  );

  const handleGenerateAiExercise = useCallback(async () => {
    if (!activeModule) return;
    const moduleTutor = getSubjectTutor(activeModule.subject);
    setFinished(false);
    setCorrectionState({ loading: false });
    setGeneratedExercise({ loading: true, showHints: false, showSolution: false });
    try {
      const courseContent = resolveCourseTextForSubject(
        activeModule.subject,
        activeModule.lessonTitle,
        activeModule.competence,
      );
      const data = await generateTutorExercise({
        tutorName: moduleTutor.name,
        subject: activeModule.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: activeModule.lessonTitle,
        competence: activeModule.competence,
        category: selectedCategory,
        difficulty,
        courseContent,
      });
      setGeneratedExercise({
        loading: false,
        data,
        showHints: false,
        showSolution: false,
      });
    } catch (err) {
      setGeneratedExercise({
        loading: false,
        error: err instanceof Error ? err.message : 'Exercice indisponible pour le moment.',
        showHints: false,
        showSolution: false,
      });
    }
  }, [
    activeModule,
    difficulty,
    experience.classLevel,
    experience.serie,
    resolveCourseTextForSubject,
    selectedCategory,
  ]);

  useEffect(() => {
    if (pendingAiTrigger === 'exercise') {
      onClearPendingAiTrigger?.();
      void handleGenerateAiExercise();
    }
  }, [pendingAiTrigger, onClearPendingAiTrigger, handleGenerateAiExercise]);

  const handleRequestCorrection = async (requestType: 'hint' | 'correct') => {
    if (!activeModule || correctionState.loading) return;
    const moduleTutor = getSubjectTutor(activeModule.subject);
    setCorrectionState({ loading: true });
    try {
      const result = await requestExerciseCorrection({
        tutorName: moduleTutor.name,
        subject: activeModule.subject,
        classLevel: experience.classLevel,
        serie: experience.serie,
        lessonTitle: activeModule.lessonTitle,
        competence: activeModule.competence,
        checkpoints: activeModule.checkpoints,
        difficulty,
        exercisePrompt: generatedExercise.data?.prompt,
        studentAnswer: studentAnswer.trim(),
        requestType,
      });
      setCorrectionState({ loading: false, result });
    } catch (err) {
      setCorrectionState({
        loading: false,
        error: err instanceof Error ? err.message : 'Correction indisponible.',
      });
    }
  };

  const slots: BuiltInTileSlot[] = [
    {
      id: 'ex-filters',
      render: () => (
        <section
          aria-label="Choisir un entraînement"
          className="sg-card-l1 flex h-full min-h-[240px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @sm:p-4 md:min-h-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13.5px] font-bold text-[#121417]">Choisir un entraînement</h2>
              <span className="text-[11px] font-semibold text-[var(--accent)]">
                {experience.classLevel}
                {experience.serie ? ` (${experience.serie})` : ''}
              </span>
            </div>

            {/* Matière filter (scoped strictly to current class) */}
            <label className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
              <span>Matière</span>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  resetSession();
                }}
                className="sg-focus-ring sg-glass-subtile h-[32px] w-full min-w-0 max-w-full rounded-[10px] px-2.5 text-[11.5px] font-medium text-[#121417]"
              >
                <option value="Toutes">Toutes les matières</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div className="text-[11px] text-[#4B4E54]">
              <span className="font-semibold text-[#121417]">Thème :</span>{' '}
              {activeModule?.lessonTitle}
            </div>

            {/* Niveau filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-[#4B4E54]">Niveau</span>
              <div className="flex flex-wrap gap-1">
                {DIFFICULTIES.map((lvl) => {
                  const active = difficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`sg-focus-ring rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-[transform,box-shadow] duration-150 ${
                        active ? 'sg-btn-primary text-white' : 'sg-nav-idle text-[#1C1E22]'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 rows: Exercices par leçon · Devoirs · Sujets d’examen · Corrigés */}
            <div className="flex flex-col gap-[7px]" role="listbox" aria-label="Types d’entraînement">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedCategory(category);
                      resetSession();
                    }}
                    className={`sg-focus-ring flex h-[36px] w-full items-center gap-2.5 rounded-full px-2.5 text-left transition-colors duration-150 ${
                      isSelected ? 'sg-selected-capsule' : 'hover:bg-white/60'
                    }`}
                  >
                    <span
                      className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full ${
                        isSelected ? 'sg-halo-ring' : 'border border-white/80 bg-white/55'
                      }`}
                    >
                      {isSelected && <span className="sg-halo-core h-[10px] w-[10px] rounded-full" />}
                    </span>
                    <span
                      className={`truncate text-[12px] font-semibold ${
                        isSelected ? 'text-[var(--accent)]' : 'text-[#1C1E22]'
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={resetSession}
            className="sg-focus-ring sg-btn-secondary mt-3 h-[32px] w-full shrink-0 rounded-full text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
          >
            Recommencer
          </button>
        </section>
      ),
    },
    {
      id: 'ex-session',
      render: () => (
        <section
          aria-label="Mon entraînement"
          className="sg-card-l3 flex h-full min-h-[145px] w-full min-w-0 flex-col justify-between gap-1 overflow-y-auto overflow-x-hidden rounded-[22px] md:min-h-0"
        >
          <div className="px-4 pt-3.5 pb-1.5">
            <h2 className="text-[13px] font-bold text-[#121417]">Mon entraînement</h2>
            <p className="mt-0.5 text-[12px] font-semibold text-[var(--accent)] tabular-nums">
              Thème {Math.min(moduleIndex + 1, totalCount)} sur {totalCount}
            </p>
          </div>

          <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col justify-between gap-2 rounded-[18px] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#36393F]">Repères du programme</span>
              <button
                type="button"
                role="switch"
                aria-checked={showCompetenceHint}
                aria-label="Afficher les repères du programme"
                onClick={() => setShowCompetenceHint((v) => !v)}
                className={`sg-focus-ring flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-150 ${
                  showCompetenceHint
                    ? 'sg-accent-switch'
                    : 'border border-white/70 bg-[#B6BAC2]'
                }`}
              >
                <span
                  className={`h-[12px] w-[12px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                    showCompetenceHint ? 'translate-x-[14px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFinished(true)}
              className="sg-focus-ring sg-btn-primary h-[32px] w-full rounded-full px-3 text-[12px] font-semibold text-white whitespace-nowrap"
            >
              Terminer l’entraînement
            </button>
          </div>
        </section>
      ),
    },
    {
      id: 'ex-progress',
      render: () => (
        <section
          aria-label="Progression de l’entraînement"
          className="sg-card-l1 flex h-full min-h-[145px] w-full min-w-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 @sm:p-4 md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Progression</h2>
            <p className="mt-1 text-[12px] leading-snug text-[#4B4E54]">
              Coche chaque point du programme maîtrisé avant de passer au thème suivant.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11.5px] font-medium text-[#4B4E54] tabular-nums">
              <span>
                {validatedCount} thème(s) validé(s) sur {totalCount}
              </span>
              <span className="font-mono font-semibold text-[var(--accent)]">
                {progressPercent}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Thèmes validés"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="h-[4px] w-full overflow-hidden rounded-full bg-white/65"
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
      id: 'ex-main',
      render: () => (
        <section
          aria-label="EXERCICES & EXAMENS"
          className="sg-card-l2 flex h-full min-h-[240px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-5 md:min-h-0"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
              EXERCICES & EXAMENS · {experience.classLevel}
              {experience.serie ? ` (${experience.serie})` : ''}
            </span>
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">
              {selectedCategory} · {difficulty}
            </span>
          </div>

          {!finished && activeModule ? (
            <>
              <div className="my-2 flex min-h-0 flex-1 flex-col justify-start gap-2 overflow-y-auto pr-1">
                <div>
                  <h1 className="text-[17px] font-bold leading-snug text-[#121417]">
                    {activeModule.subject} — {activeModule.lessonTitle}
                  </h1>
                  {showCompetenceHint && (
                    <p className="mt-0.5 text-[12px] leading-snug text-[#4B4E54]">
                      <span className="font-semibold text-[var(--accent)]">Compétence visée :</span>{' '}
                      {activeModule.competence}
                    </p>
                  )}
                </div>

                <div className="sg-glass-subtile rounded-[16px] p-3">
                  <div className="flex items-center justify-between gap-2 text-[11.5px] font-bold text-[var(--accent)]">
                    <span>Points d’entraînement du programme</span>
                    <span className="tabular-nums">
                      {activeMasteredCount}/{activeCheckpoints.length} maîtrisé(s)
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {activeCheckpoints.map((checkpoint, idx) => {
                      const checked = Boolean(masteredPoints[`${activeModule.id}-${idx}`]);
                      return (
                        <button
                          key={checkpoint}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleCheckpoint(activeModule.id, idx)}
                          className={`sg-focus-ring flex items-center justify-between gap-3 rounded-[12px] border px-3 py-1.5 text-left text-[12px] leading-snug transition-colors ${
                            checked
                              ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                              : 'border-white/75 bg-white/70 text-[#1C1E22] hover:border-[var(--accent-border)]'
                          }`}
                        >
                          <span className="min-w-0 flex-1">{checkpoint}</span>
                          <span className="shrink-0 text-[10.5px] font-bold whitespace-nowrap">
                            {checked ? 'Maîtrisé' : 'À travailler'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                    <div className="mt-2.5 flex flex-col gap-2 border-t border-white/70 pt-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11.5px] font-bold text-[#121417]">
                        Aide &amp; correction avec {getSubjectTutor(activeModule.subject).name}
                      </span>
                      <button
                        type="button"
                        disabled={generatedExercise.loading}
                        onClick={() => void handleGenerateAiExercise()}
                        className="sg-focus-ring sg-btn-secondary flex h-[26px] items-center gap-1 rounded-full px-3 text-[10.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
                      >
                        {generatedExercise.loading ? (
                          <Loader2 className="h-[11px] w-[11px] animate-spin" />
                        ) : (
                          <Sparkles className="h-[11px] w-[11px]" />
                        )}
                        <span>
                          Nouvel exercice de {getSubjectTutor(activeModule.subject).name}
                        </span>
                      </button>
                    </div>

                    {generatedExercise.error && (
                      <p className="text-[11px] font-medium text-[#991B1B]">
                        {generatedExercise.error}
                      </p>
                    )}

                    {generatedExercise.data && (
                      <div className="rounded-[14px] border border-[var(--accent-border)]/40 bg-white/85 p-3 text-[12px] leading-snug text-[#121417]">
                        <div className="font-bold text-[var(--accent)]">
                          {generatedExercise.data.title}
                        </div>
                        <p className="mt-1 whitespace-pre-line text-[#1C1E22]">
                          {generatedExercise.data.prompt}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {generatedExercise.data.hints.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setGeneratedExercise((prev) => ({
                                  ...prev,
                                  showHints: !prev.showHints,
                                }))
                              }
                              className="sg-focus-ring text-[11px] font-semibold text-[var(--accent)] hover:underline"
                            >
                              {generatedExercise.showHints
                                ? 'Masquer les indices'
                                : 'Voir les indices'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setGeneratedExercise((prev) => ({
                                ...prev,
                                showSolution: !prev.showSolution,
                              }))
                            }
                            className="sg-focus-ring inline-flex items-center gap-1 text-[11px] font-semibold text-[#36393F] hover:underline"
                          >
                            <Eye className="h-[11px] w-[11px]" />
                            <span>
                              {generatedExercise.showSolution
                                ? 'Masquer le corrigé'
                                : 'Voir le corrigé'}
                            </span>
                          </button>
                        </div>
                        {generatedExercise.showHints && (
                          <ul className="mt-1.5 space-y-0.5 text-[11.5px] text-[#36393F]">
                            {generatedExercise.data.hints.map((h, i) => (
                              <li key={i}>• {h}</li>
                            ))}
                          </ul>
                        )}
                        {generatedExercise.showSolution && (
                          <div className="mt-2 rounded-[10px] bg-[#F4F6FA] p-2.5 text-[11.5px] text-[#1C1E22]">
                            <div className="font-bold text-[#0D8A4E]">Corrigé détaillé</div>
                            <p className="mt-0.5 whitespace-pre-line">
                              {generatedExercise.data.solution}
                            </p>
                            {generatedExercise.data.keyTakeaway && (
                              <p className="mt-1 font-medium text-[var(--accent)]">
                                À retenir : {generatedExercise.data.keyTakeaway}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={2}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      aria-label={`Réponse ou question pour ${getSubjectTutor(activeModule.subject).name}`}
                      placeholder={`Écris ta réponse, ton calcul ou ta question pour ${getSubjectTutor(activeModule.subject).name}…`}
                      className="sg-focus-ring w-full resize-none rounded-[12px] border border-white/80 bg-white/75 px-3 py-2 text-[12px] text-[#121417] placeholder:text-[#666A72]"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={correctionState.loading}
                        onClick={() => void handleRequestCorrection('correct')}
                        className="sg-focus-ring sg-btn-primary flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white whitespace-nowrap"
                      >
                        {correctionState.loading ? (
                          <Loader2 className="h-[12px] w-[12px] animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-[12px] w-[12px]" />
                        )}
                        <span>Corriger ma réponse</span>
                      </button>

                      <button
                        type="button"
                        disabled={correctionState.loading}
                        onClick={() => void handleRequestCorrection('hint')}
                        className="sg-focus-ring sg-btn-secondary flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[var(--accent)] whitespace-nowrap"
                      >
                        <HelpCircle className="h-[12px] w-[12px]" />
                        <span>Indice de {getSubjectTutor(activeModule.subject).name}</span>
                      </button>
                    </div>

                    {correctionState.error && (
                      <p className="text-[11px] font-medium text-[#991B1B]">
                        {correctionState.error}
                      </p>
                    )}

                    {correctionState.result && (
                      <div className="rounded-[14px] border border-[var(--accent-border)]/45 bg-white/80 p-3 text-[11.5px] leading-snug text-[#121417]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1 font-bold text-[var(--accent)]">
                            <Sparkles className="h-[12px] w-[12px]" />
                            Retour de {getSubjectTutor(activeModule.subject).name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              correctionState.result.isCorrect
                                ? 'bg-[#D9F3E4] text-[#096B3B]'
                                : 'bg-[#FDEACC] text-[#924A03]'
                            }`}
                          >
                            {correctionState.result.scoreLabel}
                          </span>
                        </div>
                        <p className="mt-1">{correctionState.result.feedback}</p>
                        {correctionState.result.steps.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-[#36393F]">
                            {correctionState.result.steps.map((step, i) => (
                              <li key={i}>• {step}</li>
                            ))}
                          </ul>
                        )}
                        {correctionState.result.nextTip && (
                          <p className="mt-1.5 font-medium text-[var(--accent)]">
                            Conseil : {correctionState.result.nextTip}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleValidateModule}
                  className="sg-focus-ring sg-btn-primary h-[30px] rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap"
                >
                  {validatedModules[activeModule.id] ? 'Thème validé' : 'Valider ce thème'}
                </button>
                <button
                  type="button"
                  onClick={handleNextModule}
                  className="sg-focus-ring sg-btn-secondary h-[30px] rounded-full px-3.5 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  {moduleIndex + 1 < totalCount ? 'Thème suivant' : 'Voir le bilan'}
                </button>
              </div>
            </>
          ) : (
            <div className="my-2 flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-y-auto">
              <div>
                <h1 className="text-[19px] font-bold text-[#121417]">Entraînement terminé</h1>
                <div className="mt-1 text-[22px] font-bold text-[var(--accent)] tabular-nums">
                  Points maîtrisés : {totalMasteredPointsCount} / {totalCheckpointsCount}
                </div>
                <p className="mt-0.5 text-[13px] text-[#4B4E54]">
                  {validatedCount} thème(s) validé(s) sur {totalCount} pour {experience.classLevel}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFinished(false);
                    setModuleIndex(0);
                  }}
                  className="sg-focus-ring sg-btn-primary h-[32px] rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap"
                >
                  Revoir les points à travailler
                </button>
                <button
                  type="button"
                  onClick={resetSession}
                  className="sg-focus-ring sg-btn-secondary h-[32px] rounded-full px-4 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  Recommencer
                </button>
                <button
                  type="button"
                  onClick={onGoToCours}
                  className="sg-focus-ring text-[12px] font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                >
                  Revoir la leçon
                </button>
              </div>
            </div>
          )}
        </section>
      ),
    },
    {
      id: 'ex-nav',
      render: () => (
        <section
          aria-label="Navigation des entraînements"
          className="sg-card-l1 flex h-full min-h-[155px] w-full min-w-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 @sm:p-4 md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Série active</h2>
            <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
              Maîtrise actuelle : {totalMasteredPointsCount} / {totalCheckpointsCount}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFinished(false);
                setModuleIndex((i) => (i - 1 + totalCount) % totalCount);
              }}
              aria-label="Thème précédent"
              className="sg-focus-ring sg-nav-idle h-[28px] rounded-full px-3 text-[11px] font-semibold text-[#1C1E22]"
            >
              Préc.
            </button>
            <button
              type="button"
              onClick={handleNextModule}
              aria-label="Thème suivant"
              className="sg-focus-ring sg-btn-primary flex h-[36px] w-[36px] items-center justify-center rounded-full text-[12px] font-bold text-white tabular-nums"
            >
              {moduleIndex + 1}
            </button>
            <button
              type="button"
              onClick={handleNextModule}
              aria-label="Aller au thème suivant"
              className="sg-focus-ring sg-nav-idle h-[28px] rounded-full px-3 text-[11px] font-semibold text-[#1C1E22]"
            >
              Suiv.
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToCours}
            className="sg-focus-ring text-center text-[11.5px] font-semibold text-[var(--accent)] hover:underline"
          >
            Revoir la leçon
          </button>
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
      formatIndex={1}
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
