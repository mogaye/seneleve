export type CycleId = 'prescolaire' | 'elementaire' | 'moyen' | 'lycee';

export interface CycleDef {
  id: CycleId;
  label: string;
  shortLabel: string;
  code: string;
}

export interface ClassDef {
  id: string;
  label: string;
  shortLabel: string;
  cycle: CycleId;
  examTag?: string;
}

export interface SerieDef {
  id: string;
  label: string;
  group: 'Générale' | 'Technique' | 'Spéciale';
}

export interface SubjectItem {
  id: string;
  name: string;
  domain: string;
  dominant: boolean;
}

export const CYCLES: readonly CycleDef[] = [
  { id: 'prescolaire', label: 'Préscolaire', shortLabel: 'Préscolaire', code: 'PS' },
  { id: 'elementaire', label: 'Élémentaire', shortLabel: 'Élémentaire', code: 'EL' },
  { id: 'moyen', label: 'Moyen', shortLabel: 'Moyen', code: 'CL' },
  { id: 'lycee', label: 'Lycée', shortLabel: 'Lycée', code: 'LY' },
] as const;

export const CLASSES: readonly ClassDef[] = [
  // Préscolaire
  { id: 'ps', label: 'Petite Section', shortLabel: 'PS', cycle: 'prescolaire' },
  { id: 'ms', label: 'Moyenne Section', shortLabel: 'MS', cycle: 'prescolaire' },
  { id: 'gs', label: 'Grande Section', shortLabel: 'GS', cycle: 'prescolaire' },
  // Élémentaire
  { id: 'ci', label: 'CI', shortLabel: 'CI', cycle: 'elementaire' },
  { id: 'cp', label: 'CP', shortLabel: 'CP', cycle: 'elementaire' },
  { id: 'ce1', label: 'CE1', shortLabel: 'CE1', cycle: 'elementaire' },
  { id: 'ce2', label: 'CE2', shortLabel: 'CE2', cycle: 'elementaire' },
  { id: 'cm1', label: 'CM1', shortLabel: 'CM1', cycle: 'elementaire' },
  { id: 'cm2', label: 'CM2', shortLabel: 'CM2', cycle: 'elementaire', examTag: 'CFEE' },
  // Moyen
  { id: '6e', label: '6e', shortLabel: '6e', cycle: 'moyen' },
  { id: '5e', label: '5e', shortLabel: '5e', cycle: 'moyen' },
  { id: '4e', label: '4e', shortLabel: '4e', cycle: 'moyen' },
  { id: '3e', label: '3e', shortLabel: '3e', cycle: 'moyen', examTag: 'BFEM' },
  // Lycée
  { id: 'seconde', label: 'Seconde', shortLabel: '2nde', cycle: 'lycee' },
  { id: 'premiere', label: 'Première', shortLabel: '1re', cycle: 'lycee' },
  { id: 'terminale', label: 'Terminale', shortLabel: 'Tle', cycle: 'lycee', examTag: 'Baccalauréat' },
] as const;

export const LYCEE_SERIES: readonly SerieDef[] = [
  { id: 'L1a', label: 'L1a', group: 'Générale' },
  { id: 'L1b', label: 'L1b', group: 'Générale' },
  { id: "L'1", label: "L'1", group: 'Générale' },
  { id: 'L2', label: 'L2', group: 'Générale' },
  { id: 'S1', label: 'S1', group: 'Générale' },
  { id: 'S2', label: 'S2', group: 'Générale' },
  { id: 'S3', label: 'S3', group: 'Technique' },
  { id: 'S4', label: 'S4', group: 'Technique' },
  { id: 'S5', label: 'S5', group: 'Technique' },
  { id: 'STEG', label: 'STEG', group: 'Technique' },
  { id: 'STIDD', label: 'STIDD', group: 'Technique' },
  { id: 'F6', label: 'F6', group: 'Technique' },
  { id: 'FA', label: 'Franco-arabe', group: 'Spéciale' },
] as const;

