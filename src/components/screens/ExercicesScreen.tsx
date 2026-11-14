import React, { useEffect, useMemo, useState } from 'react';
import {
  ClassExperience,
  DifficultyLevel,
  ExerciseCategory,
} from '../../data/studyData';

interface ExercicesScreenProps {
  experience: ClassExperience;
  initialSubject?: string;
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
  onGoToCours,
}) => {
  const { subjects, exercises } = experience;

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('Exercices par leçon');
  const [subjectFilter, setSubjectFilter] = useState<string>('Toutes');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Entraînement');

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { choice: number; correct: boolean }>>({});
  const [finished, setFinished] = useState(false);
  const [immediateCorrection, setImmediateCorrection] = useState(true);

  useEffect(() => {
    setSubjectFilter(
      initialSubject && subjects.includes(initialSubject) ? initialSubject : 'Toutes',
    );
    setQuestionIndex(0);
    setSelectedChoice(null);
    setValidated(false);
    setAnswers({});
    setFinished(false);
  }, [experience.classLevel, experience.serie, initialSubject, subjects]);

  const questions = useMemo(() => {
    const exact = exercises.filter(
      (q) =>
        q.category === selectedCategory &&
        (subjectFilter === 'Toutes' || q.subject === subjectFilter),
    );
    if (exact.length > 0) return exact;
    const bySubject =
      subjectFilter === 'Toutes'
        ? exercises
        : exercises.filter((q) => q.subject === subjectFilter);
    if (bySubject.length > 0) return bySubject;
    const byCat = exercises.filter((q) => q.category === selectedCategory);
    return byCat.length > 0 ? byCat : exercises;
  }, [exercises, selectedCategory, subjectFilter]);

  const activeQuestion = questions[questionIndex % questions.length] ?? exercises[0];
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const score = Object.values(answers).filter((a) => a.correct).length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const resetSession = () => {
    setQuestionIndex(0);
    setSelectedChoice(null);
    setValidated(false);
    setAnswers({});
    setFinished(false);
  };

  const handleValidate = () => {
    if (selectedChoice === null || !activeQuestion) return;
    const isCorrect = selectedChoice === activeQuestion.correctIndex;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: { choice: selectedChoice, correct: isCorrect },
    }));
    setValidated(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 < totalCount) {
      setQuestionIndex((i) => i + 1);
      setSelectedChoice(null);
      setValidated(false);
    } else {
      setFinished(true);
    }
  };

  const isCurrentCorrect =
    validated &&
    selectedChoice !== null &&
    activeQuestion &&
    selectedChoice === activeQuestion.correctIndex;

  return (
    <div className="grid flex-1 grid-cols-1 gap-[12px] md:grid-cols-[1fr_2.15fr] md:grid-rows-[1fr_1.35fr]">
      {/* Panneau de Gauche Pleine Hauteur — Choisir un entraînement */}
      <section
        aria-label="Choisir un entraînement"
        className="sg-card-l1 flex h-full flex-col justify-between rounded-[22px] p-4 md:row-span-2"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13.5px] font-bold text-[#121417]">Choisir un entraînement</h2>
            <span className="text-[11px] font-semibold text-[var(--accent)]">
              {experience.classLevel}
            </span>
          </div>

          {/* Matière filter (scoped strictly to current class) */}
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-[#4B4E54]">
            <span>Matière</span>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                resetSession();
              }}
              className="sg-focus-ring sg-glass-subtile h-[32px] rounded-[10px] px-2.5 text-[11.5px] font-medium text-[#121417]"
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
            <span className="font-semibold text-[#121417]">Leçon :</span>{' '}
            {activeQuestion?.lessonTitle}
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
          className="sg-focus-ring sg-btn-secondary mt-3 h-[32px] w-full rounded-full text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
        >
          Recommencer
        </button>
      </section>

      {/* Top-Right Row: Mon entraînement (Level 3) + Progression */}
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1fr_1.35fr]">
        {/* Mon entraînement — Level 3 glowing green */}
        <section
          aria-label="Mon entraînement"
          className="sg-card-l3 flex min-h-[155px] flex-col justify-between overflow-hidden rounded-[22px] md:h-full md:min-h-0"
        >
          <div className="p-4 pb-2">
            <h2 className="text-[13px] font-bold text-[#121417]">Mon entraînement</h2>
            <p className="mt-0.5 text-[12px] font-semibold text-[var(--accent)] tabular-nums">
              Question {Math.min(questionIndex + 1, totalCount)} sur {totalCount}
            </p>
          </div>

          <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col justify-between gap-2.5 rounded-[18px] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#36393F]">Correction</span>
              <button
                type="button"
                role="switch"
                aria-checked={immediateCorrection}
                aria-label="Correction immédiate"
                onClick={() => setImmediateCorrection((v) => !v)}
                className={`sg-focus-ring flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-150 ${
                  immediateCorrection
                    ? 'sg-accent-switch'
                    : 'border border-white/70 bg-[#B6BAC2]'
                }`}
              >
                <span
                  className={`h-[12px] w-[12px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                    immediateCorrection ? 'translate-x-[14px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFinished(true)}
              className="sg-focus-ring sg-btn-primary h-[34px] w-full rounded-full px-3 text-[12px] font-semibold text-white whitespace-nowrap"
            >
              Terminer l’exercice
            </button>
          </div>
        </section>

        {/* Progression & message */}
        <section
          aria-label="Progression de l’entraînement"
          className="sg-card-l1 flex min-h-[155px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Progression</h2>
            <p className="mt-1 text-[12px] text-[#4B4E54]">
              Tu pourras revoir tes réponses avant de terminer.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[11.5px] font-medium text-[#4B4E54] tabular-nums">
              <span>
                {answeredCount} question(s) faite(s) sur {totalCount}
              </span>
              <span className="font-mono font-semibold text-[var(--accent)]">
                {progressPercent}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Questions faites"
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
      </div>

      {/* Bottom Right Row: Main Question/Result Panel + Quick Controls */}
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-[1.65fr_1fr]">
        {/* Grand Panneau Principal — Exercices & Examens */}
        <section
          aria-label="EXERCICES & EXAMENS"
          className="sg-card-l2 flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:h-full md:min-h-0 md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-wider text-[var(--accent)]">
              EXERCICES & EXAMENS · {experience.classLevel}
              {experience.serie ? ` (${experience.serie})` : ''}
            </span>
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">
              {selectedCategory} · {difficulty}
            </span>
          </div>

          {!finished && activeQuestion ? (
            <div className="my-2 flex flex-1 flex-col justify-center gap-3 overflow-y-auto pr-1">
              <div>
                <h1 className="text-[18px] font-bold tracking-tight text-[#121417]">
                  À toi de t’entraîner !
                </h1>
                <p className="mt-0.5 text-[12px] text-[#4B4E54]">
                  Résous les questions, puis consulte la correction pour comprendre tes erreurs.
                </p>
              </div>

              <div className="sg-glass-subtile rounded-[16px] p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
                  Question {questionIndex + 1} · {activeQuestion.subject}
                </div>
                <p className="mt-0.5 text-[13.5px] font-semibold text-[#121417]">
                  {activeQuestion.prompt}
                </p>

                <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {activeQuestion.choices.map((choice, idx) => {
                    const isPicked = selectedChoice === idx;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          setSelectedChoice(idx);
                          setValidated(false);
                        }}
                        className={`sg-focus-ring rounded-[12px] border px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                          isPicked
                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                            : 'border-white/75 bg-white/70 text-[#1C1E22] hover:border-[var(--accent-border)]'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {validated && immediateCorrection && (
                <div
                  className={`rounded-[12px] border px-3 py-2 text-[12px] ${
                    isCurrentCorrect
                      ? 'border-[#16A34A] bg-[#D9F3E4]/90 text-[#096B3B]'
                      : 'border-[#DC2626] bg-[#FCE0E2]/90 text-[#9C1520]'
                  }`}
                >
                  <div className="font-bold">
                    {isCurrentCorrect
                      ? 'Bonne réponse !'
                      : 'Pas encore. Regarde la correction et réessaie.'}
                  </div>
                  <div className="mt-0.5">
                    {isCurrentCorrect
                      ? `Voici pourquoi cette réponse est juste : ${activeQuestion.explanation}`
                      : activeQuestion.explanation}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={selectedChoice === null}
                  className="sg-focus-ring sg-btn-primary h-[30px] rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap disabled:opacity-50"
                >
                  Valider ma réponse
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="sg-focus-ring sg-btn-secondary h-[30px] rounded-full px-3.5 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  {validated ? 'Question suivante' : 'Passer la question'}
                </button>
              </div>
            </div>
          ) : (
            <div className="my-2 flex flex-1 flex-col justify-center gap-3">
              <div>
                <h1 className="text-[19px] font-bold text-[#121417]">Entraînement terminé</h1>
                <div className="mt-1 text-[22px] font-bold text-[var(--accent)] tabular-nums">
                  Ton résultat : {score} / {totalCount}
                </div>
                <p className="mt-0.5 text-[13px] text-[#4B4E54]">
                  {score >= Math.ceil(totalCount * 0.6)
                    ? 'Très bien !'
                    : 'Bon début, continue à t’entraîner.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFinished(false);
                    setQuestionIndex(0);
                    setValidated(true);
                  }}
                  className="sg-focus-ring sg-btn-primary h-[32px] rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap"
                >
                  Revoir mes erreurs
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

        {/* Panneau Bas-Droite — Raccourcis questions */}
        <section
          aria-label="Navigation des questions"
          className="sg-card-l1 flex min-h-[155px] flex-col justify-between rounded-[22px] p-4 md:h-full md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Série active</h2>
            <p className="mt-1 text-[12px] text-[#4B4E54] tabular-nums">
              Score actuel : {score} / {totalCount}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFinished(false);
                setQuestionIndex((i) => (i - 1 + totalCount) % totalCount);
                setSelectedChoice(null);
                setValidated(false);
              }}
              aria-label="Question précédente"
              className="sg-focus-ring sg-nav-idle h-[28px] rounded-full px-3 text-[11px] font-semibold text-[#1C1E22]"
            >
              Préc.
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              aria-label="Question suivante"
              className="sg-focus-ring sg-btn-primary flex h-[36px] w-[36px] items-center justify-center rounded-full text-[12px] font-bold text-white tabular-nums"
            >
              {questionIndex + 1}
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              aria-label="Aller à la question suivante"
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
      </div>
    </div>
  );
};
