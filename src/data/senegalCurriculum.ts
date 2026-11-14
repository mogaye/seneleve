export type CycleId = 'prescolaire' | 'elementaire' | 'moyen' | 'lycee' | 'references';

export interface CurriculumSubject {
  name: string;
  items: string[];
}

export interface CurriculumLink {
  label: string;
  url: string;
  category?: string;
}

export interface SeriesRow {
  code: string;
  dominante: string;
}

export interface CurriculumClassItem {
  id: string;
  shortCode: string;
  title: string;
  subtitle: string;
  badge: string;
  globalOrder: number; // 1..16 across PS -> Terminale (0 for references)
  summary: string;
  subjects: CurriculumSubject[];
  keyPoints: string[];
  evaluationNote: string;
  seriesTable?: SeriesRow[];
  links?: CurriculumLink[];
}

export interface CycleDefinition {
  id: CycleId;
  label: string;
  shortLabel: string;
  ageOrScope: string;
  spiralOrExamNote: string;
  overviewNote: string;
  reformHighlight: string;
  classes: CurriculumClassItem[];
  links: CurriculumLink[];
}

export const SENEGAL_SERIES_TABLE: SeriesRow[] = [
  { code: 'L1a / L1b', dominante: 'Langues anciennes et littéraires, selon l’option grec ou latin et l’offre du lycée' },
  { code: 'L’1', dominante: 'Langues et civilisations modernes' },
  { code: 'L2', dominante: 'Sciences humaines et sociales' },
  { code: 'S1', dominante: 'Sciences exactes, mathématiques et sciences physiques très renforcées' },
  { code: 'S2', dominante: 'Sciences expérimentales, notamment SVT et sciences physiques' },
  { code: 'S3', dominante: 'Sciences et techniques, avec forte dominante scientifique et technique' },
  { code: 'S4', dominante: 'Agriculture et environnement' },
  { code: 'S5', dominante: 'Productions et transformations agroalimentaires' },
  { code: 'STEG', dominante: 'Sciences et technologies de l’économie et de la gestion ; remplace l’ancienne série G' },
  { code: 'STIDD', dominante: 'Sciences et technologies industrielles pour le développement durable ; remplace T1/T2' },
  { code: 'F6', dominante: 'Option technique de chimie, proposée dans certains établissements' },
  { code: 'Franco-arabe / arabe', dominante: 'Parcours avec enseignements renforcés en arabe, selon la série et l’établissement' },
];

