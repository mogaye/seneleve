import { ClassLevel, SerieOption } from './studyData';

export interface CourseSection {
  heading: string;
  intro?: string;
  items: string[];
  note?: string;
}

export interface CourseDocument {
  title: string;
  subtitle?: string;
  intro?: string;
  sections: CourseSection[];
  footerNote?: string;
  /** Exact user-provided course text rendered verbatim without any modification. */
  verbatimText?: string;
  isCustom?: boolean;
  customId?: string;
  createdAt?: string;
}

export interface CustomVerbatimCourse {
  id: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  subject: string;
  title: string;
  content: string;
  createdAt: string;
}

const CUSTOM_COURSES_KEY = 'seneleve:custom-courses:v1';

export function loadCustomCourses(): CustomVerbatimCourse[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_COURSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomVerbatimCourse =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.classLevel === 'string' &&
        typeof item.subject === 'string' &&
        typeof item.title === 'string' &&
        typeof item.content === 'string',
    );
  } catch {
    return [];
  }
}

export function saveCustomCourses(courses: CustomVerbatimCourse[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(courses));
  } catch {
    // Ignore storage quota errors
  }
}

export function formatCourseDocumentAsPlainText(doc: CourseDocument): string {
  if (doc.verbatimText) {
    return `${doc.title}\n\n${doc.verbatimText}`;
  }
  const parts: string[] = [doc.title];
  if (doc.subtitle) parts.push(doc.subtitle);
  if (doc.intro) parts.push(doc.intro);
  for (const sec of doc.sections) {
    parts.push(`\n${sec.heading}`);
    if (sec.intro) parts.push(sec.intro);
    for (const item of sec.items) {
      parts.push(`• ${item}`);
    }
    if (sec.note) parts.push(sec.note);
  }
  if (doc.footerNote) parts.push(`\n${doc.footerNote}`);
  return parts.join('\n');
}

