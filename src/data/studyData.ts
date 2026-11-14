export type SchoolCycle = 'Préscolaire' | 'Élémentaire' | 'Collège' | 'Lycée';

export const CLASS_LEVELS_FULL = [
  'Petite Section',
  'Moyenne Section',
  'Grande Section',
  'CI',
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6e',
  '5e',
  '4e',
  '3e',
  '2nde',
  '1re',
  'Terminale',
] as const;

export type ClassLevel = (typeof CLASS_LEVELS_FULL)[number];

export const BAC_SERIES = [
  'L1a/L1b',
  'L’1',
  'L2',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'STEG',
  'STIDD',
  'F6',
  'Franco-arabe',
] as const;

export const SECONDE_SERIES = [
  'Tronc commun',
  'Orientation S',
  'Orientation L',
  'Orientation STEG',
  'Technique (STIDD / F6)',
  'Franco-arabe',
] as const;

export type SerieOption =
  | (typeof SECONDE_SERIES)[number]
  | (typeof BAC_SERIES)[number];

export interface ClassMeta {
  id: ClassLevel;
  cycle: SchoolCycle;
  cycleClass: 'cycle-prescolaire' | 'cycle-elementaire' | 'cycle-college' | 'cycle-lycee';
  series: readonly SerieOption[];
  examLabel: string;
}

