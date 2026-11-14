import { TileRect } from './bentoLayout';

export type CustomTileTheme = 'default' | 'azure' | 'emerald' | 'amber' | 'violet';

export type CustomTileBlockType =
  | 'text'
  | 'image'
  | 'sketch'
  | 'checklist'
  | 'flashcard'
  | 'formula'
  | 'table'
  | 'timer';

export interface CustomTileChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface CustomTileTableRow {
  id: string;
  left: string;
  right: string;
}

export type CustomTileBlock =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'image'; dataUrl: string; caption: string }
  | { id: string; type: 'sketch'; dataUrl: string; caption: string }
  | { id: string; type: 'checklist'; items: CustomTileChecklistItem[] }
  | { id: string; type: 'flashcard'; question: string; answer: string }
  | { id: string; type: 'formula'; label: string; expression: string; explanation?: string }
  | {
      id: string;
      type: 'table';
      leftHeader: string;
      rightHeader: string;
      rows: CustomTileTableRow[];
    }
  | { id: string; type: 'timer'; label: string; minutes: number };

export type CustomTileTemplateId = 'blank' | 'fiche' | 'schema' | 'flashcards' | 'chrono';

export const CUSTOM_TILE_THEME_STYLES: Record<
  CustomTileTheme,
  {
    label: string;
    surfaceClass: string;
    dotColor: string;
    ringClass: string;
  }
> = {
  default: {
    label: 'Neutre',
    surfaceClass: 'sg-card-l1',
    dotColor: '#64748B',
    ringClass: 'border-[#CBD5E1]',
  },
  azure: {
    label: 'Cours',
    surfaceClass:
      'bg-gradient-to-br from-[#F4F8FF]/95 to-[#E8F0FE]/90 border border-[#BFDBFE] shadow-[0_8px_24px_rgba(14,79,214,0.1)]',
    dotColor: '#0E4FD6',
    ringClass: 'border-[#93C5FD]',
  },
  emerald: {
    label: 'Méthode',
    surfaceClass:
      'bg-gradient-to-br from-[#F2FBF6]/95 to-[#E4F7EC]/90 border border-[#A7F3D0] shadow-[0_8px_24px_rgba(13,138,78,0.1)]',
    dotColor: '#0D8A4E',
    ringClass: 'border-[#6EE7B7]',
  },
  amber: {
    label: 'Mémo',
    surfaceClass:
      'bg-gradient-to-br from-[#FFFBF2]/95 to-[#FEF3C7]/85 border border-[#FDE68A] shadow-[0_8px_24px_rgba(184,93,4,0.1)]',
    dotColor: '#B85D04',
    ringClass: 'border-[#FCD34D]',
  },
  violet: {
    label: 'Schéma',
    surfaceClass:
      'bg-gradient-to-br from-[#F9F6FF]/95 to-[#EFE9FE]/90 border border-[#DDD6FE] shadow-[0_8px_24px_rgba(109,40,217,0.1)]',
    dotColor: '#6D28D9',
    ringClass: 'border-[#C4B5FD]',
  },
};

