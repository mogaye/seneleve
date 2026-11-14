export type SchoolCycle = 'Élémentaire' | 'Collège' | 'Lycée';

export const CLASS_LEVELS_FULL = [
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

export const SECONDE_SERIES = ['L', 'S', 'T'] as const;
export const PREMIERE_SERIES = ['L1', 'L2', 'S1', 'S2', 'STEG', 'STIDD'] as const;

export type SerieOption =
  | (typeof SECONDE_SERIES)[number]
  | (typeof PREMIERE_SERIES)[number]
  | (typeof BAC_SERIES)[number];

export interface ClassMeta {
  id: ClassLevel;
  cycle: SchoolCycle;
  cycleClass: 'cycle-elementaire' | 'cycle-college' | 'cycle-lycee';
  series: readonly SerieOption[];
  examLabel: string;
}

export const CLASS_CATALOG: readonly ClassMeta[] = [
  { id: 'CI', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CP', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CE1', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CE2', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CM1', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'Évaluation des acquis' },
  { id: 'CM2', cycle: 'Élémentaire', cycleClass: 'cycle-elementaire', series: [], examLabel: 'CFEE' },
  { id: '6e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '5e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '4e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'Composition semestrielle' },
  { id: '3e', cycle: 'Collège', cycleClass: 'cycle-college', series: [], examLabel: 'BFEM' },
  { id: '2nde', cycle: 'Lycée', cycleClass: 'cycle-lycee', series: SECONDE_SERIES, examLabel: 'Devoir de niveau' },
  { id: '1re', cycle: 'Lycée', cycleClass: 'cycle-lycee', series: PREMIERE_SERIES, examLabel: 'Épreuve anticipée' },
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
  lecon: string;
  exemples: string[];
  aRetenir: string[];
  summary: string;
  flashcards: { question: string; answer: string }[];
  quiz: {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ExerciseQuestion {
  id: string;
  category: ExerciseCategory;
  subject: string;
  lessonTitle: string;
  difficulty: DifficultyLevel;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface ClassExperience {
  classLevel: ClassLevel;
  cycle: SchoolCycle;
  cycleClass: 'cycle-elementaire' | 'cycle-college' | 'cycle-lycee';
  serie: SerieOption | null;
  examLabel: string;
  subjects: string[];
  lessons: LessonItem[];
  exercises: ExerciseQuestion[];
}

export function getClassMeta(classLevel: ClassLevel): ClassMeta {
  return CLASS_CATALOG.find((c) => c.id === classLevel) ?? CLASS_CATALOG[0];
}

export function getSeriesForClass(classLevel: ClassLevel): readonly SerieOption[] {
  return getClassMeta(classLevel).series;
}

export function getDefaultSerieForClass(classLevel: ClassLevel): SerieOption | null {
  const series = getSeriesForClass(classLevel);
  if (series.length === 0) return null;
  if (series.includes('S2' as SerieOption)) return 'S2';
  if (series.includes('S' as SerieOption)) return 'S';
  return series[0];
}

export function getSubjectsForClassAndSerie(
  classLevel: ClassLevel,
  serie: SerieOption | null,
): string[] {
  if (classLevel === 'CI' || classLevel === 'CP') {
    return ['Lecture & Écriture', 'Calcul & Numération', 'Vivre dans son milieu', 'Éducation artistique', 'Langage'];
  }
  if (classLevel === 'CE1' || classLevel === 'CE2') {
    return ['Français', 'Mathématiques', 'Éveil scientifique', 'Histoire-Géographie', 'Vivre ensemble'];
  }
  if (classLevel === 'CM1' || classLevel === 'CM2') {
    return ['Français', 'Mathématiques', 'Éveil scientifique', 'Histoire-Géographie', 'Éducation civique'];
  }
  if (classLevel === '6e' || classLevel === '5e' || classLevel === '4e' || classLevel === '3e') {
    return ['Français', 'Mathématiques', 'SVT / Sciences physiques', 'Histoire-Géographie', 'Anglais'];
  }

  // Lycée (2nde, 1re, Terminale) with série differentiation
  const activeSerie = serie ?? getDefaultSerieForClass(classLevel) ?? 'S';
  if (activeSerie === 'STEG') {
    return ['Économie & Gestion', 'Comptabilité', 'Mathématiques', 'Français', 'Anglais'];
  }
  if (activeSerie === 'STIDD' || activeSerie === 'F6' || activeSerie === 'T') {
    return ['Sciences de l’ingénieur', 'Mathématiques', 'Physique appliquée', 'Français', 'Anglais'];
  }
  if (activeSerie.startsWith('S')) {
    return ['Mathématiques', 'Sciences Physiques', 'SVT', 'Philosophie', 'Français'];
  }
  if (activeSerie.startsWith('L')) {
    return ['Philosophie', 'Français', 'Histoire-Géographie', 'Langues vivantes', 'Mathématiques'];
  }
  return ['Arabe', 'Français', 'Philosophie', 'Histoire-Géographie', 'Instruction islamique'];
}

function buildLessonsForClass(
  classLevel: ClassLevel,
  subjects: string[],
  serie: SerieOption | null,
): LessonItem[] {
  const s0 = subjects[0] ?? 'Français';
  const s1 = subjects[1] ?? 'Mathématiques';
  const s2 = subjects[2] ?? 'Sciences';
  const s3 = subjects[3] ?? 'Histoire-Géographie';

  if (classLevel === 'CI' || classLevel === 'CP') {
    return [
      {
        id: `${classLevel}-l1`,
        title: 'Les voyelles et les premières syllabes',
        subject: s0,
        objectif: 'Reconnaître les voyelles et former des syllabes simples à voix haute.',
        lecon: 'En associant une consonne et une voyelle, on forme une syllabe claire : m + a donne ma, p + a donne pa.',
        exemples: ['m + a → ma (maman)', 'l + i → li (livre)'],
        aRetenir: ['Observer chaque lettre de gauche à droite.', 'Prononcer doucement chaque syllabe.'],
        summary: 'Assembler consonne et voyelle pour lire des syllabes puis des mots simples.',
        flashcards: [
          { question: 'Que donne la lettre m suivie de a ?', answer: 'La syllabe ma.' },
          { question: 'Combien de syllabes entend-on dans « papa » ?', answer: '2 syllabes : pa-pa.' },
        ],
        quiz: [
          {
            question: 'Quelle syllabe obtient-on avec b + o ?',
            choices: ['ba', 'bo', 'bi'],
            correctIndex: 1,
            explanation: 'La consonne b avec la voyelle o forme la syllabe bo.',
          },
          {
            question: 'Quel mot commence par « ma » ?',
            choices: ['matin', 'soleil', 'livre'],
            correctIndex: 0,
            explanation: '« matin » commence par la syllabe ma.',
          },
        ],
      },
      {
        id: `${classLevel}-l2`,
        title: 'Compter et additionner jusqu’à 20',
        subject: s1,
        objectif: 'Dénombrer une petite collection et réussir une addition simple.',
        lecon: 'Additionner signifie réunir deux quantités pour trouver le total.',
        exemples: ['4 billes + 3 billes = 7 billes.', '10 + 5 = 15.'],
        aRetenir: ['Compter en avançant sur la file numérique.', 'Regrouper par dizaines dès que l’on atteint 10.'],
        summary: 'Réunir deux nombres pour obtenir la somme totale.',
        flashcards: [
          { question: 'Combien font 6 + 4 ?', answer: '10.' },
        ],
        quiz: [
          {
            question: 'Combien font 8 + 5 ?',
            choices: ['12', '13', '14'],
            correctIndex: 1,
            explanation: '8 + 2 = 10, puis 10 + 3 = 13.',
          },
        ],
      },
      {
        id: `${classLevel}-l3`,
        title: 'Prendre soin de son environnement proche',
        subject: s2,
        objectif: 'Identifier les gestes simples de propreté et de respect autour de soi.',
        lecon: 'Garder la salle propre, économiser l’eau et respecter les plantes aide chacun à vivre dans un cadre sain.',
        exemples: ['Jeter les papiers dans la poubelle.', 'Fermer le robinet après s’être lavé les mains.'],
        aRetenir: ['Chaque geste quotidien protège la santé et la nature.'],
        summary: 'Adopter les bons réflexes d’hygiène et de protection du milieu.',
        flashcards: [
          { question: 'Que faire après avoir utilisé un robinet ?', answer: 'Bien le fermer pour ne pas gaspiller l’eau.' },
        ],
        quiz: [
          {
            question: 'Où doit-on déposer les déchets ?',
            choices: ['Dans la poubelle', 'Par terre', 'Dans la cour'],
            correctIndex: 0,
            explanation: 'Les déchets doivent toujours aller dans la poubelle.',
          },
        ],
      },
    ];
  }

  if (classLevel === 'CE1' || classLevel === 'CE2' || classLevel === 'CM1' || classLevel === 'CM2') {
    return [
      {
        id: `${classLevel}-l1`,
        title: 'Accord du verbe avec son sujet',
        subject: s0,
        objectif: 'Identifier le sujet dans la phrase et accorder correctement le verbe.',
        lecon: 'Le verbe s’accorde toujours en personne et en nombre avec son sujet, même lorsque le sujet est éloigné ou inversé.',
        exemples: ['Les élèves préparent leur leçon.', 'Dans la cour résonnent des chants joyeux.'],
        aRetenir: ['Poser la question « Qui est-ce qui ? » pour repérer le sujet.', 'Vérifier singulier ou pluriel avant la terminaison.'],
        summary: 'Repérer le groupe sujet pour choisir la bonne terminaison verbale.',
        flashcards: [
          { question: 'Comment trouver le sujet d’un verbe ?', answer: 'En posant la question « Qui est-ce qui + verbe ? ».' },
          { question: 'Quelle terminaison prend un verbe avec « ils » au présent ?', answer: '-ent (ou -ont pour être/avoir/aller/faire).' },
        ],
        quiz: [
          {
            question: 'Complète : « Mes camarades … attentivement. »',
            choices: ['écoute', 'écoutent', 'écoutes'],
            correctIndex: 1,
            explanation: 'Le sujet « Mes camarades » est au pluriel, donc le verbe prend -ent (« écoutent »).',
          },
          {
            question: 'Dans « Le vent souffle fort », quel est le sujet ?',
            choices: ['fort', 'souffle', 'Le vent'],
            correctIndex: 2,
            explanation: 'C’est « Le vent » qui fait l’action de souffler.',
          },
        ],
      },
      {
        id: `${classLevel}-l2`,
        title: 'Fractions et problèmes de partage',
        subject: s1,
        objectif: 'Lire, comparer et additionner des fractions de même dénominateur.',
        lecon: 'Une fraction a/b exprime a parts prélevées sur une unité partagée en b parts égales.',
        exemples: ['2/5 + 1/5 = 3/5.', '3/6 = 1/2 en divisant haut et bas par 3.'],
        aRetenir: ['On additionne les numérateurs en gardant le dénominateur commun.', 'Une fraction égale à 1 a le même numérateur et dénominateur.'],
        summary: 'Comparer et additionner des parts égales à partir d’un dénominateur commun.',
        flashcards: [
          { question: 'Que représente le dénominateur d’une fraction ?', answer: 'Le nombre total de parts égales dans l’unité.' },
        ],
        quiz: [
          {
            question: 'Combien font 1/4 + 2/4 ?',
            choices: ['3/8', '3/4', '2/4'],
            correctIndex: 1,
            explanation: 'On additionne 1 + 2 = 3 en conservant le dénominateur 4.',
          },
        ],
      },
      {
        id: `${classLevel}-l3`,
        title: 'Le cycle de l’eau dans la nature',
        subject: s2,
        objectif: 'Décrire les transformations de l’eau sous l’effet de la chaleur et du froid.',
        lecon: 'Sous l’action du soleil, l’eau s’évapore, forme des nuages par condensation, puis retombe sous forme de pluie.',
        exemples: ['Évaporation → Condensation → Précipitations.', 'Ruissellement vers les rivières et les nappes.'],
        aRetenir: ['Le cycle de l’eau est continu et renouvelé par l’énergie solaire.'],
        summary: 'Passages successifs entre états liquide, vapeur et nuages.',
        flashcards: [
          { question: 'Comment appelle-t-on le passage de la vapeur aux gouttelettes de nuage ?', answer: 'La condensation.' },
        ],
        quiz: [
          {
            question: 'Quelle énergie provoque l’évaporation de l’eau ?',
            choices: ['Le soleil', 'Le vent seul', 'La lune'],
            correctIndex: 0,
            explanation: 'La chaleur du soleil transforme l’eau liquide en vapeur d’eau.',
          },
        ],
      },
    ];
  }

  if (classLevel === '6e' || classLevel === '5e' || classLevel === '4e' || classLevel === '3e') {
    return [
      {
        id: `${classLevel}-l1`,
        title: 'Équations et inéquations du premier degré',
        subject: s1,
        objectif: 'Résoudre ax + b = c pas à pas et vérifier la solution obtenue.',
        lecon: 'On isole l’inconnue x en appliquant la même opération des deux côtés de l’égalité. Pour une inéquation, diviser par un nombre négatif inverse le sens du signe.',
        exemples: ['3x + 5 = 17 ⇒ 3x = 12 ⇒ x = 4.', '−2x ≤ 8 ⇒ x ≥ −4.'],
        aRetenir: ['Toujours vérifier en remplaçant x dans l’équation initiale.', 'Inverser le signe d’inégalité lors d’une division négative.'],
        summary: 'Isoler l’inconnue, respecter les règles de signe et contrôler le résultat.',
        flashcards: [
          { question: 'Que devient le signe < si on divise par −3 ?', answer: 'Il s’inverse et devient >.' },
          { question: 'Solution de 4x − 8 = 0 ?', answer: 'x = 2.' },
        ],
        quiz: [
          {
            question: 'Quelle est la solution de 5x − 10 = 15 ?',
            choices: ['x = 1', 'x = 5', 'x = 25'],
            correctIndex: 1,
            explanation: '5x = 25 donc x = 5.',
          },
          {
            question: 'Si −3x > 9, alors :',
            choices: ['x > −3', 'x < −3', 'x < 3'],
            correctIndex: 1,
            explanation: 'Diviser par −3 inverse > en <.',
          },
        ],
      },
      {
        id: `${classLevel}-l2`,
        title: 'Analyse de texte et figure de style',
        subject: s0,
        objectif: 'Repérer les figures de comparaison et justifier leur effet dans un texte.',
        lecon: 'La comparaison relie deux éléments avec un outil de comparaison (comme, tel), tandis que la métaphore rapproche directement sans outil.',
        exemples: ['Comparaison : « Fort comme un lion ».', 'Métaphore : « Un océan de lumière ».'],
        aRetenir: ['Nommer la figure puis expliquer l’image créée par l’auteur.'],
        summary: 'Distinguer comparaison et métaphore et interpréter leur sens.',
        flashcards: [
          { question: 'Quelle est la différence entre comparaison et métaphore ?', answer: 'La comparaison utilise un mot-outil (« comme »), la métaphore non.' },
        ],
        quiz: [
          {
            question: 'Quelle phrase contient une métaphore ?',
            choices: ['Il court comme le vent', 'Ce jeune élève est un roc', 'Elle semble fatiguée'],
            correctIndex: 1,
            explanation: 'Le rapprochement est direct, sans outil de comparaison.',
          },
        ],
      },
      {
        id: `${classLevel}-l3`,
        title: 'Photosynthèse et respiration cellulaire',
        subject: s2,
        objectif: 'Expliquer les échanges gazeux des plantes chlorophylliennes à la lumière.',
        lecon: 'Les feuilles captent le dioxyde de carbone et l’énergie lumineuse grâce à la chlorophylle pour produire de la matière organique et rejeter du dioxygène.',
        exemples: ['Eau + CO₂ + lumière → glucides + O₂.', 'Sans lumière, la synthèse d’amidon s’arrête.'],
        aRetenir: ['La photosynthèse demande lumière, eau, CO₂ et chlorophylle.'],
        summary: 'Production de matière organique par les feuilles vertes à la lumière.',
        flashcards: [
          { question: 'Quel pigment capte la lumière dans les feuilles ?', answer: 'La chlorophylle.' },
        ],
        quiz: [
          {
            question: 'Quel gaz est libéré pendant la photosynthèse ?',
            choices: ['Dioxyde de carbone', 'Dioxygène', 'Azote'],
            correctIndex: 1,
            explanation: 'La plante absorbe du CO₂ et libère du dioxygène.',
          },
        ],
      },
    ];
  }

  // Lycée (2nde, 1re, Terminale) tailored to Série
  const serieTag = serie ? `Série ${serie}` : 'Parcours général';
  if (serie === 'STEG') {
    return [
      {
        id: `${classLevel}-steg-l1`,
        title: 'Le bilan comptable : Actif et Passif',
        subject: s1,
        objectif: 'Classer les emplois et les ressources d’une entreprise selon le plan SYSCOHADA.',
        lecon: `En ${serieTag}, le bilan présente le patrimoine à une date donnée : l’Actif regroupe les biens et créances, le Passif regroupe les capitaux propres et dettes.`,
        exemples: ['Total Actif = Total Passif à l’équilibre.', 'Immobilisations à l’Actif ; Emprunts au Passif.'],
        aRetenir: ['Actif = Emplois ; Passif = Ressources.', 'L’équilibre financier impose l’égalité stricte des deux colonnes.'],
        summary: 'Structurer l’Actif et le Passif et vérifier l’égalité fondamentale du bilan.',
        flashcards: [
          { question: 'Où inscrit-on les capitaux propres dans un bilan ?', answer: 'Au Passif (ressources durables).' },
          { question: 'Quelle relation lie le total Actif et le total Passif ?', answer: 'Ils sont toujours égaux.' },
        ],
        quiz: [
          {
            question: 'Dans quelle colonne classe-t-on un matériel informatique acquis par l’entreprise ?',
            choices: ['À l’Actif immobilisé', 'Au Passif circulant', 'Dans les charges'],
            correctIndex: 0,
            explanation: 'C’est un bien durable détenu par l’entreprise, donc à l’Actif immobilisé.',
          },
        ],
      },
      {
        id: `${classLevel}-steg-l2`,
        title: 'Croissance, marché et circuit économique',
        subject: s0,
        objectif: 'Analyser les flux réels et monétaires entre ménages, entreprises et État.',
        lecon: 'Les agents économiques échangent biens, services et revenus sur différents marchés reliés en circuit.',
        exemples: ['Travail fourni → salaire versé.', 'Consommation des ménages → chiffre d’affaires.'],
        aRetenir: ['Tout flux réel a une contrepartie monétaire inverse.'],
        summary: 'Comprendre l’interdépendance des agents dans le circuit économique.',
        flashcards: [
          { question: 'Quelle est la contrepartie monétaire du travail ?', answer: 'Le salaire.' },
        ],
        quiz: [
          {
            question: 'Qui assure principalement la production de biens marchands ?',
            choices: ['Les sociétés non financières', 'Les ménages seuls', 'Les associations'],
            correctIndex: 0,
            explanation: 'Les entreprises produisent des biens et services marchands.',
          },
        ],
      },
      {
        id: `${classLevel}-steg-l3`,
        title: 'Suites géométriques et intérêts composés',
        subject: s2,
        objectif: 'Modéliser une capitalisation annuelle à taux fixe.',
        lecon: 'Un capital placé à intérêts composés suit une suite géométrique de raison (1 + t).',
        exemples: ['Cₙ = C₀ × (1 + t)ⁿ.', 'À 5 %, on multiplie par 1,05 chaque année.'],
        aRetenir: ['Exprimer toujours le taux t en valeur décimale (5 % = 0,05).'],
        summary: 'Calculer une valeur future par progression géométrique.',
        flashcards: [
          { question: 'Quelle est la raison d’une hausse de 4 % ?', answer: '1,04.' },
        ],
        quiz: [
          {
            question: 'Quel coefficient correspond à une augmentation de 10 % ?',
            choices: ['0,10', '1,10', '1,01'],
            correctIndex: 1,
            explanation: '1 + 10/100 = 1,10.',
          },
        ],
      },
    ];
  }

  return [
    {
      id: `${classLevel}-lyc-l1`,
      title: `Fonctions numériques et dérivation (${serieTag})`,
      subject: s0 === 'Mathématiques' ? s0 : s1,
      objectif: 'Calculer la fonction dérivée et dresser le tableau de variations complet.',
      lecon: `En ${serieTag}, le signe de f’(x) détermine les variations de f : croissante lorsque f’(x) > 0, décroissante lorsque f’(x) < 0.`,
      exemples: ['f(x) = x² − 4x + 1 ⇒ f’(x) = 2x − 4.', 'Extremum local en x = 2 où f’ s’annule en changeant de signe.'],
      aRetenir: ['(xⁿ)’ = n·xⁿ⁻¹ et dérivée d’une constante = 0.', 'Toujours justifier par le signe de f’.'],
      summary: 'Dériver, chercher les zéros de f’, étudier son signe et conclure sur les variations.',
      flashcards: [
        { question: 'Quelle est la dérivée de f(x) = 3x² + 2 ?', answer: 'f’(x) = 6x.' },
        { question: 'Si f’(x) < 0 sur un intervalle, comment varie f ?', answer: 'f est décroissante sur cet intervalle.' },
      ],
      quiz: [
        {
          question: 'Quelle est la dérivée de f(x) = x³ ?',
          choices: ['3x', '3x²', 'x²'],
          correctIndex: 1,
          explanation: 'Avec (xⁿ)’ = n·xⁿ⁻¹, on obtient 3x².',
        },
        {
          question: 'En un extremum local d’une fonction dérivable, que vaut f’(x) ?',
          choices: ['1', '0', '−1'],
          correctIndex: 1,
          explanation: 'La dérivée s’annule et change de signe.',
        },
      ],
    },
    {
      id: `${classLevel}-lyc-l2`,
      title: `Dissertation et argumentation structurée (${serieTag})`,
      subject: s3 === 'Français' ? s3 : subjects.find((s) => s === 'Français' || s === 'Philosophie') ?? s0,
      objectif: 'Construire une introduction rigoureuse et des paragraphes argumentés.',
      lecon: 'Une introduction comporte trois étapes : l’amorce, la problématique et l’annonce du plan. Chaque paragraphe défend une idée directrice illustrée par un exemple analysé.',
      exemples: ['Amorce culturelle ou philosophique.', 'Connecteur logique + argument + citation analysée.'],
      aRetenir: ['Lier chaque partie à la problématique centrale.', 'Conclure avec netteté sans ouvrir sur un hors-sujet.'],
      summary: 'Introduction en 3 temps, développement progressif et conclusion répondant au sujet.',
      flashcards: [
        { question: 'Quels sont les trois temps d’une introduction ?', answer: 'Amorce, problématique et annonce du plan.' },
      ],
      quiz: [
        {
          question: 'À quoi sert la problématique ?',
          choices: ['Réciter le cours', 'Formuler la question directrice du devoir', 'Remplacer la conclusion'],
          correctIndex: 1,
          explanation: 'Elle reformule le sujet en une question centrale.',
        },
      ],
    },
    {
      id: `${classLevel}-lyc-l3`,
      title: `Méthodologie d’analyse et synthèse (${serieTag})`,
      subject: s2,
      objectif: 'Mobiliser les lois fondamentales et rédiger une démonstration concise.',
      lecon: 'Chaque raisonnement scientifique ou littéraire repose sur l’identification des données, le choix de la loi adaptée et l’interprétation du résultat.',
      exemples: ['Énoncer le principe utilisé avant le calcul.', 'Vérifier l’ordre de grandeur et les unités.'],
      aRetenir: ['Clarté des étapes = points assurés à l’épreuve.'],
      summary: 'Structurer l’analyse : données, principe, application et conclusion.',
      flashcards: [
        { question: 'Que faut-il toujours vérifier à la fin d’un calcul physique ?', answer: 'L’unité et la cohérence de l’ordre de grandeur.' },
      ],
      quiz: [
        {
          question: 'Quelle étape précède l’application numérique ?',
          choices: ['L’expression littérale', 'La conclusion finale', 'Le brouillon'],
          correctIndex: 0,
          explanation: 'On écrit d’abord la formule littérale avant de remplacer par les valeurs.',
        },
      ],
    },
  ];
}

function buildExercisesForClass(
  classLevel: ClassLevel,
  subjects: string[],
  lessons: LessonItem[],
): ExerciseQuestion[] {
  const l0 = lessons[0];
  const l1 = lessons[1] ?? lessons[0];
  const l2 = lessons[2] ?? lessons[0];

  return [
    {
      id: `${classLevel}-ex1`,
      category: 'Exercices par leçon',
      subject: l0.subject,
      lessonTitle: l0.title,
      difficulty: 'Découverte',
      prompt: l0.quiz[0].question,
      choices: l0.quiz[0].choices,
      correctIndex: l0.quiz[0].correctIndex,
      explanation: l0.quiz[0].explanation,
    },
    {
      id: `${classLevel}-ex2`,
      category: 'Devoirs',
      subject: l1.subject,
      lessonTitle: l1.title,
      difficulty: 'Entraînement',
      prompt: l1.quiz[0].question,
      choices: l1.quiz[0].choices,
      correctIndex: l1.quiz[0].correctIndex,
      explanation: l1.quiz[0].explanation,
    },
    {
      id: `${classLevel}-ex3`,
      category: 'Sujets d’examen',
      subject: l2.subject,
      lessonTitle: l2.title,
      difficulty: 'Défi',
      prompt: l2.quiz[0].question,
      choices: l2.quiz[0].choices,
      correctIndex: l2.quiz[0].correctIndex,
      explanation: l2.quiz[0].explanation,
    },
    {
      id: `${classLevel}-ex4`,
      category: 'Corrigés',
      subject: subjects[0] ?? l0.subject,
      lessonTitle: l0.title,
      difficulty: 'Entraînement',
      prompt: (l0.quiz[1] ?? l0.quiz[0]).question,
      choices: (l0.quiz[1] ?? l0.quiz[0]).choices,
      correctIndex: (l0.quiz[1] ?? l0.quiz[0]).correctIndex,
      explanation: (l0.quiz[1] ?? l0.quiz[0]).explanation,
    },
  ];
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

  const subjects = getSubjectsForClassAndSerie(classLevel, validSerie);
  const lessons = buildLessonsForClass(classLevel, subjects, validSerie);
  const exercises = buildExercisesForClass(classLevel, subjects, lessons);

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