export const CLASS_CATALOG: readonly ClassMeta[] = [
  { id: 'Petite Section', cycle: 'Préscolaire', cycleClass: 'cycle-prescolaire', series: [], examLabel: 'Observation des acquis' },
  { id: 'Moyenne Section', cycle: 'Préscolaire', cycleClass: 'cycle-prescolaire', series: [], examLabel: 'Observation des acquis' },
  { id: 'Grande Section', cycle: 'Préscolaire', cycleClass: 'cycle-prescolaire', series: [], examLabel: 'Bilan de fin de cycle' },
  { id: 'CI', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CP', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation d’étape' },
  { id: 'CE1', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CE2', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation d’étape' },
  { id: 'CM1', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CM2', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'CFEE' },
  { id: '6e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '5e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '4e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '3e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'BFEM' },
  { id: '2nde', cycle: 'Lycée', cycleClass: 'cycle-lycee', series: SECONDE_SERIES, examLabel: 'Devoir de niveau' },
  { id: '1re', cycle: 'Lycée', cycleClass: 'cycle-lycee', series: BAC_SERIES, examLabel: 'Épreuve de niveau' },
  { id: 'Terminale', cycle: 'Lycée', cycleClass: 'cycle-lycee', series: BAC_SERIES, examLabel: 'Baccalauréat' },
];

export type ExerciseCategory =
  | 'Exercices par leçon'
  | 'Devoirs'
  | 'Sujets d’examen'
  | 'Corrigés';

export type DifficultyLevel = 'Découverte' | 'Entraînement' | 'Défi';
export type SubjectStatus = 'À commencer' | 'En cours' | 'Révisée';

export interface LessonItem {
  id: string;
  title: string;
  subject: string;
  objectif: string;
  notions: string[];
  courseStatusNote: string;
  summary: string;
  flashcards: { question: string; answer: string }[];
}

export interface ExerciseModuleItem {
  id: string;
  category: ExerciseCategory;
  subject: string;
  lessonTitle: string;
  difficulty: DifficultyLevel;
  competence: string;
  checkpoints: string[];
}

export interface ClassExperience {
  classLevel: ClassLevel;
  cycle: SchoolCycle;
  cycleClass: 'cycle-prescolaire' | 'cycle-elementaire' | 'cycle-college' | 'cycle-lycee';
  serie: SerieOption | null;
  examLabel: string;
  subjects: string[];
  lessons: LessonItem[];
  exercises: ExerciseModuleItem[];
}

interface SubjectSpec {
  subject: string;
  title: string;
  objectif: string;
  notions: string[];
}

export function getClassMeta(classLevel: ClassLevel): ClassMeta {
  return CLASS_CATALOG.find((c) => c.id === classLevel) ?? CLASS_CATALOG[3];
}

export function getSeriesForClass(classLevel: ClassLevel): readonly SerieOption[] {
  return getClassMeta(classLevel).series;
}

export function getDefaultSerieForClass(classLevel: ClassLevel): SerieOption | null {
  const series = getSeriesForClass(classLevel);
  if (series.length === 0) return null;
  if (series.includes('Tronc commun' as SerieOption)) return 'Tronc commun';
  if (series.includes('S2' as SerieOption)) return 'S2';
  return series[0];
}

function getPrescolaireSpecs(classLevel: 'Petite Section' | 'Moyenne Section' | 'Grande Section'): SubjectSpec[] {
  if (classLevel === 'Petite Section') {
    return [
      {
        subject: 'Langage et communication',
        title: 'Écoute, expression et comptines',
        objectif: 'Comprendre des consignes simples et nommer son environnement familier.',
        notions: [
          'Écouter et comprendre des consignes simples',
          'Nommer les personnes et objets familiers, exprimer un besoin',
          'Participer à une comptine ou à une histoire',
        ],
      },
      {
        subject: 'Motricité',
        title: 'Coordination motrice et sécurité',
        objectif: 'Développer l’aisance corporelle et respecter les règles de sécurité.',
        notions: [
          'Marcher, courir, sauter, lancer et manipuler',
          'Coordonner ses gestes dans l’espace',
          'Apprendre les règles simples de sécurité',
        ],
      },
      {
        subject: 'Premiers apprentissages mathématiques',
        title: 'Tri, formes et premières quantités',
        objectif: 'Classer des objets et comparer de petites quantités par manipulation.',
        notions: [
          'Trier, apparier et classer selon un critère',
          'Comparer des quantités (un / beaucoup, grand / petit)',
          'Reconnaître des formes et des positions (devant / derrière)',
        ],
      },
      {
        subject: 'Découverte du milieu',
        title: 'Corps, famille et environnement proche',
        objectif: 'Observer le vivant, les objets usuels et les phénomènes courants.',
        notions: [
          'Corps, famille, classe et maison',
          'Animaux, plantes et objets du quotidien',
          'Saisons et phénomènes observables',
        ],
      },
      {
        subject: 'Vie sociale et autonomie',
        title: 'Partage et règles de vie collective',
        objectif: 'Vivre ensemble avec respect et gagner en autonomie.',
        notions: [
          'Saluer, partager, ranger et attendre son tour',
          'Respecter les règles simples et les autres',
        ],
      },
      {
        subject: 'Éducation artistique et sensorielle',
        title: 'Arts plastiques, chant et rythme',
        objectif: 'Explorer matières, couleurs et jeux rythmiques.',
        notions: [
          'Dessin libre, peinture, modelage et collage',
          'Chant, écoute et jeux rythmiques',
        ],
      },
      {
        subject: 'Hygiène et santé',
        title: 'Propreté et prévention',
        objectif: 'Adopter les gestes d’hygiène quotidiens.',
        notions: [
          'Lavage des mains et propreté corporelle',
          'Alimentation et prévention des dangers courants',
        ],
      },
    ];
  }

  if (classLevel === 'Moyenne Section') {
    return [
      {
        subject: 'Langage oral',
        title: 'Récit court et vocabulaire',
        objectif: 'Raconter un événement, décrire une image et reformuler une consigne.',
        notions: [
          'Raconter un événement court et décrire une image',
          'Enrichir le vocabulaire usuel',
          'Écouter et reformuler une consigne',
        ],
      },
      {
        subject: 'Préparation à la lecture-écriture',
        title: 'Sons, syllabes et gestes graphiques',
        objectif: 'Développer l’écoute phonologique et la tenue de l’outil scripteur.',
        notions: [
          'Jeux de sons et de syllabes, discrimination visuelle',
          'Tenue de l’outil et gestes graphiques préparatoires',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Collections, suites et repérage',
        objectif: 'Dénombrer, comparer et se repérer dans l’espace et le temps.',
        notions: [
          'Dénombrer et comparer de petites collections',
          'Classer selon un critère et poursuivre une suite simple',
          'Reconnaître des formes et se repérer dans l’espace et le temps',
        ],
      },
      {
        subject: 'Découverte du monde',
        title: 'Observation du vivant et des matériaux',
        objectif: 'Observer et décrire le corps, le vivant et les objets proches.',
        notions: [
          'Observer et décrire le corps et le vivant',
          'Explorer objets, matériaux et milieu proche',
        ],
      },
      {
        subject: 'Motricité et activités physiques',
        title: 'Équilibre, parcours et jeux collectifs',
        objectif: 'Coordonner ses déplacements en respectant les règles.',
        notions: [
          'Équilibre, coordination et parcours moteurs',
          'Jeux collectifs et respect des règles',
        ],
      },
      {
        subject: 'Arts',
        title: 'Couleurs, chant et expression corporelle',
        objectif: 'Expérimenter création plastique, rythme et jeu dramatique.',
        notions: [
          'Expérimenter couleurs, formes et matières',
          'Chant, rythme, expression corporelle et jeu dramatique',
        ],
      },
      {
        subject: 'Vie collective',
        title: 'Autonomie, émotions et coopération',
        objectif: 'S’intégrer dans les routines et coopérer avec ses pairs.',
        notions: [
          'Autonomie dans les routines et coopération',
          'Expression des émotions, respect des autres et du matériel',
        ],
      },
    ];
  }

  return [
    {
      subject: 'Langage et prélecture',
      title: 'Récits organisés et conscience phonologique',
      objectif: 'S’exprimer en phrases organisées et reconnaître les lettres.',
      notions: [
        'Comprendre des récits, décrire et raconter en phrases organisées',
        'Conscience phonologique, reconnaissance de lettres et principe alphabétique',
      ],
    },
    {
      subject: 'Préécriture',
      title: 'Graphisme contrôlé et écriture du prénom',
      objectif: 'Maîtriser les tracés de base et copier des mots familiers.',
      notions: [
        'Graphisme contrôlé et formes de lettres',
        'Copie de signes, écriture du prénom et de mots familiers',
      ],
    },
    {
      subject: 'Mathématiques',
      title: 'Dénombrement, calcul initial et mesures',
      objectif: 'Composer des collections et aborder les premières procédures de calcul.',
      notions: [
        'Dénombrement, comparaison et composition de collections',
        'Premières procédures de calcul, suites et formes',
        'Repérage, grandeurs et mesures par manipulation',
      ],
    },
    {
      subject: 'Découverte du monde',
      title: 'Vivant, environnement et repères spatio-temporels',
      objectif: 'Comprendre la santé, la nature et les repères de temps et d’espace.',
      notions: [
        'Corps et santé, plantes, animaux et environnement',
        'Objets et usages, repères temporels et spatiaux',
      ],
    },
    {
      subject: 'Éducation sociale et civique',
      title: 'Règles communes, égalité et sécurité',
      objectif: 'Assumer des responsabilités adaptées à l’âge.',
      notions: [
        'Règles communes, coopération, égalité et respect',
        'Sécurité et responsabilités collectives',
      ],
    },
    {
      subject: 'Éducation physique et artistique',
      title: 'Habiletés motrices et arts du spectacle',
      objectif: 'Enrichir motricité, arts plastiques, musique et théâtre.',
      notions: [
        'Habiletés motrices, jeux d’opposition et de coopération',
        'Arts plastiques, musique, expression corporelle et théâtre',
      ],
    },
    {
      subject: 'Préparation à l’élémentaire',
      title: 'Attention, consignes et goût du livre',
      objectif: 'Consolider l’écoute, l’autonomie et la familiarité avec les nombres.',
      notions: [
        'Écoute, attention, autonomie et compréhension des consignes',
        'Goût des livres et familiarité avec les nombres',
      ],
    },
  ];
}

function getElementaireSpecs(classLevel: 'CI' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'): SubjectSpec[] {
  if (classLevel === 'CI') {
    return [
      {
        subject: 'Langue et communication',
        title: 'Sons, lettres, syllabes et premiers mots',
        objectif: 'Développer l’oral, le décodage des syllabes et l’écriture de mots familiers.',
        notions: [
          'Écouter, comprendre des consignes et parler de soi, de la famille et de la classe',
          'Conscience des syllabes et des sons, relation sons-lettres et graphèmes enseignés',
          'Tracer, copier et écrire lettres, syllabes, mots familiers et courtes phrases',
          'Écouter des récits et remettre en ordre des événements simples',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Dénombrement, ajout/retrait et formes simples',
        objectif: 'Manipuler les premiers nombres et résoudre oralement de petits problèmes.',
        notions: [
          'Manipuler, trier, comparer, dénombrer, lire et écrire les nombres du palier',
          'Premières situations d’ajout, de retrait et de partage par manipulation',
          'Repérage spatial, reproduction de formes simples et comparaison de grandeurs',
        ],
      },
      {
        subject: 'Éducation à la science et à la vie sociale',
        title: 'Milieu proche, vivant et règles d’hygiène',
        objectif: 'Observer son environnement proche et appliquer les règles simples de vie.',
        notions: [
          'Se connaître, connaître la famille, l’école et les lieux proches',
          'Observer le corps, animaux, plantes, eau, météo et objets usuels',
          'Règles simples d’hygiène, sécurité, respect et vie collective',
        ],
      },
      {
        subject: 'Éducation physique, sportive et artistique',
        title: 'Jeux moteurs, chants et dessin',
        objectif: 'Développer coordination motrice et expression rythmique et plastique.',
        notions: [
          'Jeux moteurs et coordination corporelle',
          'Chants, dessins, coloriages, modelages et activités rythmiques',
        ],
      },
    ];
  }

  if (classLevel === 'CP') {
    return [
      {
        subject: 'Langue et communication',
        title: 'Lecture de phrases courtes, dictée et ponctuation',
        objectif: 'Consolider le décodage, la compréhension de récits courts et l’écriture sous dictée.',
        notions: [
          'Consolider l’alphabet, le décodage et la lecture de textes courts',
          'Identifier personnages, lieu, actions et ordre des événements',
          'Copier, écrire sous dictée et produire des phrases simples ponctuées',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Addition, soustraction et groupements',
        objectif: 'Décomposer les nombres, additionner, soustraire et mesurer des grandeurs usuelles.',
        notions: [
          'Lire, écrire, comparer, ranger et décomposer les nombres du palier',
          'Addition, soustraction et approche de la multiplication/partage par groupements',
          'Problèmes de réunion, retrait, comparaison et partage ; figures et solides usuels',
        ],
      },
      {
        subject: 'Éducation à la science et à la vie sociale',
        title: 'Quartier ou village, métiers et cadre de vie',
        objectif: 'Identifier les rôles sociaux et protéger l’hygiène et l’environnement.',
        notions: [
          'Rôles dans la famille et à l’école, métiers et règles de vie',
          'Quartier ou village, saisons, plantes, animaux, eau et objets techniques simples',
          'Hygiène, sécurité, entraide et protection du cadre de vie',
        ],
      },
      {
        subject: 'Éducation physique, sportive et artistique',
        title: 'Activités physiques, plastiques et musicales',
        objectif: 'Poursuivre l’éveil sportif, musical, plastique et scénique.',
        notions: [
          'Jeux sportifs et motricité collective',
          'Activités plastiques, musicales et scéniques',
        ],
      },
    ];
  }

  if (classLevel === 'CE1') {
    return [
      {
        subject: 'Langue et communication',
        title: 'Types de textes, groupe nominal et accords simples',
        objectif: 'Lire avec fluidité et produire des phrases ou textes courts organisés.',
        notions: [
          'Textes narratifs, descriptifs et injonctifs : repérage des idées et étapes',
          'Classes de mots, groupe nominal, sujet-verbe, accords simples et ponctuation',
          'Copie, dictée, écriture cursive et conjugaison des temps usuels',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Quatre opérations, quadrillage et mesures',
        objectif: 'Poser et vérifier des calculs et résoudre des problèmes à étapes.',
        notions: [
          'Nombres, quatre opérations au palier, tables mémorisées et calculs vérifiés',
          'Problèmes à une ou plusieurs étapes ; tracés sur quadrillage avec instruments',
          'Longueurs, masses, contenances, durées, monnaie et lecture de calendrier',
        ],
      },
      {
        subject: 'Éducation à la science et à la vie sociale',
        title: 'Histoire locale, repères géographiques et vivant',
        objectif: 'Situer son milieu, découvrir le vivant et pratiquer la citoyenneté.',
        notions: [
          'Temps de l’élève, famille et histoire locale par récits et enquêtes',
          'Relief, eau, végétation, activités humaines et moyens de déplacement',
          'Santé, environnement, citoyenneté, égalité, paix et respect',
        ],
      },
      {
        subject: 'Éducation physique, sportive et artistique',
        title: 'Jeux sportifs et création artistique',
        objectif: 'Maîtriser les règles sportives et les pratiques plastiques et scéniques.',
        notions: [
          'Activités motrices et jeux sportifs collectifs',
          'Arts plastiques, musique et arts scéniques',
        ],
      },
    ];
  }

  if (classLevel === 'CE2') {
    return [
      {
        subject: 'Langue et communication',
        title: 'La lettre, paragraphes et orthographe grammaticale',
        objectif: 'Rédiger des textes structurés et consolider grammaire et conjugaison.',
        notions: [
          'Textes narratifs, descriptifs, injonctifs et informatifs (notamment la lettre)',
          'Types de phrases, noms, déterminants, adjectifs, pronoms et compléments',
          'Conjugaison des temps travaillés, orthographe lexicale et grille de révision',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Multiplication, division, symétrie et fractions simples',
        objectif: 'Maîtriser le calcul posé, la symétrie, les angles et les tableaux simples.',
        notions: [
          'Valeur de position, multiplication, division et introduction aux fractions simples',
          'Construction et comparaison de figures, angles et symétrie aux instruments',
          'Longueurs, masses, capacités, durées, monnaie, surfaces et graphiques simples',
        ],
      },
      {
        subject: 'Éducation à la science et à la vie sociale',
        title: 'Milieu naturel, eau, air et histoire du milieu',
        objectif: 'Relier l’observation scientifique aux enjeux de santé et de propreté.',
        notions: [
          'Repères de temps, histoire locale, événements et personnages du milieu',
          'Milieu naturel et humain, ressources, voies de communication et cartes simples',
          'Vivant, santé, eau, air, matériaux, objets techniques et citoyenneté',
        ],
      },
      {
        subject: 'Éducation physique, sportive et artistique',
        title: 'Compétences sportives et expression musicale',
        objectif: 'Développer esprit d’équipe et maîtrise artistique.',
        notions: [
          'Pratiques sportives et coopération',
          'Expression plastique, musicale et scénique',
        ],
      },
    ];
  }

  if (classLevel === 'CM1') {
    return [
      {
        subject: 'Langue et communication',
        title: 'Cohésion textuelle, fonctions et rédaction',
        objectif: 'Distinguer informations principales et secondaires et structurer en paragraphes.',
        notions: [
          'Lecture de textes longs, inférence et résumé ; textes narratifs, descriptifs, injonctifs, informatifs',
          'Connecteurs, reprises nominales/pronominales, nature et fonction des mots',
          'Accords, conjugaison des temps étudiés, dictée et rédaction révisée',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Nombres décimaux, fractions et géométrie plane',
        objectif: 'Calculer sur entiers, décimaux et fractions et aborder la proportionnalité simple.',
        notions: [
          'Numération entière et décimale, calcul mental/posé et problèmes en plusieurs étapes',
          'Fractions, partage, mesure et proportionnalité simple',
          'Droites, segments, angles, polygones, solides, périmètres, aires et graphiques',
        ],
      },
      {
        subject: 'Éducation à la science et à la vie sociale',
        title: 'Histoire et géographie du Sénégal en Afrique de l’Ouest',
        objectif: 'Situer le Sénégal sur carte et étudier fonctions du vivant et énergie.',
        notions: [
          'Histoire du Sénégal et sources documentaires, repères chronologiques',
          'Sénégal en Afrique de l’Ouest : cartes, paysages, ressources et population',
          'Fonctions du vivant, santé, matière, énergie, objets techniques et développement durable',
        ],
      },
      {
        subject: 'Éducation physique, sportive et artistique',
        title: 'Sports collectifs/individuels et arts',
        objectif: 'Pratiquer l’EPS et approfondir arts plastiques, musique et scène.',
        notions: [
          'EPS, sports collectifs et individuels',
          'Arts plastiques, musique et arts scéniques',
        ],
      },
    ];
  }

  // CM2
  return [
    {
      subject: 'Langue et communication',
      title: 'Analyse de textes, argumentation et maîtrise rédactionnelle',
      objectif: 'Produire des textes complets et justifier une interprétation de lecture.',
      notions: [
        'Textes narratifs, descriptifs, injonctifs, informatifs, argumentatifs et dialogués',
        'Intention, organisation, arguments, indices de cohésion et questions implicites',
        'Maîtrise complète de la grammaire, conjugaison, orthographe et rédaction',
      ],
    },
    {
      subject: 'Mathématiques',
      title: 'Décimaux, proportionnalité, aires/volumes et problèmes',
      objectif: 'Mobiliser calcul, géométrie et mesures dans des résolutions complètes.',
      notions: [
        'Numération, fractions, nombres décimaux, proportionnalité et contrôle du résultat',
        'Propriétés géométriques, symétrie, angles, polygones et solides',
        'Unités usuelles, périmètres, aires, volumes, tableaux et graphiques',
      ],
    },
    {
      subject: 'Éducation à la science et à la vie sociale',
      title: 'Territoire sénégalais, histoire africaine et démarche expérimentale',
      objectif: 'Expliquer des phénomènes scientifiques et préparer les évaluations du CFEE.',
      notions: [
        'Repères historiques du Sénégal et de l’Afrique, événements et acteurs',
        'Régions du Sénégal, paysages, ressources et enjeux environnementaux',
        'Vivant, santé, matière, énergie, expériences simples et préparation au CFEE',
      ],
    },
    {
      subject: 'Éducation physique, sportive et artistique',
      title: 'Pratiques sportives et arts de fin de cycle',
      objectif: 'Consolider les habiletés sportives et artistiques.',
      notions: [
        'EPS et sports collectifs ou individuels',
        'Arts plastiques, musique et arts scéniques',
      ],
    },
  ];
}

function getCollegeSpecs(classLevel: '6e' | '5e' | '4e' | '3e'): SubjectSpec[] {
  if (classLevel === '6e') {
    return [
      {
        subject: 'Français',
        title: 'Récit, description et phrase simple',
        objectif: 'Maîtriser la lecture de textes courts, les classes de mots et les accords de base.',
        notions: [
          'Lecture et compréhension de textes, récit et description',
          'Vocabulaire, phrase simple, classes de mots et accords de base',
          'Conjugaison des temps usuels, rédaction et expression orale',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Premiers échanges et environnement scolaire',
        objectif: 'Se présenter, saluer et utiliser les structures élémentaires.',
        notions: [
          'Se présenter, saluer, donner des informations personnelles',
          'Parler de la famille et de l’école, nombres, dates, objets et consignes',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Décimaux, fractions, figures planes et périmètres',
        objectif: 'Calculer avec les décimaux et fractions et construire les figures de base.',
        notions: [
          'Nombres décimaux, opérations, divisibilité, fractions et proportionnalité',
          'Expressions numériques, droites, segments, angles, triangles, quadrilatères et symétrie',
          'Mesures, périmètres et résolution de problèmes',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Repères chronologiques et civilisations anciennes',
        objectif: 'Utiliser les sources historiques et situer les premiers peuplements.',
        notions: [
          'Outils, repères de temps et sources historiques',
          'Premiers peuplements, civilisations anciennes et histoire africaine et sénégalaise',
        ],
      },
      {
        subject: 'Géographie',
        title: 'Cartes, globe et repères du Sénégal',
        objectif: 'Lire cartes et plans et décrire le milieu local et régional.',
        notions: [
          'Outils de la géographie, cartes et globe',
          'Milieu local et régional, grands ensembles et repères du Sénégal',
        ],
      },
      {
        subject: 'SVT / Sciences physiques',
        title: 'Initiation au vivant, à la matière, à l’eau et à l’air',
        objectif: 'Observer le vivant et les premiers phénomènes physiques.',
        notions: [
          'Observation scientifique, vivant et milieu, corps et santé',
          'Matière, objets, eau, air et phénomènes physiques d’initiation',
        ],
      },
      {
        subject: 'Technologie',
        title: 'Objets techniques et fonction d’usage',
        objectif: 'Identifier matériaux, usages et bases du dessin technique.',
        notions: [
          'Objets techniques, matériaux et fonction d’usage',
          'Dessin et premières démarches de conception ou fabrication',
        ],
      },
      {
        subject: 'Éducation civique',
        title: 'Règles de vie, droits, devoirs et institutions proches',
        objectif: 'Respecter les biens communs et la vie scolaire.',
        notions: [
          'Règles de vie, famille, école, droits et devoirs',
          'Respect des biens et des institutions proches',
        ],
      },
      {
        subject: 'EPS / Arts',
        title: 'Activités athlétiques, jeux et expression artistique',
        objectif: 'Développer endurance, coordination, dessin et musique.',
        notions: [
          'Activités athlétiques, jeux, sports collectifs et expression corporelle',
          'Dessin et musique',
        ],
      },
    ];
  }

  if (classLevel === '5e') {
    return [
      {
        subject: 'Français',
        title: 'Lecture analytique, dialogue et grammaire du texte',
        objectif: 'Structurer la rédaction narrative, descriptive et documentaire.',
        notions: [
          'Lecture analytique, narration, description, dialogue et textes documentaires',
          'Grammaire de la phrase et du texte, conjugaison, orthographe et rédaction structurée',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Vie quotidienne, habitudes et récits simples',
        objectif: 'Exprimer goûts, activités et petits récits au présent et au passé.',
        notions: [
          'Parler de la vie quotidienne, habitudes, goûts, lieux et activités',
          'Questions, descriptions et petits récits au présent et au passé simple',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Nombres relatifs, PGCD/PPCM et calcul littéral initial',
        objectif: 'Manipuler puissances, nombres premiers, fractions et géométrie plane.',
        notions: [
          'Puissances, nombres relatifs, divisibilité, nombres premiers, PGCD/PPCM',
          'Fractions, calcul littéral initial, proportionnalité et problèmes',
          'Géométrie plane, symétrie, constructions et mesures',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Sociétés anciennes et médiévales',
        objectif: 'Situer l’Afrique et le Sénégal dans les civilisations anciennes et médiévales.',
        notions: [
          'Sociétés et civilisations anciennes et médiévales',
          'Afrique et Sénégal dans les repères historiques du programme',
        ],
      },
      {
        subject: 'Géographie',
        title: 'L’Afrique : milieux, population et ressources',
        objectif: 'Lire cartes et documents sur les villes et activités africaines.',
        notions: [
          'Afrique : milieux naturels, population, villes, activités et ressources',
          'Lecture de cartes et de documents géographiques',
        ],
      },
      {
        subject: 'SVT / Sciences physiques',
        title: 'Fonctions biologiques, mélanges et propriétés de la matière',
        objectif: 'Étudier l’organisation du vivant et réaliser des mesures physiques.',
        notions: [
          'Organisation du vivant, environnement, santé et fonctions biologiques',
          'Propriétés de la matière, mélanges, mesures et phénomènes physiques',
        ],
      },
      {
        subject: 'Technologie',
        title: 'Analyse d’objets et représentation technique',
        objectif: 'Associer matériaux, fonctions et réalisation simple.',
        notions: [
          'Analyse d’objets, matériaux et fonctions',
          'Représentation technique et réalisation simple',
        ],
      },
      {
        subject: 'Éducation civique',
        title: 'Responsabilités, solidarité et droits de l’enfant',
        objectif: 'Favoriser la prévention des conflits et le sens civique.',
        notions: [
          'Vie collective, responsabilités, institutions et solidarité',
          'Droits de l’enfant et prévention des conflits',
        ],
      },
      {
        subject: 'EPS / Arts',
        title: 'Athlétisme, sports collectifs et création',
        objectif: 'Poursuivre l’entraînement sportif et l’expression artistique.',
        notions: [
          'Athlétisme et jeux sportifs',
          'Expression artistique',
        ],
      },
    ];
  }

  if (classLevel === '4e') {
    return [
      {
        subject: 'Français',
        title: 'Textes explicatifs, argumentatifs, poétiques et propositions',
        objectif: 'Analyser la phrase complexe, les fonctions et produire des textes variés.',
        notions: [
          'Textes narratifs, descriptifs, explicatifs, argumentatifs et poétiques',
          'Analyse de langue, propositions, fonctions, accords et conjugaison',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Expériences, opinion, comparaison et conseil',
        objectif: 'Exprimer obligation, possibilité, comparaison et compréhension orale/écrite.',
        notions: [
          'Décrire des expériences et projets, raconter et comparer',
          'Exprimer opinion, obligation, possibilité et conseil',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Calcul littéral, équations, Pythagore et statistiques',
        objectif: 'Développer, factoriser, résoudre des équations et étudier les transformations.',
        notions: [
          'Nombres rationnels et relatifs, calcul littéral, développement et factorisation',
          'Équations et inéquations simples, proportionnalité et applications linéaires',
          'Triangles, parallélisme, transformations, Pythagore, espace et statistiques',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Grandes transformations politiques, économiques et sociales',
        objectif: 'Relier les mutations mondiales à l’histoire de l’Afrique et du Sénégal.',
        notions: [
          'Grandes transformations politiques, économiques et sociales',
          'Histoire de l’Afrique et du Sénégal intégrée à la progression',
        ],
      },
      {
        subject: 'Géographie',
        title: 'Grands ensembles régionaux et développement',
        objectif: 'Analyser ressources, populations et enjeux environnementaux.',
        notions: [
          'Grands ensembles régionaux, populations et activités',
          'Ressources, développement et enjeux environnementaux',
        ],
      },
      {
        subject: 'SVT / Sciences physiques',
        title: 'Corps humain, électricité, mécanique et optique',
        objectif: 'Relier fonctions biologiques et transformations physiques de la matière.',
        notions: [
          'Fonctions du corps, santé, reproduction et environnement',
          'Électricité, mécanique, optique et transformations de la matière',
        ],
      },
      {
        subject: 'Technologie',
        title: 'Systèmes techniques, énergie et projet',
        objectif: 'Concevoir un projet en choisissant matériaux et source d’énergie.',
        notions: [
          'Systèmes techniques, énergie et représentation',
          'Choix de matériaux et réalisation de projet',
        ],
      },
      {
        subject: 'Éducation civique',
        title: 'Institutions, égalité, paix et environnement',
        objectif: 'Comprendre la citoyenneté et les droits et devoirs.',
        notions: [
          'Institutions, citoyenneté, droits et devoirs',
          'Égalité, paix et protection de l’environnement',
        ],
      },
      {
        subject: 'EPS / Arts',
        title: 'Arbitrage, coopération sportive et arts',
        objectif: 'Développer autonomie sportive, arbitrage et pratiques artistiques.',
        notions: [
          'Compétences sportives, arbitrage et coopération',
          'Activités artistiques',
        ],
      },
    ];
  }

  // 3e
  return [
    {
      subject: 'Français',
      title: 'Argumentation, théâtre, poésie et résumé (BFEM)',
      objectif: 'Maîtriser commentaire, rédaction, résumé et analyse grammaticale complète.',
      notions: [
        'Compréhension et interprétation : argumentation, récit, théâtre et poésie',
        'Grammaire approfondie, orthographe, conjugaison, rédaction et résumé',
        'Méthodologie des épreuves du BFEM',
      ],
    },
    {
      subject: 'Anglais',
      title: 'Compréhension de documents et argumentation écrite/orale',
      objectif: 'Consolider grammaire et lexique pour communiquer avec aisance.',
      notions: [
        'Compréhension de documents et expression suivie',
        'Récit, opinion, argumentation et situations de communication',
      ],
    },
    {
      subject: 'Mathématiques',
      title: 'Racines carrées, Thalès, trigonométrie et fonctions',
      objectif: 'Résoudre équations/systèmes et mobiliser géométrie et probabilités.',
      notions: [
        'Racines carrées, calcul littéral, équations, systèmes, fonctions et proportionnalité',
        'Théorème de Thalès, Pythagore, trigonométrie et géométrie dans l’espace',
        'Statistiques, probabilités et dénombrement',
      ],
    },
    {
      subject: 'Histoire',
      title: 'Colonisation, résistances, guerres et indépendances',
      objectif: 'Comprendre la période contemporaine et la construction des États.',
      notions: [
        'Périodes modernes et contemporaines, colonisation et résistances',
        'Guerres mondiales, indépendances et construction des États africains et du Sénégal',
      ],
    },
    {
      subject: 'Géographie',
      title: 'Espaces, urbanisation et enjeux du développement',
      objectif: 'Analyser économie, population et ressources du Sénégal, de l’Afrique et du monde.',
      notions: [
        'Espaces, développement, population et urbanisation',
        'Économie, ressources et enjeux du Sénégal, de l’Afrique et du monde',
      ],
    },
    {
      subject: 'SVT / Sciences physiques',
      title: 'Hérédité, mécanique, électricité et chimie',
      objectif: 'Expliquer fonctions biologiques et réactions ou lois physiques.',
      notions: [
        'Fonctions biologiques, santé, hérédité et environnement',
        'Électricité, mécanique, chimie et transformations physiques',
      ],
    },
    {
      subject: 'Technologie',
      title: 'Systèmes, énergie, conception et sécurité technique',
      objectif: 'Conduire conception, réalisation et maîtrise des règles de sécurité.',
      notions: [
        'Systèmes, énergie, conception et réalisation',
        'Sécurité et usages techniques',
      ],
    },
    {
      subject: 'Éducation civique',
      title: 'Institutions nationales et participation citoyenne',
      objectif: 'Maîtriser le fonctionnement des institutions, les droits et la paix.',
      notions: [
        'Institutions nationales, citoyenneté, droits et devoirs',
        'Paix, participation citoyenne et protection de l’environnement',
      ],
    },
    {
      subject: 'EPS / Arts',
      title: 'Performance, entraînement et coopération',
      objectif: 'Préparer les épreuves physiques et entretenir l’expression artistique.',
      notions: [
        'Entraînement, performance, règles et coopération',
        'Activités artistiques',
      ],
    },
  ];
}

function getLyceeSpecs(
  classLevel: '2nde' | '1re' | 'Terminale',
  serie: SerieOption,
): SubjectSpec[] {
  if (classLevel === '2nde') {
    const base: SubjectSpec[] = [
      {
        subject: 'Français',
        title: 'Analyse littéraire, argumentation et commentaire',
        objectif: 'Maîtriser commentaire de texte, résumé et écriture structurée.',
        notions: [
          'Compréhension et analyse de textes, lecture littéraire et expression orale',
          'Écriture argumentative, narrative et explicative, résumé ou compte rendu',
          'Grammaire, vocabulaire, orthographe et méthodes de commentaire',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Calcul algébrique, fonctions et géométrie',
        objectif: 'Consolider équations, fonctions, géométrie et probabilités de base.',
        notions: [
          'Calcul numérique et algébrique, équations, inéquations et fonctions graphiques',
          'Géométrie plane et dans l’espace, grandeurs et mesures',
          'Statistiques, probabilités de base et résolution de problèmes',
        ],
      },
      {
        subject: 'Langues vivantes',
        title: 'Communication, grammaire et compréhension',
        objectif: 'Renforcer l’expression écrite et orale dans les langues du lycée.',
        notions: [
          'Compréhension orale et écrite, expression et communication',
          'Vocabulaire, grammaire et options anciennes ou classiques selon l’établissement',
        ],
      },
      {
        subject: 'Histoire-Géographie',
        title: 'Repères historiques, cartes et documents',
        objectif: 'Analyser des documents historiques et des cartes géographiques.',
        notions: [
          'Repères historiques et géographiques fondamentaux',
          'Lecture critique de documents et de cartes',
        ],
      },
      {
        subject: 'SVT',
        title: 'Vivant, santé, environnement et démarche scientifique',
        objectif: 'Appliquer la démarche expérimentale aux phénomènes biologiques.',
        notions: [
          'Vivant, corps humain, santé et environnement',
          'Démarche scientifique et observation expérimentale',
        ],
      },
      {
        subject: 'Sciences physiques',
        title: 'Matière, énergie, mesures et mouvements',
        objectif: 'Maîtriser mesures expérimentales et lois physiques de base.',
        notions: [
          'Matière, énergie et transformations',
          'Mesures, mouvements et phénomènes physiques étudiés',
        ],
      },
    ];

    if (serie === 'Orientation STEG') {
      base.push({
        subject: 'Économie & Gestion',
        title: 'Initiation à l’économie et aux organisations',
        objectif: 'Découvrir agents économiques, entreprise et outils de gestion.',
        notions: [
          'Agents économiques, échanges et fonctionnement des organisations',
          'Introduction aux documents de gestion',
        ],
      });
    } else if (serie === 'Technique (STIDD / F6)') {
      base.push({
        subject: 'Sciences et technologies',
        title: 'Initiation technologique et laboratoire',
        objectif: 'Préparer les enseignements techniques et chimiques.',
        notions: [
          'Analyse de systèmes techniques et conception de base',
          'Sécurité et pratiques de laboratoire',
        ],
      });
    } else if (serie === 'Franco-arabe') {
      base.push({
        subject: 'Arabe',
        title: 'Langue arabe et textes de culture',
        objectif: 'Consolider lecture, grammaire et rédaction en langue arabe.',
        notions: [
          'Compréhension et expression écrite en arabe',
          'Civilisation et disciplines complémentaires du parcours',
        ],
      });
    }

    base.push({
      subject: 'Éducation civique & EPS',
      title: 'Citoyenneté et activités physiques',
      objectif: 'Poursuivre l’éducation citoyenne et sportive.',
      notions: ['Éducation civique et citoyenne', 'Éducation physique et sportive'],
    });
    return base;
  }

  // Première (1re) & Terminale — differentiated cleanly by Série and level!
  const isTerm = classLevel === 'Terminale';

  const generalFrench: SubjectSpec = {
    subject: 'Français',
    title: isTerm
      ? 'Littérature, mouvements, dissertation et commentaire'
      : 'Analyse des genres littéraires et méthodologie écrite',
    objectif: isTerm
      ? 'Maîtriser les exercices du Baccalauréat : dissertation, commentaire et lecture littéraire.'
      : 'Approfondir genres littéraires, commentaire composé et expression structurée.',
    notions: isTerm
      ? [
          'Compétences de lecture et d’écriture littéraires, genres et mouvements',
          'Méthodologie complète de la dissertation et du commentaire littéraire',
          'Préparation intensive aux épreuves écrites et orales',
        ]
      : [
          'Analyse des genres littéraires et étude des textes',
          'Méthode de commentaire, dissertation et rédaction argumentée',
        ],
  };

  const generalPhilo: SubjectSpec = {
    subject: 'Philosophie',
    title: isTerm ? 'Problématisation, dissertation et commentaire philosophique' : 'Introduction à la réflexion philosophique',
    objectif: 'Construire une argumentation conceptuelle rigoureuse à partir des grands repères.',
    notions: [
      'Analyse de concepts, problématisation et structuration d’une thèse',
      'Méthodes de la dissertation et du commentaire de texte philosophique',
    ],
  };

  const generalHG: SubjectSpec = {
    subject: 'Histoire-Géographie',
    title: isTerm
      ? 'Relations internationales, développement et étude de documents'
      : 'Mutations contemporaines, cartes et synthèse documentaire',
    objectif: 'Analyser documents historiques et enjeux géographiques contemporains.',
    notions: [
      'Lecture et critique de documents historiques et statistiques',
      'Cartographie, développement et grands ensembles régionaux',
    ],
  };

  const generalLangues: SubjectSpec = {
    subject: 'Langues vivantes',
    title: 'Compréhension, expression écrite et orale',
    objectif: 'Maîtriser les compétences linguistiques et culturelles du cycle terminal.',
    notions: [
      'Compréhension de textes authentiques et expression argumentée',
      'Grammaire consolidée, lexique thématique et traduction',
    ],
  };

  const mathS1S3: SubjectSpec = {
    subject: 'Mathématiques',
    title: isTerm
      ? 'Complexes, suites, intégrales, équations différentielles et probabilités'
      : 'Algèbre, analyse des fonctions, géométrie et dénombrement',
    objectif: isTerm
      ? 'Maîtriser le programme complet d’analyse, d’algèbre et de géométrie pour l’épreuve scientifique.'
      : 'Acquérir dérivation, suites, trigonométrie et géométrie vectorielle.',
    notions: isTerm
      ? [
          'Nombres complexes, systèmes linéaires et arithmétique',
          'Suites, fonctions, calcul intégral et équations différentielles',
          'Géométrie plane et de l’espace, courbes et probabilités',
        ]
      : [
          'Polynômes, équations, inéquations et systèmes',
          'Fonctions numériques, limites et dérivation',
          'Suites, géométrie plane et probabilités',
        ],
  };

  const physS1S2: SubjectSpec = {
    subject: 'Sciences physiques',
    title: isTerm
      ? 'Cinématique, dynamique, gravitation, électromagnétisme et électricité'
      : 'Mécanique, énergie, circuits électriques et chimie organique',
    objectif: isTerm
      ? 'Modéliser les phénomènes mécaniques, électriques et chimiques du programme officiel.'
      : 'Établir les lois de conservation et la démarche expérimentale.',
    notions: isTerm
      ? [
          'Cinématique, dynamique et gravitation',
          'Électromagnétisme et électricité',
          'Cinétique chimique, solutions aqueuses et chimie organique',
        ]
      : [
          'Travail, énergie mécanique et champs électriques',
          'Chimie des solutions et réactions d’oxydoréduction',
        ],
  };

  const svtSpec: SubjectSpec = {
    subject: 'SVT',
    title: isTerm
      ? 'Système nerveux, activité cardiaque, glycémie, immunologie et reproduction'
      : 'Cellule, métabolisme, génétique et géologie',
    objectif: 'Expliquer les régulations physiologiques, l’immunité et la transmission génétique.',
    notions: isTerm
      ? [
          'Système nerveux et activité cardiaque',
          'Régulation de la glycémie et immunologie',
          'Reproduction et génétique',
        ]
      : [
          'Organisation cellulaire, métabolisme et division cellulaire',
          'Génétique fondamentale et phénomènes géologiques',
        ],
  };

  if (serie === 'S1' || serie === 'S3') {
    const specs = [mathS1S3, physS1S2];
    if (serie === 'S3') {
      specs.push({
        subject: 'Sciences et technologies de l’ingénieur',
        title: 'Systèmes techniques, mécanique appliquée et conception',
        objectif: 'Analyser et dimensionner des systèmes industriels et techniques.',
        notions: [
          'Analyse fonctionnelle et structurelle des systèmes',
          'Mécanique appliquée, automatismes et conception technique',
        ],
      });
    } else {
      specs.push(svtSpec);
    }
    specs.push(generalFrench);
    if (isTerm) specs.push(generalPhilo);
    specs.push(generalLangues, generalHG);
    return specs;
  }

  if (serie === 'S2') {
    const specs = [svtSpec, physS1S2, mathS1S3, generalFrench];
    if (isTerm) specs.push(generalPhilo);
    specs.push(generalLangues, generalHG);
    return specs;
  }

  if (serie === 'S4' || serie === 'S5') {
    const specs: SubjectSpec[] = [
      {
        subject: serie === 'S4' ? 'Agriculture et environnement' : 'Productions et transformations agroalimentaires',
        title:
          serie === 'S4'
            ? 'Sciences agronomiques, sols, eau et gestion des ressources'
            : 'Procédés agroalimentaires, conservation et qualité des produits',
        objectif:
          serie === 'S4'
            ? 'Relier sciences biologiques, productions agricoles et protection des écosystèmes.'
            : 'Maîtriser les techniques de transformation et de valorisation agroalimentaire.',
        notions:
          serie === 'S4'
            ? [
                'Agronomie, gestion durable des sols et des ressources naturelles',
                'Écologie appliquée et systèmes de production agricole',
              ]
            : [
                'Technologies de transformation, conservation et hygiène alimentaire',
                'Contrôle qualité des produits agricoles et agroalimentaires',
              ],
      },
      svtSpec,
      physS1S2,
      mathS1S3,
      generalFrench,
    ];
    if (isTerm) specs.push(generalPhilo);
    specs.push(generalLangues);
    return specs;
  }

  if (serie === 'STEG') {
    const specs: SubjectSpec[] = [
      {
        subject: 'Économie',
        title: 'Croissance, marché, échanges et politiques économiques',
        objectif: 'Analyser les mécanismes macroéconomiques et les documents statistiques.',
        notions: [
          'Circuit économique, croissance, monnaie et financement',
          'Commerce international, emploi et politiques publiques',
        ],
      },
      {
        subject: 'Gestion',
        title: 'Organisation, stratégie et outils de gestion commerciale',
        objectif: 'Résoudre des études de cas de gestion administrative et commerciale.',
        notions: [
          'Organisation de l’entreprise, gestion commerciale et ressources',
          'Analyse de décisions et indicateurs de performance',
        ],
      },
      {
        subject: 'Comptabilité',
        title: 'Bilan, opérations courantes, coûts et analyse financière',
        objectif: 'Enregistrer les opérations comptables et analyser la rentabilité.',
        notions: [
          'Enregistrement des opérations courantes et travaux d’inventaire',
          'Bilan, compte de résultat, coûts complets et analyse financière',
        ],
      },
      {
        subject: 'Méthodes quantitatives / Mathématiques',
        title: 'Statistiques, suites, probabilités et calcul financier',
        objectif: 'Appliquer les outils mathématiques aux données économiques et de gestion.',
        notions: [
          'Suites, fonctions appliquées et mathématiques financières',
          'Statistiques à une et deux variables, probabilités',
        ],
      },
      generalFrench,
      generalLangues,
    ];
    if (isTerm) specs.push(generalPhilo);
    return specs;
  }

  if (serie === 'STIDD') {
    const specs: SubjectSpec[] = [
      {
        subject: 'Technologie industrielle & Conception',
        title: 'Systèmes industriels, conception durable et réalisation',
        objectif: 'Concevoir, modéliser et vérifier des solutions techniques industrielles.',
        notions: [
          'Conception, fabrication ou électrotechnique selon l’option',
          'Chaîne d’énergie, chaîne d’information et développement durable',
        ],
      },
      {
        subject: 'Physique appliquée',
        title: 'Électrotechnique, énergie, mécanique et transferts',
        objectif: 'Appliquer les lois de la physique aux systèmes technologiques.',
        notions: [
          'Électricité industrielle, conversion d’énergie et mécanique',
          'Mesures, capteurs et rendement énergétique',
        ],
      },
      mathS1S3,
      generalFrench,
      generalLangues,
    ];
    if (isTerm) specs.push(generalPhilo);
    return specs;
  }

  if (serie === 'F6') {
    const specs: SubjectSpec[] = [
      {
        subject: 'Chimie & Techniques de laboratoire',
        title: 'Chimie analytique, synthèses et protocoles de laboratoire',
        objectif: 'Conduire dosages, analyses et synthèses en respectant la sécurité.',
        notions: [
          'Chimie minérale, organique et analytique',
          'Techniques expérimentales, dosages et contrôle en laboratoire',
        ],
      },
      physS1S2,
      mathS1S3,
      generalFrench,
      generalLangues,
    ];
    if (isTerm) specs.push(generalPhilo);
    return specs;
  }

  if (serie === 'Franco-arabe') {
    const specs: SubjectSpec[] = [
      {
        subject: 'Arabe',
        title: 'Littérature, grammaire et expression en langue arabe',
        objectif: 'Maîtriser l’analyse de textes et la rédaction structurée en arabe.',
        notions: [
          'Étude de textes littéraires et contemporains en arabe',
          'Grammaire, rhétorique et dissertation',
        ],
      },
      {
        subject: 'Instruction islamique',
        title: 'Textes de référence, valeurs et civilisation',
        objectif: 'Approfondir la compréhension des sources et de l’éthique.',
        notions: [
          'Étude des textes fondamentaux et principes éthiques',
          'Histoire et civilisation',
        ],
      },
      generalFrench,
      generalHG,
    ];
    if (isTerm) specs.push(generalPhilo);
    specs.push({
      subject: 'Mathématiques',
      title: 'Outils mathématiques du programme général',
      objectif: 'Mobiliser fonctions, suites et probabilités.',
      notions: ['Fonctions, suites et statistiques', 'Résolution de problèmes'],
    });
    return specs;
  }

  // L1a/L1b, L'1, L2
  const specs: SubjectSpec[] = [generalFrench];
  if (isTerm || serie === 'L2') specs.push(generalPhilo);
  if (serie === 'L1a/L1b') {
    specs.push({
      subject: 'Langues anciennes (Grec / Latin)',
      title: 'Version, commentaire et civilisation antique',
      objectif: 'Traduire et interpréter des textes grecs ou latins selon l’option.',
      notions: [
        'Morphologie, syntaxe et traduction de textes classiques',
        'Culture et institutions antiques',
      ],
    });
  }
  specs.push(generalLangues, generalHG);
  if (serie === 'L2') {
    specs.push(svtSpec);
  }
  specs.push({
    subject: 'Mathématiques',
    title: 'Statistiques, fonctions et probabilités',
    objectif: 'Maîtriser l’analyse quantitative et la résolution de problèmes.',
    notions: [
      'Fonctions numériques et suites',
      'Statistiques, dénombrement et probabilités',
    ],
  });
  return specs;
}

export function getClassExperience(
  classLevel: ClassLevel,
  requestedSerie: SerieOption | null,
): ClassExperience {
  const meta = getClassMeta(classLevel);
  const validSerie =
    meta.series.length === 0
      ? null
      : requestedSerie && meta.series.includes(requestedSerie)
        ? requestedSerie
        : getDefaultSerieForClass(classLevel);

  let specs: SubjectSpec[];
  if (
    classLevel === 'Petite Section' ||
    classLevel === 'Moyenne Section' ||
    classLevel === 'Grande Section'
  ) {
    specs = getPrescolaireSpecs(classLevel);
  } else if (
    classLevel === 'CI' ||
    classLevel === 'CP' ||
    classLevel === 'CE1' ||
    classLevel === 'CE2' ||
    classLevel === 'CM1' ||
    classLevel === 'CM2'
  ) {
    specs = getElementaireSpecs(classLevel);
  } else if (
    classLevel === '6e' ||
    classLevel === '5e' ||
    classLevel === '4e' ||
    classLevel === '3e'
  ) {
    specs = getCollegeSpecs(classLevel);
  } else {
    specs = getLyceeSpecs(classLevel, validSerie ?? getDefaultSerieForClass(classLevel)!);
  }

  const subjects = specs.map((s) => s.subject);
  const lessons: LessonItem[] = specs.map((spec, index) => ({
    id: `${classLevel}-${validSerie ?? 'std'}-${index}`,
    title: spec.title,
    subject: spec.subject,
    objectif: spec.objectif,
    notions: spec.notions,
    courseStatusNote:
      'Structure officielle du programme intégrée. Le cours détaillé complet sera ajouté directement ici.',
    summary: `${spec.objectif} Notions clés : ${spec.notions[0] ?? spec.title}.`,
    flashcards: spec.notions.map((notion, nIdx) => ({
      question: `${spec.subject} — Point du programme ${nIdx + 1}`,
      answer: notion,
    })),
  }));

  const categories: ExerciseCategory[] = [
    'Exercices par leçon',
    'Devoirs',
    'Sujets d’examen',
    'Corrigés',
  ];
  const difficulties: DifficultyLevel[] = ['Découverte', 'Entraînement', 'Défi'];

  const exercises: ExerciseModuleItem[] = specs.map((spec, index) => ({
    id: `${classLevel}-ex-${index}`,
    category: categories[index % categories.length],
    subject: spec.subject,
    lessonTitle: spec.title,
    difficulty: difficulties[index % difficulties.length],
    competence: spec.objectif,
    checkpoints: spec.notions,
  }));

  return {
    classLevel,
    cycle: meta.cycle,
    cycleClass: meta.cycleClass,
    serie: validSerie,
    examLabel: meta.examLabel,
    subjects,
    lessons,
    exercises,
  };
}
