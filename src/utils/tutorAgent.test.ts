import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SCREEN_LAYOUTS } from './bentoLayout';
import {
  describeSiteAction,
  extractSiteNovelties,
  getSubjectTutor,
  sanitizeSiteActions,
} from './tutorAgent';
import { CLASS_LEVELS_FULL, getClassExperience, getSeriesForClass } from '../data/studyData';

test('getSubjectTutor assigns universal human first names for every subject in the curriculum', () => {
  assert.equal(getSubjectTutor('Mathématiques').name, 'Léo');
  assert.equal(getSubjectTutor('Français').name, 'Clara');
  assert.equal(getSubjectTutor('SVT').name, 'Nadia');
  assert.equal(getSubjectTutor('Sciences physiques').name, 'Sami');
  assert.equal(getSubjectTutor('Philosophie').name, 'Idris');
  assert.equal(getSubjectTutor('Toutes').name, 'Maya');

  for (const cls of CLASS_LEVELS_FULL) {
    const series = getSeriesForClass(cls);
    const inputs = series.length > 0 ? series : [null];
    for (const s of inputs) {
      const exp = getClassExperience(cls, s);
      for (const subj of exp.subjects) {
        const persona = getSubjectTutor(subj);
        assert.ok(persona.name.length >= 2);
        assert.equal(/gemini|google|gpt|claude/i.test(persona.name), false);
      }
    }
  }
});

test('extractSiteNovelties collects custom tiles across all screens cleanly', () => {
  const layouts = {
    0: [...DEFAULT_SCREEN_LAYOUTS[0]],
    1: [...DEFAULT_SCREEN_LAYOUTS[1]],
    2: [
      ...DEFAULT_SCREEN_LAYOUTS[2],
      { id: 'custom-1', x: 0, y: 100, w: 48, h: 42, isCustom: true, title: 'Ma note', note: 'Théorème de Thalès' },
    ],
    3: [...DEFAULT_SCREEN_LAYOUTS[3]],
  };
  const novelties = extractSiteNovelties(layouts);
  assert.equal(novelties.length, 1);
  assert.equal(novelties[0].screenIndex, 2);
  assert.equal(novelties[0].title, 'Ma note');
  assert.equal(novelties[0].note, 'Théorème de Thalès');
});

test('sanitizeSiteActions validates and filters malformed actions safely', () => {
  const cleaned = sanitizeSiteActions([
    { type: 'navigate', formatIndex: 2 },
    { type: 'navigate', formatIndex: 99 },
    { type: 'set_class', classLevel: 'Terminale', serie: 'S1' },
    { type: 'set_class', classLevel: 'ClasseInconnue' },
    { type: 'open_revision_tab', tab: 'Flashcards' },
    { type: 'add_note_tile', title: 'Résumé', note: 'Formule u_n = u_0 + nr' },
    { type: 'toggle_focus', enabled: true },
  ]);

  assert.equal(cleaned.length, 5);
  assert.equal(describeSiteAction(cleaned[0]), 'Ouverture de Révisions');
  assert.equal(describeSiteAction(cleaned[1]), 'Classe réglée sur Terminale (S1)');
});
