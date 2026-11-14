import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, Layers } from 'lucide-react';
import { ClassExperience } from '../data/studyData';
import { FormatIndex } from '../utils/wireframeState';

interface SectionBottomStripProps {
  formatIndex: FormatIndex;
  experience: ClassExperience;
  onNavigateTo: (target: FormatIndex) => void;
}

export const SectionBottomStrip: React.FC<SectionBottomStripProps> = ({
  formatIndex,
  experience,
  onNavigateTo,
}) => {
  const totalNotions = experience.lessons.reduce(
    (sum, lesson) => sum + lesson.notions.length,
    0,
  );
  const classTag = `${experience.classLevel}${experience.serie ? ` · ${experience.serie}` : ''}`;

  const config = (() => {
    if (formatIndex === 0) {
      return {
        icon: BookOpen,
        leftEyebrow: 'Programme actif',
        leftTitle: `${classTag} — ${experience.cycle}`,
        leftDesc: `${experience.subjects.length} matière(s) et ${totalNotions} notions officielles structurées.`,
        midEyebrow: 'Organisation des cours',
        midTitle: 'Structure prête pour vos leçons complètes',
        midDesc:
          'Consulte les objectifs et repères officiels de chaque matière avant de passer à la pratique.',
        ctaLabel: 'Passer aux exercices',
        targetFormat: 1 as FormatIndex,
      };
    }
    if (formatIndex === 1) {
      return {
        icon: CheckCircle2,
        leftEyebrow: 'Méthode d’entraînement',
        leftTitle: `${experience.exercises.length} thème(s) d’application`,
        leftDesc: `Valide chaque compétence du programme de ${classTag} à ton rythme.`,
        midEyebrow: 'Suivi par compétence',
        midTitle: 'Exercices, devoirs et annales alignés',
        midDesc:
          'Coche les notions maîtrisées pour repérer immédiatement les chapitres à consolider.',
        ctaLabel: 'Passer aux révisions',
        targetFormat: 2 as FormatIndex,
      };
    }
    if (formatIndex === 2) {
      return {
        icon: Layers,
        leftEyebrow: 'Rythme de mémorisation',
        leftTitle: `${totalNotions} notions révisables`,
        leftDesc:
          'Alterne auto-évaluation, cartes mémoire, résumés et planification hebdomadaire.',
        midEyebrow: 'Ancrage durable',
        midTitle: 'Séances courtes et ciblées',
        midDesc:
          'Reviens en priorité sur les points marqués à revoir avant d’aborder les examens blancs.',
        ctaLabel: 'Préparer l’examen',
        targetFormat: 3 as FormatIndex,
      };
    }
    return {
      icon: Compass,
      leftEyebrow: 'Objectif du niveau',
      leftTitle: `${experience.examLabel} · ${classTag}`,
      leftDesc: `${experience.subjects.length} matière(s) à suivre entre « À commencer », « En cours » et « Révisée ».`,
      midEyebrow: 'Feuille de route',
      midTitle: 'Planification progressive sur 3 phases',
      midDesc:
        'Renseigne la date de ton épreuve pour suivre les jours restants et consolider chaque matière.',
      ctaLabel: 'Revoir les cours',
      targetFormat: 0 as FormatIndex,
    };
  })();

  const Icon = config.icon;

  return (
    <footer
      aria-label="Synthèse de la section"
      className="flex shrink-0 flex-col gap-2"
    >
      <div className="sg-card-l1 grid grid-cols-1 items-center gap-2.5 rounded-[22px] p-3 md:grid-cols-[1.05fr_1.35fr_auto] md:px-4 md:py-3">
        <div className="sg-glass-subtile flex items-start gap-2.5 rounded-[16px] px-3 py-2.5">
          <div className="sg-nav-active mt-0.5 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-white">
            <Icon className="h-[14px] w-[14px]" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--accent)]">
              {config.leftEyebrow}
            </div>
            <div className="truncate text-[12.5px] font-bold text-[#121417]">
              {config.leftTitle}
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-[#4B4E54]">
              {config.leftDesc}
            </p>
          </div>
        </div>

        <div className="sg-glass-subtile rounded-[16px] px-3.5 py-2.5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--accent)]">
            {config.midEyebrow}
          </div>
          <div className="text-[12.5px] font-bold text-[#121417]">
            {config.midTitle}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-[#4B4E54]">
            {config.midDesc}
          </p>
        </div>

        <div className="flex items-center justify-end md:pl-1">
          <button
            type="button"
            onClick={() => onNavigateTo(config.targetFormat)}
            className="sg-focus-ring sg-btn-primary flex h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-white whitespace-nowrap transition-[transform,box-shadow] duration-150 md:w-auto"
          >
            <span>{config.ctaLabel}</span>
            <ArrowRight className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] font-medium text-[#4B4E54]">
        <span>
          Programme scolaire du Sénégal · {classTag} ({experience.cycle})
        </span>
        <span>
          Fais glisser vers la droite ou utilise la barre latérale pour changer d’espace
        </span>
      </div>
    </footer>
  );
};
