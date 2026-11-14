import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPercentage,
  computeDaysRemaining,
  computePreparationPercent,
  createInitialDashboardState,
  FORMAT_META,
  resolveSwipeDirection,
  setActiveClass,
  setFormat,
  stepClassLevel,
  stepFormat,
  toggleUtilityNav,
} from './wireframeState';
import {
  BAC_SERIES,
  CLASS_LEVELS_FULL,
  getClassExperience,
  getDefaultSerieForClass,
  getSeriesForClass,
  SECONDE_SERIES,
} from '../data/studyData';
import { getPdfCourseDocument } from '../data/pdfCourses';

test('initial state starts at CI and 4 screen metadata match specification', () => {
  const state = createInitialDashboardState();
  assert.equal(state.activeFormat, 0);
  assert.equal(state.selectedClass, 'CI');
  assert.equal(state.selectedSerie, null);
  assert.equal(FORMAT_META.length, 4);
  assert.equal(FORMAT_META[0].sidebarLabel, 'Cours');
  assert.equal(FORMAT_META[1].sidebarLabel, 'Entraînement');
  assert.equal(FORMAT_META[2].sidebarLabel, 'Révisions');
  assert.equal(FORMAT_META[3].sidebarLabel, 'Examens');
});

test('stepFormat cycles through all 4 formats cleanly in both directions', () => {
  assert.equal(stepFormat(0, 1), 1);
  assert.equal(stepFormat(1, 1), 2);
  assert.equal(stepFormat(2, 1), 3);
  assert.equal(stepFormat(3, 1), 0);
  assert.equal(stepFormat(0, -1), 3);
  assert.equal(stepFormat(3, -1), 2);
});

test('class progression spans Petite Section to Terminale and adapts series cleanly', () => {
  assert.equal(CLASS_LEVELS_FULL[0], 'Petite Section');
  assert.equal(CLASS_LEVELS_FULL[3], 'CI');
  assert.equal(CLASS_LEVELS_FULL[CLASS_LEVELS_FULL.length - 1], 'Terminale');
  assert.equal(CLASS_LEVELS_FULL.length, 16);
  assert.equal(stepClassLevel('Petite Section', 1), 'Moyenne Section');
  assert.equal(stepClassLevel('Grande Section', 1), 'CI');
  assert.equal(stepClassLevel('CI', 1), 'CP');
  assert.equal(stepClassLevel('CM2', 1), '6e');
  assert.equal(stepClassLevel('3e', 1), '2nde');
  assert.equal(stepClassLevel('Terminale', 1), 'Petite Section');
  assert.equal(stepClassLevel('Petite Section', -1), 'Terminale');

  assert.equal(getSeriesForClass('Petite Section').length, 0);
  assert.equal(getSeriesForClass('CI').length, 0);
  assert.equal(getSeriesForClass('3e').length, 0);
  assert.deepEqual(getSeriesForClass('2nde'), SECONDE_SERIES);
  assert.equal(getSeriesForClass('1re').length, BAC_SERIES.length);
  assert.equal(getSeriesForClass('Terminale').length, BAC_SERIES.length);
  assert.equal(getDefaultSerieForClass('2nde'), 'Tronc commun');
  assert.equal(getDefaultSerieForClass('Terminale'), 'S2');

  const secondeState = setActiveClass(createInitialDashboardState(), '2nde');
  assert.equal(secondeState.selectedClass, '2nde');
  assert.equal(secondeState.selectedSerie, 'Tronc commun');

  const termState = setActiveClass(createInitialDashboardState(), 'Terminale');
  assert.equal(termState.selectedClass, 'Terminale');
  assert.equal(termState.selectedSerie, 'S2');
});

test('class experience adapts subjects by class/serie, uses structured notions, and never leaks other class names', () => {
  const psExp = getClassExperience('Petite Section', null);
  assert.equal(psExp.cycle, 'Préscolaire');
  assert.ok(psExp.subjects.includes('Langage et communication'));
  assert.ok(psExp.lessons[0].notions.length >= 2);
  assert.ok(psExp.exercises[0].checkpoints.length >= 2);

  const collegeExp = getClassExperience('3e', null);
  assert.equal(collegeExp.subjects.length, 9);
  assert.equal(collegeExp.examLabel, 'BFEM');

  const stegExp = getClassExperience('Terminale', 'STEG');
  assert.ok(stegExp.subjects.some((s) => s.includes('Comptabilité')));
  assert.equal(stegExp.examLabel, 'Baccalauréat');

  const s1Exp = getClassExperience('Terminale', 'S1');
  assert.ok(s1Exp.subjects.includes('Sciences physiques'));

  for (const cls of CLASS_LEVELS_FULL) {
    const series = getSeriesForClass(cls);
    const serieInputs = series.length > 0 ? series : [null];
    const otherClasses = CLASS_LEVELS_FULL.filter((c) => c !== cls);

    for (const serie of serieInputs) {
      const exp = getClassExperience(cls, serie);
      const serialized = JSON.stringify({
        subjects: exp.subjects,
        lessons: exp.lessons,
        exercises: exp.exercises,
        examLabel: exp.examLabel,
      });
      for (const other of otherClasses) {
        const wordRegex = new RegExp(`\\b${other}\\b`);
        assert.equal(
          wordRegex.test(serialized),
          false,
          `Class ${cls} (${serie ?? 'std'}) leaked class name ${other}`,
        );
      }
    }
  }
});

