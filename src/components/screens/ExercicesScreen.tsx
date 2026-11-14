import React, { useEffect, useMemo, useState } from 'react';
import {
  ClassExperience,
  DifficultyLevel,
  ExerciseCategory,
} from '../../data/studyData';
import { TileRect } from '../../utils/bentoLayout';
import { BentoTileCanvas, BuiltInTileSlot } from '../BentoTileCanvas';

interface ExercicesScreenProps {
  experience: ClassExperience;
  initialSubject?: string;
  tiles: TileRect[];
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
  tiles,
  onChangeTiles,
  onBringToFront,
  onGoToCours,
}) => {
  const { subjects, exercises } = experience;

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('Exercices par leçon');
  const [subjectFilter, setSubjectFilter] = useState<string>('Toutes');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Entraînement');

  const [moduleIndex, setModuleIndex] = useState(0);
  const [masteredPoints, setMasteredPoints] = useState<Record<string, boolean>>({});
  const [validatedModules, setValidatedModules] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [showCompetenceHint, setShowCompetenceHint] = useState(true);

  useEffect(() => {
    setSubjectFilter(
      initialSubject && subjects.includes(initialSubject) ? initialSubject : 'Toutes',
    );
    setModuleIndex(0);
    setMasteredPoints({});
    setValidatedModules({});
    setFinished(false);
  }, [experience.classLevel, experience.serie, initialSubject, subjects]);

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
    if (moduleIndex + 1 < totalCount) {
      setModuleIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const slots: BuiltInTileSlot[] = [
    {
      id: 'ex-filters',
      render: () => (
        <section
          aria-label="Choisir un entraînement"
          className="sg-card-l1 flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:min-h-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
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
          className="sg-card-l3 flex h-full min-h-[145px] flex-col justify-between overflow-hidden rounded-[22px] md:min-h-0"
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
          className="sg-card-l1 flex h-full min-h-[145px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:min-h-0"
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
          className="sg-card-l2 flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:min-h-0 md:p-5"
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

                  <p className="mt-2 text-[11px] italic text-[#55585F]">
                    Les séries d’exercices et sujets détaillés de ce thème seront intégrés ici avec le cours associé.
                  </p>
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
          className="sg-card-l1 flex h-full min-h-[155px] flex-col justify-between overflow-hidden rounded-[22px] p-4 md:min-h-0"
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
      onChangeTiles={onChangeTiles}
      onBringToFront={onBringToFront}
    />
  );
};
