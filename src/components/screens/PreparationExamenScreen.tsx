import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ClassExperience, SubjectStatus } from '../../data/studyData';
import { requestExamPlan } from '../../services/tutorClient';
import { TileRect } from '../../utils/bentoLayout';
import { getSubjectTutor, NoveltyAnalysisResult } from '../../utils/tutorAgent';
import { computeDaysRemaining, computePreparationPercent } from '../../utils/wireframeState';
import { BentoTileCanvas, BuiltInTileSlot } from '../BentoTileCanvas';

interface PreparationExamenScreenProps {
  experience: ClassExperience;
  tiles: TileRect[];
  baseHeightPx?: number;
  locked?: boolean;
  onSubjectChange?: (subject: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onChangeTiles: (next: TileRect[]) => void;
  onBringToFront: (tileId: string) => void;
  onGoToExamSubjects: () => void;
}

const STATUS_CYCLE: SubjectStatus[] = ['À commencer', 'En cours', 'Révisée'];

export const PreparationExamenScreen: React.FC<PreparationExamenScreenProps> = ({
  experience,
  tiles,
  baseHeightPx,
  locked = false,
  onSubjectChange,
  onAnalyzeTile,
  onChangeTiles,
  onBringToFront,
  onGoToExamSubjects,
}) => {
  const { subjects, examLabel, classLevel, serie } = experience;

  const [examDate, setExamDate] = useState<string>('');
  const [subjectStatuses, setSubjectStatuses] = useState<Record<string, SubjectStatus>>(() => ({
    ...(subjects[0] ? { [subjects[0]]: 'Révisée' } : {}),
    ...(subjects[1] ? { [subjects[1]]: 'En cours' } : {}),
  }));
  const [planGenerated, setPlanGenerated] = useState<boolean>(false);
  const [aiExamPlan, setAiExamPlan] = useState<{
    loading: boolean;
    error?: string;
    summary?: string;
    steps?: { phase: string; title: string; type: string }[];
  }>({ loading: false });

  const prioritySubject =
    subjects.find((s) => (subjectStatuses[s] ?? 'À commencer') !== 'Révisée') ??
    subjects[0] ??
    'Toutes';
  const tutor = useMemo(() => getSubjectTutor(prioritySubject), [prioritySubject]);

  useEffect(() => {
    onSubjectChange?.(prioritySubject);
  }, [prioritySubject, onSubjectChange]);

  useEffect(() => {
    setSubjectStatuses({
      ...(subjects[0] ? { [subjects[0]]: 'Révisée' } : {}),
      ...(subjects[1] ? { [subjects[1]]: 'En cours' } : {}),
    });
    setPlanGenerated(false);
    setAiExamPlan({ loading: false });
  }, [classLevel, serie, subjects]);

  const statusList = useMemo(
    () => subjects.map((subj) => subjectStatuses[subj] ?? 'À commencer'),
    [subjects, subjectStatuses],
  );

  const prepPercent = useMemo(
    () => computePreparationPercent(statusList),
    [statusList],
  );

  const daysRemaining = useMemo(
    () => computeDaysRemaining(examDate),
    [examDate],
  );

  const cycleSubjectStatus = (subject: string) => {
    setSubjectStatuses((prev) => {
      const current = prev[subject] ?? 'À commencer';
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
      return { ...prev, [subject]: next };
    });
  };

  const defaultPlanSteps = useMemo(() => {
    return [
      {
        phase: 'Semaine 1',
        title: `Révision des notions clés — ${subjects[0] ?? 'Programme principal'}`,
        type: 'Leçons & Résumés',
      },
      {
        phase: 'Semaine 2',
        title: `Série d’exercices ciblés — ${subjects[1] ?? subjects[0] ?? 'Approfondissement'}`,
        type: 'Exercices corrigés',
      },
      {
        phase: 'Semaine 3',
        title: `Sujet complet chronométré — ${examLabel}${serie ? ` (${serie})` : ''}`,
        type: 'Examen blanc',
      },
    ];
  }, [subjects, examLabel, serie]);

  const planSteps =
    aiExamPlan.steps && aiExamPlan.steps.length > 0 ? aiExamPlan.steps : defaultPlanSteps;

  const handleGenerateAiExamPlan = async () => {
    if (aiExamPlan.loading) return;
    setAiExamPlan({ loading: true });
    try {
      const res = await requestExamPlan({
        tutorName: tutor.name,
        subject: prioritySubject,
        classLevel,
        serie,
        examLabel,
        daysRemaining,
        subjectsStatus: subjects.map((s) => ({
          subject: s,
          status: subjectStatuses[s] ?? 'À commencer',
        })),
      });
      setPlanGenerated(true);
      setAiExamPlan({
        loading: false,
        summary: res.summary,
        steps: res.steps,
      });
    } catch (err) {
      setAiExamPlan({
        loading: false,
        error: err instanceof Error ? err.message : 'Plan personnalisé indisponible.',
      });
    }
  };

  const slots: BuiltInTileSlot[] = [
    {
      id: 'exam-target',
      render: () => (
        <section
          aria-label="Examen préparé"
          className="sg-card-l1 flex h-full min-h-[130px] w-full min-w-0 flex-col justify-between gap-1.5 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 md:min-h-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">Examen préparé</span>
            <span className="text-[12px] font-bold text-[var(--accent)]">
              {classLevel}
              {serie ? ` · ${serie}` : ''}
            </span>
          </div>

          <div className="text-[17px] font-bold tracking-tight text-[#121417]">
            {examLabel}
          </div>

          <p className="text-[11px] text-[#4B4E54]">
            Programme et matières alignés sur votre niveau actuel.
          </p>
        </section>
      ),
    },
    {
      id: 'exam-date',
      render: () => (
        <section
          aria-label="Date de l’examen"
          className="sg-card-l3 flex h-full min-h-[130px] w-full min-w-0 flex-col justify-between gap-1 overflow-y-auto overflow-x-hidden rounded-[22px] md:min-h-0"
        >
          <div className="px-3.5 pt-3 pb-1.5">
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">Date de l’examen</span>
            <div className="mt-0.5 text-[15px] font-bold text-[#121417] tabular-nums">
              {examDate
                ? new Date(`${examDate}T00:00:00`).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'À renseigner'}
            </div>
          </div>

          <div className="sg-glass-subtile mx-[4px] mb-[4px] flex flex-col gap-1.5 rounded-[18px] p-2.5">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              aria-label="Date de l’examen"
              className="sg-focus-ring h-[30px] w-full min-w-0 rounded-full border border-white/80 bg-white/80 px-3 text-[11.5px] font-medium text-[#121417]"
            />
            {!examDate && (
              <p className="text-[10.5px] leading-tight text-[#4B4E54]">
                Ajoute la date de ton examen pour organiser tes révisions.
              </p>
            )}
          </div>
        </section>
      ),
    },
    {
      id: 'exam-days',
      render: () => (
        <section
          aria-label="Jours restants"
          className="sg-card-l1 flex h-full min-h-[130px] w-full min-w-0 flex-col justify-between gap-1.5 overflow-y-auto overflow-x-hidden rounded-[22px] p-3.5 md:min-h-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">Jours restants</span>
            <span className="font-mono text-[15.5px] font-bold text-[var(--accent)] tabular-nums">
              {daysRemaining !== null ? `${daysRemaining} jours` : 'À renseigner'}
            </span>
          </div>

          <div className="sg-glass-subtile rounded-[12px] px-2.5 py-2">
            <div className="text-[11px] font-bold text-[#121417]">Conseil du jour</div>
            <p className="mt-0.5 text-[11px] leading-snug text-[#4B4E54]">
              Commence par revoir une leçon, puis vérifie tes acquis avec un sujet ou un quiz.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#4B4E54] tabular-nums">
            <span>Préparation : {prepPercent} %</span>
            <div className="h-[4px] min-w-[72px] flex-1 max-w-[52%] overflow-hidden rounded-full bg-white/65">
              <div
                className="sg-accent-bar h-full rounded-full transition-[width] duration-200"
                style={{ width: `${prepPercent}%` }}
              />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'exam-plan',
      render: () => (
        <section
          aria-label="PRÉPARATION EXAMEN"
          className="sg-card-l2 flex h-full min-h-[220px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @md:p-5 md:min-h-0"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
              PRÉPARATION EXAMEN · {classLevel}
              {serie ? ` (${serie})` : ''}
            </span>
            <span className="text-[11.5px] font-semibold text-[#4B4E54]">
              {examDate || prepPercent > 0
                ? 'Tu avances bien. Continue selon ton planning.'
                : 'Ajoute la date de ton examen pour organiser tes révisions.'}
            </span>
          </div>

          <div className="my-2 flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-y-auto pr-1">
            <div>
              <h1 className="text-[19px] font-bold leading-snug text-[#121417] md:text-[21px]">
                Prépare ton examen avec méthode
              </h1>
              <p className="mt-0.5 text-[12.5px] text-[#4B4E54]">
                Retrouve les matières à réviser, les sujets d’entraînement et ton plan de préparation.
              </p>
            </div>

            <div>
              <h2 className="text-[12.5px] font-bold text-[#121417]">Mon plan de préparation</h2>
              {aiExamPlan.summary && (
                <p className="mt-1 text-[11.5px] font-medium text-[var(--accent)]">
                  {tutor.name} : {aiExamPlan.summary}
                </p>
              )}
              {aiExamPlan.error && (
                <p className="mt-1 text-[11px] font-medium text-[#991B1B]">{aiExamPlan.error}</p>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {planSteps.map((step) => (
                  <div
                    key={`${step.phase}-${step.title}`}
                    className="sg-glass-subtile flex flex-wrap items-center justify-between gap-2 rounded-[14px] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                        {step.phase}
                      </span>
                      <span className="text-[12px] font-semibold text-[#121417]">
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#4B4E54]">
                      {planGenerated ? `${step.type} · Planifié` : step.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlanGenerated(true)}
                  className="sg-focus-ring sg-btn-primary h-[30px] rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap"
                >
                  Créer mon plan de révision
                </button>
                <button
                  type="button"
                  disabled={aiExamPlan.loading}
                  onClick={() => void handleGenerateAiExamPlan()}
                  className="sg-focus-ring sg-btn-secondary flex h-[30px] items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-[var(--accent)] whitespace-nowrap"
                >
                  {aiExamPlan.loading ? (
                    <Loader2 className="h-[12px] w-[12px] animate-spin" />
                  ) : (
                    <Sparkles className="h-[12px] w-[12px]" />
                  )}
                  <span>Plan adapté par {tutor.name}</span>
                </button>
                <button
                  type="button"
                  onClick={onGoToExamSubjects}
                  className="sg-focus-ring sg-nav-idle h-[30px] rounded-full px-3.5 text-[12px] font-semibold text-[#1C1E22] whitespace-nowrap"
                >
                  Voir les sujets d’examen
                </button>
              </div>

              <span className="font-mono text-[11.5px] font-bold text-[var(--accent)] tabular-nums">
                Préparation : {prepPercent} %
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Pourcentage de préparation"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={prepPercent}
              className="h-[4px] w-full overflow-hidden rounded-full bg-white/65"
            >
              <div
                className="sg-accent-bar h-full rounded-full transition-[width] duration-200"
                style={{ width: `${prepPercent}%` }}
              />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'exam-subjects',
      render: () => (
        <section
          aria-label="Matières à réviser"
          className="sg-card-l1 flex h-full min-h-[220px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] p-3.5 @sm:p-4 md:min-h-0"
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#121417]">Matières à réviser</h2>
            <p className="mt-0.5 text-[11px] text-[#4B4E54]">
              À commencer · En cours · Révisée
            </p>
          </div>

          <div className="my-2 flex min-h-0 flex-1 flex-col gap-[6px] overflow-y-auto pr-1">
            {subjects.map((subject) => {
              const status = subjectStatuses[subject] ?? 'À commencer';
              const isActive = status !== 'À commencer';
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => cycleSubjectStatus(subject)}
                  className={`sg-focus-ring flex h-[32px] shrink-0 w-full items-center justify-between gap-2 rounded-full px-2.5 text-left transition-colors ${
                    status === 'Révisée'
                      ? 'sg-selected-capsule'
                      : isActive
                        ? 'border border-[var(--accent-border)]/45 bg-[var(--accent-soft)]/55'
                        : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                        status === 'Révisée'
                          ? 'sg-halo-ring'
                          : 'border border-white/80 bg-white/55'
                      }`}
                    >
                      {status === 'Révisée' && (
                        <span className="sg-halo-core h-[9px] w-[9px] rounded-full" />
                      )}
                    </span>
                    <span className="truncate text-[11.5px] font-semibold text-[#121417]">
                      {subject}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 text-[10.5px] font-semibold whitespace-nowrap ${
                      status === 'Révisée'
                        ? 'text-[var(--accent)]'
                        : status === 'En cours'
                          ? 'text-[#7F1D1D]'
                          : 'text-[#55585F]'
                    }`}
                  >
                    {status}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onGoToExamSubjects}
            className="sg-focus-ring sg-btn-secondary h-[30px] w-full rounded-full text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
          >
            Voir les sujets d’examen
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
      onAnalyzeTile={onAnalyzeTile}
      onChangeTiles={onChangeTiles}
      onBringToFront={onBringToFront}
    />
  );
};