export const SECONDE_OPTIONS: readonly SerieDef[] = [
  { id: 'TC', label: 'Tronc commun', group: 'Générale' },
  { id: '2nde-S', label: 'Seconde S', group: 'Générale' },
  { id: '2nde-L', label: 'Seconde L', group: 'Générale' },
  { id: '2nde-STEG', label: 'Seconde G / STEG', group: 'Technique' },
  { id: '2nde-Tech', label: 'Seconde Tech', group: 'Technique' },
  { id: 'FA', label: 'Franco-arabe', group: 'Spéciale' },
] as const;

const PRESCOLAIRE_SUBJECTS: Record<string, readonly SubjectItem[]> = {
  ps: [
    { id: 'ps-lang', name: 'Langage et communication', domain: 'Oral & écoute', dominant: true },
    { id: 'ps-math', name: 'Premiers apprentissages mathématiques', domain: 'Formes & quantités', dominant: true },
    { id: 'ps-milieu', name: 'Découverte du milieu', domain: 'Vivant & objets', dominant: true },
    { id: 'ps-motricite', name: 'Motricité', domain: 'Gestes & sécurité', dominant: false },
    { id: 'ps-social', name: 'Vie sociale et autonomie', domain: 'Vivre ensemble', dominant: false },
    { id: 'ps-arts', name: 'Éducation artistique et sensorielle', domain: 'Dessin & chant', dominant: false },
    { id: 'ps-hygiene', name: 'Hygiène et santé', domain: 'Prévention', dominant: false },
  ],
  ms: [
    { id: 'ms-lang', name: 'Langage oral', domain: 'Expression & récits', dominant: true },
    { id: 'ms-prelect', name: 'Préparation lecture-écriture', domain: 'Sons & graphisme', dominant: true },
    { id: 'ms-math', name: 'Mathématiques', domain: 'Dénombrement & formes', dominant: true },
    { id: 'ms-monde', name: 'Découverte du monde', domain: 'Vivant & matériaux', dominant: true },
    { id: 'ms-motricite', name: 'Motricité et activités physiques', domain: 'Parcours & jeux', dominant: false },
    { id: 'ms-arts', name: 'Arts', domain: 'Couleurs & rythme', dominant: false },
    { id: 'ms-vie', name: 'Vie collective', domain: 'Coopération', dominant: false },
  ],
  gs: [
    { id: 'gs-prelect', name: 'Langage et prélecture', domain: 'Phonologie & récits', dominant: true },
    { id: 'gs-preecrit', name: 'Préécriture', domain: 'Graphisme & lettres', dominant: true },
    { id: 'gs-math', name: 'Mathématiques', domain: 'Calcul & mesures', dominant: true },
    { id: 'gs-monde', name: 'Découverte du monde', domain: 'Temps, espace & santé', dominant: true },
    { id: 'gs-civique', name: 'Éducation sociale et civique', domain: 'Règles & égalité', dominant: false },
    { id: 'gs-epsa', name: 'Éducation physique et artistique', domain: 'Motricité & arts', dominant: false },
    { id: 'gs-ci', name: 'Transition vers le CI', domain: 'Autonomie & livres', dominant: false },
  ],
};

const ELEMENTAIRE_SUBJECTS: readonly SubjectItem[] = [
  { id: 'el-lc', name: 'Langue et communication', domain: 'Français · Lecture · Écriture', dominant: true },
  { id: 'el-math', name: 'Mathématiques', domain: 'Numérique · Géométrie · Mesures', dominant: true },
  { id: 'el-esvs', name: 'Éducation science et vie sociale', domain: 'Histoire · Géo · Sciences · Civisme', dominant: true },
  { id: 'el-epsa', name: 'Éducation physique, sportive et artistique', domain: 'EPS · Arts plastiques · Musique', dominant: false },
];