export function createBlockId(prefix = 'blk'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlock(
  type: CustomTileBlockType,
  overrides: Partial<CustomTileBlock> = {},
): CustomTileBlock {
  const id = createBlockId(type);
  switch (type) {
    case 'text':
      return { id, type: 'text', text: '', ...(overrides as Partial<{ text: string }>) };
    case 'image':
      return {
        id,
        type: 'image',
        dataUrl: '',
        caption: '',
        ...(overrides as Partial<{ dataUrl: string; caption: string }>),
      };
    case 'sketch':
      return {
        id,
        type: 'sketch',
        dataUrl: '',
        caption: 'Schéma annoté',
        ...(overrides as Partial<{ dataUrl: string; caption: string }>),
      };
    case 'checklist':
      return {
        id,
        type: 'checklist',
        items: [
          { id: createBlockId('chk'), label: 'Relire le point clé du cours', done: false },
          { id: createBlockId('chk'), label: 'Faire un exemple d’application', done: false },
        ],
        ...(overrides as Partial<{ items: CustomTileChecklistItem[] }>),
      };
    case 'flashcard':
      return {
        id,
        type: 'flashcard',
        question: 'Question clé à retenir',
        answer: 'Réponse synthétique',
        ...(overrides as Partial<{ question: string; answer: string }>),
      };
    case 'formula':
      return {
        id,
        type: 'formula',
        label: 'À retenir',
        expression: '',
        explanation: '',
        ...(overrides as Partial<{ label: string; expression: string; explanation: string }>),
      };
    case 'table':
      return {
        id,
        type: 'table',
        leftHeader: 'Notion / Terme',
        rightHeader: 'Définition / Exemple',
        rows: [
          { id: createBlockId('row'), left: '', right: '' },
          { id: createBlockId('row'), left: '', right: '' },
        ],
        ...(overrides as Partial<{
          leftHeader: string;
          rightHeader: string;
          rows: CustomTileTableRow[];
        }>),
      };
    case 'timer':
      return {
        id,
        type: 'timer',
        label: 'Séance ciblée',
        minutes: 25,
        ...(overrides as Partial<{ label: string; minutes: number }>),
      };
  }
}

export function normalizeTileBlocks(tile: Pick<TileRect, 'blocks' | 'note'>): CustomTileBlock[] {
  if (Array.isArray(tile.blocks)) {
    return tile.blocks;
  }
  const legacyNote = typeof tile.note === 'string' ? tile.note : '';
  return [{ id: 'legacy-note', type: 'text', text: legacyNote }];
}

export function summarizeCustomTileText(
  tile: Pick<TileRect, 'title' | 'note' | 'blocks' | 'subject'>,
): string {
  const blocks = normalizeTileBlocks(tile);
  const parts: string[] = [];

  if (tile.subject?.trim()) {
    parts.push(`Matière : ${tile.subject.trim()}`);
  }

  for (const blk of blocks) {
    if (blk.type === 'text' && blk.text.trim()) {
      parts.push(blk.text.trim());
    } else if (blk.type === 'image' && (blk.caption.trim() || blk.dataUrl)) {
      parts.push(blk.caption.trim() ? `Image : ${blk.caption.trim()}` : 'Image jointe');
    } else if (blk.type === 'sketch' && (blk.caption.trim() || blk.dataUrl)) {
      parts.push(blk.caption.trim() ? `Schéma dessiné : ${blk.caption.trim()}` : 'Schéma dessiné');
    } else if (blk.type === 'checklist' && blk.items.length > 0) {
      const listText = blk.items
        .filter((i) => i.label.trim())
        .map((i) => `${i.done ? '[x]' : '[ ]'} ${i.label.trim()}`)
        .join('\n');
      if (listText) parts.push(listText);
    } else if (blk.type === 'flashcard' && (blk.question.trim() || blk.answer.trim())) {
      parts.push(`Carte — Q : ${blk.question.trim()} | R : ${blk.answer.trim()}`);
    } else if (blk.type === 'formula' && (blk.expression.trim() || blk.label.trim())) {
      parts.push(
        `${blk.label.trim() || 'Formule'} : ${blk.expression.trim()}${
          blk.explanation?.trim() ? ` (${blk.explanation.trim()})` : ''
        }`,
      );
    } else if (blk.type === 'table') {
      const rowText = blk.rows
        .filter((r) => r.left.trim() || r.right.trim())
        .map((r) => `${r.left.trim()} -> ${r.right.trim()}`)
        .join(' ; ');
      if (rowText) {
        parts.push(`${blk.leftHeader} / ${blk.rightHeader} : ${rowText}`);
      }
    } else if (blk.type === 'timer') {
      parts.push(`Minuteur : ${blk.label} (${blk.minutes} min)`);
    }
  }

  if (parts.length === 0 && typeof tile.note === 'string' && tile.note.trim()) {
    return tile.note.trim();
  }

  return parts.join('\n\n');
}

export function computeChecklistStats(blocks: readonly CustomTileBlock[]): {
  total: number;
  done: number;
} {
  let total = 0;
  let done = 0;
  for (const blk of blocks) {
    if (blk.type === 'checklist') {
      for (const item of blk.items) {
        total += 1;
        if (item.done) done += 1;
      }
    }
  }
  return { total, done };
}

export function buildTemplateBlocks(
  templateId: CustomTileTemplateId,
  subject?: string,
): { title: string; theme: CustomTileTheme; blocks: CustomTileBlock[] } {
  const subjSuffix = subject ? ` · ${subject}` : '';
  switch (templateId) {
    case 'fiche':
      return {
        title: `Fiche de synthèse${subjSuffix}`,
        theme: 'azure',
        blocks: [
          createBlock('formula', {
            label: 'Idée / Formule centrale',
            expression: 'Écris ici la règle, la formule ou la définition à connaître par cœur.',
          }),
          createBlock('text', {
            text: 'Points essentiels expliqués avec tes propres mots :',
          }),
          createBlock('checklist', {
            items: [
              { id: createBlockId('chk'), label: 'Comprendre la définition', done: false },
              { id: createBlockId('chk'), label: 'Refaire un exemple sans regarder', done: false },
            ],
          }),
        ],
      };
    case 'schema':
      return {
        title: `Planche schéma${subjSuffix}`,
        theme: 'violet',
        blocks: [
          createBlock('sketch', {
            caption: 'Trace ton schéma, graphe ou figure puis annote les éléments clés.',
          }),
          createBlock('text', {
            text: 'Légende et observations :',
          }),
        ],
      };
    case 'flashcards':
      return {
        title: `Pack mémoire${subjSuffix}`,
        theme: 'amber',
        blocks: [
          createBlock('flashcard', {
            question: 'Question 1 : Quel est le concept principal ?',
            answer: 'Clique pour modifier la réponse attendue.',
          }),
          createBlock('flashcard', {
            question: 'Question 2 : Quelle formule ou date appliquer ?',
            answer: 'Réponse / formule à retenir.',
          }),
        ],
      };
    case 'chrono':
      return {
        title: `Objectif de séance${subjSuffix}`,
        theme: 'emerald',
        blocks: [
          createBlock('timer', {
            label: 'Concentration sans distraction',
            minutes: 25,
          }),
          createBlock('checklist', {
            items: [
              { id: createBlockId('chk'), label: 'Relire le chapitre ciblé', done: false },
              { id: createBlockId('chk'), label: 'Résoudre 2 exercices complets', done: false },
              { id: createBlockId('chk'), label: 'Vérifier mes erreurs', done: false },
            ],
          }),
        ],
      };
    case 'blank':
    default:
      return {
        title: `Nouveau carreau${subjSuffix}`,
        theme: 'default',
        blocks: [createBlock('text', { text: '' })],
      };
  }
}

export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1080,
  quality = 0.82,
): Promise<string> {
  const rawUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Impossible de lire ce fichier image.'));
      }
    };
    reader.onerror = () => reject(new Error('Lecture du fichier image échouée.'));
    reader.readAsDataURL(file);
  });

  if (typeof document === 'undefined' || file.type === 'image/svg+xml') {
    return rawUrl;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
      const targetW = Math.max(1, Math.round(img.width * ratio));
      const targetH = Math.max(1, Math.round(img.height * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      try {
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(mime, mime === 'image/png' ? undefined : quality);
        resolve(compressed.length < rawUrl.length ? compressed : rawUrl);
      } catch {
        resolve(rawUrl);
      }
    };
    img.onerror = () => resolve(rawUrl);
    img.src = rawUrl;
  });
}
