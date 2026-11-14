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
  getSeriesForClass,
} from '../data/studyData';

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

test('class progression spans CI to Terminale and adapts series cleanly', () => {
  assert.equal(CLASS_LEVELS_FULL[0], 'CI');
  assert.equal(CLASS_LEVELS_FULL[CLASS_LEVELS_FULL.length - 1], 'Terminale');
  assert.equal(CLASS_LEVELS_FULL.length, 13);
  assert.equal(stepClassLevel('CI', 1), 'CP');
  assert.equal(stepClassLevel('CM2', 1), '6e');
  assert.equal(stepClassLevel('3e', 1), '2nde');
  assert.equal(stepClassLevel('Terminale', 1), 'CI');
  assert.equal(stepClassLevel('CI', -1), 'Terminale');

  assert.equal(getSeriesForClass('CI').length, 0);
  assert.equal(getSeriesForClass('3e').length, 0);
  assert.deepEqual(getSeriesForClass('2nde'), ['L', 'S', 'T']);
  assert.equal(getSeriesForClass('Terminale').length, BAC_SERIES.length);

  const termState = setActiveClass(createInitialDashboardState(), 'Terminale');
  assert.equal(termState.selectedClass, 'Terminale');
  assert.equal(termState.selectedSerie, 'S2');
});

test('class experience adapts subjects by serie and never leaks other class names', () => {
  const stegExp = getClassExperience('Terminale', 'STEG');
  assert.ok(stegExp.subjects.includes('Comptabilité'));
  assert.equal(stegExp.examLabel, 'Baccalauréat');

  const s1Exp = getClassExperience('Terminale', 'S1');
  assert.ok(s1Exp.subjects.includes('Sciences Physiques'));

  for (const cls of CLASS_LEVELS_FULL) {
    const exp = getClassExperience(cls, null);
    const otherClasses = CLASS_LEVELS_FULL.filter((c) => c !== cls);
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
        `Class ${cls} leaked class name ${other}`,
      );
    }
  }
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
