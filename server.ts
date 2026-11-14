import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (attempt < maxRetries && (status === 429 || status === 503)) {
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function parseJsonSafe<T>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  try {
    return JSON.parse(rawText.trim()) as T;
  } catch {
    return fallback;
  }
}

function buildPersonaInstruction(params: {
  tutorName?: string;
  subject?: string;
  classLevel?: string;
  serie?: string | null;
}): string {
  const tutorName = params.tutorName?.trim() || 'Maya';
  const subject = params.subject?.trim() || 'toutes les matières';
  const classLevel = params.classLevel?.trim() || 'CI';
  const serie = params.serie ? ` (série ${params.serie})` : '';

  return [
    `Tu t'appelles ${tutorName}. Tu es un tuteur pédagogique humain, chaleureux, clair et rigoureux, spécialisé en ${subject} pour le programme scolaire officiel du Sénégal en classe de ${classLevel}${serie}.`,
    `Règle absolue d'identité : tu ne mentionnes JAMAIS Gemini, Google, une API, un modèle de langage ou une intelligence artificielle externe. Tu t'exprimes uniquement en français sous le prénom ${tutorName}.`,
    `Adapte toujours ton niveau de langage, tes explications et tes exemples à un élève de ${classLevel}${serie}.`,
  ].join(' ');
}