const CI_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: '1. Langue et communication',
    subtitle: 'CI au Sénégal — Cours d’Initiation',
    intro:
      'En CI, l’enfant apprend à écouter, parler, lire et écrire. Dans certaines écoles bilingues, la première lecture-écriture se fait en langue nationale — par exemple en wolof, pulaar ou seereer — selon la langue retenue par l’école. La progression précise des lettres et des sons varie donc d’une langue à l’autre.',
    sections: [
      {
        heading: 'Les apprentissages suivent généralement cet ordre :',
        items: [
          '1. Écouter une histoire ou une consigne et la comprendre.',
          '2. S’exprimer oralement : nommer, décrire, répondre et raconter simplement.',
          '3. Reconnaître les lettres et les sons.',
          '4. Repérer les syllabes dans les mots.',
          '5. Former et lire des syllabes.',
          '6. Former et lire des mots.',
          '7. Lire des phrases puis de courts textes.',
          '8. Tracer les lettres et copier des mots ou des phrases simples.',
          '9. Commencer à écrire des mots et de petites phrases.',
          '10. Réciter, chanter et enrichir son vocabulaire.',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: '2. Mathématiques',
    subtitle: 'CI au Sénégal — Cours d’Initiation',
    intro:
      'Le cahier d’exercices CI publié par le ministère en 2024 organise les mathématiques en activités numériques, géométrie, mesure et résolution de problèmes. Il fournit une progression de leçons, avec des révisions et des activités d’intégration.',
    sections: [
      {
        heading: 'Activités numériques',
        items: [
          'Ensembles et sous-ensembles ; classement et comparaison.',
          'Quantités : peu, beaucoup, rien.',
          'Nombres de 0 à 20 : découverte, ordre, nombres ordinaux, composition et décomposition.',
          'Dizaines et unités.',
          'Sens de l’addition et de la soustraction, puis calculs sur les nombres étudiés.',
          'Doubles et moitiés.',
          'Révisions et situations d’intégration.',
        ],
      },
      {
        heading: 'Géométrie et repérage',
        items: [
          'Droite et gauche ; devant et derrière ; près et loin.',
          'Sur, sous, en haut et en bas ; situer des objets.',
          'Pavé droit, cube et cylindre ; patrons de solides.',
          'Carré, rectangle, triangle et rond.',
          'Lignes ouvertes et fermées ; intérieur, extérieur et frontière.',
          'Quadrillage, nœuds, cases, départ, arrivée et itinéraires.',
        ],
      },
      {
        heading: 'Mesure',
        items: [
          'Longueur et distance.',
          'Capacité.',
          'Masse.',
          'Durée.',
          'Journée et semaine.',
        ],
      },
      {
        heading: 'Résolution de problèmes',
        items: [
          'Repérer les informations utiles, inutiles ou manquantes.',
          'Comprendre les données, les questions et les consignes d’un énoncé.',
          'Utiliser des règles logiques, des modèles, des suites et des tableaux à double entrée.',
          'Résoudre des problèmes simples et vérifier sa réponse.',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: '3. Éducation à la science et à la vie sociale (ESVS)',
    subtitle: 'CI au Sénégal — Cours d’Initiation',
    intro:
      'Le CEB rassemble dans ce domaine la découverte du monde, l’éducation au développement durable et le vivre-ensemble. Les activités s’appuient sur l’environnement proche de l’enfant : famille, école, quartier ou village.',
    sections: [
      {
        heading: 'On y travaille notamment :',
        items: [
          'l’observation du milieu et des objets ;',
          'les premières notions d’histoire, de géographie et de sciences ;',
          'l’environnement, la santé et les habitudes d’hygiène ;',
          'les règles de vie, le respect des autres, la coopération et la citoyenneté.',
        ],
      },
    ],
  },
  'Éducation physique, sportive et artistique': {
    title: '4. Éducation physique et artistique',
    subtitle: 'CI au Sénégal — Cours d’Initiation',
    sections: [
      {
        heading: 'Domaines du programme',
        items: [
          'EPS : mouvements, jeux, coordination et activités sportives adaptées.',
          'Arts plastiques : dessin, coloriage, modelage et découpage.',
          'Éducation musicale : chants, rythme et écoute.',
          'Arts scéniques : expression, petits jeux de rôle et récitation.',
        ],
      },
    ],
    footerNote:
      'Le document du ministère présente le programme élémentaire du CI au CM2 ; le cahier officiel de mathématiques donne la progression la plus détaillée pour le CI. Pour les autres matières, les ressources consultées décrivent surtout les compétences et les domaines, et la progression précise dépend du guide utilisé par l’école.',
  },
};

const CP_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: 'Langue et communication',
    subtitle: 'CP au Sénégal — Cours préparatoire',
    intro:
      'Le CP vient après le CI et termine la première étape de l’enseignement élémentaire, qui comprend ces deux classes. Le programme consolide les acquis du CI et développe la lecture courante, l’écriture et l’expression. Dans les écoles qui utilisent le dispositif bilingue Lecture Pour Tous, la langue nationale étudiée et sa progression dépendent de l’école.',
    sections: [
      {
        heading: 'Compétences et apprentissages',
        items: [
          'Expression orale : écouter, répondre, raconter et décrire.',
          'Lecture : réviser les sons et syllabes du CI, lire des mots et des phrases, puis gagner en fluidité et en vitesse.',
          'Compréhension : comprendre des textes entendus et lus, enrichir son vocabulaire et aborder différents types de textes.',
          'Écriture : écrire correctement les lettres et les mots, copier et produire de courts écrits.',
          'Récitation et poésie.',
          'Selon la progression de l’école : vocabulaire, grammaire, conjugaison et orthographe intégrés aux activités de lecture et d’écriture.',
        ],
      },
    ],
    footerNote:
      'Le guide CP de lecture prévoit neuf semaines initiales de révision des acquis du CI, puis un travail renforcé sur la lecture fluide, la compréhension et le vocabulaire.',
  },
  'Mathématiques': {
    title: 'Mathématiques — progression détaillée',
    subtitle: 'CP au Sénégal — Cours préparatoire',
    intro:
      'Le cahier d’exercices PAAME 2 du ministère, édition 2024, répartit les mathématiques en activités numériques, géométrie, mesure et résolution de problèmes. Les entrées ci-dessous comprennent aussi des révisions et des activités d’intégration.',
    sections: [
      {
        heading: 'Activités numériques',
        items: [
          'Réviser les nombres de 0 à 10, puis de 0 à 20, leur composition et leur décomposition, l’addition et la soustraction.',
          'Découvrir les nombres de 21 à 50 ; comprendre le sens de l’addition et de la soustraction.',
          'Effectuer des additions et soustractions sans retenue, puis avec retenue.',
          'Travailler les nombres pairs et impairs.',
          'Étendre les nombres et les opérations jusqu’à 59, puis 69 et 79 ; vérifier les résultats de soustraction et additionner trois nombres.',
          'Découvrir le sens de la multiplication et du partage.',
          'Étendre les nombres jusqu’à 89, 99, puis 100.',
          'Utiliser des écritures multiplicatives et des écritures de partage ; réviser et résoudre des situations d’intégration.',
        ],
      },
      {
        heading: 'Géométrie',
        items: [
          'Lignes ouvertes et fermées ; intérieur, extérieur et frontière.',
          'Rythmes graphiques ; quadrillage, nœud, case, lignes et colonnes.',
          'Point de départ, point d’arrivée et itinéraire.',
          'Tracer des lignes ; reproduire des figures ; lignes courbes et brisées ; frises.',
          'Reconnaître et reproduire le carré, le rectangle, le triangle et le rond.',
          'Réviser les figures et les appliquer dans des activités d’intégration.',
        ],
      },
      {
        heading: 'Mesure',
        items: [
          'Longueurs et distances ; mesurer avec un mètre, une règle et un double-décimètre.',
          'Capacités et litre.',
          'Masse et kilogramme.',
          'Durée ; jours, semaines, mois et saisons.',
          'Lire l’heure et les minutes.',
          'Utiliser la monnaie courante : pièces de 5, 10, 25, 50 et 100 F.',
        ],
      },
      {
        heading: 'Résolution de problèmes',
        items: [
          'Identifier les données et distinguer informations numériques et non numériques.',
          'Repérer les données utiles, inutiles ou manquantes.',
          'Comprendre les questions et les consignes.',
          'Trouver une question finale ou une question intermédiaire.',
          'Comprendre un énoncé mathématique et suivre une démarche progressive.',
          'Réviser et résoudre des problèmes d’intégration.',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: 'Éducation à la science et à la vie sociale',
    subtitle: 'CP au Sénégal — Cours préparatoire',
    intro:
      'Le CEB regroupe notamment la découverte du monde, l’éducation au développement durable et le vivre-ensemble. Au CP, les activités partent du milieu proche de l’enfant et portent sur l’observation, la vie sociale et les habitudes de santé et d’hygiène.',
    sections: [
      {
        heading: 'Axes du programme',
        items: [
          'Découverte du monde : observation du milieu proche, repères de temps et d’espace.',
          'Vie sociale : rôles dans la famille et à l’école, règles de vie et entraide.',
          'Éducation au développement durable : santé, hygiène, propreté et protection du cadre de vie.',
        ],
      },
    ],
  },
  'Éducation physique, sportive et artistique': {
    title: 'EPS et arts',
    subtitle: 'CP au Sénégal — Cours préparatoire',
    sections: [
      {
        heading: 'Activités du domaine',
        items: [
          'Éducation physique et sportive : mouvements, jeux et activités sportives.',
          'Arts plastiques : dessin, coloriage, découpage et réalisation de formes.',
          'Éducation musicale : chants et rythmes.',
          'Arts scéniques : récitations, expression et petits jeux de rôle.',
        ],
      },
    ],
    footerNote:
      'La liste ci-dessus reprend les contenus détaillés trouvés pour les mathématiques et les grands domaines du CP. La progression exacte de lecture dépend du guide et, dans les écoles bilingues concernées, de la langue utilisée.',
  },
};

const CE1_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: '1. Langue et communication',
    subtitle: 'Programme du CE1 au Sénégal',
    intro:
      'La progression du CEB pour le CE1 avance par grands paliers : raconter, décrire, puis donner des consignes ou expliquer une marche à suivre. Le guide de l’étape 2 détaille les objectifs de lecture, d’expression et de production écrite.',
    sections: [
      {
        heading: 'Expression orale et récitation',
        items: [
          'Raconter un événement vécu, une expérience personnelle ou un fait entendu.',
          'Raconter une histoire lue ou entendue : conte, album, bande dessinée.',
          'Décrire un objet ou une personne.',
          'Donner une consigne ou expliquer comment faire quelque chose.',
          'Participer à une conversation en respectant le sujet, le tour de parole et les règles de politesse.',
          'Réciter des poèmes et des textes en prose avec une intonation et des gestes adaptés.',
        ],
      },
      {
        heading: 'Lecture et compréhension',
        items: [
          'Lire des textes narratifs, puis des textes descriptifs et des textes injonctifs.',
          'Consolider les correspondances entre lettres et sons et lire les mots fréquents.',
          'Gagner en précision, en fluidité et en expression à voix haute.',
          'Repérer les personnages, les lieux, le moment et l’ordre des événements.',
          'Reformuler une histoire, la résumer, anticiper la suite et relever les informations explicites ou implicites.',
          'Donner un avis sur un texte et expliquer son point de vue.',
        ],
      },
      {
        heading: 'Écriture et étude de la langue',
        items: [
          'Produire de courts textes narratifs, descriptifs et injonctifs.',
          'Employer le vocabulaire lié au sujet, des connecteurs comme « d’abord », « puis » et « ensuite », et organiser ses idées.',
          'Reconnaître une phrase, les majuscules et les signes de ponctuation.',
          'Étudier les phrases déclaratives et exclamatives, les formes affirmative et négative, les noms propres et communs et les articles.',
          'Distinguer passé, présent et futur ; conjuguer au présent des verbes du premier groupe, ainsi que être et avoir.',
          'Copier, écrire sous dictée et améliorer l’orthographe des mots étudiés.',
        ],
      },
    ],
    footerNote:
      'Le guide de langue et communication consulté est celui de l’étape 2, dont la version accessible est datée de 2014. Il décrit les compétences et les paliers ; le calendrier des leçons peut être adapté par l’école.',
  },
  'Mathématiques': {
    title: '2. Mathématiques : progression leçon par leçon',
    subtitle: 'Programme du CE1 au Sénégal — Cahier PAAME2, édition 2024',
    intro:
      'La progression de mathématiques ci-dessous reprend le cahier d’exercices PAAME2, édition 2024, élaboré par le ministère et aligné sur le CEB. Les leçons comprennent aussi des révisions et des activités d’intégration.',
    sections: [
      {
        heading: 'A. Activités numériques — 56 leçons (Palier 1 — leçons 1 à 30)',
        items: [
          '1. Nombres de 0 à 100',
          '2. Écritures additives des nombres de 0 à 100',
          '3. Addition, soustraction et multiplication',
          '4. Nombres de 100 à 500',
          '5. Écritures additives des nombres de 0 à 500',
          '6. Nombres pairs et impairs',
          '7. Doubles et moitiés',
          '8. Sens de l’addition',
          '9. Addition sans retenue de 100 à 500',
          '10. Addition avec retenue de 100 à 500',
          '11–12. Nombres de 500 à 999',
          '13. Sens de la soustraction',
          '14. Soustraction sans retenue de 500 à 999',
          '15. Soustraction avec retenue de 500 à 999',
          '16. Nombre 1 000',
          '17. Écritures additives de 1 000',
          '18. Révision des additions de 500 à 999',
          '19. Révision des soustractions de 500 à 999',
          '20–21. Nombres de 1 000 à 5 000',
          '22. Sens de la multiplication',
          '23. Multiplication sans retenue',
          '24. Multiplication avec retenue',
          '25. Sens de la division',
          '26. Division sans reste',
          '27. Nombres divisibles par 2 et par 5',
          '28. Révision des additions et soustractions jusqu’à 5 000',
          '29. Révision des multiplications jusqu’à 5 000',
          '30. Activités d’intégration',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 2 — leçons 31 à 56',
        items: [
          '31–32. Nombres de 5 000 à 9 999',
          '33. Comparaison des nombres',
          '34–35. Addition sans puis avec retenue, de 5 000 à 9 999',
          '36–37. Soustraction sans puis avec retenue, de 5 000 à 9 999',
          '38. Tables de multiplication de 1 à 6',
          '39–40. Multiplication par un multiplicateur à deux chiffres, sans puis avec retenue',
          '41. Révision des additions et soustractions',
          '42. Révision de la multiplication à deux chiffres',
          '43. Sens de la division',
          '44. Division sans reste',
          '45. Division avec reste',
          '46–47. Nombre 10 000',
          '48. Addition et soustraction jusqu’à 10 000',
          '49. Multiplication jusqu’à 10 000',
          '50. Sens de la division',
          '51. Division avec ou sans reste',
          '52. Triple d’un nombre',
          '53–55. Révisions de l’addition, de la soustraction, de la multiplication et de la division',
          '56. Activités d’intégration',
        ],
      },
      {
        heading: 'B. Activités géométriques — 21 leçons',
        items: [
          '1. Lignes droites et lignes brisées',
          '2. Lignes courbes',
          '3. Droites horizontales, verticales et obliques',
          '4. Droites sécantes',
          '5. Angle droit',
          '6. Droites perpendiculaires',
          '7. Droites parallèles',
          '8–9. Révisions',
          '10. Activités d’intégration',
          '11–12. Carré : découverte, propriétés et construction',
          '13. Diagonales du carré',
          '14. Médianes du carré',
          '15–16. Rectangle : découverte, propriétés et construction',
          '17. Diagonales du rectangle',
          '18. Médianes du rectangle',
          '19–20. Révisions',
          '21. Activités d’intégration',
        ],
      },
      {
        heading: 'C. Activités de mesure — 29 leçons',
        items: [
          '1. Mètre',
          '2. Mètre et décimètre',
          '3. Mètre, décimètre et centimètre',
          '4. Mètre, décimètre, centimètre et millimètre',
          '5–8. Litre, puis litre avec décilitres, centilitres et millilitres',
          '9. Révision',
          '10. Activités d’intégration',
          '11. Kilogramme',
          '12. Kilogramme et gramme',
          '13. Kilogramme, 500 g et 250 g',
          '14. Jour, semaine et mois',
          '15. Jour, semaine, mois et année',
          '16–17. Heure et minute',
          '18. Révision',
          '19. Activités d’intégration',
          '20. Périmètre du carré',
          '21–22. Périmètre du rectangle',
          '23. Pièces de monnaie',
          '24. Pièces et billets de banque',
          '25–26. Prix d’achat, prix de revient et frais',
          '27. Prix d’achat, prix de revient, frais et prix de vente',
          '28. Révision',
          '29. Activités d’intégration',
        ],
      },
      {
        heading: 'D. Résolution de problèmes — 22 leçons',
        items: [
          '1. Informations numériques et non numériques',
          '2. Données numériques',
          '3. Données utiles et inutiles',
          '4. Données manquantes',
          '5–6. Tableaux de données',
          '7. Révision',
          '8. Activités d’intégration',
          '9–10. Données et questions d’un énoncé',
          '11–12. Formuler ou identifier la question finale',
          '13. Révision',
          '14. Activités d’intégration',
          '15–18. Question finale et questions intermédiaires',
          '19–20. Résoudre un problème par étapes',
          '21. Révision',
          '22. Activités d’intégration',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: '3. Éducation à la science et à la vie sociale — ESVS',
    subtitle: 'Programme du CE1 au Sénégal',
    intro: 'Le domaine comprend :',
    sections: [
      {
        heading: 'Sous-domaines de l’ESVS',
        items: [
          'Histoire : famille, école et passé proche.',
          'Géographie : observation du milieu, météo et saisons.',
          'Initiation scientifique et technologique (IST) : plantes, corps humain, besoins et nutrition.',
          'Vivre dans son milieu : environnement, santé et comportements favorables au cadre de vie.',
          'Vivre ensemble : règles de vie collective et respect des biens communs et privés.',
        ],
      },
    ],
    footerNote:
      'Une planification harmonisée de l’IEF pour le premier trimestre 2024–2025 donne, par exemple, l’étude de l’histoire de la famille et de l’école, des saisons, des besoins de la plante et du corps humain, ainsi que du respect des biens publics et privés.',
  },
  'Éducation physique, sportive et artistique': {
    title: '4. Éducation physique, sportive et artistique — EPSA',
    subtitle: 'Programme du CE1 au Sénégal',
    intro: 'Le domaine comprend :',
    sections: [
      {
        heading: 'Composantes du domaine',
        items: [
          'des activités physiques et sportives ;',
          'des activités plastiques : dessin, peinture, collage ou création ;',
          'l’éducation musicale : écoute, chant et rythme ;',
          'les arts scéniques : expression corporelle, jeu et petite mise en scène.',
        ],
      },
    ],
  },
};

const CE2_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: '1. Langue et communication',
    subtitle: 'Programme du CE2 au Sénégal',
    intro:
      'Au CE2, les élèves consolident les apprentissages du CE1 puis travaillent notamment les textes informatifs, les affiches et les textes poétiques. Ils apprennent à comprendre différents types de textes, à lire à voix haute avec aisance et à écrire pour un destinataire précis.',
    sections: [
      {
        heading: 'Oral, lecture et écriture',
        items: [
          'Donner des informations, raconter, décrire, expliquer une tâche ou un phénomène et participer à des échanges.',
          'Comprendre et lire à voix haute des textes narratifs, descriptifs, injonctifs, informatifs et poétiques.',
          'Lire une lettre ou une affiche et en repérer l’idée générale, les informations importantes et la présentation.',
          'Rédiger des lettres et des affiches ; lire, comprendre et déclamer des poèmes.',
          'Planifier un texte, produire un premier jet, le corriger puis le réécrire.',
        ],
      },
      {
        heading: 'Étude de la langue',
        intro: 'Les notions sont travaillées en lien avec les textes lus et écrits. Parmi les contenus du guide figurent :',
        items: [
          'Vocabulaire : dictionnaire, synonymes, antonymes, familles de mots, préfixes et suffixes, vocabulaire des lettres et des affiches.',
          'Grammaire : articles définis et indéfinis, phrase nominale, compléments d’objet direct et indirect, pronoms personnels, compléments de temps et de lieu.',
          'Conjugaison : infinitif ; verbes des 1er, 2e et 3e groupes à différents temps, dont le présent, le futur, l’imparfait et le passé composé ; impératif dans les consignes.',
          'Orthographe : accords du verbe avec son sujet, féminin et pluriel des noms et adjectifs, homophones comme ou/où et mots fréquents.',
          'Écriture : copie soignée, dictées et maîtrise des majuscules cursives.',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: '2. Mathématiques : progression leçon par leçon',
    subtitle: 'Programme du CE2 au Sénégal — Cahier PAAME2, édition 2024',
    sections: [
      {
        heading: 'A. Activités numériques — 46 leçons (Palier 3 — leçons 1 à 28)',
        items: [
          '1–2. Révision des nombres de 0 à 10 000',
          '3–4. Révision du sens et des techniques de l’addition et de la soustraction',
          '5–6. Révision de la multiplication par un chiffre puis par deux chiffres',
          '7–8. Révision de la division avec puis sans reste',
          '9–10. Nombres de 10 000 à 50 000',
          '11. Sens de l’addition',
          '12–13. Addition sur les nombres de 10 000 à 50 000',
          '14. Sens de la soustraction',
          '15–16. Soustraction sur les nombres de 10 000 à 50 000',
          '17. Révision de l’addition et de la soustraction',
          '18. Sens de la multiplication',
          '19–20. Multiplication sur les nombres de 10 000 à 50 000',
          '21. Sens de la division',
          '22–24. Division sur les nombres de 10 000 à 50 000',
          '25. Nombres pairs et impairs ; moitié, double et triple',
          '26. Critères de divisibilité',
          '27. Révision de la multiplication et de la division',
          '28. Activités d’intégration',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 4 — leçons 29 à 46',
        items: [
          '29–30. Nombres de 50 000 à 99 999',
          '31. Addition et soustraction sur ces nombres',
          '32–33. Multiplication sur les nombres de 50 000 à 99 999',
          '34–35. Division sur les nombres de 50 000 à 99 999',
          '36–37. Nombres décimaux',
          '38–39. Fractions simples',
          '40. Caractères de divisibilité',
          '41–42. Nombre 100 000',
          '43–44. Multiplication et division jusqu’à 100 000',
          '45. Révision des quatre opérations',
          '46. Activités d’intégration',
        ],
      },
      {
        heading: 'B. Activités géométriques — 29 leçons',
        items: [
          '1. Lignes droites, courbes et brisées',
          '2. Droites horizontales, verticales et obliques',
          '3. Droites sécantes, parallèles et perpendiculaires',
          '4–5. Angles droits, obtus et aigus',
          '6–7. Carré',
          '8–9. Rectangle',
          '10–14. Triangle : étude et construction',
          '15. Révision',
          '16. Activités d’intégration',
          '17–18. Cercle',
          '19–20. Figures symétriques et axe de symétrie',
          '21. Révision',
          '22–23. Patron du cube',
          '24–25. Patron du pavé droit',
          '26–27. Patron du cylindre',
          '28. Révision',
          '29. Activités d’intégration',
        ],
      },
      {
        heading: 'C. Activités de mesure — 31 leçons',
        items: [
          '1–2. Mètre, décimètre, centimètre et millimètre',
          '3. Décamètre, hectomètre et kilomètre',
          '4. Gramme, décigramme, centigramme et milligramme',
          '5. Kilogramme, hectogramme, décagramme et gramme',
          '6. Tonne, quintal et kilogramme',
          '7. Litre, décilitre, centilitre et millilitre',
          '8. Hectolitre, décalitre et litre',
          '9. Révision',
          '10. Activités d’intégration',
          '11. Masse nette, masse brute et tare',
          '12. Heure, minute et seconde',
          '13. Durée écoulée',
          '14. Prix d’achat, prix de revient et frais',
          '15. Prix d’achat, prix de vente et bénéfice',
          '16. Prix d’achat, prix de vente et perte',
          '17. Parts égales',
          '18. Parts proportionnelles',
          '19. Révision',
          '20. Activités d’intégration',
          '21. Périmètre du carré',
          '22. Périmètre du rectangle',
          '23. Périmètre du carré : exercices complémentaires',
          '24. Périmètre du rectangle : exercices complémentaires',
          '25. Périmètre du triangle',
          '26–27. Mètre carré',
          '28. Aire du carré',
          '29. Aire du rectangle',
          '30. Révision',
          '31. Activités d’intégration',
        ],
      },
      {
        heading: 'D. Résolution de problèmes — 21 leçons',
        items: [
          'Palier 4 — 1. Données numériques et questions',
          'Palier 4 — 2–3. Données utiles et données inutiles',
          'Palier 4 — 4. Données manquantes',
          'Palier 4 — 5–6. Tableaux de données',
          'Palier 4 — 7. Question finale',
          'Palier 4 — 8. Questions intermédiaires',
          'Palier 4 — 9. Question finale et questions intermédiaires',
          'Palier 4 — 10. Démarche progressive',
          'Palier 4 — 11–13. Construction d’énoncés de problèmes',
          'Palier 4 — 14. Révision',
          'Palier 4 — 15. Activités d’intégration',
          'Palier 5 — 16. Énoncés oraux et écrits',
          'Palier 5 — 17. Repérer une erreur dans un raisonnement',
          'Palier 5 — 18. Démarche progressive',
          'Palier 5 — 19. Démarche régressive',
          'Palier 5 — 20. Révision',
          'Palier 5 — 21. Activités d’intégration',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: '3. Éducation à la science et à la vie sociale — ESVS',
    subtitle: 'Programme du CE2 au Sénégal',
    intro:
      'Le guide de l’étape 2 répartit ce domaine entre histoire, géographie, initiation scientifique et technologique, vivre dans son milieu et vivre ensemble.',
    sections: [
      {
        heading: 'Contenus du domaine',
        items: [
          'Histoire : repères sur le passé du Sénégal, dont les royaumes et leur organisation sociale, politique et économique.',
          'Géographie : relief, cours d’eau, climat et végétation de la région ; activités humaines comme l’agriculture, l’élevage, la pêche et le tourisme.',
          'Initiation scientifique et technologique : êtres vivants, plantes et animaux ; utilisation, entretien ou réalisation d’objets techniques simples.',
          'Vivre dans son milieu : santé, environnement, problèmes locaux et solutions possibles.',
          'Vivre ensemble : droits et devoirs, tolérance, respect des différences, solidarité et paix.',
        ],
      },
    ],
  },
  'Éducation physique, sportive et artistique': {
    title: '4. Éducation physique, sportive et artistique — EPSA',
    subtitle: 'Programme du CE2 au Sénégal',
    sections: [
      {
        heading: 'Composantes du domaine',
        items: [
          'Le domaine comprend les activités physiques et sportives, les arts plastiques, la musique et les arts scéniques : pratiquer des exercices et des jeux sportifs, créer ou décorer, chanter, travailler le rythme et participer à de petites mises en scène.',
        ],
      },
    ],
  },
};

const CM1_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: '1. Langue et communication — français',
    subtitle: 'Programme du CM1 au Sénégal',
    intro:
      'Le CM1 travaille l’expression orale, la récitation, la lecture, l’étude des outils de la langue et la production écrite. Le guide prévoit une progression en quatre paliers, autour de différents types de textes.',
    sections: [
      {
        heading: 'Les quatre paliers',
        items: [
          'Palier 1 — raconter : raconter un événement vécu, faire le compte rendu d’une visite ou d’une réunion, relater un conte ou une histoire imaginée. Lire et comprendre des récits, gagner en fluidité, réciter un texte.',
          'Palier 2 — décrire : décrire un lieu, une personne, un animal ou une situation ; comprendre et produire des textes descriptifs.',
          'Palier 3 — donner des consignes : formuler un ordre, un conseil, une recommandation ou une règle ; lire et écrire des textes injonctifs.',
          'Palier 4 — informer et expliquer : expliquer une tâche, un schéma ou un montage ; transmettre des informations tirées d’une lecture, d’un document ou de la presse.',
        ],
      },
      {
        heading: 'Outils de la langue et écriture',
        items: [
          'Outils de la langue : vocabulaire et dictionnaire ; classes et fonctions des mots ; groupe sujet et groupe verbal ; phrases simples et complexes ; propositions juxtaposées et coordonnées ; pronoms ; accords dans la phrase ; conjugaison de verbes usuels aux temps étudiés, notamment le passé simple dans le récit et l’impératif dans les consignes ; orthographe, ponctuation, dictée et copie.',
          'Écriture : produire des récits, descriptions, consignes et textes informatifs ; organiser les idées, choisir le vocabulaire adapté, utiliser des connecteurs et relire pour corriger les erreurs.',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: '2. Mathématiques — progression détaillée des leçons',
    subtitle: 'Programme du CM1 au Sénégal — Cahier PAAME2 CM1, édition 2024',
    intro:
      'Le cahier PAAME2 présente les activités numériques, la géométrie, la mesure et la résolution de problèmes. Les leçons ci-dessous suivent son sommaire CM1.',
    sections: [
      {
        heading: 'A. Activités numériques — 51 leçons (Palier 1 — leçons 1 à 12)',
        items: [
          '1. Grands nombres (1) : lire, écrire et décomposer les nombres jusqu’à 999 999.',
          '2. Grands nombres (2) : nombres jusqu’à 999 999 999.',
          '3–4. Critères de divisibilité (1) et (2).',
          '5. Sens de l’addition.',
          '6. Addition avec et sans retenue.',
          '7. Sens de la soustraction.',
          '8. Soustraction avec et sans retenue.',
          '9. Sens de la multiplication.',
          '10. Multiplication avec plusieurs chiffres au multiplicateur.',
          '11. Révision : addition, soustraction et multiplication.',
          '12. Activités d’intégration.',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 2 — leçons 13 à 29',
        items: [
          '13. Sens de la division.',
          '14–15. Division avec un diviseur à deux chiffres (1) et (2).',
          '16–17. Nombres décimaux (1) et (2).',
          '18–19. Addition des nombres décimaux (1) et (2).',
          '20–22. Soustraction des nombres décimaux (1), (2) et (3).',
          '23–24. Multiplication des nombres décimaux (1) et (2).',
          '25–27. Division des nombres décimaux (1), (2) et (3).',
          '28. Révision des quatre opérations sur les nombres décimaux.',
          '29. Activités d’intégration.',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 3 — leçons 30 à 51',
        items: [
          '30. Fractions ordinaires.',
          '31. Fractions décimales.',
          '32–35. Comparaison des fractions (1) à (4).',
          '36–37. Simplification des fractions (1) et (2).',
          '38–39. Addition des fractions (1) et (2).',
          '40–41. Soustraction des fractions (1) et (2).',
          '42. Prendre une fraction d’une grandeur.',
          '43. Trouver une grandeur dont on connaît une fraction.',
          '44. Révision sur les fractions.',
          '45. Activités d’intégration.',
          '46. Révision de l’addition et de la soustraction des nombres décimaux.',
          '47. Révision de la multiplication et de la division des nombres décimaux.',
          '48–49. Révision sur les fractions (1) et (2).',
          '50–51. Activités d’intégration.',
        ],
      },
      {
        heading: 'B. Activités géométriques — 26 leçons',
        items: [
          'Palier 1 — 1. Droites sécantes et droites perpendiculaires.',
          'Palier 1 — 2. Droites parallèles.',
          'Palier 1 — 3. Angle droit, angle obtus et angle aigu.',
          'Palier 1 — 4. Révision.',
          'Palier 1 — 5. Intégration.',
          'Palier 2 — 6. Carré.',
          'Palier 2 — 7. Rectangle.',
          'Palier 2 — 8. Triangle.',
          'Palier 2 — 9. Parallélogramme.',
          'Palier 2 — 10. Cercle.',
          'Palier 2 — 11. Révision.',
          'Palier 2 — 12. Intégration.',
          'Palier 3 — 13–14. Cube (1) et (2).',
          'Palier 3 — 15–16. Pavé droit (1) et (2).',
          'Palier 3 — 17–18. Cylindre (1) et (2).',
          'Palier 3 — 19. Révision.',
          'Palier 3 — 20. Intégration.',
          'Palier 4 — 21–22. Figures symétriques et axe de symétrie (1) et (2).',
          'Palier 4 — 23–24. Translation (1) et (2).',
          'Palier 4 — 25. Révision.',
          'Palier 4 — 26. Intégration.',
        ],
      },
      {
        heading: 'C. Activités de mesure — 42 leçons',
        items: [
          'Palier 1 — 1. Mètre et sous-multiples.',
          'Palier 1 — 2. Mètre et multiples.',
          'Palier 1 — 3. Périmètre du carré et du rectangle.',
          'Palier 1 — 4. Périmètre du cercle.',
          'Palier 1 — 5. Dimensions du carré et du rectangle.',
          'Palier 1 — 6. Intervalles.',
          'Palier 1 — 7–8. Litre et sous-multiples ; litre et multiples.',
          'Palier 1 — 9–10. Gramme et sous-multiples ; gramme et multiples.',
          'Palier 1 — 11. Masse nette, masse brute et tare.',
          'Palier 1 — 12. Degré.',
          'Palier 1 — 13. Révision.',
          'Palier 1 — 14. Intégration.',
          'Palier 2 — 15–16. Mètre carré et sous-multiples ; mètre carré et multiples.',
          'Palier 2 — 17. Aire et dimensions du carré.',
          'Palier 2 — 18. Aire et dimensions du rectangle.',
          'Palier 2 — 19–20. Aire et dimensions du triangle (1) et (2).',
          'Palier 2 — 21–22. Aire et dimensions du parallélogramme (1) et (2).',
          'Palier 2 — 23–24. Aire et dimensions du cercle (1) et (2).',
          'Palier 2 — 25–26. Mesures de volume (1) et (2).',
          'Palier 2 — 27. Volume, masse et capacité.',
          'Palier 2 — 28. Masse volumique.',
          'Palier 2 — 29–30. Durée (1) et (2).',
          'Palier 2 — 31. Addition de durées.',
          'Palier 2 — 32. Soustraction de durées.',
          'Palier 2 — 33–34. Mouvements uniformes (1) et (2).',
          'Palier 2 — 35. Révision.',
          'Palier 2 — 36. Intégration.',
          'Palier 3 — 37. Budget familial.',
          'Palier 3 — 38. Prix.',
          'Palier 3 — 39. Parts égales.',
          'Palier 3 — 40. Parts inégales.',
          'Palier 3 — 41. Révision.',
          'Palier 3 — 42. Intégration.',
        ],
      },
      {
        heading: 'D. Résolution de problèmes — 21 leçons',
        items: [
          'Palier 1 — 1–3. Données utiles, inutiles ou manquantes (1) à (3).',
          'Palier 1 — 4. Consignes.',
          'Palier 1 — 5. Questions.',
          'Palier 1 — 6–7. Question finale et questions intermédiaires (1) et (2).',
          'Palier 1 — 8. Tableaux et schémas (1).',
          'Palier 1 — 9. Graphiques. Puis une intégration interdisciplinaire.',
          'Palier 1 — 10. Tableaux et schémas (2).',
          'Palier 1 — 11. Tableaux et graphiques.',
          'Palier 1 — 12. Révision.',
          'Palier 1 — 13. Intégration.',
          'Palier 2 — 14. Factures et tableaux.',
          'Palier 2 — 15. Schémas et graphiques.',
          'Palier 2 — 16. Rédiger un énoncé à partir d’une résolution.',
          'Palier 2 — 17. Repérer une erreur.',
          'Palier 2 — 18. Démarche progressive. Puis une intégration interdisciplinaire.',
          'Palier 2 — 19. Démarche régressive.',
          'Palier 2 — 20. Révision.',
          'Palier 2 — 21. Intégration, suivie d’une autre activité interdisciplinaire.',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: '3. Éducation à la science et à la vie sociale — ESVS',
    subtitle: 'Programme du CM1 au Sénégal',
    intro:
      'Le guide regroupe cette matière en découverte du monde et éducation au développement durable, avec notamment l’histoire, la géographie, l’initiation scientifique et technologique, « vivre dans son milieu » et « vivre ensemble ».',
    sections: [
      {
        heading: 'Domaines étudiés',
        items: [
          'Histoire : découvrir la préhistoire à partir de vestiges, de documents et d’enquêtes ; étudier des faits marquants de l’histoire du Sénégal, les royaumes et les premiers contacts avec les Arabes et les Européens ; comprendre certaines conséquences de ces contacts, les résistances à la conquête coloniale et la marche vers l’indépendance.',
          'Géographie : repérer les caractéristiques physiques de son milieu et du Sénégal ; lire et exploiter des cartes ; étudier le découpage administratif, les caractéristiques humaines et la population ; comprendre certains liens entre voies de communication, population et milieu.',
          'Initiation scientifique et technologique : observer des phénomènes et des objets techniques simples ; identifier les parties d’un objet, expliquer son fonctionnement et apprendre à le manipuler ou à réaliser un montage simple.',
          'Vivre dans son milieu : comprendre des problèmes liés à l’environnement, à l’hygiène, à la santé, à la nutrition et à la population ; rechercher des solutions adaptées au contexte local.',
          'Vivre ensemble : règles de vie commune, solidarité et citoyenneté ; découverte d’organisations et d’institutions, en partant du milieu de l’élève.',
        ],
      },
    ],
  },
  'Éducation physique, sportive et artistique': {
    title: '4. Éducation physique, sportive et artistique — EPSA',
    subtitle: 'Programme du CM1 au Sénégal',
    intro:
      'Le guide comprend l’éducation physique et sportive, ainsi que les arts plastiques, l’éducation musicale et les arts scéniques.',
    sections: [
      {
        heading: 'Composantes du programme',
        items: [
          'Éducation physique et sportive : activités physiques, jeux et activités sportives ; coordination, respect des règles et participation aux activités collectives.',
          'Arts plastiques : dessin, observation des formes et des couleurs, modelage d’objets courants, découpage, collage et pliage.',
          'Éducation musicale : chant, écoute, rythme et participation à des activités musicales.',
          'Arts scéniques : expression et jeux de rôle, présentation de sketches et participation à de petites productions collectives.',
        ],
      },
    ],
  },
};

const CM2_COURSES: Record<string, CourseDocument> = {
  'Langue et communication': {
    title: '1. Langue et communication — français',
    subtitle: 'Programme du CM2 au Sénégal — Préparation au CFEE',
    intro:
      'Le programme comprend l’expression orale, la récitation, la lecture, l’étude des outils de la langue et la production écrite. Au CM2, les paliers 5 à 8 prolongent les apprentissages du CM1. Les élèves travaillent notamment les textes informatifs et argumentatifs, et développent leur capacité à présenter une idée, exposer un projet, donner leur avis et défendre un point de vue.',
    sections: [
      {
        heading: 'Compétences et outils de la langue',
        items: [
          'Oral et récitation : exposer une idée ou un projet, écouter et questionner, exprimer son avis et argumenter ; mémoriser et réciter des textes en prose ou en vers.',
          'Lecture : comprendre des textes narratifs, descriptifs, injonctifs, informatifs, argumentatifs, dialogués et poétiques ; lire avec fluidité et repérer les informations utiles.',
          'Vocabulaire : employer les mots adaptés à un sujet, utiliser le dictionnaire et distinguer le sens propre du sens figuré.',
          'Grammaire : étudier les propositions subordonnées, les pronoms possessifs et démonstratifs, les fonctions des mots et l’analyse grammaticale et logique de phrases.',
          'Conjugaison et orthographe : conjuguer des verbes usuels, notamment au subjonctif présent ; travailler le participe présent et l’adjectif verbal, les homophones comme quand / quant / qu’en, et l’écriture des mots avec certains préfixes.',
          'Écriture : produire des textes informatifs et argumentatifs ; organiser les idées, justifier un point de vue, relire et corriger. Le guide prévoit aussi dictée et copie de textes.',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: '2. Mathématiques — progression détaillée',
    subtitle: 'Programme du CM2 au Sénégal — Cahier PAAME2 CM2, édition 2024',
    intro:
      'Le cahier PAAME2 CM2 répartit les mathématiques en activités numériques, géométrie, mesure et résolution de problèmes. Les intitulés et numéros de leçons ci-dessous reprennent son sommaire.',
    sections: [
      {
        heading: 'A. Activités numériques — 48 leçons (Palier 4 — leçons 1 à 13)',
        items: [
          '1. Grands nombres : lire, écrire et décomposer des nombres jusqu’à 999 999 999 999.',
          '2–3. Critères de divisibilité (1) et (2).',
          '4. Addition.',
          '5. Soustraction.',
          '6. Sens de la multiplication.',
          '7. Multiplication avec plusieurs chiffres au multiplicateur.',
          '8. Division avec un chiffre au diviseur.',
          '9. Division avec deux chiffres au diviseur.',
          '10. Division avec trois chiffres au diviseur.',
          '11. Révision des quatre opérations sur les grands nombres.',
          '12–13. Activités d’intégration.',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 5 — leçons 14 à 26',
        items: [
          '14–15. Nombres décimaux (1) et (2).',
          '16. Addition des nombres décimaux.',
          '17. Soustraction des nombres décimaux.',
          '18–19. Multiplication des nombres décimaux (1) et (2).',
          '20–23. Division des nombres décimaux (1) à (4).',
          '24. Révision des quatre opérations sur les nombres décimaux.',
          '25–26. Activités d’intégration.',
        ],
      },
      {
        heading: 'A. Activités numériques — Palier 6 — leçons 27 à 48',
        items: [
          '27. Notion de fraction.',
          '28. Simplification des fractions.',
          '29. Réduction de fractions au même dénominateur.',
          '30. Comparaison de fractions.',
          '31. Addition et soustraction des fractions.',
          '32. Multiplication des fractions.',
          '33. Division des fractions par un nombre entier.',
          '34. Prendre une fraction d’une grandeur.',
          '35. Trouver une grandeur dont on connaît une fraction.',
          '36. Calcul du pourcentage.',
          '37. Échelle d’un plan et d’une carte.',
          '38. Tableaux de proportionnalité.',
          '39. Règle de trois.',
          '40. Révision : multiplication et division des fractions.',
          '41–42. Activités d’intégration.',
          '43–44. Révision sur les nombres décimaux (1) et (2).',
          '45–46. Révision sur les fractions (1) et (2).',
          '47–48. Activités d’intégration.',
        ],
      },
      {
        heading: 'B. Activités géométriques — 26 leçons',
        items: [
          'Palier 5 — 1. Carré et rectangle.',
          'Palier 5 — 2. Triangle.',
          'Palier 5 — 3. Parallélogramme.',
          'Palier 5 — 4. Cercle.',
          'Palier 5 — 5. Losange.',
          'Palier 5 — 6. Trapèze.',
          'Palier 5 — 7. Tangram.',
          'Palier 5 — 8. Révision.',
          'Palier 5 — 9. Intégration.',
          'Palier 6 — 10. Hexagone.',
          'Palier 6 — 11. Octogone.',
          'Palier 6 — 12. Polygones irréguliers.',
          'Palier 6 — 13. Cube.',
          'Palier 6 — 14. Pavé droit.',
          'Palier 6 — 15–16. Cylindre (1) et (2).',
          'Palier 6 — 17–18. Prisme droit (1) et (2).',
          'Palier 6 — 19. Révision.',
          'Palier 6 — 20. Intégration.',
          'Palier 7 — 21. Figures symétriques et axe de symétrie.',
          'Palier 7 — 22. Translation.',
          'Palier 7 — 23. Agrandissement.',
          'Palier 7 — 24. Réduction.',
          'Palier 7 — 25. Révision.',
          'Palier 7 — 26. Intégration.',
        ],
      },
      {
        heading: 'C. Activités de mesure — 48 leçons',
        items: [
          'Palier 4 — 1. Mètre et sous-multiples.',
          'Palier 4 — 2. Mètre et multiples.',
          'Palier 4 — 3. Périmètres du carré, du rectangle et du cercle.',
          'Palier 4 — 4. Dimensions du carré, du rectangle et du cercle.',
          'Palier 4 — 5. Intervalles.',
          'Palier 4 — 6. Échelles.',
          'Palier 4 — 7. Litre, multiples et sous-multiples.',
          'Palier 4 — 8. Gramme, multiples et sous-multiples.',
          'Palier 4 — 9. Masse nette, masse brute et tare.',
          'Palier 4 — 10. Degré.',
          'Palier 4 — 11. Révision.',
          'Palier 4 — 12. Intégration.',
          'Palier 5 — 13. Mètre carré, multiples et sous-multiples.',
          'Palier 5 — 14. Aire et dimensions du carré et du rectangle.',
          'Palier 5 — 15. Aire et dimensions du triangle.',
          'Palier 5 — 16. Aire et dimensions du parallélogramme.',
          'Palier 5 — 17. Aire et dimensions du cercle.',
          'Palier 5 — 18. Aire et dimensions du losange.',
          'Palier 5 — 19. Aire et dimensions du trapèze.',
          'Palier 5 — 20. Aires augmentées et diminuées.',
          'Palier 5 — 21. Mètre cube et sous-multiples.',
          'Palier 5 — 22. Volume du cube.',
          'Palier 5 — 23. Volume du pavé droit.',
          'Palier 5 — 24. Volume du cylindre.',
          'Palier 5 — 25. Volume, masse et capacité.',
          'Palier 5 — 26. Masse volumique.',
          'Palier 5 — 27. Durée.',
          'Palier 5 — 28. Addition et soustraction de durées.',
          'Palier 5 — 29. Multiplication et division de durées.',
          'Palier 5 — 30. Mouvements uniformes.',
          'Palier 5 — 31. Représentation graphique.',
          'Palier 5 — 32. Débit.',
          'Palier 5 — 33. Révision.',
          'Palier 5 — 34. Intégration.',
          'Palier 6 — 35. Budget familial.',
          'Palier 6 — 36. Prix.',
          'Palier 6 — 37. Pourcentage.',
          'Palier 6 — 38. Grandeur.',
          'Palier 6 — 39. Intérêt.',
          'Palier 6 — 40. Capital placé.',
          'Palier 6 — 41. Taux de placement.',
          'Palier 6 — 42. Durée de placement.',
          'Palier 6 — 43. Parts égales.',
          'Palier 6 — 44. Parts inégales.',
          'Palier 6 — 45. Partages proportionnels.',
          'Palier 6 — 46. Moyenne.',
          'Palier 6 — 47. Révision.',
          'Palier 6 — 48. Intégration.',
        ],
      },
      {
        heading: 'D. Résolution de problèmes — 22 leçons',
        items: [
          'Palier 3 — 1–2. Données utiles, inutiles ou manquantes (1) et (2).',
          'Palier 3 — 3–4. Consignes et questions (1) et (2).',
          'Palier 3 — 5. Question finale.',
          'Palier 3 — 6. Question finale et questions intermédiaires.',
          'Palier 3 — 7. Tableaux et schémas. Puis une activité d’intégration interdisciplinaire.',
          'Palier 3 — 8. Tableaux et graphiques (1).',
          'Palier 3 — 9. Schémas.',
          'Palier 3 — 10. Tableaux et graphiques (2).',
          'Palier 3 — 11. Révision.',
          'Palier 3 — 12. Intégration, puis une autre activité interdisciplinaire.',
          'Palier 4 — 13. Factures, tableaux et schémas.',
          'Palier 4 — 14. Graphiques.',
          'Palier 4 — 15. Construire un énoncé à partir d’une résolution.',
          'Palier 4 — 16. Repérer une erreur.',
          'Palier 4 — 17. Démarche progressive.',
          'Palier 4 — 18. Démarche régressive.',
          'Palier 4 — 19. Outils de vérification.',
          'Palier 4 — 20. Présenter une solution.',
          'Palier 4 — 21. Révision.',
          'Palier 4 — 22. Intégration, puis activité interdisciplinaire.',
        ],
      },
    ],
  },
  'Éducation à la science et à la vie sociale': {
    title: '3. Éducation à la science et à la vie sociale — ESVS',
    subtitle: 'Programme du CM2 au Sénégal',
    intro:
      'Le guide CEB comprend la découverte du monde — histoire, géographie, initiation scientifique et technologique — ainsi que l’éducation au développement durable, avec « vivre dans son milieu » et « vivre ensemble ».',
    sections: [
      {
        heading: 'Paliers et contenus',
        items: [
          'Histoire : étudier les grands empires noirs d’Afrique de l’Ouest, dont le Ghana, le Mali et le Gao ; aborder les premiers contacts avec les Arabes ; découvrir de grandes inventions et des progrès scientifiques des XIXᵉ et XXᵉ siècles.',
          'Géographie : expliquer les relations entre les ressources, les activités économiques — agriculture, élevage, pêche, commerce, artisanat, industrie ou tourisme — et la vie sociale et culturelle ; étudier les liens entre milieu, population, habitat, transports et communications.',
          'Sciences et technologie : étudier des phénomènes de la vie courante comme la météo, la combustion, les changements d’état et la dilatation ; observer les propriétés de l’air, de l’eau, des métaux et des roches ; découvrir les appareils digestif, respiratoire et circulatoire et leurs fonctions.',
          'Environnement, santé et nutrition : comprendre la dégradation des ressources naturelles, ses conséquences pour les populations, les troubles nutritionnels et certaines maladies ; proposer des solutions de prévention et de gestion durable.',
          'Vivre ensemble : apprendre à gérer les désaccords, respecter les différences, agir solidairement et découvrir le fonctionnement d’organisations et d’institutions.',
        ],
      },
    ],
  },
  'Éducation physique, sportive et artistique': {
    title: '4. Éducation physique, sportive et artistique — EPSA',
    subtitle: 'Programme du CM2 au Sénégal',
    intro:
      'Le guide distingue l’éducation physique et sportive, les arts plastiques, l’éducation musicale et les arts scéniques.',
    sections: [
      {
        heading: 'Composantes du programme',
        items: [
          'Éducation physique et sportive : activités physiques et sportives, coordination, maîtrise des mouvements, respect des règles et participation aux jeux collectifs.',
          'Arts plastiques : dessin, illustration de textes ou de thèmes, modelage et création ; travail sur formes, couleurs et techniques.',
          'Éducation musicale : interpréter et créer des chants, reproduire des rythmes et reconnaître des sons d’instruments, notamment ceux du patrimoine local et national.',
          'Arts scéniques : jeu de rôle, expression par la voix et les gestes, imitation de personnages et représentation de sketches.',
        ],
      },
    ],
  },
};

const SIXIEME_COURSES: Record<string, CourseDocument> = {
  'Français': {
    title: 'Français — 12 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Situation de communication et registres de langue',
          '2. Conte et récit merveilleux',
          '3. Récit : situation initiale, péripéties, dénouement et temps du récit',
          '4. Description d’un lieu, d’un personnage ou d’une image',
          '5. Lettre personnelle',
          '6. Poésie : vers, strophes, rimes et sens figuré',
          '7. Fables, proverbes, devinettes et premières scènes de théâtre',
          '8. Phrase simple et groupe nominal',
          '9. Verbe, compléments et liens entre les phrases',
          '10. Groupes, modes et temps de conjugaison',
          '11. Accords, accents, ponctuation et homophones',
          '12. Formation et sens des mots, familles de mots et dictionnaire',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: 'Mathématiques — 19 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    sections: [
      {
        heading: 'Activités numériques et géométrie',
        items: [
          'Activités numériques : nombres décimaux ; addition ; soustraction ; rangement ; multiplication ; division ; organisation d’un calcul ; proportionnalité et pourcentages ; nombres décimaux relatifs ; repérage sur une droite et dans un plan.',
          'Géométrie : introduction à la géométrie ; cercle ; droites perpendiculaires et parallèles ; symétrie orthogonale ; angles ; polygones ; aires ; géométrie dans l’espace ; repérage sur la sphère.',
        ],
      },
    ],
    footerNote:
      'Le guide officiel d’usage des mathématiques couvre le programme et annonce 19 tableaux de leçons pour la 6e.',
  },
  'Histoire': {
    title: 'Histoire — 22 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    sections: [
      {
        heading: 'Progression des 22 leçons',
        items: [
          '1. Introduction à l’étude de l’histoire : sources, méthodes et chronologie',
          '2. Grandes divisions de la préhistoire',
          '3. Préhistoire africaine : Paléolithique et Néolithique',
          '4. Préhistoire et protohistoire au Sénégal',
          '5. Visite de sites ou de musées et compte rendu',
          '6. Égypte pharaonique : pays, habitants et grandes périodes',
          '7. Civilisation égyptienne',
          '8. Nubie antique',
          '9. Éthiopie antique',
          '10. Relations entre l’Afrique du Nord-Est et l’Afrique intérieure',
          '11. Civilisation carthaginoise',
          '12. Étude d’images et de textes réunis par les élèves',
          '13. Mésopotamie : cadre géographique, histoire et civilisation',
          '14. Palestine : cadre géographique, histoire et civilisation',
          '15. Enquête sur le foyer des religions monothéistes',
          '16. Grèce : pays, habitants et grandes périodes',
          '17. Civilisations grecques',
          '18. Rome, de la cité à l’Empire',
          '19. Civilisation romaine et son évolution',
          '20. Christianisme et expansion dans le monde romain',
          '21. Grandes invasions en Europe et en Afrique',
          '22. Exposé sur un thème choisi',
        ],
      },
    ],
  },
  'Géographie': {
    title: 'Géographie — 39 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    intro:
      'Le fil conducteur est l’étude de grandes régions du Sénégal : localisation et carte, milieu physique, population, organisation de l’espace, activités, puis problèmes et pistes de développement.',
    sections: [
      {
        heading: 'Régions étudiées (leçons 1 à 39)',
        items: [
          'Bassin arachidier — leçons 1 à 8 : localisation et carte ; cultures de l’arachide et du mil ; relief, climat et sols ; population ; villages, villes et transports ; activités rurales ; transformation artisanale et industrielle ; problèmes et perspectives.',
          'Dakar et littoral central — leçons 9 à 14 : localisation ; littoral, dunes et Niayes ; population et migrations ; organisation urbaine ; activités économiques ; croissance urbaine et problèmes de développement.',
          'Ferlo — leçons 15 à 20 : localisation ; climat et ressources en eau ; population et transhumance ; campements, villages et forages ; élevage ; accès à l’eau et gestion des pâturages.',
          'Vallée du Sénégal — leçons 21 à 27 : localisation ; fleuve, crues, décrues, walo et diéri ; population ; villages et villes ; cultures, élevage et pêche ; barrages et irrigation ; problèmes et perspectives.',
          'Casamance — leçons 28 à 33 : localisation ; pluies, mangrove et forêt ; population ; villes et voies de communication ; activités traditionnelles et aménagements ; déforestation et désenclavement.',
          'Haut-Sénégal — leçons 34 à 39 : localisation ; relief, fleuves et végétation ; population ; organisation de l’espace ; activités ; problèmes et perspectives.',
        ],
      },
    ],
  },
  'Anglais': {
    title: 'Anglais — 16 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    sections: [
      {
        heading: 'Progression des 16 leçons',
        items: [
          '1. Salutations, présentations et alphabet',
          '2. Salle de classe et consignes',
          '3. Nombres, adresse, téléphone et nationalité',
          '4. Métiers',
          '5. Heure, jours, mois et dates',
          '6. Famille',
          '7. Maison, pièces et meubles',
          '8. Repas, boissons et goûts',
          '9. Habitudes quotidiennes',
          '10. Corps, vêtements et description des personnes',
          '11. Présent continu et description d’une image',
          '12. Achats au marché',
          '13. Météo et saisons',
          '14. Santé : can, must, may',
          '15. Raconter le week-end passé au prétérit',
          '16. Projets et fêtes : going to et mots de liaison',
        ],
      },
    ],
  },
  'SVT': {
    title: 'SVT — 12 leçons',
    subtitle: 'Programme de 6e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Composantes de l’environnement : milieu physique et êtres vivants',
          '2. Classification et répartition des êtres vivants',
          '3. Relations dans l’environnement et chaînes alimentaires',
          '4. Production d’aliments par les végétaux chlorophylliens',
          '5. Amélioration de la production des plantes et des animaux',
          '6. Déplacement des animaux et adaptation aux milieux',
          '7. Cellule et division cellulaire',
          '8. Germination et autres façons d’obtenir une nouvelle plante',
          '9. Paludisme : transmission et prévention',
          '10. Ascaridiase : contamination et prévention',
          '11. Choléra : transmission et prévention',
          '12. Paysages : roches, érosion et évolution',
        ],
      },
    ],
  },
};

const CINQUIEME_COURSES: Record<string, CourseDocument> = {
  'Français': {
    title: 'Français — 12 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Théâtre et comédie : répliques, didascalies, formes du comique',
          '2. Épopée, mythes et légendes : héros, merveilleux et tradition orale',
          '3. Texte descriptif : portrait, description d’un lieu et figures de style',
          '4. Récit et dialogue : schéma narratif, paroles rapportées et sketch',
          '5. Lettre et messages courts : lettre familière, demande simple, SMS',
          '6. S’informer, présenter et débattre : recherche documentaire et exposé',
          '7. Groupe nominal : déterminants, pronoms, comparatif et superlatif',
          '8. Verbe dans la phrase : transitivité, compléments, voix active et passive',
          '9. Phrase complexe : subordonnées relatives, complétives et circonstancielles',
          '10. Conjugaison : temps, modes et valeurs dans le récit et le discours',
          '11. Orthographe : accords particuliers, participe passé, homophones',
          '12. Mots et style : dérivation, sens, registres et prononciation',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: 'Mathématiques — 12 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Puissances : exposants positifs, produits, quotients et puissances de 10',
          '2. Multiples et diviseurs : divisibilité, nombres premiers, PGCD et PPCM',
          '3. Fractions : simplifier, comparer, additionner, soustraire, multiplier et diviser',
          '4. Proportionnalité : échelles, vitesse moyenne, pourcentages et partages',
          '5. Nombres décimaux relatifs : comparaison et quatre opérations',
          '6. Représentation graphique d’un tableau de correspondance',
          '7. Symétrie centrale',
          '8. Angles : angles opposés, alternes-internes, correspondants et triangle',
          '9. Parallélogrammes : construction et propriétés',
          '10. Triangles : inégalité triangulaire, droites remarquables et cercle circonscrit',
          '11. Quadrilatères : rectangle, losange, carré et trapèze',
          '12. Géométrie dans l’espace : prismes, cylindres, patrons, aires et volumes',
        ],
      },
    ],
  },
  'Histoire': {
    title: 'Histoire — 22 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 22 leçons',
        items: [
          '1. Le monde à la fin du VIe siècle',
          '2. Naissance de l’islam : Arabie préislamique, Mohamed et le Coran',
          '3. Expansion musulmane et organisation politique',
          '4. Vie politique, religieuse, économique et culturelle',
          '5. Enquête sur les chefs religieux de la localité',
          '6. Empire du Ghana',
          '7. Mouvement almoravide',
          '8. Empire du Mali',
          '9. Empire songhaï',
          '10. Royaumes mossis',
          '11. Royaumes du golfe de Guinée : cités yoroubas et Bénin',
          '12. Dossier documentaire, par exemple sur le commerce transsaharien',
          '13. Sénégambie : cadre géographique et peuplement',
          '14. Tekrour et Fouta',
          '15. Empire du Jolof',
          '16. Empire du Gaabu',
          '17. Synthèse sur les civilisations d’Afrique occidentale',
          '18. Système féodal en Europe',
          '19. Humanisme et Renaissance',
          '20. Civilisations précolombiennes d’Amérique',
          '21. Grands voyages de découvertes',
          '22. Construction d’une frise chronologique',
        ],
      },
    ],
  },
  'Géographie': {
    title: 'Géographie — 26 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 26 leçons',
        items: [
          '1. Localisation du Sénégal et lecture de carte',
          '2. Structure géologique',
          '3. Relief',
          '4. Climat',
          '5. Sols et végétation',
          '6. Hydrographie',
          '7. Écosystèmes',
          '8. Peuplement, peuples, langues et religions',
          '9. Accroissement de la population',
          '10. Structures de la population et pyramide des âges',
          '11. Répartition géographique et densités',
          '12. Mobilité : migrations, exode rural et émigration',
          '13. Villes : urbanisation, fonctions et problèmes',
          '14. Agriculture',
          '15. Élevage',
          '16. Pêche',
          '17. Artisanat et industrie',
          '18. Tourisme',
          '19. Transports et commerce intérieur',
          '20. Échanges extérieurs',
          '21. Jeunesse : défis et potentialités',
          '22. Relations entre villes et campagnes',
          '23. Disparités régionales',
          '24. Régionalisation et développement communautaire',
          '25. Environnement et protection de la nature',
          '26. Le Sénégal en Afrique et dans le monde',
        ],
      },
    ],
  },
  'Anglais': {
    title: 'Anglais — 16 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 16 leçons',
        items: [
          '1. Retour en classe : se présenter et poser des questions',
          '2. Activités quotidiennes : présent simple ou continu',
          '3. Nourriture et boissons : quantités et recettes',
          '4. Règles scolaires : obligation et interdiction',
          '5. Parler du futur : will, going to et présent continu',
          '6. Santé et corps : donner des conseils',
          '7. Sports, loisirs et passe-temps',
          '8. Possession : pronoms possessifs et whose',
          '9. Métiers et fabrication : initiation à la voix passive',
          '10. Present perfect : expériences, just/already/yet, for/since',
          '11. Raconter : prétérit simple et continu',
          '12. Comparer village et ville',
          '13. Horaires, transports et indications de direction',
          '14. Décrire des personnes et des lieux',
          '15. Conditionnel de type 1, demandes et excuses',
          '16. Rapporter les paroles de quelqu’un',
        ],
      },
    ],
  },
  'SVT': {
    title: 'SVT — 12 leçons',
    subtitle: 'Programme de 5e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Cadre de vie rural et urbain, dégradation et enquête',
          '2. Pollutions et conséquences sur la santé',
          '3. Régimes alimentaires des animaux et adaptations',
          '4. Besoins de l’organisme et effets d’une mauvaise alimentation',
          '5. Respiration animale selon le milieu',
          '6. Reproduction des animaux : fécondation et développement',
          '7. Reproduction des plantes à fleurs',
          '8. Reproduction des plantes sans fleurs',
          '9. Constituants et types de sols',
          '10. Formation, évolution et protection des sols',
          '11. Origine des roches sédimentaires et fossiles',
          '12. Utilité et gestion des roches sédimentaires',
        ],
      },
    ],
  },
};

const QUATRIEME_COURSES: Record<string, CourseDocument> = {
  'Français': {
    title: 'Français — 12 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Nouvelle et conte fantastique : récit bref, chute, réel et surnaturel',
          '2. Roman : lire une œuvre intégrale, étudier les personnages et les thèmes',
          '3. Poésie : vers, rimes, rythme, images et écriture poétique',
          '4. Informer : fait divers, article de journal et compte rendu',
          '5. Récit enrichi : raconter, décrire et insérer un dialogue',
          '6. Lettre de demande et lettre administrative',
          '7. Argumentation : thèse, arguments, exemples et plan',
          '8. Phrase : types, formes, fonctions et mise en relief',
          '9. Circonstances et paroles rapportées : subordination, discours direct et indirect',
          '10. Verbe : modes, temps et aspects',
          '11. Orthographe : accords particuliers, homophones et noms à double genre',
          '12. Vocabulaire et style : figures de style, registres et origine des mots',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: 'Mathématiques — 14 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 14 leçons',
        items: [
          '1. Nombres rationnels',
          '2. Calcul algébrique',
          '3. Équations à une inconnue',
          '4. Inéquations et systèmes de deux inéquations',
          '5. Applications linéaires et représentation graphique',
          '6. Statistiques',
          '7. Distances : cercles, distance d’un point à une droite, bissectrice',
          '8. Droites des milieux',
          '9. Droites remarquables d’un triangle : bissectrices et médianes',
          '10. Triangle rectangle',
          '11. Translations et vecteurs',
          '12. Rotations et polygones réguliers',
          '13. Projection orthogonale dans le plan',
          '14. Géométrie dans l’espace',
        ],
      },
    ],
  },
  'Histoire': {
    title: 'Histoire — 24 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 24 leçons',
        items: [
          '1. Afrique au XVIe siècle : arrivée des Européens et recul du commerce transsaharien',
          '2. Asie et Nouveau Monde au XVIe siècle : arrivée et implantation européennes',
          '3. Initiation à la dissertation',
          '4. Naissance, mécanismes et évolution de la traite négrière',
          '5. Conséquences de la traite en Afrique',
          '6. Conséquences en Europe, en Amérique et en Asie',
          '7. Traite négrière au Sénégal',
          '8. Mouvement abolitionniste',
          '9. Visite de la Maison des Esclaves ou dossier sur Gorée',
          '10. Sénégambie : dislocation du Jolof et émergence de nouveaux royaumes',
          '11. Évolution du Fouta du XVIIe au XIXe siècle',
          '12. Entités politiques apparues après le déclin du Gaabu',
          '13. Exposé sur les institutions sociales, politiques et économiques',
          '14. Empires peuls du Sokoto et du Macina',
          '15. Empire toucouleur d’El Hadji Omar Tall',
          '16. Tchaka et le mouvement zoulou',
          '17. Formation des royaumes jusqu’au milieu du XIXe siècle',
          '18. Initiation au commentaire de documents',
          '19. Première révolution industrielle et ses transformations',
          '20. Mouvement des idées au XVIIIe siècle',
          '21. Révolution française de 1789 et ses conséquences',
          '22. Amérique du Nord : naissance des États-Unis',
          '23. Empire ottoman',
          '24. Initiation au commentaire de texte historique',
        ],
      },
    ],
  },
  'Géographie': {
    title: 'Géographie — 22 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 22 leçons',
        items: [
          '1. Afrique de l’Ouest : localisation et carte',
          '2. Problèmes de développement en Afrique de l’Ouest',
          '3. Problèmes d’intégration régionale',
          '4. Afrique : localisation et carte du continent',
          '5. Diversité physique et humaine de l’Afrique',
          '6. Pauvreté et dépendance : facteurs et conséquences',
          '7. Coopération internationale et aide au développement',
          '8. Europe : localisation et carte',
          '9. Relief et climat de l’Europe',
          '10. Population européenne',
          '11. Intégration européenne',
          '12. Amérique : localisation et carte',
          '13. Unités naturelles de l’Amérique',
          '14. Diversité des peuples américains',
          '15. Disparités économiques et sociales en Amérique',
          '16. Intégration des pays américains',
          '17. Asie : localisation et carte',
          '18. Contrastes naturels de l’Asie',
          '19. Populations de l’Asie',
          '20. Disparités économiques et intégration en Asie',
          '21. Océanie : localisation et carte',
          '22. Disparités et problèmes d’intégration en Océanie',
        ],
      },
    ],
  },
  'Anglais': {
    title: 'Anglais — 15 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 15 leçons',
        items: [
          '1. Présentation personnelle et informations d’identité',
          '2. Révision des temps : présent, passé et present perfect',
          '3. Famille et logement : conversation polie',
          '4. Vie urbaine : problèmes de la ville',
          '5. Ville : lieux, services et projets',
          '6. Vie au village : agriculture, pêche et environnement',
          '7. Migration et exode rural : donner son avis',
          '8. Voyages et communications : permission et capacité',
          '9. Récits imaginaires : raconter au passé',
          '10. Métiers et emploi : professions et entretien d’embauche',
          '11. Lettres, petites annonces, tableaux et graphiques',
          '12. Patrimoine culturel : croyances, coutumes et cérémonies',
          '13. Valeurs morales et héros historiques',
          '14. Éducation traditionnelle et moderne',
          '15. Santé : paludisme, VIH-sida, tuberculose et prévention',
        ],
      },
    ],
  },
  'Physique-Chimie': {
    title: 'Physique-Chimie — 12 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 12 leçons',
        items: [
          '1. Introduction aux sciences physiques : matière et changements d’état',
          '2. Grandeurs physiques, unités et mesures',
          '3. Masse, masse volumique et densité',
          '4. Poids et relation entre poids et masse',
          '5. Électricité : circuits, intensité et tension',
          '6. Sources et récepteurs de lumière',
          '7. Propagation rectiligne de la lumière et ombres',
          '8. Réflexion et réfraction',
          '9. Mélanges, corps purs et techniques de séparation',
          '10. Structure de la matière : atomes, molécules et ions',
          '11. Mole et grandeurs molaires',
          '12. Réactions chimiques et équations-bilans',
        ],
      },
    ],
  },
  'SVT': {
    title: 'SVT — 13 leçons',
    subtitle: 'Programme de 4e au Sénégal',
    sections: [
      {
        heading: 'Progression des 13 leçons',
        items: [
          '1. Ressources naturelles et gestion durable',
          '2. Digestion et absorption intestinale',
          '3. Sang : composition et maladies',
          '4. Circulation et rôle du sang',
          '5. Pression artérielle et maladies cardiovasculaires',
          '6. Puberté et rôle des organes génitaux',
          '7. De la fécondation à l’accouchement',
          '8. Comment éviter une grossesse ?',
          '9. Transmission des caractères héréditaires',
          '10. Contamination par les microorganismes',
          '11. Volcanisme',
          '12. Formation des roches magmatiques',
          '13. Séismes et structure du globe terrestre',
        ],
      },
    ],
  },
};