const MOYEN_SUBJECTS: readonly SubjectItem[] = [
  { id: 'moy-fr', name: 'Français', domain: 'Lecture · Grammaire · Rédaction', dominant: true },
  { id: 'moy-math', name: 'Mathématiques', domain: 'Algèbre · Géométrie · Problèmes', dominant: true },
  { id: 'moy-ang', name: 'Anglais', domain: 'Compréhension & expression', dominant: true },
  { id: 'moy-hist', name: 'Histoire', domain: 'Afrique · Sénégal · Monde', dominant: true },
  { id: 'moy-geo', name: 'Géographie', domain: 'Espaces · Population · Ressources', dominant: true },
  { id: 'moy-svt', name: 'SVT', domain: 'Vivant · Santé · Environnement', dominant: true },
  { id: 'moy-sp', name: 'Sciences physiques', domain: 'Matière · Électricité · Mécanique', dominant: true },
  { id: 'moy-tech', name: 'Technologie', domain: 'Objets & systèmes techniques', dominant: false },
  { id: 'moy-ec', name: 'Éducation civique', domain: 'Citoyenneté & institutions', dominant: false },
  { id: 'moy-eps', name: 'EPS / Arts', domain: 'Sport & expression artistique', dominant: false },
];

function buildLyceeSubjects(classId: string, serieId: string): readonly SubjectItem[] {
  const hasPhilo = classId === 'premiere' || classId === 'terminale';
  const baseGeneral: SubjectItem[] = [
    { id: 'ly-fr', name: 'Français / Littérature', domain: 'Analyse · Dissertation · Commentaire', dominant: true },
    ...(hasPhilo
      ? [{ id: 'ly-philo', name: 'Philosophie', domain: 'Réflexion & méthodologie', dominant: serieId.startsWith('L') }]
      : []),
    { id: 'ly-hg', name: 'Histoire-Géographie', domain: 'Documents · Cartes · Enjeux', dominant: serieId === 'L2' },
    { id: 'ly-lv', name: 'Langues vivantes', domain: 'Anglais · LV2', dominant: serieId.startsWith('L') },
  ];

  const tailGeneral: SubjectItem[] = [
    { id: 'ly-eps', name: 'EPS', domain: 'Éducation physique et sportive', dominant: false },
  ];

  if (serieId === 'L1a' || serieId === 'L1b') {
    return [
      ...baseGeneral,
      { id: 'ly-anc', name: serieId === 'L1a' ? 'Langues anciennes (Grec)' : 'Langues anciennes (Latin)', domain: 'Traduction & civilisation', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Formation générale', dominant: false },
      { id: 'ly-svt', name: 'SVT', domain: 'Formation générale', dominant: false },
      ...tailGeneral,
    ];
  }

  if (serieId === "L'1" || serieId === '2nde-L') {
    return [
      ...baseGeneral,
      { id: 'ly-civ', name: 'Langues et civilisations modernes', domain: 'Expression & culture', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Tronc commun', dominant: false },
      { id: 'ly-svt', name: 'SVT', domain: 'Tronc commun', dominant: false },
      ...tailGeneral,
    ];
  }

  if (serieId === 'L2') {
    return [
      ...baseGeneral,
      { id: 'ly-shs', name: 'Sciences humaines et sociales', domain: 'Sociétés & analyse', dominant: true },
      { id: 'ly-svt', name: 'SVT', domain: 'Biologie & santé', dominant: false },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Méthodes quantitatives', dominant: false },
      ...tailGeneral,
    ];
  }

  if (serieId === 'S1' || serieId === '2nde-S') {
    return [
      { id: 'ly-math', name: 'Mathématiques', domain: 'Analyse · Algèbre · Géométrie', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques', domain: 'Physique & Chimie approfondies', dominant: true },
      { id: 'ly-svt', name: 'SVT', domain: 'Biologie & physiologie', dominant: serieId === '2nde-S' },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'S2') {
    return [
      { id: 'ly-svt', name: 'SVT', domain: 'Sciences expérimentales', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques', domain: 'Physique & Chimie', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Fonctions & probabilités', dominant: true },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'S3') {
    return [
      { id: 'ly-math', name: 'Mathématiques', domain: 'Sciences exactes', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques', domain: 'Mécanique · Électromagnétisme', dominant: true },
      { id: 'ly-si', name: 'Sciences et techniques de l’ingénieur', domain: 'Conception & technologie', dominant: true },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'S4' || serieId === 'S5') {
    return [
      {
        id: 'ly-agro',
        name: serieId === 'S4' ? 'Agriculture et environnement' : 'Productions et transformations agroalimentaires',
        domain: 'Spécialité agronomique',
        dominant: true,
      },
      { id: 'ly-svt', name: 'SVT', domain: 'Sciences biologiques', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques', domain: 'Bases expérimentales', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Outils scientifiques', dominant: false },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'STEG' || serieId === '2nde-STEG') {
    return [
      { id: 'ly-eco', name: 'Économie et gestion', domain: 'Principes & organisation', dominant: true },
      { id: 'ly-compta', name: 'Comptabilité et outils de gestion', domain: 'Méthodes quantitatives & commerce', dominant: true },
      { id: 'ly-math', name: 'Mathématiques appliquées', domain: 'Gestion & statistiques', dominant: true },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'STIDD' || serieId === '2nde-Tech') {
    return [
      { id: 'ly-tech', name: 'Technologie industrielle', domain: 'Conception · Fabrication · Électrotechnique', dominant: true },
      { id: 'ly-pa', name: 'Physique appliquée', domain: 'Énergie & systèmes', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Sciences appliquées', dominant: true },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'F6') {
    return [
      { id: 'ly-chimie', name: 'Chimie et techniques de laboratoire', domain: 'Analyse & travaux pratiques', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques', domain: 'Physique expérimentale', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Calcul scientifique', dominant: true },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  if (serieId === 'FA') {
    return [
      { id: 'ly-arabe', name: 'Langue et disciplines arabes', domain: 'Programme franco-arabe renforcé', dominant: true },
      { id: 'ly-math', name: 'Mathématiques', domain: 'Programme général', dominant: true },
      { id: 'ly-sp', name: 'Sciences physiques / SVT', domain: 'Programme général', dominant: false },
      ...baseGeneral,
      ...tailGeneral,
    ];
  }

  // Tronc commun Seconde
  return [
    { id: 'ly-fr', name: 'Français', domain: 'Compréhension · Analyse · Expression', dominant: true },
    { id: 'ly-math', name: 'Mathématiques', domain: 'Algèbre · Fonctions · Géométrie', dominant: true },
    { id: 'ly-lv', name: 'Langues vivantes', domain: 'Communication écrite & orale', dominant: true },
    { id: 'ly-hg', name: 'Histoire-Géographie', domain: 'Repères, cartes et documents', dominant: true },
    { id: 'ly-svt', name: 'SVT', domain: 'Vivant, santé et environnement', dominant: false },
    { id: 'ly-sp', name: 'Sciences physiques', domain: 'Matière, énergie et mouvements', dominant: false },
    { id: 'ly-ec', name: 'Éducation civique et EPS', domain: 'Citoyenneté & sport', dominant: false },
  ];
}

export function getClassesForCycle(cycle: CycleId): readonly ClassDef[] {
  return CLASSES.filter((c) => c.cycle === cycle);
}

export function getSeriesForClass(classId: string): readonly SerieDef[] {
  if (classId === 'seconde') return SECONDE_OPTIONS;
  if (classId === 'premiere' || classId === 'terminale') return LYCEE_SERIES;
  return [];
}

export function getDefaultSerieForClass(classId: string): string {
  if (classId === 'seconde') return 'TC';
  if (classId === 'premiere' || classId === 'terminale') return 'S2';
  return '';
}

export function getClassById(classId: string): ClassDef {
  return CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
}

export function getSubjectsForSelection(
  cycle: CycleId,
  classId: string,
  serieId: string,
  dominantOnly = false,
): readonly SubjectItem[] {
  let list: readonly SubjectItem[] = [];
  if (cycle === 'prescolaire') {
    list = PRESCOLAIRE_SUBJECTS[classId] ?? PRESCOLAIRE_SUBJECTS.ps;
  } else if (cycle === 'elementaire') {
    list = ELEMENTAIRE_SUBJECTS;
  } else if (cycle === 'moyen') {
    list = MOYEN_SUBJECTS;
  } else {
    list = buildLyceeSubjects(classId, serieId || getDefaultSerieForClass(classId));
  }

  if (!dominantOnly) return list;
  const filtered = list.filter((item) => item.dominant);
  return filtered.length > 0 ? filtered : list;
}