test('lycee courses and lessons strictly isolate each series without cross-series mixing', () => {
  const getDoc = (classLevel: '2nde' | '1re' | 'Terminale', serie: string, subject: string) => {
    const exp = getClassExperience(classLevel, serie as never);
    const lesson = exp.lessons.find((l) => l.subject === subject);
    return getPdfCourseDocument({
      classLevel,
      serie: serie as never,
      subject,
      fallbackTitle: lesson?.title ?? subject,
      fallbackObjectif: lesson?.objectif ?? subject,
      fallbackNotions: lesson?.notions ?? [],
    });
  };

  // Terminale S2 vs S1 vs L2 isolation
  const s2Svt = getDoc('Terminale', 'S2', 'SVT');
  assert.ok(s2Svt.title.includes('Terminale S2'));
  assert.ok(s2Svt.title.includes('30 leçons'));
  assert.equal(/\b(L2|S1|S3|S4|STEG)\b/.test(JSON.stringify(s2Svt)), false);

  for (const subj of ['Sciences physiques', 'Mathématiques', 'Français', 'Philosophie']) {
    const doc = getDoc('Terminale', 'S2', subj);
    assert.equal(
      /\b(L2|S1|S3|S4|STEG)\b/.test(JSON.stringify(doc)),
      false,
      `Terminale S2 ${subj} leaked another series`,
    );
  }

  const s1Svt = getDoc('Terminale', 'S1', 'SVT');
  assert.ok(s1Svt.title.includes('19 leçons'));
  assert.equal(/\b(L2|S2)\b/.test(JSON.stringify(s1Svt)), false);

  const l2Svt = getDoc('Terminale', 'L2', 'SVT');
  assert.ok(l2Svt.title.includes('11 leçons'));
  assert.equal(/\b(S1|S2)\b/.test(JSON.stringify(l2Svt)), false);

  // Exercise IDs differ strictly across series
  const s2ExIds = new Set(getClassExperience('Terminale', 'S2').exercises.map((e) => e.id));
  const l2ExIds = getClassExperience('Terminale', 'L2').exercises.map((e) => e.id);
  for (const id of l2ExIds) {
    assert.equal(s2ExIds.has(id), false, `Exercise ID ${id} collided between S2 and L2`);
  }

  // 1re series isolation
  const pS2Svt = getDoc('1re', 'S2', 'SVT');
  assert.equal(/\b(L2|S1|STEG)\b/.test(JSON.stringify(pS2Svt)), false);
  const pL2Svt = getDoc('1re', 'L2', 'SVT');
  assert.equal(/\b(S1|S2|STEG)\b/.test(JSON.stringify(pL2Svt)), false);
  const pS1Maths = getDoc('1re', 'S1', 'Mathématiques');
  assert.equal(/\b(L2|S2|STEG)\b/.test(JSON.stringify(pS1Maths)), false);
  const pStegEco = getDoc('1re', 'STEG', 'Économie');
  assert.equal(/\b(S1|S2|L2)\b/.test(JSON.stringify(pStegEco)), false);

  // 2nde series isolation
  const secSMaths = getDoc('2nde', 'Orientation S', 'Mathématiques');
  assert.ok(secSMaths.title.includes('15 chapitres'));
  assert.equal(/\bde L\b/.test(JSON.stringify(secSMaths)), false);

  const secLMaths = getDoc('2nde', 'Orientation L', 'Mathématiques');
  assert.ok(secLMaths.title.includes('8 chapitres'));

  const secStegMaths = getDoc('2nde', 'Orientation STEG', 'Mathématiques');
  assert.ok(secStegMaths.title.includes('7 chapitres'));

  const secSPhys = getDoc('2nde', 'Orientation S', 'Sciences physiques');
  assert.ok(secSPhys.title.includes('25 leçons'));
  const secLPhys = getDoc('2nde', 'Orientation L', 'Sciences physiques');
  assert.ok(secLPhys.title.includes('10 leçons'));

  const secSSvt = getDoc('2nde', 'Orientation S', 'SVT');
  assert.ok(secSSvt.title.includes('10 leçons'));
  assert.equal(/\bde L\b/.test(JSON.stringify(secSSvt)), false);
  const secLSvt = getDoc('2nde', 'Orientation L', 'SVT');
  assert.ok(secLSvt.title.includes('8 leçons'));
});

test('setFormat, resolveSwipeDirection, computePreparationPercent, computeDaysRemaining, toggleUtilityNav work cleanly', () => {
  const initial = createInitialDashboardState();
  assert.equal(setFormat(initial, 9).activeFormat, 3);
  assert.equal(resolveSwipeDirection(200, 1440), 1);
  assert.equal(resolveSwipeDirection(-200, 1440), -1);
  assert.equal(resolveSwipeDirection(40, 1440), 0);
  assert.equal(computePreparationPercent(['Révisée', 'En cours', 'À commencer', 'À commencer']), 38);
  const ref = new Date(2026, 10, 14);
  assert.equal(computeDaysRemaining('2026-11-24', ref), 10);
  assert.equal(computeDaysRemaining('', ref), null);
  assert.equal(toggleUtilityNav(initial, 1).activeUtilityNav, 1);
  assert.equal(clampPercentage(Number.NaN), 0);
});