const TROISIEME_COURSES: Record<string, CourseDocument> = {
  'Français': {
    title: 'Français — 8 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 8 leçons',
        items: [
          '1. Phrase simple, phrase complexe et subordination',
          '2. Verbe : modes, temps, concordance et voix',
          '3. Accords et orthographe',
          '4. Lexique : formation et sens des mots, figures de style et registres',
          '5. Lire une œuvre intégrale, notamment Une si longue lettre de Mariama Bâ',
          '6. Résumer et discuter un texte argumentatif',
          '7. Dissertation : analyser le sujet, construire un plan et rédiger',
          '8. Commentaire composé : analyser un texte et organiser les axes de lecture',
        ],
      },
    ],
  },
  'Mathématiques': {
    title: 'Mathématiques — 13 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 13 leçons',
        items: [
          '1. Racine carrée et calcul sur les radicaux',
          '2. Applications affines et applications affines par intervalles',
          '3. Équations et inéquations à une inconnue',
          '4. Équations et systèmes à deux inconnues',
          '5. Inéquations et systèmes d’inéquations à deux inconnues',
          '6. Statistiques',
          '7. Théorème de Thalès et sa réciproque',
          '8. Trigonométrie dans le triangle rectangle',
          '9. Angle inscrit',
          '10. Vecteurs',
          '11. Transformations du plan',
          '12. Repérage dans le plan',
          '13. Géométrie dans l’espace',
        ],
      },
    ],
  },
  'Histoire': {
    title: 'Histoire — 22 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 22 leçons',
        items: [
          '1. Découvertes scientifiques et mutations économiques',
          '2. Développement du capitalisme et changements sociaux',
          '3. Doctrines sociales : syndicalisme et socialisme',
          '4. Exercices de dissertation historique',
          '5. Missions et explorations en Afrique',
          '6. Rivalités coloniales, conférence de Berlin et partage de l’Afrique',
          '7. Résistances africaines : formes et exemples',
          '8. Systèmes coloniaux français et britannique',
          '9. Dossier sur une résistance locale',
          '10. Impérialisme japonais',
          '11. Impérialisme européen en Asie, y compris russe',
          '12. Impérialisme américain',
          '13. Révolutions chinoises, de Sun Wen à Mao Zedong',
          '14. Première Guerre mondiale et ses conséquences',
          '15. Révolution russe et consolidation du régime',
          '16. Crise des années 1930',
          '17. Seconde Guerre mondiale et ses conséquences',
          '18. Relations Est-Ouest et guerre froide',
          '19. Dossier sur les tirailleurs sénégalais pendant les deux guerres',
          '20. Causes et formes de la décolonisation',
          '21. Vie politique du Sénégal de 1944 à 1962',
          '22. Conférence de Bandung et émergence du Tiers-monde',
        ],
      },
    ],
  },
  'Géographie': {
    title: 'Géographie — 10 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 10 leçons',
        items: [
          '1. Terre et système solaire : place de la Terre et influence du Soleil',
          '2. Potentiel et équilibres : ressources et cycles de la vie',
          '3. Surexploitation des ressources et conséquences',
          '4. Conséquences climatiques de l’exploitation économique de la planète',
          '5. Inégalités de développement',
          '6. Systèmes économiques : capitalisme et socialisme',
          '7. Coopération bilatérale',
          '8. Coopération multilatérale et organisations internationales',
          '9. Formes et problèmes de communication',
          '10. La planète comme « village » : enjeux du système-monde',
        ],
      },
    ],
  },
  'Anglais': {
    title: 'Anglais — 21 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 21 leçons',
        items: [
          '1. Temps du présent',
          '2. Temps du passé',
          '3. Futur',
          '4. Phrases conditionnelles',
          '5. Reformuler une condition : unless, otherwise et expressions proches',
          '6. Souhaits et regrets',
          '7. Préférences : would rather, prefer',
          '8. Discours direct et discours rapporté',
          '9. Voix active et voix passive',
          '10. Mots interrogatifs et questions indirectes',
          '11. Comparatifs et superlatifs',
          '12. Propositions relatives',
          '13. Modaux : capacité, permission, obligation et possibilité',
          '14. Mots de liaison',
          '15. Inversion après un adverbe négatif',
          '16. Prépositions et verbes à particule',
          '17. Noms et adjectifs composés',
          '18. Concession avec no matter',
          '19. Question tags',
          '20. Gérondif : formes en -ing et constructions avec to',
          '21. Formation des mots : préfixes, suffixes et familles de mots',
        ],
      },
    ],
  },
  'Physique-Chimie': {
    title: 'Physique-Chimie — 11 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 11 leçons',
        items: [
          '1. Lentilles minces et formation des images',
          '2. Dispersion de la lumière blanche',
          '3. Forces et équilibre d’un solide',
          '4. Travail et puissance mécaniques',
          '5. Électrisation et courant électrique',
          '6. Résistance électrique et loi d’Ohm',
          '7. Énergie et rendement',
          '8. Solutions aqueuses et concentrations',
          '9. Acides et bases',
          '10. Propriétés chimiques des métaux usuels',
          '11. Hydrocarbures et combustions',
        ],
      },
    ],
  },
  'SVT': {
    title: 'SVT — 15 leçons',
    subtitle: 'Programme de 3e au Sénégal — Préparation au BFEM',
    sections: [
      {
        heading: 'Progression des 15 leçons',
        items: [
          '1. Fonctionnement du système nerveux',
          '2. Vision et défauts de la vue',
          '3. Respiration chez l’être humain',
          '4. Production d’énergie liée à la respiration',
          '5. Fermentation et production d’énergie',
          '6. Rôle du rein et excrétion urinaire',
          '7. Immunité et réponse immunitaire',
          '8. Système immunitaire',
          '9. Groupes sanguins et compatibilité des transfusions',
          '10. Aide à l’immunité : vaccination et sérothérapie',
          '11. VIH/sida : infection et prévention',
          '12. Tectonique des plaques',
          '13. Formation des roches métamorphiques',
          '14. Cycle des roches',
          '15. Chronologie en géologie',
        ],
      },
    ],
  },
};

