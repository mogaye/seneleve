import { CLASS_LEVELS_FULL, ClassLevel, getSeriesForClass, SerieOption } from '../data/studyData';
import { TileRect } from './bentoLayout';
import { FormatIndex } from './wireframeState';

export interface SubjectTutorPersona {
  name: string;
  initial: string;
  subject: string;
  roleLabel: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  tip: string;
}

export interface ExerciseCorrectionResult {
  isCorrect: boolean;
  scoreLabel: string;
  feedback: string;
  steps: string[];
  nextTip: string;
}

export interface NoveltyAnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestedQuestion: string;
}

export type SiteControlAction =
  | { type: 'navigate'; formatIndex: FormatIndex }
  | { type: 'set_class'; classLevel: ClassLevel; serie?: SerieOption | null }
  | { type: 'open_revision_tab'; tab: 'Quiz' | 'Flashcards' | 'Résumé' | 'Planning' }
  | { type: 'add_note_tile'; title: string; note: string }
  | { type: 'toggle_focus'; enabled: boolean };

export interface TutorChatMessage {
  id: string;
  role: 'user' | 'tutor';
  tutorName?: string;
  text: string;
  actions?: SiteControlAction[];
}

export interface SiteNoveltyItem {
  id: string;
  screenIndex: FormatIndex;
  title: string;
  note: string;
}

