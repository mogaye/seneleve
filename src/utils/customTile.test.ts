import assert from 'node:assert/strict';
import test from 'node:test';
import { createCustomTile, DEFAULT_SCREEN_LAYOUTS } from './bentoLayout';
import {
  buildTemplateBlocks,
  computeChecklistStats,
  createBlock,
  normalizeTileBlocks,
  summarizeCustomTileText,
} from './customTile';

test('normalizeTileBlocks falls back cleanly for legacy note-only custom tiles', () => {
  const blocks = normalizeTileBlocks({
    note: 'Formule de Pythagore : a² + b² = c²',
  });
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'text');
  if (blocks[0].type === 'text') {
    assert.equal(blocks[0].text, 'Formule de Pythagore : a² + b² = c²');
  }
});

test('summarizeCustomTileText aggregates rich blocks without exposing base64 payloads', () => {
  const secretBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
  const summary = summarizeCustomTileText({
    title: 'Fiche Physique',
    subject: 'Sciences physiques',
    blocks: [
      createBlock('text', { text: 'Loi d’Ohm en courant continu.' }),
      createBlock('image', { dataUrl: secretBase64, caption: 'Montage en série' }),
      createBlock('sketch', { dataUrl: secretBase64, caption: 'Circuit simple' }),
      createBlock('formula', { label: 'Loi d’Ohm', expression: 'U = R × I' }),
      createBlock('flashcard', { question: 'Unité de résistance ?', answer: 'Ohm (Ω)' }),
      createBlock('checklist', {
        items: [
          { id: '1', label: 'Tracer la courbe U(I)', done: true },
          { id: '2', label: 'Vérifier les unités SI', done: false },
        ],
      }),
    ],
  });

  assert.match(summary, /Sciences physiques/);
  assert.match(summary, /Montage en série/);
  assert.match(summary, /Circuit simple/);
  assert.match(summary, /U = R × I/);
  assert.match(summary, /Ohm \(Ω\)/);
  assert.match(summary, /\[x\] Tracer la courbe U\(I\)/);
  assert.equal(summary.includes('base64,'), false);
});

test('computeChecklistStats counts done and total items across checklist blocks', () => {
  const stats = computeChecklistStats([
    createBlock('text', { text: 'Intro' }),
    createBlock('checklist', {
      items: [
        { id: 'a', label: 'Étape 1', done: true },
        { id: 'b', label: 'Étape 2', done: false },
        { id: 'c', label: 'Étape 3', done: true },
      ],
    }),
  ]);
  assert.deepEqual(stats, { total: 3, done: 2 });
});

test('buildTemplateBlocks produces valid structured templates for every template id', () => {
  const ids = ['blank', 'fiche', 'schema', 'flashcards', 'chrono'] as const;
  for (const id of ids) {
    const tpl = buildTemplateBlocks(id, 'SVT');
    assert.ok(tpl.title.includes('SVT'));
    assert.ok(tpl.blocks.length >= 1);
  }
});

test('createCustomTile preserves h=34 geometry and initializes starter blocks', () => {
  const tile = createCustomTile(DEFAULT_SCREEN_LAYOUTS[0], 0, 'Mathématiques');
  assert.equal(tile.isCustom, true);
  assert.equal(tile.h, 34);
  assert.equal(tile.subject, 'Mathématiques');
  assert.ok(Array.isArray(tile.blocks) && tile.blocks.length === 1);
  assert.equal(tile.blocks[0].type, 'text');
});
