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
        title: 'Communication, conte, récit, description et langue',
        objectif: 'Maîtriser les 12 leçons de lecture, récit merveilleux, description, grammaire et accords.',
        notions: [
          'Situation de communication, registres de langue, conte et récit merveilleux',
          'Description, lettre personnelle, poésie, fables et premières scènes de théâtre',
          'Phrase simple, groupe nominal, verbe, conjugaison, accords et formation des mots',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Décimaux, proportionnalité, géométrie plane et repérage',
        objectif: 'Calculer avec les décimaux et relatifs, construire les figures de base et calculer les aires.',
        notions: [
          'Nombres décimaux, opérations, organisation d’un calcul, proportionnalité et pourcentages',
          'Nombres décimaux relatifs et repérage sur une droite, dans le plan et sur la sphère',
          'Cercle, droites perpendiculaires et parallèles, symétrie orthogonale, angles, polygones, aires et espace',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Préhistoire, Afrique antique et civilisations anciennes',
        objectif: 'Explorer la chronologie, la préhistoire au Sénégal et les civilisations antiques (22 leçons).',
        notions: [
          'Sources, chronologie, préhistoire africaine et protohistoire sénégalaise',
          'Égypte pharaonique, Nubie, Éthiopie antique et civilisation carthaginoise',
          'Mésopotamie, Palestine, Grèce antique, Rome, christianisme et grandes invasions',
        ],
      },
      {
        subject: 'Géographie',
        title: 'Grandes régions du Sénégal et organisation de l’espace',
        objectif: 'Localiser et analyser les grandes régions sénégalaises (39 leçons).',
        notions: [
          'Bassin arachidier, Dakar et littoral central : relief, populations et activités',
          'Ferlo et Vallée du Sénégal : élevage, barrages, irrigation et ressources en eau',
          'Casamance et Haut-Sénégal : milieux, voies de communication et enjeux de développement',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Salutations, quotidien, projets et prétérit',
        objectif: 'Acquérir les bases de la communication orale et écrite en 16 leçons.',
        notions: [
          'Salutations, salle de classe, nombres, heure, famille, maison et goûts',
          'Habitudes quotidiennes, présent continu, achats au marché, météo et santé (can, must, may)',
          'Récit au prétérit et projets futurs avec going to',
        ],
      },
      {
        subject: 'Physique-Chimie',
        title: 'Initiation à la matière, mesures, eau et air',
        objectif: 'Observer les grandeurs physiques, états de la matière et propriétés de l’eau et de l’air.',
        notions: [
          'Observation des états de la matière, mesures simples de longueur, masse et volume',
          'Propriétés usuelles de l’eau, de l’air et phénomènes physiques quotidiens',
        ],
      },
      {
        subject: 'SVT',
        title: 'Environnement, végétaux, cellules, santé et paysages',
        objectif: 'Maîtriser les 12 leçons sur le vivant, la nutrition végétale, la prévention et les roches.',
        notions: [
          'Environnement, classification des êtres vivants, chaînes alimentaires et photosynthèse',
          'Déplacement des animaux, cellule, division cellulaire et germination des plantes',
          'Prévention du paludisme, de l’ascaridiase et du choléra ; roches et évolution des paysages',
        ],
      },
      {
        subject: 'Éducation civique',
        title: 'Règles de vie, droits, devoirs et institutions proches',
        objectif: 'Respecter les biens communs, les règles et la citoyenneté au collège.',
        notions: [
          'Règles de vie collective, droits et devoirs de l’élève',
          'Respect des biens publics, solidarité et institutions proches',
        ],
      },
      {
        subject: 'EPS / Arts',
        title: 'Activités athlétiques, jeux et expression artistique',
        objectif: 'Développer endurance, coordination, dessin et musique.',
        notions: [
          'Activités athlétiques, jeux, sports collectifs et expression corporelle',
          'Dessin, arts plastiques et musique',
        ],
      },
    ];
  }

  if (classLevel === '5e') {
    return [
      {
        subject: 'Français',
        title: 'Théâtre, épopée, récit, phrase complexe et style',
        objectif: 'Approfondir la lecture littéraire et l’analyse syntaxique en 12 leçons.',
        notions: [
          'Théâtre et comédie, épopée, mythes, légendes, description, récit et dialogue',
          'Lettre, messages courts et recherche documentaire pour présenter et débattre',
          'Groupe nominal, transitivité, phrase complexe, conjugaison, accords et dérivation',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Puissances, PGCD/PPCM, fractions, symétrie et espace',
        objectif: 'Maîtriser les 12 leçons de calcul numérique, proportionnalité et géométrie.',
        notions: [
          'Puissances, nombres premiers, PGCD/PPCM, fractions, proportionnalité et décimaux relatifs',
          'Symétrie centrale, angles, parallélogrammes, triangles et quadrilatères',
          'Représentations graphiques et géométrie dans l’espace (prismes, cylindres, aires, volumes)',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Empires d’Afrique de l’Ouest, Islam et Sénégambie',
        objectif: 'Étudier les 22 leçons sur l’Afrique médiévale, la Sénégambie et le monde.',
        notions: [
          'Naissance et expansion de l’islam ; grands empires : Ghana, Mali, Songhaï et cités d’Afrique',
          'Sénégambie : peuplement, Tekrour, Fouta, Jolof et Gaabu',
          'Féodalité, Humanisme, Renaissance, civilisations précolombiennes et grands voyages',
        ],
      },
      {
        subject: 'Géographie',
        title: 'Le Sénégal : milieu physique, population et économie',
        objectif: 'Connaître les 26 leçons complètes sur la géographie du Sénégal.',
        notions: [
          'Localisation, géologie, relief, climat, sols, végétation, hydrographie et écosystèmes du Sénégal',
          'Peuplement, croissance démographique, pyramide des âges, migrations et urbanisation',
          'Agriculture, élevage, pêche, artisanat, industrie, tourisme, transports et disparités régionales',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Quotidien, futur, present perfect, prétérit et discours',
        objectif: 'Communiquer dans des situations variées au travers de 16 leçons.',
        notions: [
          'Présent simple et continu, nourriture et quantités, règles, futur et conseils de santé',
          'Voix passive, present perfect, prétérit simple et continu, comparaisons et directions',
          'Conditionnel de type 1 et discours rapporté',
        ],
      },
      {
        subject: 'Physique-Chimie',
        title: 'Mesures, mélanges, propriétés physiques et transformations',
        objectif: 'Consolidation expérimentale des propriétés de la matière et des mélanges.',
        notions: [
          'Mesures physiques de base, masses, volumes et états de la matière',
          'Mélanges, séparations et phénomènes physiques du quotidien',
        ],
      },
      {
        subject: 'SVT',
        title: 'Cadre de vie, nutrition, respiration, reproduction et sols',
        objectif: 'Maîtriser les 12 leçons de biologie animale/végétale et de géologie sédimentaire.',
        notions: [
          'Cadre de vie rural/urbain, pollutions et prévention santé ; régimes alimentaires et besoins nutritionnels',
          'Respiration animale, reproduction des animaux et des plantes avec ou sans fleurs',
          'Constituants, formation et protection des sols ; roches sédimentaires et fossiles',
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
          'Expression plastique et musicale',
        ],
      },
    ];
  }

  if (classLevel === '4e') {
    return [
      {
        subject: 'Français',
        title: 'Nouvelle fantastique, roman, argumentation et subordination',
        objectif: 'Analyser récits, presse et textes argumentatifs en 12 leçons.',
        notions: [
          'Nouvelle et conte fantastique, roman intégral, poésie et information (fait divers, article)',
          'Récit enrichi avec dialogue, lettre administrative et argumentation structurée',
          'Phrase complexe, subordination, discours direct/indirect, conjugaison et style',
        ],
      },
      {
        subject: 'Mathématiques',
        title: 'Rationnels, équations, vecteurs, rotations et statistiques',
        objectif: 'Maîtriser les 14 leçons d’algèbre, géométrie vectorielle et statistique.',
        notions: [
          'Nombres rationnels, calcul algébrique, équations, systèmes d’inéquations et applications linéaires',
          'Statistiques, distances, bissectrices, droites des milieux, médianes et triangle rectangle',
          'Translations, vecteurs, rotations, polygones réguliers, projection orthogonale et espace',
        ],
      },
      {
        subject: 'Histoire',
        title: 'Traite négrière, royaumes d’Afrique et révolutions (XVIIIe-XIXe)',
        objectif: 'Étudier les 24 leçons de l’histoire atlantique, sénégambienne et moderne.',
        notions: [
          'Afrique au XVIe siècle, traite négrière, conséquences, Sénégal et mouvement abolitionniste',
          'Sénégambie (dislocation du Jolof, Fouta, Gaabu), Sokoto, Macina, El Hadji Omar Tall et Tchaka',
          'Première révolution industrielle, Lumières, Révolution française, États-Unis et méthodologie',
        ],
      },
      {
        subject: 'Géographie',
        title: 'Afrique de l’Ouest, Afrique et grands ensembles continentaux',
        objectif: 'Analyser intégration régionale et disparités mondiales en 22 leçons.',
        notions: [
          'Afrique de l’Ouest et continent africain : cartes, développement, intégration et coopération',
          'Europe et Amérique : reliefs, populations, économies et intégration régionale',
          'Asie et Océanie : contrastes naturels, populations, disparités économiques et cartes',
        ],
      },
      {
        subject: 'Anglais',
        title: 'Ville, village, migrations, emplois, culture et santé',
        objectif: 'Développer compréhension écrite, opinion et vocabulaire en 15 leçons.',
        notions: [
          'Identité, révision des temps, vie urbaine et rurale, exode rural, voyages et communication',
          'Récits au passé, métiers, entretien d’embauche, lettres, tableaux et graphiques',
          'Patrimoine culturel, valeurs morales, éducation et prévention santé',
        ],
      },
      {
        subject: 'Physique-Chimie',
        title: 'Grandeurs, électricité, optique et réactions chimiques',
        objectif: 'Maîtriser les 12 leçons d’électricité, optique géométrique et chimie fondamentale.',
        notions: [
          'Matière, grandeurs et unités, masse volumique, densité et relation poids-masse',
          'Électricité (circuits, intensité, tension) ; lumière (ombres, réflexion et réfraction)',
          'Mélanges, atomes, molécules, ions, mole et équations-bilans chimiques',
        ],
      },
      {
        subject: 'SVT',
        title: 'Digestion, circulation, reproduction, microbes et globe',
        objectif: 'Comprendre physiologie humaine, hérédité et géodynamique en 13 leçons.',
        notions: [
          'Ressources naturelles, digestion, sang, circulation, pression artérielle et santé cardiovasculaire',
          'Puberté, fécondation, contraception, transmission héréditaire et contamination microbienne',
          'Volcanisme, roches magmatiques, séismes et structure du globe terrestre',
        ],
      },
      {
        subject: 'Éducation civique',
        title: 'Institutions, égalité, paix et environnement',
        objectif: 'Comprendre la citoyenneté, les institutions et les droits et devoirs.',
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
          'Activités plastiques, musicales et scéniques',
        ],
      },
    ];
  }

  // 3e
  return [
    {
      subject: 'Français',
      title: 'Subordination, œuvre intégrale, résumé, dissertation et commentaire',
      objectif: 'Maîtriser les 8 leçons clés du programme pour réussir le BFEM.',
      notions: [
        'Phrase simple et complexe, subordination, modes/temps du verbe, accords et lexique',
        'Lecture d’une œuvre intégrale (Une si longue lettre de Mariama Bâ)',
        'Méthodes des épreuves : résumé et discussion, dissertation et commentaire composé',
      ],
    },
    {
      subject: 'Mathématiques',
      title: 'Radicaux, systèmes, Thalès, trigonométrie, vecteurs et espace',
      objectif: 'Maîtriser les 13 leçons officielles du programme de mathématiques.',
      notions: [
        'Racine carrée, applications affines, équations, inéquations et systèmes à deux inconnues',
        'Statistiques, théorème de Thalès, trigonométrie dans le triangle rectangle et angle inscrit',
        'Vecteurs, transformations du plan, repérage et géométrie dans l’espace',
      ],
    },
    {
      subject: 'Histoire',
      title: 'Impérialisme, guerres mondiales, indépendances et monde depuis 1945',
      objectif: 'Maîtriser les 22 leçons d’histoire contemporaine africaine et mondiale.',
      notions: [
        'Capitalisme, explorations, conférence de Berlin, résistances africaines et systèmes coloniaux',
        'Révolutions, guerres mondiales, crise de 1929 et éveil des nationalismes',
        'Décolonisation en Afrique et au Sénégal, guerre froide, construction européenne et Proche-Orient',
      ],
    },
    {
      subject: 'Géographie',
      title: 'Système-monde, pôles économiques et défis de développement',
      objectif: 'Analyser les grands pôles économiques et l’émergence en 20 leçons.',
      notions: [
        'Amérique du Nord et Union européenne : atouts, populations, intégration et puissance',
        'Asie-Pacifique, Japon, Chine et nouveaux pays industrialisés',
        'Brésil, Afrique dans la mondialisation, mondialisation et développement durable',
      ],
    },
    {
      subject: 'Anglais',
      title: 'Temps, modaux, conditionnels, santé, environnement et citoyens',
      objectif: 'Consolider grammaire et expression sur les 16 leçons du programme.',
      notions: [
        'Temps verbaux, modaux, voix passive, conditionnels, discours rapporté et propositions',
        'Éducation, emploi, santé, environnement, droits, médias, culture et paix',
      ],
    },
    {
      subject: 'Physique-Chimie',
      title: 'Optique, énergie mécanique, électricité et chimie organique/minérale',
      objectif: 'Maîtriser les 11 leçons de physique et chimie de fin de collège.',
      notions: [
        'Lentilles minces, dispersion de la lumière, forces, travail, puissance et énergie mécanique',
        'Résistance, loi d’Ohm, puissance électrique, solutions aqueuses, acides, bases, métaux et hydrocarbures',
      ],
    },
    {
      subject: 'SVT',
      title: 'Système nerveux, vision, respiration, rein, immunité et géologie',
      objectif: 'Expliquer fonctions physiologiques, immunologie et roches en 15 leçons.',
      notions: [
        'Système nerveux, œil et vision, respiration humaine, cœur/sang, excrétion et rein',
        'Immunité, défense de l’organisme, infection VIH-sida et vaccination',
        'Tectonique des plaques, formation des roches métamorphiques, cycle des roches et chronologie',
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
    const mathSpec2nde: SubjectSpec =
      serie === 'Orientation S'
        ? {
            subject: 'Mathématiques',
            title: 'Seconde S : vecteurs, trigonométrie, fonctions et polynômes (15 chapitres)',
            objectif: 'Acquérir les 15 chapitres de Seconde S en géométrie vectorielle, fonctions et algèbre.',
            notions: [
              'Calcul vectoriel, repérage cartésien, produit scalaire et trigonométrie',
              'Calcul dans ℝ, intervalles, généralités et étude de fonctions numériques',
              'Équations du 2nd degré, systèmes, polynômes, fractions rationnelles et statistique',
            ],
          }
        : serie === 'Orientation L'
          ? {
              subject: 'Mathématiques',
              title: 'Seconde L : calcul dans ℝ, fonctions affines, systèmes et courbes (8 chapitres)',
              objectif: 'Maîtriser les 8 chapitres du programme littéraire de Seconde L.',
              notions: [
                'Calcul dans ℝ, proportionnalité, fonction affine et droites du plan',
                'Lectures graphiques et statistique descriptive',
                'Systèmes à deux inconnues, second degré et tracé de courbes',
              ],
            }
          : serie === 'Orientation STEG'
            ? {
                subject: 'Mathématiques',
                title: 'Seconde STEG : statistique, dénombrement, programmation linéaire et finances (7 chapitres)',
                objectif: 'Mobiliser les mathématiques appliquées à la gestion et aux sciences économiques.',
                notions: [
                  'Calcul, bases de numération, statistique et dénombrement',
                  'Géométrie analytique, systèmes et programmation linéaire',
                  'Second degré, fonctions et mathématiques financières',
                ],
              }
            : {
                subject: 'Mathématiques',
                title: `Seconde (${serie}) : algèbre, fonctions et géométrie`,
                objectif: 'Consolider équations, fonctions, repérage vectoriel et statistique.',
                notions: [
                  'Calcul dans ℝ, équations, inéquations et systèmes linéaires',
                  'Fonctions numériques, lectures graphiques et géométrie plane',
                  'Statistique et résolution de problèmes',
                ],
              };

    const physSpec2nde: SubjectSpec =
      serie === 'Orientation S'
        ? {
            subject: 'Sciences physiques',
            title: 'Physique-chimie Seconde S : électrisation, dipôles, mécanique, optique et solutions (25 leçons)',
            objectif: 'Maîtriser les 25 leçons expérimentales et quantitatives de Seconde S (5 h/semaine).',
            notions: [
              'Électrisation, courant, tension, dipôles passifs/actifs et amplificateur opérationnel',
              'Mouvement, forces, équilibre d’un solide et optique géométrique',
              'Atomes, liaisons chimiques, mole, équation-bilan, pH et caractérisation des ions',
            ],
          }
        : serie === 'Orientation L'
          ? {
              subject: 'Sciences physiques',
              title: 'Physique-chimie Seconde L : circuits, mécanique et transformations de la matière (10 leçons)',
              objectif: 'Acquérir les 10 leçons de culture scientifique de Seconde L (2 h/semaine).',
              notions: [
                'Électricité environnementale, circuit électrique, intensité et tension',
                'Mouvements, vitesse, forces, poids et masse',
                'Mélanges, corps purs, transformations de la matière et solutions acide/basique',
              ],
            }
          : {
              subject: 'Sciences physiques',
              title: `Physique-chimie Seconde (${serie}) : électricité, mécanique et matière`,
              objectif: 'Maîtriser les mesures expérimentales et lois physiques de base.',
              notions: [
                'Circuits électriques, mouvements, forces et équilibre',
                'Matière, transformations chimiques et solutions aqueuses',
              ],
            };

    const svtSpec2nde: SubjectSpec =
      serie === 'Orientation S'
        ? {
            subject: 'SVT',
            title: 'SVT Seconde S : écosystèmes, ressources, espèce et évolution (10 leçons)',
            objectif: 'Étudier l’écologie appliquée au Sénégal, la variation des espèces et l’évolution du vivant.',
            notions: [
              'Structure, fonctionnement et diversité des écosystèmes au Sénégal',
              'Gestion des sols, de l’eau, de l’énergie et des espaces rural et urbain',
              'L’espèce, la variation et l’évolution des êtres vivants',
            ],
          }
        : {
            subject: 'SVT',
            title: `SVT Seconde (${serie}) : écosystèmes, sols, eau et espaces (8 leçons)`,
            objectif: 'Comprendre les écosystèmes du Sénégal et la gestion des ressources naturelles.',
            notions: [
              'Structure, fonctionnement et diversité des écosystèmes au Sénégal',
              'Les sols, l’eau, l’énergie, l’espace rural et l’espace urbain',
            ],
          };

    const base: SubjectSpec[] = [
      {
        subject: 'Français',
        title: `Français Seconde (${serie}) : genres littéraires, mouvements et méthode (21 leçons)`,
        objectif: 'Maîtriser commentaire de texte, résumé suivi de discussion et fiche de lecture.',
        notions: [
          'Genres et types de textes (narratif, descriptif, argumentatif, injonctif, explicatif)',
          'Courants littéraires : Renaissance, Baroque, Classicisme, Lumières et Négritude',
          'Figures de style, conte, résumé suivi de discussion et fiche de lecture',
        ],
      },
      mathSpec2nde,
      {
        subject: 'Langues vivantes',
        title: `Anglais Seconde (${serie}) : grammaire, expression et société (23 leçons)`,
        objectif: 'Renforcer la maîtrise grammaticale et l’expression écrite et orale.',
        notions: [
          'Temps, modaux, conditionnels, voix passive et discours rapporté',
          'Relatives, gérondif, formation des mots et thèmes de société',
        ],
      },
      {
        subject: 'Histoire-Géographie',
        title: `Histoire (25 leçons) & Géographie (20 leçons) — Seconde (${serie})`,
        objectif: 'Analyser l’histoire africaine et mondiale et maîtriser la géographie générale.',
        notions: [
          'Préhistoire, Égypte pharaonique, grands empires ouest-africains, traites et révolutions',
          'Univers, Terre, océans, climats, tectonique des plaques et reliefs',
        ],
      },
    ];

    if (serie === 'Orientation S') {
      base.push(physSpec2nde, svtSpec2nde);
    } else if (serie === 'Orientation L') {
      base.push({
        subject: 'Économie',
        title: 'Économie Seconde L : comptabilité nationale, agrégats et facteurs (15 leçons)',
        objectif: 'Comprendre besoins, comptabilité nationale, secteurs institutionnels et facteur travail.',
        notions: [
          'Biens, besoins, courants économiques et circuit économique',
          'Comptabilité nationale, agrégats et tableaux statistiques',
          'Indicateurs démographiques, activité, facteur travail et capital',
        ],
      });
      base.push(svtSpec2nde, physSpec2nde);
    } else if (serie === 'Orientation STEG') {
      base.push({
        subject: 'Économie & Gestion',
        title: 'Économie & Gestion Seconde STEG : entreprise, circuit et gestion comptable',
        objectif: 'Découvrir agents économiques, documents commerciaux et outils comptables.',
        notions: [
          'Biens, besoins, circuit économique et secteurs institutionnels',
          'Organisation de l’entreprise, documents de gestion et indicateurs',
        ],
      });
    } else if (serie === 'Technique (STIDD / F6)') {
      base.push(physSpec2nde, {
        subject: 'Sciences et technologies',
        title: 'Initiation technologique et pratiques de laboratoire (STIDD / F6)',
        objectif: 'Préparer les spécialités industrielles ou chimiques de laboratoire.',
        notions: [
          'Analyse de systèmes techniques et conception de base',
          'Sécurité, mesures et protocoles de laboratoire',
        ],
      });
    } else if (serie === 'Franco-arabe') {
      base.push({
        subject: 'Arabe',
        title: 'Langue arabe et textes de culture (Seconde Franco-arabe)',
        objectif: 'Consolider lecture, grammaire et rédaction en langue arabe.',
        notions: [
          'Compréhension et expression écrite en arabe',
          'Civilisation et disciplines complémentaires du parcours',
        ],
      });
      base.push(svtSpec2nde, physSpec2nde);
    } else {
      base.push(svtSpec2nde, physSpec2nde);
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
  const lvlLabel = isTerm ? `Terminale ${serie}` : `Première ${serie}`;

  const generalFrench: SubjectSpec = {
    subject: 'Français',
    title: isTerm
      ? `Français ${lvlLabel} : surréalisme, roman, théâtre et épreuves du Bac`
      : `Français ${lvlLabel} : mouvements littéraires, Négritude et méthode (18 leçons)`,
    objectif: isTerm
      ? `Maîtriser les exercices du Baccalauréat (${serie}) : dissertation, commentaire, résumé et synthèse.`
      : `Approfondir genres, mouvements littéraires et expression écrite en ${lvlLabel}.`,
    notions: isTerm
      ? [
          'Surréalisme, poésie, roman (francophone et africain) et théâtre',
          'Texte argumentatif, lecture d’œuvre intégrale et ressources de style',
          'Dissertation, commentaire suivi/composé, résumé et synthèse de documents',
        ]
      : [
          'Genres littéraires : roman, poésie, théâtre et essai',
          'Romantisme, Parnasse, Symbolisme, Réalisme, Naturalisme et Négritude',
          'Commentaire composé, dissertation, écriture d’invention et résumé',
        ],
  };

  const generalPhilo: SubjectSpec = {
    subject: 'Philosophie',
    title: isTerm
      ? `Philosophie ${lvlLabel} : réflexion philosophique, société, sciences et esthétique`
      : `Philosophie ${lvlLabel} : origines, grands courants et méthode (9 leçons)`,
    objectif: isTerm
      ? `Construire une problématisation rigoureuse pour la dissertation et le commentaire en ${lvlLabel}.`
      : 'Découvrir les domaines et grands courants historiques de la philosophie.',
    notions: isTerm
      ? [
          'Réflexion philosophique, philosophie africaine, nature/culture, conscience et liberté',
          'État et droits, pensée scientifique, vérité, technique et esthétique',
          'Étude d’œuvres (Descartes, Discours de la méthode), dissertation et explication de texte',
        ]
      : [
          'Qu’est-ce que philosopher ?, domaines de la philosophie et méthodologie',
          'Mythes, philosophie grecque, Moyen Âge, Temps modernes et philosophies africaines',
        ],
  };

  const generalHG: SubjectSpec = {
    subject: 'Histoire-Géographie',
    title: isTerm
      ? `Histoire (19 leçons) & Géographie (18 leçons) — ${lvlLabel}`
      : `Histoire (23 leçons) & Géographie (23 leçons) — ${lvlLabel}`,
    objectif: isTerm
      ? 'Maîtriser le monde contemporain, les civilisations et le système-monde.'
      : 'Analyser impérialisme, guerres mondiales, démographie et dynamiques économiques.',
    notions: isTerm
      ? [
          'Guerre froide, décolonisation, civilisations négro-africaines et monde musulman',
          'Système-monde, Amérique du Nord, Europe, Asie-Pacifique, Afrique et Sénégal',
        ]
      : [
          'Révolution industrielle, impérialisme, résistances africaines et Sénégal (1914-1945)',
          'Population mondiale, agriculture, urbanisation, transports et intégration économique',
        ],
  };

  const generalLangues: SubjectSpec = {
    subject: 'Langues vivantes',
    title: isTerm
      ? `Anglais ${lvlLabel} : grammaire consolidée et thèmes d’étude (23 leçons)`
      : `Anglais ${lvlLabel} : maîtrise grammaticale et thèmes de société (35 leçons)`,
    objectif: `Maîtriser compréhension, grammaire et expression écrite en ${lvlLabel}.`,
    notions: isTerm
      ? [
          'Temps, modaux, passif, discours indirect, conditionnels et relatives',
          'Emploi, économie, santé, environnement, patrimoine, sciences et éducation',
        ]
      : [
          'Présent, passé, futur, passif, modaux, comparatifs et discours rapporté',
          'Métiers, loisirs, économie, environnement, patrimoine et médias',
        ],
  };

  const buildMathSpec = (): SubjectSpec => {
    if (serie === 'S1' || serie === 'S3') {
      return {
        subject: 'Mathématiques',
        title: isTerm
          ? `Mathématiques ${lvlLabel} : complexes, arithmétique, intégrales et géométrie (14 chapitres)`
          : `Mathématiques ${lvlLabel} : algèbre, analyse, barycentre et trigonométrie (7 h/semaine)`,
        objectif: isTerm
          ? `Maîtriser les 14 chapitres scientifiques de ${lvlLabel} pour le Baccalauréat.`
          : `Approfondir analyse, géométrie vectorielle et probabilités en ${lvlLabel}.`,
        notions: isTerm
          ? [
              'Probabilités conditionnelles, variables aléatoires, complexes et arithmétique (PGCD, congruences)',
              'Suites, limites, dérivation, ln, exp, puissances, intégrales et équations différentielles',
              'Barycentres, isométries, similitudes, géométrie dans l’espace, courbes paramétrées et coniques',
            ]
          : [
              'Polynômes, systèmes, calcul vectoriel, barycentre, produit scalaire et trigonométrie',
              'Fonctions numériques, limites, dérivation, suites, dénombrement et statistique',
            ],
      };
    }

    if (serie === 'S2' || serie === 'S4' || serie === 'S5') {
      return {
        subject: 'Mathématiques',
        title: isTerm
          ? `Mathématiques ${lvlLabel} : analyse, suites, intégrales, complexes et probabilités`
          : `Mathématiques ${lvlLabel} : fonctions, trigonométrie, suites et probabilités`,
        objectif: isTerm
          ? `Maîtriser l’analyse, les nombres complexes et les probabilités du programme officiel de ${lvlLabel}.`
          : `Consolider fonctions, dérivation, suites et dénombrement en ${lvlLabel}.`,
        notions: isTerm
          ? [
              'Fonctions, dérivées, primitives, logarithme népérien et exponentielle',
              'Suites numériques, calcul intégral et équations différentielles',
              'Nombres complexes (applications géométriques), variables aléatoires et probabilités',
            ]
          : [
              'Équations, systèmes, barycentre, produit scalaire et trigonométrie',
              'Fonctions, dérivation, suites numériques, statistique et dénombrement',
            ],
      };
    }

    if (serie === 'L1a/L1b' || serie === 'L’1' || serie === 'L2') {
      return {
        subject: 'Mathématiques',
        title: isTerm
          ? `Mathématiques ${lvlLabel} : polynômes, probabilités, ln, exp, suites et intégrales (13 chapitres)`
          : `Mathématiques ${lvlLabel} : fonctions, dérivation, suites et dénombrement (13 chapitres · 3 h/sem)`,
        objectif: `Maîtriser les 13 chapitres du programme littéraire de ${lvlLabel}.`,
        notions: isTerm
          ? [
              'Applications, factorisation de polynômes, dénombrement, probabilités et ajustement linéaire',
              'Limites, continuité, dérivation, étude de fonctions et résolution d’équations',
              'Logarithme népérien, fonction exponentielle, suites et calcul intégral',
            ]
          : [
              'Systèmes d’équations, polynômes, limites, continuité et dérivabilité',
              'Étude de fonctions polynômes, homographiques et réciproques (x², √x)',
              'Suites arithmétiques et géométriques, statistiques à deux variables et dénombrement',
            ],
      };
    }

    return {
      subject: 'Mathématiques',
      title: `Mathématiques ${lvlLabel} : analyse, suites et probabilités`,
      objectif: `Maîtriser les outils mathématiques attendus en ${lvlLabel}.`,
      notions: [
        'Analyse des fonctions, suites numériques et calcul différentiel/intégral',
        'Statistiques, dénombrement et probabilités',
      ],
    };
  };

  const buildPhysSpec = (): SubjectSpec => {
    if (serie === 'L2') {
      return {
        subject: 'Sciences physiques',
        title: isTerm
          ? 'Physique-Chimie Terminale L2 : énergie, ondes, lumière et chimie quotidienne (5+5 chapitres)'
          : 'Physique-Chimie Première L2 : chute libre, énergie, lentilles, organique et redox',
        objectif: isTerm
          ? 'Maîtriser les 5 chapitres de physique et 5 chapitres de chimie du programme de Terminale L2.'
          : 'Comprendre énergie mécanique, optique, chimie organique et pile Daniell en Première L2.',
        notions: isTerm
          ? [
              'Physique (5 chap.) : énergie électrique et nucléaire, signaux, ondes mécaniques et lumière',
              'Chimie (5 chap.) : matières plastiques et textiles, savons, lessives, pollution de l’air et de l’eau',
            ]
          : [
              'Chute libre, travail, puissance, énergies cinétique/mécanique et lentilles',
              'Chimie organique (alcanes, chaînes insaturées, composés oxygénés), oxydoréduction et pile Daniell',
            ],
      };
    }

    if (serie === 'S1' || serie === 'S2' || serie === 'S3' || serie === 'F6') {
      return {
        subject: 'Sciences physiques',
        title: isTerm
          ? `Physique-Chimie ${lvlLabel} : mécanique, électromagnétisme, optique et solutions (15+9 chapitres)`
          : `Physique-Chimie ${lvlLabel} : énergie, champs, ondes, chimie organique et électrochimie`,
        objectif: isTerm
          ? `Maîtriser les 15 chapitres de physique et 9 chapitres de chimie de ${lvlLabel}.`
          : `Établir les lois d’énergie, d’électrostatique, d’optique et de chimie en ${lvlLabel}.`,
        notions: isTerm
          ? [
              'Cinématique, dynamique, gravitation, champs magnétiques, Laplace, dipôles RL/RC et oscillations',
              'Interférences lumineuses, effet photoélectrique, atome et réactions nucléaires',
              'Alcools, amines, acides carboxyliques, cinétique, pH, acides/bases, effet tampon et stéréochimie',
            ]
          : [
              'Énergie, champs, condensateurs, électronique, phénomènes vibratoires, ondes et optique',
              'Chimie organique et électrochimie',
            ],
      };
    }

    return {
      subject: 'Sciences physiques',
      title: `Physique-Chimie ${lvlLabel} : mécanique, électricité et chimie appliquée`,
      objectif: `Maîtriser les bases physiques et chimiques utiles en ${lvlLabel}.`,
      notions: [
        'Mécanique, énergie électrique et phénomènes ondulatoires ou optiques',
        'Solutions aqueuses, cinétique et réactions chimiques',
      ],
    };
  };

  const buildSvtSpec = (): SubjectSpec => {
    if (serie === 'S2') {
      return {
        subject: 'SVT',
        title: isTerm
          ? 'SVT Terminale S2 : neurophysiologie, milieu intérieur, immunologie, génétique et biotechnologies (30 leçons)'
          : 'SVT Première S2 : cellule, nutrition, respiration, génétique et géologie du Sénégal',
        objectif: isTerm
          ? 'Maîtriser l’intégralité des 30 leçons du programme officiel de Terminale S2.'
          : 'Comprendre la cellule, le métabolisme énergétique et la géologie en Première S2.',
        notions: isTerm
          ? [
              'Système nerveux, tissu nerveux, muscle strié, activité cardiaque et pression artérielle',
              'Étude du milieu intérieur, régulation de la glycémie et immunologie',
              'Reproduction des mammifères et spermaphytes, génétique, hérédité et biotechnologies',
            ]
          : [
              'Organisation cellulaire, échanges, synthèse des protéines et division cellulaire',
              'Digestion, nutrition humaine, respiration, fermentation et géologie du Sénégal',
            ],
      };
    }

    if (serie === 'S1') {
      return {
        subject: 'SVT',
        title: isTerm
          ? 'SVT Terminale S1 : physiologie nerveuse, cardiaque, glycémie, immunologie et génétique (19 leçons)'
          : 'SVT Première S1 : biologie cellulaire, énergétique et géologie',
        objectif: isTerm
          ? 'Maîtriser les 19 leçons du programme officiel de SVT en Terminale S1.'
          : 'Acquérir les bases de biologie cellulaire, nutrition et géologie de Première S1.',
        notions: isTerm
          ? [
              'Système nerveux, muscle strié, activité cardiaque et pression artérielle',
              'Régulation de la glycémie et défense immunitaire',
              'Reproduction chez les mammifères, génétique et hérédité humaine',
            ]
          : [
              'Cellule, synthèse des protéines, division cellulaire et métabolisme énergétique',
              'Nutrition humaine et ressources géologiques du Sénégal',
            ],
      };
    }

    if (serie === 'L2') {
      return {
        subject: 'SVT',
        title: isTerm
          ? 'SVT Terminale L2 : système nerveux, cœur, glycémie, immunité et hérédité (11 leçons)'
          : 'SVT Première L2 : cellule, protéines, digestion et géologie',
        objectif: isTerm
          ? 'Maîtriser les 11 leçons du programme officiel de SVT en Terminale L2.'
          : 'Comprendre le fonctionnement cellulaire, la nutrition humaine et la géologie en Première L2.',
        notions: isTerm
          ? [
              'Organisation du système nerveux, muscle strié et activité cardiaque',
              'Régulation de la glycémie et immunologie',
              'Hérédité humaine et grands enjeux biologiques',
            ]
          : [
              'Cellule, synthèse des protéines et division cellulaire',
              'Digestion, besoins alimentaires et géologie du Sénégal',
            ],
      };
    }

    return {
      subject: 'SVT',
      title: `SVT ${lvlLabel} : physiologie, immunologie, reproduction et génétique`,
      objectif: `Relier fonctions biologiques et enjeux environnementaux en ${lvlLabel}.`,
      notions: [
        'Système nerveux, activité musculaire et régulation physiologique',
        'Immunologie, reproduction et transmission génétique',
      ],
    };
  };

  const mathSpec = buildMathSpec();
  const physSpec = buildPhysSpec();
  const svtSpec = buildSvtSpec();

  if (serie === 'S1' || serie === 'S3') {
    const specs: SubjectSpec[] = [mathSpec, physSpec];
    if (serie === 'S3') {
      specs.push({
        subject: 'Sciences et technologies de l’ingénieur',
        title: `Sciences de l’ingénieur (${lvlLabel}) : systèmes techniques et conception`,
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
    const specs = [svtSpec, physSpec, mathSpec, generalFrench];
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
            ? `Sciences agronomiques (${lvlLabel}) : sols, eau et écosystèmes`
            : `Génie agroalimentaire (${lvlLabel}) : transformation, conservation et qualité`,
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
      physSpec,
      mathSpec,
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
        title: `Économie ${lvlLabel} : croissance, marché, échanges et politiques économiques`,
        objectif: 'Analyser les mécanismes macroéconomiques et les documents statistiques.',
        notions: [
          'Circuit économique, croissance, monnaie et financement',
          'Commerce international, emploi et politiques publiques',
        ],
      },
      {
        subject: 'Gestion',
        title: `Gestion ${lvlLabel} : organisation, stratégie et gestion commerciale`,
        objectif: 'Résoudre des études de cas de gestion administrative et commerciale.',
        notions: [
          'Organisation de l’entreprise, gestion commerciale et ressources',
          'Analyse de décisions et indicateurs de performance',
        ],
      },
      {
        subject: 'Comptabilité',
        title: `Comptabilité ${lvlLabel} : opérations courantes, coûts et analyse financière`,
        objectif: 'Enregistrer les opérations comptables et analyser la rentabilité.',
        notions: [
          'Opérations courantes, TVA et travaux d’inventaire',
          'Comptabilité analytique, compte de résultat et bilan fonctionnel',
        ],
      },
      {
        subject: 'Méthodes quantitatives / Mathématiques',
        title: `Méthodes quantitatives ${lvlLabel} : statistiques, suites, probabilités et calcul financier`,
        objectif: 'Appliquer les outils mathématiques aux données économiques et de gestion.',
        notions: [
          'Suites, fonctions appliquées et mathématiques financières',
          'Statistiques à une et deux variables, ajustement et probabilités',
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
        title: `Technologie industrielle ${lvlLabel} : systèmes, conception et réalisation`,
        objectif: 'Concevoir, modéliser et vérifier des solutions techniques industrielles.',
        notions: [
          'Conception, fabrication ou électrotechnique selon l’option',
          'Chaîne d’énergie, chaîne d’information et développement durable',
        ],
      },
      {
        subject: 'Physique appliquée',
        title: `Physique appliquée ${lvlLabel} : électrotechnique, énergie et mécanique`,
        objectif: 'Appliquer les lois de la physique aux systèmes technologiques.',
        notions: [
          'Électricité industrielle, conversion d’énergie et mécanique',
          'Mesures, capteurs et rendement énergétique',
        ],
      },
      mathSpec,
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
        title: `Chimie & Laboratoire ${lvlLabel} : chimie analytique et synthèses`,
        objectif: 'Conduire dosages, analyses et synthèses en respectant la sécurité.',
        notions: [
          'Chimie minérale, organique et analytique',
          'Techniques expérimentales, dosages et contrôle en laboratoire',
        ],
      },
      physSpec,
      mathSpec,
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
        title: `Arabe ${lvlLabel} : littérature, grammaire et expression écrite`,
        objectif: 'Maîtriser l’analyse de textes et la rédaction structurée en arabe.',
        notions: [
          'Étude de textes littéraires et contemporains en arabe',
          'Grammaire, rhétorique et dissertation',
        ],
      },
      {
        subject: 'Instruction islamique',
        title: `Instruction islamique ${lvlLabel} : textes de référence, valeurs et civilisation`,
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
    specs.push(mathSpec);
    return specs;
  }

  // L1a/L1b, L'1, L2
  const specs: SubjectSpec[] = [generalFrench];
  if (isTerm || serie === 'L2') specs.push(generalPhilo);
  if (serie === 'L1a/L1b') {
    specs.push({
      subject: 'Langues anciennes (Grec / Latin)',
      title: `Langues anciennes ${lvlLabel} : version, commentaire et civilisation antique`,
      objectif: 'Traduire et interpréter des textes grecs ou latins selon l’option.',
      notions: [
        'Morphologie, syntaxe et traduction de textes classiques',
        'Culture et institutions antiques',
      ],
    });
  }
  specs.push(generalLangues, generalHG);
  if (serie === 'L2') {
    specs.push({
      subject: 'Économie',
      title: isTerm
        ? 'Économie Terminale L2 : croissance, échange international, développement et monnaie'
        : 'Économie Première L2 : valeur, marché, consommation, investissement et monnaie (25 leçons)',
      objectif: 'Analyser les mécanismes économiques, tableaux statistiques et questions d’analyse.',
      notions: isTerm
        ? [
            'Croissance, développement, échanges internationaux et politiques économiques',
            'Monnaie, financement et étude de textes et tableaux statistiques',
          ]
        : [
            'Valeur, prix d’équilibre, marché, coûts du producteur et élasticité-revenu',
            'Épargne, investissement, monnaie, crédit et zone franc',
          ],
    });
    specs.push(svtSpec, physSpec);
  }
  specs.push(mathSpec);
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
    id: `${classLevel}-${validSerie ?? 'std'}-ex-${index}`,
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