const SUBJECT_TUTOR_MAP: Record<string, { name: string; roleLabel: string }> = {
  'Français': { name: 'Clara', roleLabel: 'Accompagnement en expression & lecture' },
  'Langue et communication': { name: 'Clara', roleLabel: 'Accompagnement en langage & lecture' },
  'Langage et communication': { name: 'Clara', roleLabel: 'Accompagnement en langage & expression' },
  'Langage oral': { name: 'Clara', roleLabel: 'Accompagnement en expression orale' },
  'Langage et prélecture': { name: 'Clara', roleLabel: 'Accompagnement en langage & prélecture' },
  'Préparation à la lecture-écriture': { name: 'Clara', roleLabel: 'Accompagnement lecture-écriture' },
  'Préécriture': { name: 'Clara', roleLabel: 'Accompagnement graphisme & écriture' },
  'Mathématiques': { name: 'Léo', roleLabel: 'Accompagnement en logique & calcul' },
  'Premiers apprentissages mathématiques': { name: 'Léo', roleLabel: 'Accompagnement éveil mathématique' },
  'Méthodes quantitatives / Mathématiques': { name: 'Léo', roleLabel: 'Accompagnement méthodes quantitatives' },
  'Anglais': { name: 'Sofia', roleLabel: 'Accompagnement en anglais' },
  'Langues vivantes': { name: 'Sofia', roleLabel: 'Accompagnement en langues vivantes' },
  'Langues anciennes (Grec / Latin)': { name: 'Sofia', roleLabel: 'Accompagnement langues anciennes' },
  'Histoire': { name: 'Adam', roleLabel: 'Accompagnement en histoire' },
  'Histoire-Géographie': { name: 'Adam', roleLabel: 'Accompagnement en histoire-géographie' },
  'Géographie': { name: 'Elena', roleLabel: 'Accompagnement en géographie' },
  'SVT': { name: 'Nadia', roleLabel: 'Accompagnement en sciences de la vie et de la terre' },
  'SVT / Sciences physiques': { name: 'Nadia', roleLabel: 'Accompagnement en sciences expérimentales' },
  'Découverte du milieu': { name: 'Nadia', roleLabel: 'Accompagnement découverte du milieu' },
  'Découverte du monde': { name: 'Nadia', roleLabel: 'Accompagnement découverte du monde' },
  'Éducation à la science et à la vie sociale': { name: 'Nadia', roleLabel: 'Accompagnement sciences & vie sociale' },
  'Sciences physiques': { name: 'Sami', roleLabel: 'Accompagnement en physique & chimie' },
  'Physique appliquée': { name: 'Sami', roleLabel: 'Accompagnement en physique appliquée' },
  'Chimie & Techniques de laboratoire': { name: 'Sami', roleLabel: 'Accompagnement chimie & laboratoire' },
  'Philosophie': { name: 'Idris', roleLabel: 'Accompagnement en philosophie & dissertation' },
  'Technologie': { name: 'Noah', roleLabel: 'Accompagnement en technologie' },
  'Sciences et technologies': { name: 'Noah', roleLabel: 'Accompagnement sciences & technologies' },
  'Sciences et technologies de l’ingénieur': { name: 'Noah', roleLabel: 'Accompagnement génie & ingénierie' },
  'Technologie industrielle & Conception': { name: 'Noah', roleLabel: 'Accompagnement conception industrielle' },
  'Économie': { name: 'Lucas', roleLabel: 'Accompagnement en économie' },
  'Gestion': { name: 'Lucas', roleLabel: 'Accompagnement en gestion' },
  'Comptabilité': { name: 'Lucas', roleLabel: 'Accompagnement en comptabilité' },
  'Économie & Gestion': { name: 'Lucas', roleLabel: 'Accompagnement économie & gestion' },
  'Arabe': { name: 'Yasmine', roleLabel: 'Accompagnement en langue arabe' },
  'Instruction islamique': { name: 'Yasmine', roleLabel: 'Accompagnement éducation religieuse' },
  'Éducation civique': { name: 'Amina', roleLabel: 'Accompagnement en éducation civique' },
  'Éducation civique & EPS': { name: 'Amina', roleLabel: 'Accompagnement civisme & sport' },
  'Vie sociale et autonomie': { name: 'Amina', roleLabel: 'Accompagnement vie sociale' },
  'Vie collective': { name: 'Amina', roleLabel: 'Accompagnement vie collective' },
  'Éducation sociale et civique': { name: 'Amina', roleLabel: 'Accompagnement éducation sociale' },
  'EPS / Arts': { name: 'Hugo', roleLabel: 'Accompagnement sport & expression artistique' },
  'Motricité': { name: 'Hugo', roleLabel: 'Accompagnement motricité & équilibre' },
  'Motricité et activités physiques': { name: 'Hugo', roleLabel: 'Accompagnement activités physiques' },
  'Éducation artistique et sensorielle': { name: 'Hugo', roleLabel: 'Accompagnement éveil artistique' },
  'Arts': { name: 'Hugo', roleLabel: 'Accompagnement arts & création' },
  'Éducation physique et artistique': { name: 'Hugo', roleLabel: 'Accompagnement éducation physique & arts' },
  'Éducation physique, sportive et artistique': { name: 'Hugo', roleLabel: 'Accompagnement sport & arts' },
  'Agriculture et environnement': { name: 'Gabriel', roleLabel: 'Accompagnement agronomie & environnement' },
  'Productions et transformations agroalimentaires': { name: 'Gabriel', roleLabel: 'Accompagnement agroalimentaire' },
  'Hygiène et santé': { name: 'Sara', roleLabel: 'Accompagnement hygiène & santé' },
  'Préparation à l’élémentaire': { name: 'Inès', roleLabel: 'Accompagnement passerelle élémentaire' },
};

const UNIVERSAL_FALLBACK_NAMES = [
  'Maya',
  'Rayan',
  'Lina',
  'Amir',
  'Chloé',
  'Tariq',
  'Eva',
  'Samir',
] as const;

export function getSubjectTutor(subject?: string | null): SubjectTutorPersona {
  const clean = (subject ?? '').trim();
  if (!clean || clean === 'Toutes') {
    return {
      name: 'Maya',
      initial: 'M',
      subject: 'Toutes les matières',
      roleLabel: 'Coordination générale de ton espace d’étude',
    };
  }

  const exact = SUBJECT_TUTOR_MAP[clean];
  if (exact) {
    return {
      name: exact.name,
      initial: exact.name.charAt(0).toUpperCase(),
      subject: clean,
      roleLabel: exact.roleLabel,
    };
  }

  const lower = clean.toLowerCase();
  const fuzzyEntry = Object.entries(SUBJECT_TUTOR_MAP).find(([key]) =>
    lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower),
  );
  if (fuzzyEntry) {
    return {
      name: fuzzyEntry[1].name,
      initial: fuzzyEntry[1].name.charAt(0).toUpperCase(),
      subject: clean,
      roleLabel: fuzzyEntry[1].roleLabel,
    };
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const fallbackName = UNIVERSAL_FALLBACK_NAMES[hash % UNIVERSAL_FALLBACK_NAMES.length];
  return {
    name: fallbackName,
    initial: fallbackName.charAt(0).toUpperCase(),
    subject: clean,
    roleLabel: `Accompagnement en ${clean}`,
  };
}

