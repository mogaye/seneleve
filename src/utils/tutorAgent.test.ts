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
  assert.equal(getSubjectTutor('Physique-Chimie').name, 'Sami');
  assert.equal(getSubjectTutor('Philosophie').name, 'Idris');
  assert.equal(getSubjectTutor('Économie').name, 'Lucas');
  assert.equal(getSubjectTutor('Toutes').name, 'Maya');

  for (const cls of CLASS_LEVELS_FULL) {
    const series = getSeriesForClass(cls);
    const inputs = series.length > 0 ? series : [null];
    for (const s of inputs) {
      const exp = getClassExperience(cls, s);
      for (const subj of exp.subjects) {
        const persona = getSubjectTutor(subj);
        assert.ok(persona.name.length >= 2);
        assert.equal(/gemini|google|gpt|claude|\bia\b/i.test(persona.name), false);
      }
    }
  }
});

test('extractSiteNovelties collects custom tiles and custom verbatim courses cleanly', () => {
  const layouts = {
    0: [...DEFAULT_SCREEN_LAYOUTS[0]],
    1: [...DEFAULT_SCREEN_LAYOUTS[1]],
    2: [
      ...DEFAULT_SCREEN_LAYOUTS[2],
      { id: 'custom-1', x: 0, y: 100, w: 48, h: 42, isCustom: true, title: 'Ma note', note: 'Théorème de Thalès' },
    ],
    3: [...DEFAULT_SCREEN_LAYOUTS[3]],
  };
  const customCourses = [
    {
      id: 'course-1',
      title: 'Chapitre 1 : La cellule',
      subject: 'SVT',
      content: 'Texte exact du cours donné sans modification.',
    },
  ];
  const novelties = extractSiteNovelties(layouts, customCourses);
  assert.equal(novelties.length, 2);
  assert.equal(novelties[0].screenIndex, 2);
  assert.equal(novelties[0].title, 'Ma note');
  assert.equal(novelties[0].kind, 'tile');
  assert.equal(novelties[1].kind, 'course');
  assert.equal(novelties[1].title, 'SVT — Chapitre 1 : La cellule');
});

test('sanitizeSiteActions validates all expanded site control actions and filters invalid entries', () => {
  const rawVerbatimContent = 'Paragraphe 1 exact.\n\nParagraphe 2   avec espaces.';
  const cleaned = sanitizeSiteActions([
    { type: 'navigate', formatIndex: 2 },
    { type: 'navigate', formatIndex: 99 },
    { type: 'set_class', classLevel: 'Terminale', serie: 'S1' },
    { type: 'set_class', classLevel: 'ClasseInconnue' },
    { type: 'select_subject', subject: 'Physique-Chimie' },
    { type: 'open_course', subject: 'SVT' },
    { type: 'close_course' },
    { type: 'open_revision_tab', tab: 'Flashcards' },
    { type: 'generate_quiz' },
    { type: 'generate_flashcards' },
    { type: 'set_exercise_filter', category: 'Devoirs', difficulty: 'Défi', subject: 'Mathématiques' },
    { type: 'generate_exercise' },
    { type: 'set_exam_date', date: '2026-07-02' },
    { type: 'set_exam_date', date: 'invalid-date' },
    { type: 'update_subject_status', subject: 'SVT', status: 'Révisée' },
    { type: 'add_note_tile', title: 'Résumé', note: 'Formule u_n = u_0 + nr' },
    { type: 'add_course', title: 'Mon cours exact', content: rawVerbatimContent, subject: 'Français' },
    { type: 'toggle_focus', enabled: true },
  ]);

  assert.equal(cleaned.length, 15);
  assert.equal(describeSiteAction(cleaned[0]), 'Ouverture de Révisions');
  assert.equal(describeSiteAction(cleaned[1]), 'Classe réglée sur Terminale (S1)');
  assert.equal(describeSiteAction(cleaned[2]), 'Matière sélectionnée : Physique-Chimie');
  assert.equal(describeSiteAction(cleaned[3]), 'Cours complet ouvert : SVT');
  const addedCourseAction = cleaned.find((a) => a.type === 'add_course');
  assert.ok(addedCourseAction && addedCourseAction.type === 'add_course');
  assert.equal(addedCourseAction.content, rawVerbatimContent);
});