export const CURRICULUM_CYCLES: CycleDefinition[] = [
  {
    id: 'prescolaire',
    label: 'Préscolaire',
    shortLabel: 'Préscolaire',
    ageOrScope: '3 à 5 ans · 3 sections',
    spiralOrExamNote: 'Éveil par le jeu, le langage, la manipulation et la vie collective',
    overviewNote:
      'Le préscolaire prépare les enfants de 3 à 5 ans à l’éducation de base par le jeu, le langage, la manipulation, l’autonomie et la vie collective.',
    reformHighlight: 'Guides officiels du curriculum rénové — édition 2024',
    links: [
      { label: 'Guide Petite Section — édition 2024 (PDF)', url: 'https://lecouloirdusavoir.com/GUIDE%20PETITE%20SECTION%20CORRIGE%202024.pdf', category: 'Guide 2024' },
      { label: 'Guide Moyenne Section — édition 2024 (PDF)', url: 'https://lecouloirdusavoir.com/GUIDE%20MOYENNE%20SECTION%20CORRIGE%202024.pdf', category: 'Guide 2024' },
      { label: 'Guide Grande Section — édition 2024 (PDF)', url: 'https://lecouloirdusavoir.com/GUIDE%20GRANDE%20SECTION%20CORRIGE%202024.pdf', category: 'Guide 2024' },
      { label: 'Index des guides du préscolaire et de l’élémentaire', url: 'https://lecouloirdusavoir.com/ressources.html', category: 'Index' },
    ],
    classes: [
      {
        id: 'ps',
        shortCode: 'PS',
        title: 'Petite Section',
        subtitle: '3 ans · Premiers repères',
        badge: '7 dom.',
        globalOrder: 1,
        summary: 'Éveil sensoriel, langage oral quotidien, motricité globale et socialisation douce.',
        subjects: [
          {
            name: 'Langage et communication',
            items: ['Écouter et comprendre des consignes simples, nommer les personnes et objets familiers, dire un besoin, participer à une comptine ou une histoire.'],
          },
          {
            name: 'Motricité',
            items: ['Marcher, courir, sauter, lancer, manipuler, coordonner les gestes ; apprendre les règles de sécurité.'],
          },
          {
            name: 'Premiers apprentissages mathématiques',
            items: ['Trier, apparier, classer, comparer des quantités, reconnaître des formes et des positions, jouer avec un/beaucoup, grand/petit, devant/derrière.'],
          },
          {
            name: 'Découverte du milieu',
            items: ['Corps, famille, classe, maison, animaux, plantes, objets, saisons et phénomènes observables.'],
          },
          {
            name: 'Vie sociale et autonomie',
            items: ['Saluer, partager, ranger, attendre son tour, respecter les règles simples et les autres.'],
          },
          {
            name: 'Éducation artistique et sensorielle',
            items: ['Dessin libre, peinture, modelage, collage, chant, écoute et jeux rythmiques.'],
          },
          {
            name: 'Hygiène et santé',
            items: ['Lavage des mains, propreté, alimentation et prévention des dangers courants.'],
          },
        ],
        keyPoints: [
          'Comprendre des consignes simples et nommer l’environnement familier.',
          'Trier, apparier et comparer un/beaucoup, grand/petit, devant/derrière.',
          'Acquérir les gestes quotidiens d’hygiène, sécurité et partage.',
        ],
        evaluationNote: 'Observation continue des progrès moteurs, langagiers et sociaux en situation de jeu et de vie collective (Guide PS 2024).',
      },
      {
        id: 'ms',
        shortCode: 'MS',
        title: 'Moyenne Section',
        subtitle: '4 ans · Langage & gestes',
        badge: '7 dom.',
        globalOrder: 2,
        summary: 'Structuration du récit oral, préparation graphique et premières suites mathématiques.',
        subjects: [
          {
            name: 'Langage oral',
            items: ['Raconter un événement court, décrire une image, enrichir le vocabulaire, écouter et reformuler une consigne.'],
          },
          {
            name: 'Préparation à la lecture-écriture',
            items: ['Jeux de sons et de syllabes, discrimination visuelle, tenue de l’outil, gestes graphiques et tracés préparatoires.'],
          },
          {
            name: 'Mathématiques',
            items: ['Dénombrer et comparer de petites collections, classer selon un critère, poursuivre une suite simple, reconnaître des formes, se repérer dans l’espace et le temps.'],
          },
          {
            name: 'Découverte du monde',
            items: ['Observer et décrire le corps, le vivant, les objets, les matériaux et le milieu proche.'],
          },
          {
            name: 'Motricité et activités physiques',
            items: ['Équilibre, coordination, parcours, jeux collectifs et respect des règles.'],
          },
          {
            name: 'Arts',
            items: ['Expérimenter couleurs, formes, matières, chant, rythme, expression corporelle et jeu dramatique.'],
          },
          {
            name: 'Vie collective',
            items: ['Autonomie dans les routines, coopération, expression des émotions, respect des autres et du matériel.'],
          },
        ],
        keyPoints: [
          'Jeux de syllabes, discrimination visuelle et tenue de l’outil graphique.',
          'Dénombrement de petites collections et suites logiques simples.',
          'Coopération dans les parcours moteurs et routines de classe.',
        ],
        evaluationNote: 'Évaluations formatives intégrées aux ateliers de langage, graphisme, manipulation mathématique et jeux collectifs (Guide MS 2024).',
      },
      {
        id: 'gs',
        shortCode: 'GS',
        title: 'Grande Section',
        subtitle: '5 ans · Transition CI',
        badge: '7 dom.',
        globalOrder: 3,
        summary: 'Conscience phonologique, principe alphabétique, calcul manipulé et autonomie pour le CI.',
        subjects: [
          {
            name: 'Langage et prélecture',
            items: ['Comprendre des récits, s’exprimer en phrases organisées, décrire et raconter ; conscience phonologique, reconnaissance de lettres et préparation au principe alphabétique.'],
          },
          {
            name: 'Préécriture',
            items: ['Graphisme contrôlé, formes de lettres, copie de signes et préparation à l’écriture du prénom et de mots familiers.'],
          },
          {
            name: 'Mathématiques',
            items: ['Dénombrement, comparaison et composition de collections ; premières procédures de calcul ; suites, formes, repérage, grandeurs et mesures par manipulation.'],
          },
          {
            name: 'Découverte du monde',
            items: ['Corps et santé, plantes et animaux, environnement, objets et usages, repères temporels et spatiaux.'],
          },
          {
            name: 'Éducation sociale et civique',
            items: ['Règles communes, coopération, égalité, respect, sécurité et responsabilités adaptées à l’âge.'],
          },
          {
            name: 'Éducation physique et artistique',
            items: ['Habiletés motrices, jeux d’opposition et de coopération, arts plastiques, musique, expression corporelle et théâtre.'],
          },
          {
            name: 'Transition vers le CI',
            items: ['Écoute, attention, autonomie, compréhension des consignes, goût des livres et familiarité avec les nombres.'],
          },
        ],
        keyPoints: [
          'Conscience phonologique et reconnaissance des lettres pour entrer dans l’écrit.',
          'Composition de collections et premières procédures de calcul.',
          'Écriture du prénom et autonomie face aux consignes scolaires du CI.',
        ],
        evaluationNote: 'Bilan de préparation à l’étape 1 (CI-CP) portant sur le langage, l’attention, la motricité fine et la familiarité numérique (Guide GS 2024).',
      },
    ],
  },
  {
    id: 'elementaire',
    label: 'Élémentaire',
    shortLabel: 'Élémentaire',
    ageOrScope: 'CI à CM2 · 3 étapes CEB',
    spiralOrExamNote: 'Organisation en spirale : Étape 1 (CI-CP), Étape 2 (CE1-CE2), Étape 3 (CM1-CM2)',
    overviewNote:
      'Le Curriculum de l’Éducation de Base (CEB) s’articule en 4 domaines : Langue et communication, Mathématiques, Éducation à la science et à la vie sociale (ESVS) et EPSA.',
    reformHighlight: 'Cahiers PAAME 2024 & Guides pédagogiques CEB (Étapes 1 à 3)',
    links: [
      { label: 'Organisation de l’enseignement élémentaire (MEN)', url: 'https://www.education.sn/pages/elementaire', category: 'Ministère' },
      { label: 'Guide pédagogique CEB — Étape 1 (CI-CP)', url: 'https://lecouloirdusavoir.com/Guide%20p%C3%A9dagogique_%C3%A9tape%201.pdf', category: 'CEB' },
      { label: 'Guide pédagogique CEB — Étape 2 révisé (CE1-CE2)', url: 'https://lecouloirdusavoir.com/guide-pedagogique-etape-2-revise.pdf', category: 'CEB' },
      { label: 'Guide pédagogique CEB — Étape 3 (CM1-CM2)', url: 'https://lecouloirdusavoir.com/Guide%20p%C3%A9dagogique_%C3%A9tape%203.pdf', category: 'CEB' },
      { label: 'Cahier de mathématiques CI — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/1_CI_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
      { label: 'Cahier de mathématiques CP — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/2_CP_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
      { label: 'Cahier de mathématiques CE1 — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/3_CE1_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
      { label: 'Cahier de mathématiques CE2 — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/4_CE2_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
      { label: 'Cahier de mathématiques CM1 — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/5_CM1_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
      { label: 'Cahier de mathématiques CM2 — PAAME 2024', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/6_CM2_version_2024_eleves_PAAME2.pdf', category: 'PAAME 2024' },
    ],
    classes: [
      {
        id: 'ci',
        shortCode: 'CI',
        title: 'CI — Cours d’Initiation',
        subtitle: 'Étape 1 · 1re année',
        badge: 'Étape 1',
        globalOrder: 4,
        summary: 'Entrée dans le décodage syllabique, numération initiale et découverte du milieu proche.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Écouter, comprendre et exécuter des consignes ; parler de soi, de la famille et de la classe.',
              'Développer vocabulaire oral, conscience des syllabes et relation sons-lettres.',
              'Reconnaître progressivement les graphèmes ; combiner syllabes et mots ; lire des phrases simples.',
              'Tracer, copier et écrire lettres, syllabes, mots familiers et courtes phrases.',
              'Écouter des récits, répondre aux questions explicites et ordonner des événements.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Manipuler, trier, comparer et dénombrer ; lire et écrire les nombres du palier.',
              'Comprendre ajout, retrait et partage ; calculer par manipulation et calcul mental.',
              'Repérer objets et déplacements ; reconnaître et reproduire des formes simples.',
              'Comparer longueurs, masses, contenances et durées ; résoudre de petits problèmes à l’oral.',
            ],
          },
          {
            name: 'Science, vie sociale et activités (ESVS / EPSA)',
            items: [
              'Connaître sa famille, l’école et les lieux proches ; observer corps, animaux, plantes, eau et météo.',
              'Appliquer règles d’hygiène, sécurité, respect et vie collective ; pratiquer jeux moteurs, chants, dessins et modelages.',
            ],
          },
        ],
        keyPoints: [
          'Relation sons-lettres et combinaison des premières syllabes.',
          'Situations d’ajout, retrait et partage par manipulation concrète.',
          'Repères d’hygiène, famille, école et milieu proche.',
        ],
        evaluationNote: 'Étape 1 (palier CI) : intégration progressive des acquis oraux, du décodage et des premiers calculs (Guide CEB Étape 1 & Cahier PAAME CI).',
      },
      {
        id: 'cp',
        shortCode: 'CP',
        title: 'CP — Cours Préparatoire',
        subtitle: 'Étape 1 · 2e année',
        badge: 'Étape 1',
        globalOrder: 5,
        summary: 'Consolidation de la lecture courante, addition/soustraction et approche de la multiplication.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Consolider l’alphabet et le décodage ; lire syllabes, mots, phrases et textes courts avec aisance.',
              'Comprendre un texte : personnages, lieu, actions, informations explicites et chronologie.',
              'Copier et produire des phrases courtes ; écrire sous dictée ; utiliser la ponctuation de base.',
              'Développer vocabulaire, récitation, chansons et lecture à voix haute.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Lire, écrire, comparer, ranger et décomposer les nombres ; automatiser des faits numériques.',
              'Additionner et soustraire ; aborder multiplication et partage par groupements concrets.',
              'Résoudre des problèmes de réunion, retrait, comparaison et partage.',
              'Identifier figures usuelles, lignes, positions, déplacements et solides ; mesurer des grandeurs usuelles.',
            ],
          },
          {
            name: 'Science, vie sociale et activités',
            items: [
              'Rôles familiaux et scolaires, métiers, quartier ou village, saisons, eau et objets techniques simples.',
              'Hygiène, sécurité, entraide, protection du cadre de vie et activités sportives/artistiques.',
            ],
          },
        ],
        keyPoints: [
          'Lecture de textes courts et compréhension des éléments clés du récit.',
          'Addition, soustraction et groupements vers la multiplication.',
          'Mesure de grandeurs avec unités usuelles et repères temporels.',
        ],
        evaluationNote: 'Fin d’Étape 1 (CI-CP) : validation des compétences socles de lecture-écriture et de calcul (Guide CEB Étape 1 & Cahier PAAME CP).',
      },
      {
        id: 'ce1',
        shortCode: 'CE1',
        title: 'CE1 — Cours Élémentaire 1',
        subtitle: 'Étape 2 · 1re année',
        badge: 'Étape 2',
        globalOrder: 6,
        summary: 'Textes narratifs/descriptifs/injonctifs, quatre opérations et découverte du temps historique.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Gagner en fluidité ; lire un texte narratif, descriptif ou injonctif et en dégager le sens.',
              'Produire des phrases puis des textes courts organisés (raconter, décrire, donner des instructions).',
              'Étudier classes de mots, groupe nominal, sujet/verbe, accords simples, ponctuation et lexique.',
              'Consolider copie, dictée, orthographe des mots fréquents, cursive et conjugaison usuelle.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Utiliser les quatre opérations au niveau du palier ; mémoriser tables, poser et vérifier des calculs.',
              'Résoudre des problèmes à une ou plusieurs étapes en choisissant l’opération pertinente.',
              'Tracer des figures, se repérer sur quadrillage, utiliser règle et instruments.',
              'Mesurer longueurs, masses, contenances, durées, monnaie et lire un calendrier ou tableau.',
            ],
          },
          {
            name: 'Science, vie sociale et activités',
            items: [
              'Temps de l’élève et histoire locale ; situer l’école, observer relief, eau, végétation et déplacements.',
              'Découvrir le vivant, le corps, les matériaux ; aborder santé, environnement, citoyenneté, égalité et paix.',
            ],
          },
        ],
        keyPoints: [
          'Étude du groupe nominal, sujet-verbe et accords simples.',
          'Quatre opérations, repérage sur quadrillage et instruments de géométrie.',
          'Enquêtes simples d’histoire locale et repères géographiques proches.',
        ],
        evaluationNote: 'Entrée dans l’Étape 2 (CE1-CE2) : consolidation spiralaire en étude de la langue et résolution de problèmes (Guide CEB Étape 2 révisé).',
      },
      {
        id: 'ce2',
        shortCode: 'CE2',
        title: 'CE2 — Cours Élémentaire 2',
        subtitle: 'Étape 2 · 2e année',
        badge: 'Étape 2',
        globalOrder: 7,
        summary: 'Rédaction de lettres, multiplication/division, fractions simples et cartes géographiques.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Comprendre textes narratifs, descriptifs, injonctifs et informatifs, notamment la lettre.',
              'Identifier idée générale, connecteurs, paragraphes et intention ; rédiger et réviser avec une grille.',
              'Approfondir types de phrases, déterminants, adjectifs, pronoms, compléments, accords et conjugaison.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Numération et valeur de position ; multiplication et division (groupement, partage, mesure).',
              'Introduire ou consolider les fractions simples ; résoudre des problèmes plus complexes.',
              'Construire figures, angles et symétrie ; mesurer surfaces, durées, monnaie et lire des graphiques.',
            ],
          },
          {
            name: 'Science, vie sociale et activités',
            items: [
              'Repères historiques locaux ; milieu naturel et humain, ressources, voies de communication et cartes.',
              'Observer vivant, eau, air, matériaux et relier aux problèmes du milieu (propreté, santé, citoyenneté).',
            ],
          },
        ],
        keyPoints: [
          'Rédaction structurée (lettre) et révision guidée.',
          'Multiplication, division, symétrie, angles et premières fractions.',
          'Lecture de cartes simples et actions citoyennes dans le milieu.',
        ],
        evaluationNote: 'Fin d’Étape 2 (CE1-CE2) : maîtrise de l’écrit structuré et des opérations élémentaires avant le Cours Moyen (PAAME CE2).',
      },
      {
        id: 'cm1',
        shortCode: 'CM1',
        title: 'CM1 — Cours Moyen 1',
        subtitle: 'Étape 3 · 1re année',
        badge: 'Étape 3',
        globalOrder: 8,
        summary: 'Nombres décimaux, fractions, proportionnalité, histoire du Sénégal et Afrique de l’Ouest.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Lire des textes longs ; distinguer idées principales/secondaires, inférer et résumer.',
              'Organiser un texte en paragraphes avec connecteurs, reprises nominales/pronominales et vocabulaire adapté.',
              'Approfondir nature et fonction des mots, compléments, accords, conjugaison et révision orthographique.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Consolider numération entière et décimale ; propriétés opératoires et problèmes à plusieurs étapes.',
              'Fractions et proportionnalité simple (partage, mesure).',
              'Droites, segments, angles, polygones, solides ; périmètres, aires, volumes ; tableaux et graphiques.',
            ],
          },
          {
            name: 'Science, vie sociale et activités',
            items: [
              'Histoire du Sénégal, repères chronologiques et sources ; Sénégal en Afrique de l’Ouest sur cartes.',
              'Fonctions du vivant, santé, matière, énergie, objets techniques et développement durable.',
            ],
          },
        ],
        keyPoints: [
          'Cohésion textuelle (connecteurs, reprises) et résumé de textes longs.',
          'Décimaux, fractions, périmètres, aires et proportionnalité.',
          'Géographie de l’Afrique de l’Ouest et fonctions du vivant.',
        ],
        evaluationNote: 'Entrée dans l’Étape 3 (CM1-CM2) : approfondissement méthodologique et scientifique (Guide CEB Étape 3 & PAAME CM1).',
      },
      {
        id: 'cm2',
        shortCode: 'CM2',
        title: 'CM2 — Cours Moyen 2',
        subtitle: 'Étape 3 · Préparation CFEE',
        badge: 'CFEE',
        globalOrder: 9,
        summary: 'Maîtrise des 6 types de textes, raisonnement géométrique complet et préparation au CFEE.',
        subjects: [
          {
            name: 'Langue et communication',
            items: [
              'Analyser textes narratifs, descriptifs, injonctifs, informatifs, argumentatifs et dialogués.',
              'Produire récit, description, consigne, lettre, compte rendu ou texte d’opinion.',
              'Maîtriser grammaire, conjugaison, orthographe, ponctuation ; répondre aux questions implicites et justifier.',
            ],
          },
          {
            name: 'Mathématiques',
            items: [
              'Maîtriser numération, calcul mental/posé, fractions, décimaux et proportionnalité ; vérifier la vraisemblance.',
              'Raisonner à partir de figures (symétrie, angles, polygones, solides) et calculer périmètres, aires et volumes.',
              'Interpréter tableaux/graphiques et conduire une résolution de problème complète.',
            ],
          },
          {
            name: 'Science, vie sociale et activités',
            items: [
              'Histoire du Sénégal et de l’Afrique ; régions sénégalaises, ressources et enjeux environnementaux.',
              'Conduire observations et expériences simples (vivant, matière, énergie) ; relier citoyenneté, droits et paix.',
              'Préparer les évaluations de fin d’élémentaire, dont le CFEE.',
            ],
          },
        ],
        keyPoints: [
          'Texte argumentatif, compte rendu et justification de réponses implicites.',
          'Proportionnalité, aires/volumes et raisonnement géométrique.',
          'Intégration complète en vue du Certificat de Fin d’Études Élémentaires (CFEE).',
        ],
        evaluationNote: 'Fin d’Étape 3 : épreuves de synthèse et préparation officielle au CFEE (Guide CEB Étape 3 & Cahier PAAME CM2).',
      },
    ],
  },
  {
    id: 'moyen',
    label: 'Enseignement moyen',
    shortLabel: 'Moyen',
    ageOrScope: '6e à 3e · Collège (BFEM)',
    spiralOrExamNote: 'Le collège mène au BFEM · Progression maths APAMS (58 tableaux au total)',
    overviewNote:
      'Disciplines habituelles : français, anglais, mathématiques, histoire-géographie, SVT, sciences physiques, technologie, éducation civique, EPS et arts.',
    reformHighlight: 'APAMS Maths : 19 tableaux (6e), 12 (5e), 14 (4e), 13 (3e)',
    links: [
      { label: 'Ministère de l’Éducation — programme moyen et secondaire', url: 'https://www.education.sn/pages/moyen', category: 'Ministère' },
      { label: 'Guide d’usage Mathématiques 6e, 5e, 4e, 3e (APAMS PDF)', url: 'https://www.apams.gouv.sn/sites/default/files/Guide%20d%27usage%20Mathematiques.pdf', category: 'APAMS' },
    ],
    classes: [
      {
        id: '6e',
        shortCode: '6e',
        title: '6e — Entrée au collège',
        subtitle: '19 tableaux maths APAMS',
        badge: '9 disc.',
        globalOrder: 10,
        summary: 'Transition élémentaire-collège : nombres décimaux, fractions, initiation SVT/physique et anglais.',
        subjects: [
          { name: 'Français', items: ['Lecture et compréhension, récit et description, vocabulaire, phrase simple, classes de mots, accords de base, temps usuels, rédaction et oral.'] },
          { name: 'Anglais', items: ['Se présenter, saluer, informations personnelles, famille, école, nombres, dates, objets et consignes ; structures élémentaires.'] },
          { name: 'Mathématiques (19 tableaux)', items: ['Nombres décimaux, opérations, divisibilité ; fractions et proportionnalité ; expressions numériques ; droites, segments, angles, triangles, quadrilatères, symétrie ; mesures et périmètres.'] },
          { name: 'Histoire & Géographie', items: ['Histoire : repères de temps, sources, premiers peuplements et civilisations anciennes (Afrique/Sénégal).', 'Géographie : outils, cartes, globe, milieu local/régional et repères du Sénégal.'] },
          { name: 'SVT / Sciences physiques & Technologie', items: ['Observation du vivant et milieu, corps et santé ; initiation eau, air, matière, électricité ; objets techniques, fonction d’usage et dessin.'] },
          { name: 'Éducation civique, EPS & Arts', items: ['Règles de vie, famille, école, droits et devoirs ; athlétisme, jeux collectifs, dessin et musique.'] },
        ],
        keyPoints: [
          '19 tableaux officiels de progression en mathématiques (APAMS).',
          'Introduction structurée de l’anglais et de la technologie.',
          'Premiers peuplements, civilisations anciennes et repères géographiques du Sénégal.',
        ],
        evaluationNote: 'Devoirs surveillés et compositions trimestrielles/semestrielles alignés sur les 19 unités mathématiques et les compétences disciplinaires.',
      },
      {
        id: '5e',
        shortCode: '5e',
        title: '5e — Consolidation',
        subtitle: '12 tableaux maths APAMS',
        badge: '9 disc.',
        globalOrder: 11,
        summary: 'Puissances, nombres relatifs, PGCD/PPCM, géographie de l’Afrique et analyse d’objets.',
        subjects: [
          { name: 'Français', items: ['Lecture analytique, narration, description, dialogue, textes documentaires ; grammaire de phrase/texte, conjugaison, orthographe et rédaction structurée.'] },
          { name: 'Anglais', items: ['Vie quotidienne, habitudes, goûts, lieux et activités ; questions, descriptions et petits récits au présent et au passé simple.'] },
          { name: 'Mathématiques (12 tableaux)', items: ['Puissances, nombres relatifs, divisibilité, nombres premiers, PGCD/PPCM, fractions et calcul littéral initial ; géométrie plane, symétrie, proportionnalité.'] },
          { name: 'Histoire & Géographie', items: ['Histoire : sociétés et civilisations anciennes et médiévales ; Afrique et Sénégal.', 'Géographie : Afrique, milieux naturels, population, villes, activités et ressources.'] },
          { name: 'SVT / Sciences physiques & Technologie', items: ['Organisation du vivant, environnement et fonctions biologiques ; mélanges, mesures et propriétés de la matière ; analyse technique et réalisation simple.'] },
          { name: 'Éducation civique, EPS & Arts', items: ['Vie collective, responsabilités, institutions, solidarité, droits de l’enfant et prévention des conflits.'] },
        ],
        keyPoints: [
          'Nombres relatifs, puissances, nombres premiers et PGCD/PPCM (12 tableaux APAMS).',
          'Étude complète du continent africain en géographie.',
          'Droits de l’enfant, solidarité et prévention des conflits.',
        ],
        evaluationNote: 'Consolidation des bases scientifiques et littéraires de milieu de cycle moyen (Guide APAMS 5e).',
      },
      {
        id: '4e',
        shortCode: '4e',
        title: '4e — Approfondissement',
        subtitle: '14 tableaux maths APAMS',
        badge: '9 disc.',
        globalOrder: 12,
        summary: 'Calcul littéral, équations, Pythagore, électricité/optique et grands ensembles régionaux.',
        subjects: [
          { name: 'Français', items: ['Textes narratifs, descriptifs, explicatifs, argumentatifs et poétiques ; propositions, fonctions, accords, conjugaison et production de textes.'] },
          { name: 'Anglais', items: ['Expériences et projets, comparer, exprimer opinion, obligation, possibilité et conseil ; compréhension écrite et orale.'] },
          { name: 'Mathématiques (14 tableaux)', items: ['Rationnels et relatifs, calcul littéral, développement/factorisation, équations et inéquations simples, applications linéaires ; triangles, parallélisme, transformations, Pythagore, espace et statistiques.'] },
          { name: 'Histoire & Géographie', items: ['Histoire : grandes transformations politiques, économiques et sociales (Afrique et Sénégal intégrés).', 'Géographie : grands ensembles régionaux, populations, développement et enjeux environnementaux.'] },
          { name: 'SVT / Sciences physiques & Technologie', items: ['Corps, santé, reproduction ou environnement ; électricité, mécanique, optique et transformations de la matière ; systèmes techniques et énergie.'] },
          { name: 'Éducation civique, EPS & Arts', items: ['Institutions, citoyenneté, égalité, paix et environnement ; arbitrage et coopération sportive.'] },
        ],
        keyPoints: [
          'Développement/factorisation, équations simples et théorème de Pythagore (14 tableaux).',
          'Introduction de l’argumentation et de l’analyse des propositions en français.',
          'Électricité, optique et mécanique en sciences physiques.',
        ],
        evaluationNote: 'Préparation progressive aux raisonnements déductifs et expérimentaux attendus en classe d’examen (Guide APAMS 4e).',
      },
      {
        id: '3e',
        shortCode: '3e',
        title: '3e — Classe d’examen BFEM',
        subtitle: '13 tableaux maths · BFEM',
        badge: 'BFEM',
        globalOrder: 13,
        summary: 'Racines carrées, Thalès, trigonométrie, indépendances africaines et préparation au BFEM.',
        subjects: [
          { name: 'Français', items: ['Compréhension/interprétation, argumentation, récit, théâtre et poésie ; grammaire approfondie, résumé, rédaction et préparation aux épreuves du BFEM.'] },
          { name: 'Anglais', items: ['Compréhension de documents, expression suivie, récit, argumentation et communication scolaire ou sociale ; grammaire et lexique consolidés.'] },
          { name: 'Mathématiques (13 tableaux)', items: ['Racines carrées, calcul littéral, équations et systèmes, fonctions et proportionnalité ; Thalès, Pythagore, trigonométrie, géométrie dans l’espace, statistiques et probabilités/dénombrement.'] },
          { name: 'Histoire & Géographie', items: ['Histoire : périodes modernes/contemporaines, colonisation, résistances, guerres, indépendances et construction des États.', 'Géographie : espaces et développement, urbanisation, économie et enjeux du Sénégal, d’Afrique et du monde.'] },
          { name: 'SVT / Sciences physiques & Technologie', items: ['Fonctions biologiques, santé, hérédité ou environnement ; électricité, mécanique, chimie ; systèmes, conception, réalisation et sécurité.'] },
          { name: 'Éducation civique, EPS & Examen', items: ['Institutions nationales, participation citoyenne, droits, paix ; révisions intégrées et préparation complète au BFEM.'] },
        ],
        keyPoints: [
          'Thalès, trigonométrie, racines carrées, systèmes et fonctions (13 tableaux).',
          'Colonisation, résistances et indépendances en histoire contemporaine.',
          'Entraînement intensif et sujets types pour le BFEM.',
        ],
        evaluationNote: 'Sanctionnée par le Brevet de Fin d’Études Moyennes (BFEM) ouvrant l’orientation vers les voies du lycée (générale, technique ou professionnelle).',
      },
    ],
  },
  {
    id: 'lycee',
    label: 'Lycée',
    shortLabel: 'Lycée',
    ageOrScope: 'Seconde à Terminale · 12 séries',
    spiralOrExamNote: 'Consolidation en Seconde puis spécialisation vers le Baccalauréat',
    overviewNote:
      'Le lycée comprend trois niveaux (Seconde, Première, Terminale). La série G a été remplacée par STEG et les anciennes séries T1/T2 évoluent vers STIDD.',
    reformHighlight: 'Séries L1/L’1/L2, S1–S5, STEG (ex-G), STIDD (ex-T1/T2), F6, Franco-arabe',
    links: [
      { label: 'Décret d’organisation du baccalauréat et séries', url: 'https://www.lexenegal.sn/code/decret-95-947-organisation-baccalaureat', category: 'Réglementation' },
      { label: 'Réforme STEG : remplacement de la série G', url: 'https://www.lexenegal.sn/code/decret-2019-645-modifiant-decret-95-947-baccalaureat-steg', category: 'Réforme' },
      { label: 'Réforme des séries techniques vers STIDD et STEG', url: 'https://formation.gouv.sn/?p=5625', category: 'Réforme' },
      { label: 'Programme de mathématiques Terminale S1/S3 (Office du Bac)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Maths-LS.pdf', category: 'Programme Tle' },
      { label: 'Programme de sciences physiques Terminale L/S (Office du Bac)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Sciences-Physiques_Tle_LS.pdf', category: 'Programme Tle' },
      { label: 'Programme de SVT Terminale L2/S1/S2 (Office du Bac)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programmes_SVT_Tles_LS.pdf', category: 'Programme Tle' },
      { label: 'Programme de français Terminale L/S (Office du Bac)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Francais_Tle_LS.pdf', category: 'Programme Tle' },
    ],
    classes: [
      {
        id: '2nde',
        shortCode: '2nde',
        title: 'Seconde — Tronc commun & orientation',
        subtitle: 'Seconde S, L, G, Technique',
        badge: 'Orientation',
        globalOrder: 14,
        summary: 'Consolidation générale et pré-orientation scientifique (S), littéraire (L), gestion (STEG) ou technique (STIDD/F6).',
        subjects: [
          { name: 'Français', items: ['Analyse de textes, lecture littéraire, oral ; textes argumentatifs, narratifs et explicatifs ; résumé, compte rendu et méthode du commentaire.'] },
          { name: 'Mathématiques', items: ['Calcul numérique/algébrique, équations et inéquations, fonctions et courbes ; géométrie plane et espace ; statistiques et probabilités de base.'] },
          { name: 'Langues & Histoire-Géographie', items: ['Langues vivantes (et options classiques selon le lycée) ; repères historiques et géographiques, étude de documents et cartes.'] },
          { name: 'Sciences (SVT & Physique-Chimie)', items: ['SVT : vivant, corps, santé, environnement et démarche scientifique.', 'Sciences physiques : matière, énergie, mesures et mouvements.'] },
          { name: 'Voies & appellations d’orientation', items: ['Seconde S (scientifique), Seconde L (littéraire), Seconde G/gestion (remplacée au bac par STEG), Seconde technique/technologique (STIDD, F6) et parcours franco-arabe.'] },
        ],
        keyPoints: [
          '« Seconde S/L/G » est souvent un raccourci d’établissement : vérifier les options exactes sur l’emploi du temps.',
          'Consolidation des fonctions en maths et des méthodes du commentaire en français.',
          'L’orientation vers la série de Première dépend des résultats et des filières ouvertes au lycée.',
        ],
        evaluationNote: 'Niveau charnière déterminant l’affectation vers les séries L, S, STEG, STIDD ou F6 en Première.',
        seriesTable: SENEGAL_SERIES_TABLE,
      },
      {
        id: '1re',
        shortCode: '1re',
        title: 'Première — Différenciation par série',
        subtitle: 'L, S, STEG, STIDD, F6',
        badge: 'Spécialités',
        globalOrder: 15,
        summary: 'Enseignements communs (français, langues, hist-géo, EPS) et renforcement net des dominantes de série.',
        subjects: [
          { name: 'Tronc commun (toutes séries)', items: ['Français et communication écrite/orale, langues vivantes, histoire-géographie, EPS ; méthodes de dissertation, commentaire, démonstration et expérimentation.'] },
          { name: 'Séries littéraires (L1a / L1b / L’1 / L2)', items: ['L1a/L1b/L’1 : littérature, analyse des genres, langues anciennes ou modernes, traduction.', 'L2 : littérature, histoire-géographie, philosophie, langues et sciences humaines/sociales.'] },
          { name: 'Séries scientifiques (S1 / S2 / S3 / S4 / S5)', items: ['S1 : mathématiques approfondies et physique-chimie.', 'S2 : priorité sciences expérimentales (SVT, physique-chimie, maths).', 'S3 : maths, physique et technologies de l’ingénieur.', 'S4/S5 : SVT, agriculture, environnement ou agroalimentaire.'] },
          { name: 'Séries technologiques (STEG / STIDD / F6)', items: ['STEG : économie, gestion, comptabilité, méthodes quantitatives.', 'STIDD : maths, physique appliquée, technologie industrielle, conception et réalisation.', 'F6 : chimie et techniques de laboratoire.'] },
        ],
        keyPoints: [
          'Introduction de la philosophie en L2 et approfondissement méthodologique dans toutes les séries.',
          'Nette spécialisation des coefficients entre dominantes littéraires, exactes, expérimentales et technologiques.',
          'La série G est officiellement remplacée par STEG.',
        ],
        evaluationNote: 'Première année de spécialisation complète préparant directement au programme de Terminale et aux épreuves anticipées ou bilans annuels.',
        seriesTable: SENEGAL_SERIES_TABLE,
      },
      {
        id: 'tle',
        shortCode: 'Tle',
        title: 'Terminale — Préparation au Baccalauréat',
        subtitle: 'Toutes séries · Office du Bac',
        badge: 'BAC',
        globalOrder: 16,
        summary: 'Programme final par série et entraînement complet aux épreuves officielles du Baccalauréat sénégalais.',
        subjects: [
          { name: 'Enseignements généraux', items: ['Français ou littérature, philosophie, langues, histoire-géographie, EPS selon la grille de série ; dissertation, commentaire, problèmes et TP.'] },
          { name: 'Mathématiques Terminale S1 / S3 (officiel)', items: ['Nombres complexes, systèmes linéaires, suites, fonctions, calcul intégral, équations différentielles, géométrie plane et de l’espace, probabilités, courbes et arithmétique.'] },
          { name: 'Sciences physiques Terminale S1 / S2 (officiel)', items: ['Cinématique et dynamique, gravitation, électromagnétisme, électricité et chapitres définis au programme de chaque série.'] },
          { name: 'SVT Terminale L2 / S1 / S2 (officiel)', items: ['Système nerveux, activité cardiaque, régulation de la glycémie, immunologie, reproduction et parties détaillées selon la série.'] },
          { name: 'Français Terminale L / S & Séries Techno', items: ['Français : lecture et écriture littéraires, genres, mouvements, analyse et dissertation.', 'STEG (économie, gestion, comptabilité), STIDD (conception, fabrication, électrotechnique), F6 (chimie de labo), S4/S5 (agronomie/environnement) et Franco-arabe.'] },
        ],
        keyPoints: [
          'Programmes officiels détaillés publiés par l’Office du Baccalauréat (Maths, Physique, SVT, Français).',
          'Vérifier les instructions et notes de session en cours en complément des PDF historiques.',
          'Parcours franco-arabe : programme général de la série complété par les disciplines arabes.',
        ],
        evaluationNote: 'Sanctionnée par le Baccalauréat national (Office du Baccalauréat) selon les coefficients de la série choisie.',
        seriesTable: SENEGAL_SERIES_TABLE,
      },
      {
        id: 'series',
        shortCode: '12S',
        title: 'Référentiel des 12 séries du lycée',
        subtitle: 'Générales, techniques & arabe',
        badge: 'Tableau',
        globalOrder: 16,
        summary: 'Tableau complet des dominantes officielles du lycée au Sénégal et correspondance des réformes STEG / STIDD.',
        subjects: [
          { name: 'Réformes des séries techniques', items: ['La série G a été remplacée par STEG (Sciences et technologies de l’économie et de la gestion).', 'Les anciennes séries T1/T2 évoluent vers STIDD dans la réforme technique.', 'Les offres et options (grec, latin, F6, franco-arabe) dépendent de chaque établissement.'] },
        ],
        keyPoints: [
          '12 parcours principaux couvrant lettres, sciences pures/expérimentales, agronomie, gestion et industrie.',
          'Les anciens sujets d’examen peuvent encore porter les appellations G, T1 ou T2.',
        ],
        evaluationNote: 'Consulter les décrets 95-947 et 2019-645 ainsi que les notes de l’Office du Baccalauréat pour les coefficients par série.',
        seriesTable: SENEGAL_SERIES_TABLE,
      },
    ],
  },
  {
    id: 'references',
    label: 'Références officielles',
    shortLabel: 'Références',
    ageOrScope: 'Ministère, CEB, PAAME, APAMS, Bac',
    spiralOrExamNote: 'Sources consultables et note de planification officielle (14 nov. 2026)',
    overviewNote:
      'Accès direct aux guides pédagogiques, livrets d’exercices PAAME, guide APAMS du collège, décrets de réforme et programmes PDF de l’Office du Baccalauréat.',
    reformHighlight: 'Vérifier la répartition annuelle auprès de l’IEF, de l’IA ou de l’Office du Bac',
    links: [
      { label: 'Ministère de l’Éducation nationale — préscolaire', url: 'https://www.education.sn/pages/prescolaire', category: 'Général' },
      { label: 'Ministère de l’Éducation nationale — élémentaire', url: 'https://www.education.sn/pages/elementaire', category: 'Général' },
      { label: 'APAMS — documents CEB et guides pédagogiques', url: 'https://www.apams.gouv.sn/', category: 'Général' },
      { label: 'APAMS — guide de mathématiques du collège', url: 'https://www.apams.gouv.sn/sites/default/files/Guide%20d%27usage%20Mathematiques.pdf', category: 'Général' },
      { label: 'Office du baccalauréat — épreuves, corrigés et programmes', url: 'https://officedubac.sn/epreuves-corriges/', category: 'Général' },
    ],
    classes: [
      {
        id: 'ref-prescolaire',
        shortCode: 'PRÉ',
        title: 'Guides Préscolaire (2024)',
        subtitle: 'PS, MS, GS & index',
        badge: '4 liens',
        globalOrder: 1,
        summary: 'Copies consultables en ligne du curriculum rénové du préscolaire.',
        subjects: [
          { name: 'Contenu des guides', items: ['Domaines, activités, compétences, progressions et propositions d’évaluation pour Petite, Moyenne et Grande Section.'] },
        ],
        keyPoints: ['Édition 2024 corrigée disponible par section.'],
        evaluationNote: 'Référence principale pour la planification des structures préscolaires.',
        links: [
          { label: 'Guide Petite Section — édition 2024', url: 'https://lecouloirdusavoir.com/GUIDE%20PETITE%20SECTION%20CORRIGE%202024.pdf', category: 'Préscolaire' },
          { label: 'Guide Moyenne Section — édition 2024', url: 'https://lecouloirdusavoir.com/GUIDE%20MOYENNE%20SECTION%20CORRIGE%202024.pdf', category: 'Préscolaire' },
          { label: 'Guide Grande Section — édition 2024', url: 'https://lecouloirdusavoir.com/GUIDE%20GRANDE%20SECTION%20CORRIGE%202024.pdf', category: 'Préscolaire' },
          { label: 'Index des guides préscolaire & élémentaire', url: 'https://lecouloirdusavoir.com/ressources.html', category: 'Index' },
        ],
      },
      {
        id: 'ref-primaire',
        shortCode: 'CEB',
        title: 'Élémentaire : CEB & PAAME 2024',
        subtitle: 'Étapes 1–3 & cahiers CI–CM2',
        badge: '11 liens',
        globalOrder: 6,
        summary: 'Guides pédagogiques CEB par étape et livrets élèves PAAME 2024 en mathématiques.',
        subjects: [
          { name: 'Architecture des ressources', items: ['Le CEB fixe les compétences et contenus par étape (CI-CP, CE1-CE2, CM1-CM2) et les cahiers PAAME 2024 fournissent des exercices classe par classe.'] },
        ],
        keyPoints: ['6 cahiers mathématiques PAAME 2024 (CI à CM2) + 3 guides d’étapes CEB.'],
        evaluationNote: 'Préparation intégrée vers le CFEE en fin d’Étape 3.',
        links: [
          { label: 'Organisation élémentaire — Ministère', url: 'https://www.education.sn/pages/elementaire', category: 'MEN' },
          { label: 'Guide CEB — Étape 1 (CI-CP)', url: 'https://lecouloirdusavoir.com/Guide%20p%C3%A9dagogique_%C3%A9tape%201.pdf', category: 'CEB' },
          { label: 'Guide CEB — Étape 2 révisé (CE1-CE2)', url: 'https://lecouloirdusavoir.com/guide-pedagogique-etape-2-revise.pdf', category: 'CEB' },
          { label: 'Guide CEB — Étape 3 (CM1-CM2)', url: 'https://lecouloirdusavoir.com/Guide%20p%C3%A9dagogique_%C3%A9tape%203.pdf', category: 'CEB' },
          { label: 'PAAME 2024 — CI', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/1_CI_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
          { label: 'PAAME 2024 — CP', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/2_CP_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
          { label: 'PAAME 2024 — CE1', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/3_CE1_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
          { label: 'PAAME 2024 — CE2', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/4_CE2_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
          { label: 'PAAME 2024 — CM1', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/5_CM1_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
          { label: 'PAAME 2024 — CM2', url: 'https://senprof.education.sn/PAAME/PAAME%20livrets/res/6_CM2_version_2024_eleves_PAAME2.pdf', category: 'PAAME' },
        ],
      },
      {
        id: 'ref-moyen',
        shortCode: 'BFEM',
        title: 'Collège : APAMS & Ministère',
        subtitle: '6e à 3e · 58 tableaux',
        badge: '3 liens',
        globalOrder: 11,
        summary: 'Guide d’usage officiel de mathématiques du collège (19, 12, 14 et 13 tableaux) et portail APAMS.',
        subjects: [
          { name: 'Contenu du guide APAMS', items: ['Détaille objectifs, contenus, activités et évaluations de la 6e à la 3e pour la préparation au BFEM.'] },
        ],
        keyPoints: ['Compléter avec la progression annuelle distribuée par l’établissement ou l’inspection.'],
        evaluationNote: 'Référence nationale pour l’enseignement moyen.',
        links: [
          { label: 'Guide d’usage Mathématiques — 6e à 3e (APAMS)', url: 'https://www.apams.gouv.sn/sites/default/files/Guide%20d%27usage%20Mathematiques.pdf', category: 'APAMS' },
          { label: 'Portail APAMS — CEB et guides pédagogiques', url: 'https://www.apams.gouv.sn/', category: 'APAMS' },
          { label: 'Ministère — programme moyen et secondaire', url: 'https://www.education.sn/pages/moyen', category: 'MEN' },
        ],
      },
      {
        id: 'ref-lycee',
        shortCode: 'BAC',
        title: 'Lycée, Réformes & Office du Bac',
        subtitle: 'Décrets STEG/STIDD & PDF',
        badge: '9 liens',
        globalOrder: 16,
        summary: 'Textes réglementaires du baccalauréat, réformes STEG/STIDD et programmes officiels publiés par l’Office du Baccalauréat.',
        subjects: [
          { name: 'Note de mise à jour (14 nov. 2026)', items: ['Pour une planification de classe officielle, vérifier la version du programme, les horaires, les options et la répartition annuelle transmis par l’établissement, l’IEF, l’IA ou l’Office du baccalauréat pour l’année scolaire concernée.'] },
        ],
        keyPoints: ['Certains PDF historiques de l’Office du Bac sont à confronter aux instructions de la session en cours.'],
        evaluationNote: 'Portail officiel de l’Office du Baccalauréat du Sénégal.',
        links: [
          { label: 'Décret 95-947 — organisation du baccalauréat', url: 'https://www.lexenegal.sn/code/decret-95-947-organisation-baccalaureat', category: 'Décret' },
          { label: 'Décret 2019-645 — réforme STEG (ex-série G)', url: 'https://www.lexenegal.sn/code/decret-2019-645-modifiant-decret-95-947-baccalaureat-steg', category: 'Décret' },
          { label: 'Réforme technique vers STIDD et STEG', url: 'https://formation.gouv.sn/?p=5625', category: 'Réforme' },
          { label: 'Épreuves, corrigés et programmes — Office du Bac', url: 'https://officedubac.sn/epreuves-corriges/', category: 'Office du Bac' },
          { label: 'Programme Maths Terminale S1/S3 (PDF)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Maths-LS.pdf', category: 'PDF Tle' },
          { label: 'Programme Sciences Physiques Tle L/S (PDF)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Sciences-Physiques_Tle_LS.pdf', category: 'PDF Tle' },
          { label: 'Programme SVT Terminale L2/S1/S2 (PDF)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programmes_SVT_Tles_LS.pdf', category: 'PDF Tle' },
          { label: 'Programme Français Terminale L/S (PDF)', url: 'https://officedubac.sn/wp-content/uploads/2026/01/Programme_Francais_Tle_LS.pdf', category: 'PDF Tle' },
        ],
      },
    ],
  },
];