function getSecondeCourseDocument(
  serie: SerieOption | null,
  subject: string,
): CourseDocument | null {
  const activeSerie = serie ?? 'Tronc commun';
  const sub = `Programme de Seconde (${activeSerie}) au Sénégal`;

  if (subject === 'Français') {
    return {
      title: `Français — Seconde ${activeSerie} (21 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 21 leçons',
          items: [
            '1. Repères littéraires, courants et genres',
            '2. Récit : épopée, nouvelle et roman',
            '3. Poésie',
            '4. Théâtre',
            '5. Texte narratif',
            '6. Texte descriptif',
            '7. Texte argumentatif',
            '8. Texte injonctif',
            '9. Texte explicatif',
            '10. Figures de style et étude des textes',
            '11. Prose de la Renaissance',
            '12. Poésie de la Renaissance',
            '13. Baroque',
            '14. Classicisme et son esthétique',
            '15. Lumières, roman et conte philosophique',
            '16. Essai critique',
            '17. Négro-renaissance',
            '18. Poésie de la Négritude',
            '19. Conte',
            '20. Résumé suivi de discussion',
            '21. Fiche de lecture',
          ],
        },
      ],
    };
  }

  if (subject === 'Histoire-Géographie') {
    return {
      title: `Histoire (25 leçons) & Géographie (20 leçons) — Seconde ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Histoire — 25 leçons',
          items: [
            '1. Définition, objet et importance de l’histoire',
            '2. Sources et méthodes de l’histoire africaine',
            '3. L’Afrique, berceau de l’humanité',
            '4. Civilisations paléolithiques',
            '5. Révolution néolithique et conséquences',
            '6. Préhistoire et protohistoire du Sénégal',
            '7. Méthode de la dissertation historique',
            '8. Égypte pharaonique',
            '9. Royaume d’Axoum',
            '10. Méditerranée et monde noir : contacts, échanges et migrations',
            '11. Parenté entre la civilisation égyptienne et l’Afrique : exemple du Sénégal',
            '12. Empires du Ghana, du Mali et du Songhaï',
            '13. Islamisation de l’Afrique occidentale',
            '14. Empire du Jolof',
            '15. Empire du Gaabu',
            '16. Méthode du commentaire historique',
            '17. Traite arabe',
            '18. Traite atlantique',
            '19. Dossier sur la traite au Sénégal',
            '20. Révolution Torodo',
            '21. Empire d’El Hadji Omar Tall',
            '22. Empire zoulou de Chaka',
            '23. Révolution américaine',
            '24. Révolution française de 1789',
            '25. Indépendance d’Haïti',
          ],
        },
        {
          heading: 'Géographie — 20 leçons',
          items: [
            '1. Moyens de connaissance de l’Univers',
            '2. Mouvements de la Terre',
            '3. Planètes, représentations de la Terre, projections et coordonnées géographiques',
            '4. Répartition des continents et des océans',
            '5. Eaux marines',
            '6. Carte des océans, mers et courants marins',
            '7. Structure et composition de l’atmosphère',
            '8. Facteurs du climat',
            '9. Éléments du climat',
            '10. Carte des climats et construction de diagrammes',
            '11. Tectonique des plaques et isostasie',
            '12. Roches',
            '13. Grands types de structure et leur répartition',
            '14. Érosion',
            '15. Formes de relief terrestre et répartition',
            '16. Carte des reliefs et coupe topographique',
            '17. Régions intertropicales',
            '18. Régions tempérées',
            '19. Régions polaires',
            '20. Montagnes et littoraux',
          ],
        },
      ],
    };
  }

  if (subject === 'Langues vivantes') {
    return {
      title: `Anglais — Seconde ${activeSerie} (23 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 23 leçons',
          items: [
            '1. Temps du présent',
            '2. Temps du passé',
            '3. Futur',
            '4. Phrases conditionnelles',
            '5. Reformuler une condition',
            '6. Souhaits et regrets',
            '7. Exprimer une préférence',
            '8. Discours direct et discours rapporté',
            '9. Voix active et voix passive',
            '10. Mots interrogatifs',
            '11. Comparatifs et superlatifs',
            '12. Propositions relatives',
            '13. Modaux',
            '14. Mots de liaison',
            '15. Inversion en tête de phrase',
            '16. Prépositions et verbes à particule',
            '17. Noms et adjectifs composés',
            '18. Concession',
            '19. Question tags',
            '20. Gérondif',
            '21. Formation des mots',
            '22. Vie en ville et au village',
            '23. Délinquance, crime et justice',
          ],
        },
      ],
    };
  }

  if (subject === 'Mathématiques') {
    if (activeSerie === 'Orientation L') {
      return {
        title: 'Mathématiques — Seconde L (8 chapitres)',
        subtitle: sub,
        sections: [
          {
            heading: 'Progression des 8 chapitres',
            items: [
              '1. Calcul dans ℝ',
              '2. Proportionnalité',
              '3. Fonction affine et droites du plan',
              '4. Lectures graphiques',
              '5. Statistique',
              '6. Systèmes d’équations et d’inéquations du premier degré à deux inconnues',
              '7. Équations et inéquations du second degré',
              '8. Tracé de courbes',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'Orientation S') {
      return {
        title: 'Mathématiques — Seconde S (15 chapitres)',
        subtitle: sub,
        sections: [
          {
            heading: 'Progression des 15 chapitres',
            items: [
              '1. Calcul vectoriel',
              '2. Repérage cartésien',
              '3. Angles, radians et orientation du plan',
              '4. Lignes trigonométriques',
              '5. Produit scalaire',
              '6. Transformations',
              '7. Géométrie dans l’espace',
              '8. Calcul dans ℝ',
              '9. Intervalles et calcul approché',
              '10. Généralités sur les fonctions numériques',
              '11. Étude de fonctions',
              '12. Équations et inéquations du second degré',
              '13. Systèmes d’équations et d’inéquations à deux inconnues',
              '14. Polynômes et fractions rationnelles',
              '15. Statistique',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'Orientation STEG') {
      return {
        title: 'Mathématiques — Seconde STEG (7 chapitres)',
        subtitle: sub,
        sections: [
          {
            heading: 'Chapitres de mathématiques STEG',
            items: [
              '1. Calcul et bases de numération',
              '2. Statistique',
              '3. Dénombrement',
              '4. Géométrie analytique',
              '5. Systèmes et programmation linéaire',
              '6. Second degré et fonctions',
              '7. Mathématiques financières',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'Technique (STIDD / F6)') {
      return {
        title: 'Mathématiques — Seconde Technique (STIDD / F6)',
        subtitle: sub,
        sections: [
          {
            heading: 'Socle mathématique pour la filière technique',
            items: [
              '1. Calcul numérique et algébrique dans ℝ, intervalles et valeurs approchées',
              '2. Calcul vectoriel, repérage cartésien et trigonométrie',
              '3. Généralités et étude de fonctions numériques',
              '4. Équations, inéquations et systèmes linéaires',
              '5. Géométrie dans le plan, transformations et géométrie dans l’espace',
              '6. Statistique et traitement de données expérimentales',
            ],
          },
        ],
      };
    }

    return {
      title: `Mathématiques — Seconde (${activeSerie})`,
      subtitle: sub,
      sections: [
        {
          heading: 'Chapitres fondamentaux du programme de Seconde',
          items: [
            '1. Calcul dans ℝ, proportionnalité et calcul approché',
            '2. Équations, inéquations du premier et du second degré',
            '3. Systèmes d’équations et d’inéquations à deux inconnues',
            '4. Généralités sur les fonctions, fonction affine et lectures graphiques',
            '5. Calcul vectoriel, repérage cartésien et géométrie du plan',
            '6. Statistique et exploitation de tableaux de données',
          ],
        },
      ],
    };
  }

  if (subject === 'Sciences physiques') {
    if (activeSerie === 'Orientation L') {
      return {
        title: 'Physique-chimie — Seconde L (10 leçons)',
        subtitle: `${sub} — 2 h/semaine`,
        sections: [
          {
            heading: 'Progression des 10 leçons',
            items: [
              '1. Électricité dans notre environnement',
              '2. Circuit électrique',
              '3. Intensité et tension électriques',
              '4. Mouvements et vitesse',
              '5. Interactions entre objets et force',
              '6. Poids, masse et relation entre les deux',
              '7. Mélanges et corps purs',
              '8. Structure de la matière et quantité de matière',
              '9. Transformations de la matière',
              '10. Solutions acides, basiques et neutres',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'Orientation S') {
      return {
        title: 'Physique-chimie — Seconde S (25 leçons)',
        subtitle: `${sub} — 5 h/semaine`,
        sections: [
          {
            heading: 'Progression des 25 leçons',
            items: [
              '1. Phénomènes d’électrisation',
              '2. Généralités sur le courant électrique',
              '3. Intensité du courant électrique',
              '4. Tension électrique',
              '5. Dipôles passifs',
              '6. Dipôles actifs',
              '7. Amplificateur opérationnel',
              '8. Généralités sur le mouvement',
              '9. Généralités sur les forces',
              '10. Poids et masse',
              '11. Équilibre d’un solide soumis à des forces non parallèles',
              '12. Équilibre d’un solide mobile autour d’un axe',
              '13. Propagation rectiligne de la lumière',
              '14. Réflexion de la lumière',
              '15. Réfraction et dispersion de la lumière',
              '16. Mélanges et corps purs',
              '17. Éléments, atomes et classification périodique',
              '18. Liaisons chimiques',
              '19. Mole et grandeurs molaires',
              '20. Réactions chimiques et équation-bilan',
              '21. Généralités sur les solutions aqueuses',
              '22. Solution aqueuse acide',
              '23. Solution aqueuse basique',
              '24. pH et indicateurs colorés',
              '25. Caractérisation de quelques ions',
            ],
          },
        ],
      };
    }

    return {
      title: `Physique-chimie — Seconde (${activeSerie})`,
      subtitle: sub,
      sections: [
        {
          heading: 'Notions fondamentales de physique et chimie',
          items: [
            '1. Circuit électrique, intensité et tension électriques',
            '2. Mouvements, forces, poids et masse',
            '3. Propagation et réflexion de la lumière',
            '4. Mélanges, corps purs, atomes et grandeurs molaires',
            '5. Réactions chimiques et solutions acides, basiques et neutres',
          ],
        },
      ],
    };
  }

  if (subject === 'SVT') {
    if (activeSerie === 'Orientation S') {
      return {
        title: 'SVT — Seconde S (10 leçons)',
        subtitle: sub,
        sections: [
          {
            heading: 'Progression des 10 leçons',
            items: [
              '1. Structure d’un écosystème',
              '2. Fonctionnement et évolution de l’écosystème',
              '3. Diversité et répartition des écosystèmes au Sénégal',
              '4. Les sols',
              '5. L’eau',
              '6. L’énergie',
              '7. L’espace rural',
              '8. L’espace urbain',
              '9. L’espèce et la variation',
              '10. Évolution des êtres vivants',
            ],
          },
        ],
      };
    }

    return {
      title: `SVT — Seconde (${activeSerie}, 8 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 8 leçons',
          items: [
            '1. Structure d’un écosystème',
            '2. Fonctionnement et évolution de l’écosystème',
            '3. Diversité et répartition des écosystèmes au Sénégal',
            '4. Les sols',
            '5. L’eau',
            '6. L’énergie',
            '7. L’espace rural',
            '8. L’espace urbain',
          ],
        },
      ],
    };
  }

  if (subject === 'Économie' || subject === 'Économie & Gestion') {
    if (activeSerie === 'Orientation STEG') {
      return {
        title: 'Économie & Gestion — Seconde STEG',
        subtitle: sub,
        sections: [
          {
            heading: 'Sciences économiques, gestion comptable et financière',
            items: [
              '1. Biens, besoins économiques et agents économiques',
              '2. Circuit économique et secteurs institutionnels',
              '3. Introduction à l’entreprise et à son organisation',
              '4. Documents commerciaux et initiation à la gestion comptable et financière',
              '5. Travail, facteur capital et combinaison des facteurs de production',
              '6. Lecture de tableaux statistiques et indicateurs économiques',
            ],
          },
        ],
      };
    }

    return {
      title: 'Économie — Seconde L (15 leçons)',
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 15 leçons',
          items: [
            '1. Biens et besoins économiques',
            '2. Principaux courants de pensée économique',
            '3. Relations de l’économie avec les autres sciences et techniques',
            '4. Étude préliminaire d’un texte économique',
            '5. Définition et rôle de la comptabilité nationale',
            '6. Secteurs institutionnels et circuit économique',
            '7. Opérations de la comptabilité nationale',
            '8. Agrégats de la comptabilité nationale',
            '9. Étude préliminaire d’un tableau statistique',
            '10. Travail : indicateurs démographiques',
            '11. Travail : indicateurs d’activité',
            '12. Répartition de la population active',
            '13. Efficacité du facteur travail',
            '14. Facteur capital',
            '15. Combinaison des facteurs de production',
          ],
        },
      ],
    };
  }

  return null;
}