export function extractSiteNovelties(
  layouts: Record<FormatIndex, TileRect[]>,
): SiteNoveltyItem[] {
  const items: SiteNoveltyItem[] = [];
  ([0, 1, 2, 3] as FormatIndex[]).forEach((screenIndex) => {
    const tiles = layouts[screenIndex] ?? [];
    tiles.forEach((tile) => {
      if (tile.isCustom) {
        items.push({
          id: tile.id,
          screenIndex,
          title: tile.title?.trim() || 'Nouveau carreau',
          note: tile.note?.trim() || '',
        });
      }
    });
  });
  return items;
}

export function sanitizeSiteActions(rawActions: unknown): SiteControlAction[] {
  if (!Array.isArray(rawActions)) return [];
  const valid: SiteControlAction[] = [];

  for (const item of rawActions) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const type = obj.type;

    if (type === 'navigate') {
      const idx = Number(obj.formatIndex);
      if (Number.isInteger(idx) && idx >= 0 && idx <= 3) {
        valid.push({ type: 'navigate', formatIndex: idx as FormatIndex });
      }
    } else if (type === 'set_class') {
      const cls = obj.classLevel;
      if (typeof cls === 'string' && (CLASS_LEVELS_FULL as readonly string[]).includes(cls)) {
        const classLevel = cls as ClassLevel;
        const series = getSeriesForClass(classLevel);
        const requestedSerie = obj.serie;
        const matchedSerie =
          typeof requestedSerie === 'string' &&
          (series as readonly string[]).includes(requestedSerie)
            ? (requestedSerie as SerieOption)
            : undefined;
        valid.push({
          type: 'set_class',
          classLevel,
          ...(matchedSerie ? { serie: matchedSerie } : {}),
        });
      }
    } else if (type === 'open_revision_tab') {
      const tab = obj.tab;
      if (
        tab === 'Quiz' ||
        tab === 'Flashcards' ||
        tab === 'Résumé' ||
        tab === 'Planning'
      ) {
        valid.push({ type: 'open_revision_tab', tab });
      }
    } else if (type === 'add_note_tile') {
      const title = typeof obj.title === 'string' ? obj.title.trim() : '';
      const note = typeof obj.note === 'string' ? obj.note.trim() : '';
      if (title || note) {
        valid.push({
          type: 'add_note_tile',
          title: title || 'Fiche d’étude',
          note: note || title,
        });
      }
    } else if (type === 'toggle_focus') {
      if (typeof obj.enabled === 'boolean') {
        valid.push({ type: 'toggle_focus', enabled: obj.enabled });
      }
    }
  }

  return valid;
}

export function describeSiteAction(action: SiteControlAction): string {
  const screenNames: Record<FormatIndex, string> = {
    0: 'Cours',
    1: 'Entraînement',
    2: 'Révisions',
    3: 'Préparation Examen',
  };

  switch (action.type) {
    case 'navigate':
      return `Ouverture de ${screenNames[action.formatIndex]}`;
    case 'set_class':
      return `Classe réglée sur ${action.classLevel}${action.serie ? ` (${action.serie})` : ''}`;
    case 'open_revision_tab':
      return `Onglet ${action.tab} ouvert`;
    case 'add_note_tile':
      return `Carreau ajouté : ${action.title}`;
    case 'toggle_focus':
      return action.enabled ? 'Mode Focus activé' : 'Mode Focus quitté';
  }
}