function handleApiError(res: express.Response, err: unknown) {
  const status = Number((err as { status?: number })?.status) || 500;
  if (status === 400 || status === 403) {
    return res.status(status).json({
      error: 'La clé serveur configurée pour l’accompagnement semble invalide ou refusée.',
    });
  }
  if (status === 429) {
    return res.status(429).json({
      error: 'Le service d’accompagnement est très sollicité, réessaie dans un instant.',
    });
  }
  return res.status(500).json({
    error: 'Impossible de joindre le tuteur pédagogique pour le moment.',
  });
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/tutor/health', (_req, res) => {
    res.json({
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  app.post('/api/tutor/quiz', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Français',
      classLevel = 'CI',
      serie = null,
      lessonTitle = 'Leçon du programme',
      objectif = '',
      notions = [],
      courseContent = '',
      count = 4,
    } = req.body ?? {};

    const safeCount = Math.max(2, Math.min(6, Number(count) || 4));
    const trimmedContent =
      typeof courseContent === 'string' && courseContent.trim()
        ? courseContent.trim().slice(0, 6000)
        : '';

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Génère exactement ${safeCount} questions de quiz à choix multiple (4 choix par question) pour tester la compréhension de cette leçon :`,
            `Matière : ${subject}`,
            `Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `Titre : ${lessonTitle}`,
            objectif ? `Objectif : ${objectif}` : '',
            Array.isArray(notions) && notions.length > 0
              ? `Notions : ${notions.join(' ; ')}`
              : '',
            trimmedContent
              ? `Contenu complet du cours de référence :\n"""\n${trimmedContent}\n"""`
              : '',
            `Chaque question doit avoir 4 choix distincts, un seul correctIndex (0 à 3) et une explication courte et encourageante signée ${tutorName}.`,
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'choices', 'correctIndex', 'explanation'],
              },
            },
          },
        }),
      );

      const questions = parseJsonSafe(response.text, []);
      return res.json({ tutorName, questions });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/flashcards', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Français',
      classLevel = 'CI',
      serie = null,
      lessonTitle = 'Leçon du programme',
      objectif = '',
      notions = [],
      courseContent = '',
      count = 5,
    } = req.body ?? {};

    const safeCount = Math.max(3, Math.min(8, Number(count) || 5));
    const trimmedContent =
      typeof courseContent === 'string' && courseContent.trim()
        ? courseContent.trim().slice(0, 6000)
        : '';

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Génère ${safeCount} cartes mémoire (flashcards) efficaces et mémorisables pour réviser :`,
            `Matière : ${subject}`,
            `Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `Leçon : ${lessonTitle}`,
            objectif ? `Objectif : ${objectif}` : '',
            Array.isArray(notions) && notions.length > 0
              ? `Notions : ${notions.join(' ; ')}`
              : '',
            trimmedContent
              ? `Contenu complet du cours de référence :\n"""\n${trimmedContent}\n"""`
              : '',
            `Chaque carte contient : question (recto clair), answer (verso précis et court), et tip (astuce mémo de ${tutorName}).`,
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  tip: { type: Type.STRING },
                },
                required: ['question', 'answer', 'tip'],
              },
            },
          },
        }),
      );

      const flashcards = parseJsonSafe(response.text, []);
      return res.json({ tutorName, flashcards });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/generate-exercise', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Français',
      classLevel = 'CI',
      serie = null,
      lessonTitle = '',
      competence = '',
      category = 'Exercices par leçon',
      difficulty = 'Entraînement',
      courseContent = '',
    } = req.body ?? {};

    const trimmedContent =
      typeof courseContent === 'string' && courseContent.trim()
        ? courseContent.trim().slice(0, 6000)
        : '';

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Conçois un exercice d'application complet et progressif adapté au niveau de l'élève :`,
            `Matière : ${subject}`,
            `Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `Format : ${category} | Niveau : ${difficulty}`,
            lessonTitle ? `Thème / Leçon : ${lessonTitle}` : '',
            competence ? `Compétence travaillée : ${competence}` : '',
            trimmedContent
              ? `Contenu du cours à respecter :\n"""\n${trimmedContent}\n"""`
              : '',
            `Fournis : title (titre court de l'exercice), prompt (énoncé clair avec consignes et données précises), hints (2 à 3 indices graduels), solution (corrigé rédigé étape par étape), keyTakeaway (règle ou méthode à retenir).`,
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                prompt: { type: Type.STRING },
                hints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                solution: { type: Type.STRING },
                keyTakeaway: { type: Type.STRING },
              },
              required: ['title', 'prompt', 'hints', 'solution', 'keyTakeaway'],
            },
          },
        }),
      );

      const data = parseJsonSafe(response.text, {
        title: `Exercice d’application — ${subject}`,
        prompt: 'Résous l’exercice en détaillant chaque étape de ton raisonnement.',
        hints: [],
        solution: '',
        keyTakeaway: '',
      });
      return res.json(data);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/correct-exercise', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Français',
      classLevel = 'CI',
      serie = null,
      lessonTitle = '',
      competence = '',
      checkpoints = [],
      difficulty = 'Entraînement',
      exercisePrompt = '',
      studentAnswer = '',
      requestType = 'correct',
    } = req.body ?? {};

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            requestType === 'hint'
              ? `L'élève demande un indice étape par étape sans lui donner tout de suite toute la réponse finale.`
              : `Corrige la réponse ou la démarche de l'élève avec bienveillance et précision.`,
            `Matière : ${subject}`,
            `Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `Thème : ${lessonTitle}`,
            `Compétence : ${competence}`,
            `Niveau : ${difficulty}`,
            exercisePrompt ? `Énoncé de l'exercice : ${exercisePrompt}` : '',
            Array.isArray(checkpoints) && checkpoints.length > 0
              ? `Points travaillés : ${checkpoints.join(' ; ')}`
              : '',
            `Message / réponse de l'élève : "${studentAnswer || 'Je ne sais pas par où commencer.'}"`,
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isCorrect: { type: Type.BOOLEAN },
                scoreLabel: { type: Type.STRING },
                feedback: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                nextTip: { type: Type.STRING },
              },
              required: ['isCorrect', 'scoreLabel', 'feedback', 'steps', 'nextTip'],
            },
          },
        }),
      );

      const result = parseJsonSafe(response.text, {
        isCorrect: false,
        scoreLabel: 'À retravailler',
        feedback: 'Voici quelques étapes pour avancer.',
        steps: [],
        nextTip: 'Relis la consigne et vérifie chaque point.',
      });
      return res.json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/explain-lesson', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Clara',
      subject = 'Français',
      classLevel = 'CI',
      serie = null,
      lessonTitle = '',
      objectif = '',
      notions = [],
      courseContent = '',
    } = req.body ?? {};

    const trimmedContent =
      typeof courseContent === 'string' && courseContent.trim()
        ? courseContent.trim().slice(0, 6000)
        : '';

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Explique clairement et pédagogiquement cette leçon à l'élève sans modifier le cours original, avec un exemple concret de la vie courante au Sénégal et une mini question de vérification.`,
            `Matière : ${subject}`,
            `Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `Leçon : ${lessonTitle}`,
            objectif ? `Objectif : ${objectif}` : '',
            Array.isArray(notions) && notions.length > 0
              ? `Notions : ${notions.join(' ; ')}`
              : '',
            trimmedContent
              ? `Texte du cours à expliquer :\n"""\n${trimmedContent}\n"""`
              : '',
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                explanation: { type: Type.STRING },
                example: { type: Type.STRING },
                quickCheck: { type: Type.STRING },
              },
              required: ['explanation', 'example', 'quickCheck'],
            },
          },
        }),
      );

      const data = parseJsonSafe(response.text, {
        explanation: 'Voici l’essentiel à retenir pour cette leçon.',
        example: '',
        quickCheck: '',
      });
      return res.json(data);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/revision-plan', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Toutes les matières',
      classLevel = 'CI',
      serie = null,
      selectedSubjects = [],
      availableDays = '4 jours',
      timePerDay = '45 min',
    } = req.body ?? {};

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Élabore un planning hebdomadaire concret de révision pour un élève de ${classLevel}${serie ? ` (${serie})` : ''}.`,
            `Matières choisies : ${Array.isArray(selectedSubjects) && selectedSubjects.length > 0 ? selectedSubjects.join(', ') : subject}`,
            `Rythme souhaité : ${availableDays}, ${timePerDay} par jour.`,
            `Donne : overview (résumé motivant de ${tutorName}) et sessions (liste de séances avec day, subject, focus précis du programme, duration).`,
          ].join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                sessions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      duration: { type: Type.STRING },
                    },
                    required: ['day', 'subject', 'focus', 'duration'],
                  },
                },
              },
              required: ['overview', 'sessions'],
            },
          },
        }),
      );

      const data = parseJsonSafe(response.text, {
        overview: 'Voici ton planning équilibré pour cette semaine.',
        sessions: [],
      });
      return res.json(data);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/exam-plan', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Toutes les matières',
      classLevel = '3e',
      serie = null,
      examLabel = 'BFEM',
      daysRemaining = null,
      subjectsStatus = [],
    } = req.body ?? {};

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Élabore un plan de préparation personnalisé en 3 étapes concrètes pour ${examLabel} en ${classLevel}${serie ? ` (${serie})` : ''}.`,
            daysRemaining !== null
              ? `Temps restant avant l'épreuve : ${daysRemaining} jours.`
              : `Date de l'épreuve non encore renseignée.`,
            Array.isArray(subjectsStatus) && subjectsStatus.length > 0
              ? `État actuel par matière : ${subjectsStatus.map((s: { subject: string; status: string }) => `${s.subject}: ${s.status}`).join(' | ')}`
              : '',
            `Priorise d'abord les matières "À commencer" et "En cours".`,
          ]
            .filter(Boolean)
            .join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: { type: Type.STRING },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING },
                    },
                    required: ['phase', 'title', 'type'],
                  },
                },
              },
              required: ['summary', 'steps'],
            },
          },
        }),
      );

      const data = parseJsonSafe(response.text, { summary: '', steps: [] });
      return res.json(data);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/analyze-novelty', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Toutes les matières',
      classLevel = 'CI',
      serie = null,
      screenLabel = 'Cours',
      items = [],
    } = req.body ?? {};

    try {
      const formattedItems = Array.isArray(items)
        ? items
            .map(
              (item: { title?: string; note?: string; kind?: string }, idx: number) =>
                `${idx + 1}. [${item.kind === 'course' ? 'Cours complet ajouté' : 'Carreau'}] Titre: "${item.title || 'Sans titre'}" | Contenu: "${item.note || 'Vide'}"`,
            )
            .join('\n')
        : '';

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Analyse ces nouveautés (carreaux, notes ou nouveaux cours ajoutés) sur l'écran "${screenLabel}" (${classLevel}${serie ? ` ${serie}` : ''}, matière ${subject}).`,
            formattedItems || 'Aucun nouveau contenu texte saisi pour le moment.',
            `Donne : 1) summary (analyse claire de ce qui vient d'être ajouté et comment l'exploiter sans altérer le texte original), 2) keyPoints (2 à 4 points clés ou pistes d'étude concrètes), 3) suggestedQuestion (une question de révision ou d'exercice liée à cette nouveauté).`,
          ].join('\n'),
          config: {
            systemInstruction: buildPersonaInstruction({
              tutorName,
              subject,
              classLevel,
              serie,
            }),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedQuestion: { type: Type.STRING },
              },
              required: ['summary', 'keyPoints', 'suggestedQuestion'],
            },
          },
        }),
      );

      const data = parseJsonSafe(response.text, {
        summary: 'Nouveauté analysée.',
        keyPoints: [],
        suggestedQuestion: '',
      });
      return res.json(data);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/tutor/chat', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'L’accompagnement pédagogique n’est pas encore activé côté serveur.',
      });
    }

    const {
      tutorName = 'Maya',
      subject = 'Toutes les matières',
      message = '',
      history = [],
      siteContext = {},
    } = req.body ?? {};

    const classLevel = siteContext.classLevel || 'CI';
    const serie = siteContext.serie || null;
    const activeCourseContent =
      typeof siteContext.activeCourseContent === 'string'
        ? siteContext.activeCourseContent.slice(0, 4000)
        : '';
    const noveltiesText =
      Array.isArray(siteContext.novelties) && siteContext.novelties.length > 0
        ? siteContext.novelties
            .map(
              (n: { title?: string; note?: string; screenIndex?: number; kind?: string }) =>
                `- [${n.kind === 'course' ? 'Cours ajouté' : `Écran ${n.screenIndex}`}] ${n.title}: ${n.note}`,
            )
            .join('\n')
        : 'Aucune nouveauté personnalisée ajoutée.';

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map(
            (m: { role?: string; text?: string }) =>
              `${m.role === 'user' ? 'Élève' : tutorName}: ${m.text}`,
          )
          .join('\n')
      : '';

    const controlInstruction = [
      buildPersonaInstruction({ tutorName, subject, classLevel, serie }),
      `Tu peux piloter l'ensemble du site lorsque l'élève le demande ou quand c'est utile via le champ "actions" :`,
      `- navigate: formatIndex 0 (Cours), 1 (Entraînement), 2 (Révisions), 3 (Préparation Examen).`,
      `- set_class: classLevel parmi ["Petite Section","Moyenne Section","Grande Section","CI","CP","CE1","CE2","CM1","CM2","6e","5e","4e","3e","2nde","1re","Terminale"] et optionnellement serie.`,
      `- select_subject: subject (nom exact d'une matière active du niveau).`,
      `- open_course: ouvre la grande page de lecture complète du cours (optionnellement subject ou courseId).`,
      `- close_course: ferme la page de lecture complète pour revenir aux carreaux.`,
      `- open_revision_tab: tab parmi ["Quiz","Flashcards","Résumé","Planning"].`,
      `- generate_quiz: ouvre Révisions -> Quiz et lance immédiatement la génération d'un quiz sur la leçon active.`,
      `- generate_flashcards: ouvre Révisions -> Flashcards et lance immédiatement la génération des cartes mémoire.`,
      `- set_exercise_filter: règle les filtres d'Entraînement (category parmi ["Exercices par leçon","Devoirs","Sujets d’examen","Corrigés"], difficulty parmi ["Découverte","Entraînement","Défi"], et/ou subject).`,
      `- generate_exercise: ouvre Entraînement et génère immédiatement un nouvel exercice adapté.`,
      `- set_exam_date: règle la date d'examen (format YYYY-MM-DD) dans Préparation Examen.`,
      `- update_subject_status: met à jour le statut d'une matière (subject, status parmi ["À commencer","En cours","Révisée"]).`,
      `- add_note_tile: ajoute un carreau personnalisé (title, note) sur l'écran actuel.`,
      `- add_course: ajoute un cours fourni par l'élève (title, content, subject optionnel). RÈGLE STRICTE : lorsque l'élève donne un cours (titre + texte), conserve content STRICTEMENT MOT POUR MOT tel que fourni, sans rien modifier ni résumer !`,
      `- toggle_focus: enabled true/false pour activer ou quitter le mode Focus.`,
      `N'ajoute des actions que lorsqu'elles répondent directement à la demande de l'élève.`,
    ].join('\n');

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            `Contexte actuel du site :`,
            `- Écran actif : ${siteContext.screenLabel || 'Cours'} (index ${siteContext.activeFormat ?? 0})`,
            `- Lecteur de cours pleine page ouvert : ${siteContext.isCourseReaderOpen ? 'oui' : 'non'}`,
            `- Classe : ${classLevel}${serie ? ` (${serie})` : ''}`,
            `- Matière active : ${siteContext.activeSubject || subject}`,
            `- Matières du niveau : ${Array.isArray(siteContext.subjects) ? siteContext.subjects.join(', ') : subject}`,
            siteContext.activeCourseTitle
              ? `- Cours actuellement affiché : ${siteContext.activeCourseTitle}`
              : '',
            activeCourseContent ? `Extrait du cours affiché :\n${activeCourseContent}` : '',
            `- Mode Focus plein écran : ${siteContext.isFocusMode ? 'actif' : 'inactif'}`,
            `- Nouveautés / carreaux / cours ajoutés :\n${noveltiesText}`,
            historyText ? `Historique récent :\n${historyText}` : '',
            `Message de l'élève : ${message}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
          config: {
            systemInstruction: controlInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      formatIndex: { type: Type.INTEGER },
                      classLevel: { type: Type.STRING },
                      serie: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      courseId: { type: Type.STRING },
                      tab: { type: Type.STRING },
                      category: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      date: { type: Type.STRING },
                      status: { type: Type.STRING },
                      title: { type: Type.STRING },
                      note: { type: Type.STRING },
                      content: { type: Type.STRING },
                      enabled: { type: Type.BOOLEAN },
                    },
                    required: ['type'],
                  },
                },
              },
              required: ['reply'],
            },
          },
        }),
      );

      const parsed = parseJsonSafe<{ reply?: string; actions?: unknown[] }>(
        response.text,
        { reply: response.text ?? 'Je suis là pour t’aider.' },
      );

      return res.json({
        tutorName,
        reply: parsed.reply || 'Je suis prêt à t’accompagner.',
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur pédagogique actif sur http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
  process.exit(1);
});