function getPremiereCourseDocument(
  serie: SerieOption | null,
  subject: string,
): CourseDocument | null {
  const activeSerie = serie ?? 'S2';
  const sub = `Programme de Première (${activeSerie}) au Sénégal`;
  const isLit = activeSerie === 'L1a/L1b' || activeSerie === 'L’1' || activeSerie === 'L2';
  const isS1OrS3 = activeSerie === 'S1' || activeSerie === 'S3';

  if (subject === 'Français') {
    return {
      title: `Français — Première ${activeSerie} (18 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 18 leçons',
          items: [
            '1. Roman, récit et nouvelle',
            '2. Poésie',
            '3. Théâtre',
            '4. Essai et littérature d’idées',
            '5. Romantisme',
            '6. Parnasse',
            '7. Symbolisme',
            '8. Réalisme',
            '9. Naturalisme',
            '10. Négritude',
            '11. Roman négro-africain',
            '12. Littérature africaine et francophone',
            '13. Figures de style',
            '14. Étude de la langue',
            '15. Commentaire composé',
            '16. Dissertation',
            '17. Écriture d’invention',
            '18. Résumé et discussion',
          ],
        },
      ],
    };
  }

  if (subject === 'Histoire-Géographie') {
    return {
      title: `Histoire (23 leçons) & Géographie (23 leçons) — Première ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Histoire — 23 leçons',
          items: [
            '1. Révolution industrielle : genèse, formes et manifestations',
            '2. Conséquences économiques, politiques, sociales et culturelles',
            '3. Syndicalisme et socialisme',
            '4. Méthode de la dissertation et du commentaire',
            '5. Causes, doctrines et méthodes de l’impérialisme',
            '6. Carte commentée des positions en 1870',
            '7. Conférence de Berlin',
            '8. Carte commentée des positions en 1914',
            '9. Résistances à l’impérialisme européen',
            '10. Dossier sur les résistances locales',
            '11. Impérialisme en Asie',
            '12. Impérialisme en Amérique et dans les Caraïbes',
            '13. Première Guerre mondiale et conséquences',
            '14. Afrique pendant la Première Guerre mondiale',
            '15. Révolution russe',
            '16. Chine de 1911 à 1945',
            '17. Montée du fascisme et crise économique des années 1930',
            '18. Échec de la sécurité collective',
            '19. Seconde Guerre mondiale',
            '20. Sénégal pendant la Première Guerre mondiale',
            '21. Sénégal dans l’entre-deux-guerres',
            '22. Sénégal pendant la Seconde Guerre mondiale',
            '23. Dossier sur la vie économique du Sénégal de 1914 à 1945',
          ],
        },
        {
          heading: 'Géographie — 23 leçons',
          items: [
            '1. Inégalités de développement dans le monde',
            '2. Groupes humains, langues et religions',
            '3. Croissance de la population et politiques démographiques',
            '4. Migrations',
            '5. Structures de la population mondiale',
            '6. Pyramides des âges et diagrammes triangulaires',
            '7. Répartition de la population mondiale',
            '8. Calcul et carte des densités',
            '9. Agriculture tropicale traditionnelle',
            '10. Cultures commerciales des pays tropicaux',
            '11. Mutations agricoles dans les pays tropicaux',
            '12. Évolution de l’agriculture en Europe',
            '13. Agriculture moderne des pays neufs',
            '14. Pêche traditionnelle et moderne',
            '15. Ville : définition et fonctions',
            '16. Processus et formes d’urbanisation',
            '17. Industrie urbaine et mutations',
            '18. Commerce et services urbains',
            '19. Dynamique urbaine et problèmes des villes',
            '20. Transports et télécommunications',
            '21. Techniques d’échange : troc, monnaie et bourse',
            '22. Commerce mondial et échange inégal',
            '23. Espaces d’intégration économique : CEDEAO, UEMOA, UE, ALENA',
          ],
        },
      ],
    };
  }

  if (subject === 'Langues vivantes') {
    return {
      title: `Anglais — Première ${activeSerie} (35 leçons)`,
      subtitle: sub,
      intro:
        'Le programme travaille la grammaire du verbe, les noms et adjectifs, la construction des phrases, la communication orale et écrite, puis des thèmes de société.',
      sections: [
        {
          heading: 'Notions et thèmes couverts',
          items: [
            'Grammaire : temps du présent, du passé et du futur ; voix passive ; modaux ; groupes nominaux et relatives ; comparatifs ; questions ; conjonctions ; prépositions ; discours rapporté.',
            'Thèmes : métiers, loisirs, économie, santé et environnement, changements historiques, patrimoine culturel, sciences et médias.',
          ],
        },
      ],
    };
  }

  if (subject === 'Philosophie') {
    return {
      title: `Philosophie — Première ${activeSerie} (9 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 9 leçons',
          items: [
            '1. Qu’est-ce que philosopher ?',
            '2. Aperçu des domaines de la philosophie',
            '3. Dissertation et explication de texte',
            '4. Croyances, mythes et sagesses anciennes',
            '5. Naissance de la philosophie',
            '6. Le tournant socratique : sophistes, Socrate, Platon, Aristote',
            '7. Antiquité tardive et Moyen Âge',
            '8. Temps modernes : Renaissance, rationalisme, empirisme, Lumières et Kant',
            '9. Philosophie contemporaine et philosophies africaines',
          ],
        },
      ],
    };
  }

  if (subject === 'Mathématiques' || subject === 'Méthodes quantitatives / Mathématiques') {
    if (isLit) {
      return {
        title: `Mathématiques — Première ${activeSerie} (13 chapitres)`,
        subtitle: `${sub} — 3 h/semaine`,
        sections: [
          {
            heading: 'Progression des 13 chapitres',
            items: [
              '1. Systèmes d’équations et d’inéquations',
              '2. Polynômes',
              '3. Notion de fonction',
              '4. Limites et continuité',
              '5. Dérivabilité',
              '6. Variations d’une fonction',
              '7. Étude complète d’une fonction',
              '8. Fonctions polynômes',
              '9. Fonctions homographiques',
              '10. Fonctions réciproques : x² et √x',
              '11. Suites arithmétiques et géométriques',
              '12. Statistiques à deux variables',
              '13. Dénombrement',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'STEG') {
      return {
        title: 'Méthodes quantitatives & Mathématiques — Première STEG',
        subtitle: sub,
        sections: [
          {
            heading: 'Notions de mathématiques appliquées en STEG',
            items: [
              '1. Équations, inéquations et programmation linéaire appliquée à la gestion',
              '2. Étude de fonctions, dérivation et applications aux coûts et recettes',
              '3. Suites arithmétiques et géométriques ; initiation aux calculs financiers',
              '4. Statistiques à une et deux variables',
              '5. Dénombrement et probabilités',
            ],
          },
        ],
      };
    }

    const weeklyHours = isS1OrS3 ? '7 h/semaine' : activeSerie === 'S2' || activeSerie === 'S4' ? '6 h/semaine' : 'programme scientifique';
    return {
      title: `Mathématiques — Première ${activeSerie}`,
      subtitle: `${sub} — ${weeklyHours}`,
      sections: [
        {
          heading: `Programme de Première ${activeSerie}`,
          items: [
            '1. Polynômes, équations, inéquations et systèmes linéaires',
            '2. Calcul vectoriel dans le plan, barycentre et produit scalaire',
            '3. Angles orientés et trigonométrie',
            '4. Généralités sur les fonctions numériques, limites et continuité',
            '5. Dérivation, variations et étude complète de fonctions',
            '6. Suites numériques : arithmétiques, géométriques et convergence',
            '7. Dénombrement, probabilités et statistiques à deux variables',
            ...(isS1OrS3
              ? ['8. Transformations du plan et géométrie dans l’espace (approfondissement)']
              : []),
          ],
        },
      ],
    };
  }

  if (subject === 'Économie') {
    if (activeSerie === 'STEG') {
      return {
        title: 'Économie — Première STEG',
        subtitle: sub,
        sections: [
          {
            heading: 'Thèmes économiques et outils d’analyse',
            items: [
              '1. Production, coûts et formation des prix sur les marchés',
              '2. Consommation, épargne et financement de l’investissement',
              '3. Monnaie, crédit et système financier (Zone franc)',
              '4. Exploitation de textes économiques et de tableaux statistiques',
            ],
          },
        ],
      };
    }

    return {
      title: `Économie — Première ${activeSerie} (25 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Progression des 25 leçons',
          items: [
            '1. Origine de la valeur',
            '2. Notion de prix',
            '3. Demande',
            '4. Offre',
            '5. Prix d’équilibre',
            '6. Formes de marché',
            '7. Coûts et recettes du producteur',
            '8. Production optimale et profit maximum',
            '9. Exploitation d’un texte et d’un tableau statistique',
            '10. Mesure de la consommation',
            '11. Élasticité-revenu et lois d’Engel',
            '12. Déterminants de la consommation',
            '13. Comportement du consommateur',
            '14. Épargne des ménages',
            '15. Techniques de calcul économique',
            '16. Construction de graphiques',
            '17. Types d’investissement',
            '18. Mesure de l’investissement',
            '19. Financement de l’investissement',
            '20. Rôle de l’investissement dans le développement',
            '21. Formes et fonctions de la monnaie',
            '22. Masse monétaire et institutions financières',
            '23. Crédit',
            '24. Zone franc',
            '25. Question d’analyse : introduction, développement et conclusion',
          ],
        },
      ],
    };
  }

  if (subject === 'Sciences physiques' || subject === 'Physique appliquée') {
    if (activeSerie === 'L2') {
      return {
        title: 'Physique-chimie — Première L2',
        subtitle: sub,
        sections: [
          {
            heading: 'Physique',
            items: [
              '1. Chute libre',
              '2. Travail et puissance d’une force',
              '3. Énergie cinétique et énergie mécanique',
              '4. Lentilles et formation des images',
            ],
          },
          {
            heading: 'Chimie',
            items: [
              '1. Introduction à la chimie organique',
              '2. Alcanes et hydrocarbures à chaînes insaturées',
              '3. Composés oxygénés',
              '4. Réactions d’oxydoréduction et pile Daniell',
            ],
          },
        ],
      };
    }

    return {
      title: `Physique-chimie — Première ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: `Programme de physique et chimie (${activeSerie})`,
          items: [
            'Physique : travail, énergie mécanique, champs et forces électriques, condensateurs, notions d’électronique, phénomènes vibratoires, ondes et optique.',
            'Chimie : chimie organique (alcanes, alcènes, alcynes, composés oxygénés), réactions d’oxydoréduction, couples redox et électrochimie.',
          ],
        },
      ],
    };
  }

  if (subject === 'SVT') {
    return {
      title: `SVT — Première ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: `Programme de SVT (${activeSerie})`,
          items: [
            'Biologie cellulaire : organisation et fonctionnement de la cellule, échanges cellulaires, synthèse des protéines et division cellulaire.',
            ...(activeSerie === 'L2'
              ? [
                  'Physiologie et nutrition : digestion, besoins alimentaires de l’être humain et éléments de géologie du Sénégal.',
                ]
              : [
                  'Énergétique et nutrition : digestion et nutrition humaine, libération d’énergie par respiration et fermentation, besoins alimentaires.',
                  'Géologie : structure du globe et ressources géologiques du Sénégal.',
                ]),
          ],
        },
      ],
    };
  }

  return null;
}

function getTerminaleCourseDocument(
  serie: SerieOption | null,
  subject: string,
): CourseDocument | null {
  const activeSerie = serie ?? 'S2';
  const sub = `Terminale ${activeSerie} au Sénégal — Baccalauréat`;
  const isLit = activeSerie === 'L1a/L1b' || activeSerie === 'L’1' || activeSerie === 'L2';

  if (subject === 'Français') {
    return {
      title: `Français — Terminale ${activeSerie}`,
      subtitle: sub,
      intro:
        `Grands thèmes littéraires, lecture d’œuvres intégrales et méthodologie des exercices écrits du Baccalauréat en Terminale ${activeSerie}.`,
      sections: [
        {
          heading: 'Thèmes et activités au programme (15 points)',
          items: [
            '1. Le surréalisme : extraits d’Apollinaire, Aragon, Éluard, Soupault, Desnos, René Char, Césaire, Senghor et Depestre.',
            '2. La poésie : versification et œuvres françaises et africaines proposées au programme.',
            '3. Le roman : notamment Manon Lescaut, L’Étranger, Les Soleils des indépendances et L’Étrange Destin de Wangrin.',
            '4. Le théâtre : œuvres de Corneille, Hugo, Musset, Anouilh, Sartre, Beckett et auteurs africains.',
            '5. Le texte argumentatif : thèse, arguments, exemples, convaincre et persuader.',
            '6. Les ressources de la langue et du style : lexique, syntaxe, ponctuation et effets de style.',
            '7. La lecture d’une œuvre intégrale : fiche de lecture et compte rendu.',
            '8. Le texte suivi de questions.',
            '9. L’écriture d’invention : pastiche et parodie.',
            '10. Le résumé.',
            '11. La dissertation et la discussion.',
            '12. Le commentaire suivi et le commentaire composé.',
            '13. La synthèse de documents.',
            '14. Le compte rendu et le rapport.',
            '15. La correspondance.',
          ],
        },
      ],
      footerNote:
        'Pour chaque genre, le programme propose des œuvres françaises et africaines ; le choix des œuvres effectivement étudiées se fait avec l’enseignant.',
    };
  }

  if (subject === 'Mathématiques' || subject === 'Méthodes quantitatives / Mathématiques') {
    if (isLit) {
      return {
        title: `Mathématiques — Terminale ${activeSerie} (13 chapitres)`,
        subtitle: sub,
        sections: [
          {
            heading: 'Progression des 13 chapitres',
            items: [
              '1. Composition des applications.',
              '2. Factorisation des polynômes.',
              '3. Dénombrement.',
              '4. Probabilités.',
              '5. Ajustement linéaire et droite de régression.',
              '6. Limites et continuité.',
              '7. Dérivabilité.',
              '8. Étude de fonctions et représentation graphique.',
              '9. Résolution algébrique et graphique d’équations ou d’inéquations.',
              '10. Fonction logarithme népérien.',
              '11. Fonction exponentielle.',
              '12. Suites numériques.',
              '13. Calcul intégral et calcul d’aires.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'S1' || activeSerie === 'S3') {
      return {
        title: `Mathématiques — Terminale ${activeSerie} (14 chapitres)`,
        subtitle: sub,
        sections: [
          {
            heading: `Progression des 14 chapitres — Terminale ${activeSerie}`,
            items: [
              '1. Probabilités conditionnelles et indépendance.',
              '2. Variables aléatoires et loi binomiale.',
              '3. Nombres complexes : formes algébrique, géométrique et trigonométrique.',
              '4. Arithmétique : divisibilité, nombres premiers, PGCD, congruences.',
              '5. Suites numériques et limites.',
              '6. Limites, continuité et dérivation.',
              '7. Étude de fonctions, logarithme et exponentielle.',
              '8. Fonctions puissances et croissances comparées.',
              '9. Calcul intégral.',
              '10. Équations différentielles.',
              '11. Barycentres.',
              '12. Isométries et similitudes planes.',
              '13. Géométrie dans l’espace.',
              '14. Courbes paramétrées et coniques.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'S2' || activeSerie === 'S4' || activeSerie === 'S5') {
      return {
        title: `Mathématiques — Terminale ${activeSerie}`,
        subtitle: sub,
        intro: `Programme officiel de mathématiques de Terminale ${activeSerie} centré sur l’analyse, les nombres complexes et les probabilités.`,
        sections: [
          {
            heading: 'Analyse',
            items: [
              '1. Limites, continuité et dérivation des fonctions numériques.',
              '2. Étude complète de fonctions et primitives.',
              '3. Fonction logarithme népérien et fonction exponentielle.',
              '4. Suites numériques et raisonnement par récurrence.',
              '5. Calcul intégral et calculs d’aires.',
              '6. Équations différentielles linéaires du 1er et du 2nd ordre.',
            ],
          },
          {
            heading: 'Algèbre, probabilités & géométrie',
            items: [
              '7. Nombres complexes : formes algébrique, trigonométrique et exponentielle.',
              '8. Applications géométriques des nombres complexes.',
              '9. Dénombrement et probabilités conditionnelles.',
              '10. Variables aléatoires, loi binomiale et organisation de données.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'STEG') {
      return {
        title: 'Méthodes quantitatives & Mathématiques — Terminale STEG',
        subtitle: sub,
        sections: [
          {
            heading: 'Mathématiques appliquées à l’économie et à la gestion',
            items: [
              '1. Suites numériques et mathématiques financières (intérêts, annuités, emprunts).',
              '2. Étude de fonctions, logarithme, exponentielle et optimisation de coûts.',
              '3. Calcul intégral appliqué aux grandeurs économiques.',
              '4. Statistiques à deux variables, ajustement linéaire et corrélation.',
              '5. Probabilités et lois discrètes.',
            ],
          },
        ],
      };
    }

    return {
      title: `Mathématiques — Terminale ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Axes du programme',
          items: [
            '1. Analyse : limites, continuité, dérivation, logarithme et exponentielle.',
            '2. Suites numériques, calcul intégral et équations différentielles.',
            '3. Nombres complexes et applications géométriques.',
            '4. Dénombrement, probabilités et statistiques.',
          ],
        },
      ],
    };
  }

  if (subject === 'Histoire-Géographie') {
    return {
      title: `Histoire (19 leçons) & Géographie (18 leçons) — Terminale ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Histoire — 19 leçons',
          items: [
            '1. Conséquences de la Seconde Guerre mondiale et règlement du conflit.',
            '2. Relations Est-Ouest : blocs, crises et détente jusqu’à la chute du mur de Berlin.',
            '3. La Chine de 1945 aux années 1990.',
            '4. Causes générales de la décolonisation.',
            '5. Formes de la décolonisation : négociation et lutte armée.',
            '6. Décolonisation en Asie : Inde et Indochine.',
            '7. Décolonisation au Proche-Orient et relations israélo-arabes.',
            '8. Décolonisation au Maghreb : l’Algérie.',
            '9. Décolonisation en Afrique noire : Gold Coast, Sénégal, Guinée-Bissau et Angola.',
            '10. Introduction à l’étude des civilisations.',
            '11. Civilisations négro-africaines : cadre géographique et histoire.',
            '12. Organisation sociale, politique et économique.',
            '13. Religions traditionnelles.',
            '14. Évolution du monde négro-africain et influences extérieures.',
            '15. Naissance de l’islam et Arabie préislamique.',
            '16. Le Coran et les fondements de l’islam.',
            '17. Expansion et organisation du monde musulman.',
            '18. Culture musulmane : pensée, vie intellectuelle et artistique.',
            '19. Unité et diversité du monde musulman.',
          ],
        },
        {
          heading: 'Géographie — 18 leçons',
          items: [
            '1. Le système-monde et l’interdépendance des espaces.',
            '2. Espace nord-américain : atouts et handicaps naturels.',
            '3. Populations, villes et sociétés en Amérique du Nord.',
            '4. Construction de l’espace économique nord-américain : États-Unis, Canada, Mexique.',
            '5. Modèle économique américain : caractéristiques et problèmes.',
            '6. Europe : milieux naturels et populations.',
            '7. Construction européenne : réalités et perspectives.',
            '8. Étude économique de la France et de l’Allemagne.',
            '9. Asie-Pacifique : facteurs d’émergence et limites.',
            '10. Modèle économique japonais.',
            '11. Chine : problèmes démographiques.',
            '12. Chine : modèle de développement économique et social.',
            '13. Amérique latine : milieux naturels et populations.',
            '14. Le Brésil, puissance du tiers-monde.',
            '15. Afrique : problèmes et perspectives de développement.',
            '16. Sénégal : milieux naturels, populations et organisation de l’espace.',
            '17. Sénégal : question de l’eau et production alimentaire.',
            '18. Sénégal : problèmes économiques et politiques de développement.',
          ],
        },
      ],
    };
  }

  if (subject === 'Langues vivantes') {
    return {
      title: `Anglais — Terminale ${activeSerie} (23 leçons)`,
      subtitle: sub,
      sections: [
        {
          heading: 'Grammaire et langue (1 à 14)',
          items: [
            '1. Temps du présent, du passé, du parfait et du futur.',
            '2. Modaux : obligation, permission, capacité et probabilité.',
            '3. Voix active et voix passive.',
            '4. Discours direct et indirect.',
            '5. Conditionnels.',
            '6. Impératif, infinitif, forme en -ing, had better et would rather.',
            '7. Propositions relatives.',
            '8. Articles.',
            '9. Noms dénombrables et indénombrables, pronoms personnels et possessifs.',
            '10. Adjectifs : comparaison, ordre et intensifs.',
            '11. Adverbes et place dans la phrase.',
            '12. Conjonctions et subordination.',
            '13. Préfixes et suffixes.',
            '14. Prépositions et verbes à particule.',
          ],
        },
        {
          heading: 'Thèmes d’étude (15 à 23)',
          items: [
            '15. Métiers, emploi, chômage, formation et migration.',
            '16. Loisirs, sports et divertissements.',
            '17. Économie, consommation, pauvreté, agriculture, industrie et technologie.',
            '18. Santé, bien-être et environnement.',
            '19. Événements, changements, colonisation et indépendances.',
            '20. Patrimoine culturel, religions et traditions.',
            '21. Sciences et technologies.',
            '22. Information et communication.',
            '23. Éducation, systèmes scolaires, civisme et paix.',
          ],
        },
      ],
    };
  }

  if (subject === 'Philosophie') {
    return {
      title: `Philosophie — Terminale ${activeSerie}`,
      subtitle: sub,
      intro: isLit
        ? `Programme approfondi de philosophie en Terminale ${activeSerie} : réflexion philosophique, vie sociale, connaissance scientifique, esthétique et étude d’œuvres intégrales.`
        : `Programme officiel de philosophie en Terminale ${activeSerie} : réflexion philosophique, vie sociale, épistémologie scientifique, esthétique et méthodologie des épreuves.`,
      sections: [
        {
          heading: 'Notions et méthodes du programme',
          items: [
            'Origines et spécificité de la réflexion philosophique.',
            'Grandes interrogations et finalités de la philosophie.',
            'Idée d’une philosophie africaine.',
            'Nature et culture.',
            'Individu et société.',
            'Conscience et inconscient.',
            'Liberté, déterminisme et responsabilité.',
            'État, droits et libertés.',
            'Émergence et méthodes de la pensée scientifique.',
            'Types de sciences et question de la vérité.',
            'Science et technique.',
            'Représentation artistique, beauté et création.',
            'Formes et fonctions de l’art.',
            'Lecture d’œuvres philosophiques, dont Descartes, Discours de la méthode.',
            'Méthode de la dissertation et du travail de texte.',
          ],
        },
      ],
    };
  }

  if (subject === 'Sciences physiques' || subject === 'Physique appliquée') {
    if (activeSerie === 'L2') {
      return {
        title: 'Physique-Chimie — Terminale L2 (5 chap. physique · 5 chap. chimie)',
        subtitle: sub,
        sections: [
          {
            heading: 'Physique — 5 chapitres',
            items: [
              '1. Énergie électrique : production, transport et sécurité.',
              '2. Énergie nucléaire et applications.',
              '3. Signaux et ondes mécaniques.',
              '4. Lumière et phénomènes optiques.',
            ],
          },
          {
            heading: 'Chimie — 5 chapitres',
            items: [
              '1. Matières plastiques et textiles synthétiques.',
              '2. Savons, lessives et désinfectants.',
              '3. Pollution de l’air et protection de l’atmosphère.',
              '4. Pollution de l’eau et traitement des eaux.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'S1' || activeSerie === 'S2' || activeSerie === 'S3' || activeSerie === 'F6') {
      return {
        title: `Physique-Chimie — Terminale ${activeSerie} (15 chap. physique · 9 chap. chimie)`,
        subtitle: sub,
        sections: [
          {
            heading: 'Physique — 15 chapitres',
            items: [
              '1. Cinématique du point.',
              '2. Bases et applications de la dynamique.',
              '3. Gravitation universelle.',
              '4. Champs magnétiques et mouvement d’une particule chargée dans un champ magnétique.',
              '5. Loi de Laplace.',
              '6. Induction électromagnétique et dipôle RL.',
              '7. Dipôle RC.',
              '8. Oscillations électriques libres et forcées.',
              '9. Oscillations mécaniques.',
              '10. Interférences lumineuses.',
              '11. Effet photoélectrique.',
              '12. Niveaux d’énergie de l’atome.',
              '13. Réactions nucléaires.',
            ],
          },
          {
            heading: 'Chimie — 9 chapitres',
            items: [
              '1. Alcools.',
              '2. Amines.',
              '3. Acides carboxyliques et dérivés.',
              '4. Cinétique chimique.',
              '5. Autoprotolyse de l’eau, pH et indicateurs.',
              '6. Acides et bases forts.',
              '7. Acides et bases faibles et constantes d’acidité.',
              '8. Réactions acide-base, effet tampon et dosage.',
              '9. Acides aminés et éléments de stéréochimie.',
            ],
          },
        ],
      };
    }

    return {
      title: `Physique-Chimie — Terminale ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Programme de physique et chimie',
          items: [
            'Physique : mécanique, énergie, électricité, oscillations et optique.',
            'Chimie : solutions aqueuses acide-base, cinétique chimique et chimie organique.',
          ],
        },
      ],
    };
  }

  if (subject === 'SVT') {
    if (activeSerie === 'S2') {
      return {
        title: 'SVT — Terminale S2 (30 leçons)',
        subtitle: sub,
        intro:
          'Programme officiel complet de SVT en Terminale S2 (30 leçons) : neurophysiologie, activité musculaire et cardiaque, régulation du milieu intérieur, immunologie, reproduction, génétique et biotechnologies.',
        sections: [
          {
            heading: 'Relations avec le milieu & motricité',
            items: [
              'Organisation du système nerveux et propriétés du tissu nerveux.',
              'Réflexes et fonctionnement des centres nerveux.',
              'Activité et physiologie du muscle strié squelettique.',
            ],
          },
          {
            heading: 'Régulations physiologiques & immunologie',
            items: [
              'Activité cardiaque et régulation de la pression artérielle.',
              'Étude du milieu intérieur et maintien de l’homéostasie.',
              'Régulation de la glycémie.',
              'Système immunitaire, réponses immunitaires et dysfonctionnements.',
            ],
          },
          {
            heading: 'Reproduction, génétique & biotechnologies',
            items: [
              'Reproduction chez les mammifères : gamétogenèse, fécondation et régulation hormonale.',
              'Reproduction chez les spermaphytes.',
              'Génétique fondamentale, brassages chromosomiques et hérédité humaine.',
              'Biotechnologies et applications biologiques.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'S1') {
      return {
        title: 'SVT — Terminale S1 (19 leçons)',
        subtitle: sub,
        intro:
          'Programme officiel de SVT en Terminale S1 (19 leçons) axé sur les grandes fonctions physiologiques, l’immunologie, la reproduction et l’hérédité.',
        sections: [
          {
            heading: 'Thèmes du programme (19 leçons)',
            items: [
              'Organisation du système nerveux et propriétés du tissu nerveux.',
              'Activité du muscle strié.',
              'Activité cardiaque et régulation de la pression artérielle.',
              'Régulation de la glycémie.',
              'Immunologie et défense de l’organisme.',
              'Reproduction chez les mammifères : gamétogenèse, fécondation et régulation.',
              'Génétique et hérédité humaine.',
            ],
          },
        ],
      };
    }

    if (activeSerie === 'L2') {
      return {
        title: 'SVT — Terminale L2 (11 leçons)',
        subtitle: sub,
        intro:
          'Programme officiel de SVT en Terminale L2 (11 leçons), centré sur l’organisation physiologique humaine, la régulation de l’organisme, l’immunité et l’hérédité.',
        sections: [
          {
            heading: 'Thèmes du programme (11 leçons)',
            items: [
              'Organisation du système nerveux et propriétés du tissu nerveux.',
              'Activité du muscle strié.',
              'Activité cardiaque et régulation de la pression artérielle.',
              'Régulation de la glycémie.',
              'Immunologie et défense de l’organisme.',
              'Génétique et hérédité humaine.',
            ],
          },
        ],
      };
    }

    return {
      title: `SVT — Terminale ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: `Thèmes de SVT — Terminale ${activeSerie}`,
          items: [
            'Organisation du système nerveux et propriétés du tissu nerveux.',
            'Activité du muscle strié, activité cardiaque et pression artérielle.',
            'Régulation de la glycémie et immunologie.',
            'Reproduction et génétique appliquée.',
          ],
        },
      ],
    };
  }

  if (subject === 'Comptabilité') {
    return {
      title: 'Comptabilité — Terminale STEG',
      subtitle: sub,
      sections: [
        {
          heading: 'Sommaire de comptabilité STEG',
          items: [
            'Opérations courantes et TVA ;',
            'Comptabilité analytique et coûts ;',
            'Analyse financière, compte de résultat et bilan fonctionnel.',
          ],
        },
      ],
    };
  }

  if (subject === 'Économie') {
    return {
      title: `Économie — Terminale ${activeSerie}`,
      subtitle: sub,
      sections: [
        {
          heading: 'Axes du programme économique',
          items: [
            'Croissance économique, développement et indicateurs.',
            'Échanges internationaux, intégration régionale et mondialisation.',
            'Monnaie, financement de l’économie et politiques économiques.',
            'Étude de documents économiques et de tableaux statistiques.',
          ],
        },
      ],
    };
  }

  return null;
}

export function getPdfCourseDocument(params: {
  classLevel: ClassLevel;
  serie: SerieOption | null;
  subject: string;
  fallbackTitle: string;
  fallbackObjectif: string;
  fallbackNotions: string[];
}): CourseDocument {
  const { classLevel, serie, subject, fallbackTitle, fallbackObjectif, fallbackNotions } = params;

  if (classLevel === '2nde') {
    const doc = getSecondeCourseDocument(serie, subject);
    if (doc) return doc;
  } else if (classLevel === '1re') {
    const doc = getPremiereCourseDocument(serie, subject);
    if (doc) return doc;
  } else if (classLevel === 'Terminale') {
    const doc = getTerminaleCourseDocument(serie, subject);
    if (doc) return doc;
  }

  const byClass: Partial<Record<ClassLevel, Record<string, CourseDocument>>> = {
    CI: CI_COURSES,
    CP: CP_COURSES,
    CE1: CE1_COURSES,
    CE2: CE2_COURSES,
    CM1: CM1_COURSES,
    CM2: CM2_COURSES,
    '6e': SIXIEME_COURSES,
    '5e': CINQUIEME_COURSES,
    '4e': QUATRIEME_COURSES,
    '3e': TROISIEME_COURSES,
  };

  const classMap = byClass[classLevel];
  if (classMap && classMap[subject]) {
    return classMap[subject];
  }

  return {
    title: serie ? `${subject} — ${classLevel} ${serie}` : fallbackTitle,
    subtitle: serie ? `${classLevel} (${serie}) — ${subject}` : `${classLevel} — ${subject}`,
    intro: fallbackObjectif,
    sections: [
      {
        heading: 'Programme officiel de référence',
        items: fallbackNotions,
      },
    ],
  };
}

