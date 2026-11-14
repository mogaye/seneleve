import {
  ExerciseCorrectionResult,
  GeneratedExercise,
  GeneratedFlashcard,
  GeneratedQuizQuestion,
  GeneratedRevisionPlan,
  NoveltyAnalysisResult,
  SiteControlAction,
  SiteNoveltyItem,
  sanitizeSiteActions,
} from '../utils/tutorAgent';
import { ClassLevel, SerieOption } from '../data/studyData';
import { FormatIndex } from '../utils/wireframeState';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(
      data.error || 'Le service d’accompagnement est momentanément indisponible.',
    );
  }
  return data;
}

export async function fetchTutorStatus(): Promise<{ configured: boolean }> {
  try {
    const res = await fetch('/api/tutor/health');
    if (!res.ok) return { configured: false };
    return (await res.json()) as { configured: boolean };
  } catch {
    return { configured: false };
  }
}

export async function generateTutorQuiz(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  lessonTitle: string;
  objectif: string;
  notions: string[];
  courseContent?: string;
  count?: number;
}): Promise<GeneratedQuizQuestion[]> {
  const res = await postJson<{ questions: GeneratedQuizQuestion[] }>(
    '/api/tutor/quiz',
    params,
  );
  return Array.isArray(res.questions) ? res.questions : [];
}

export async function generateTutorFlashcards(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  lessonTitle: string;
  objectif: string;
  notions: string[];
  courseContent?: string;
  count?: number;
}): Promise<GeneratedFlashcard[]> {
  const res = await postJson<{ flashcards: GeneratedFlashcard[] }>(
    '/api/tutor/flashcards',
    params,
  );
  return Array.isArray(res.flashcards) ? res.flashcards : [];
}

export async function generateTutorExercise(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  lessonTitle: string;
  competence: string;
  category: string;
  difficulty: string;
  courseContent?: string;
}): Promise<GeneratedExercise> {
  return postJson<GeneratedExercise>('/api/tutor/generate-exercise', params);
}

export async function requestExerciseCorrection(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  lessonTitle: string;
  competence: string;
  checkpoints: string[];
  difficulty: string;
  exercisePrompt?: string;
  studentAnswer: string;
  requestType: 'hint' | 'correct';
}): Promise<ExerciseCorrectionResult> {
  return postJson<ExerciseCorrectionResult>('/api/tutor/correct-exercise', params);
}

export async function requestLessonExplanation(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  lessonTitle: string;
  objectif: string;
  notions: string[];
  courseContent?: string;
}): Promise<{ explanation: string; example: string; quickCheck: string }> {
  return postJson('/api/tutor/explain-lesson', params);
}

export async function requestRevisionPlan(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  selectedSubjects: string[];
  availableDays: string;
  timePerDay: string;
}): Promise<GeneratedRevisionPlan> {
  return postJson<GeneratedRevisionPlan>('/api/tutor/revision-plan', params);
}

export async function requestExamPlan(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  examLabel: string;
  daysRemaining: number | null;
  subjectsStatus: { subject: string; status: string }[];
}): Promise<{
  summary: string;
  steps: { phase: string; title: string; type: string }[];
}> {
  return postJson('/api/tutor/exam-plan', params);
}

export async function analyzeSiteNovelties(params: {
  tutorName: string;
  subject: string;
  classLevel: ClassLevel;
  serie: SerieOption | null;
  screenLabel: string;
  items: { id: string; title: string; note: string; kind?: 'tile' | 'course' }[];
}): Promise<NoveltyAnalysisResult> {
  return postJson<NoveltyAnalysisResult>('/api/tutor/analyze-novelty', params);
}

export async function sendTutorChat(params: {
  tutorName: string;
  subject: string;
  message: string;
  history: { role: 'user' | 'tutor'; text: string }[];
  siteContext: {
    activeFormat: FormatIndex;
    screenLabel: string;
    classLevel: ClassLevel;
    serie: SerieOption | null;
    activeSubject: string;
    subjects: string[];
    novelties: SiteNoveltyItem[];
    isFocusMode: boolean;
    isCourseReaderOpen: boolean;
    activeCourseTitle?: string;
    activeCourseContent?: string;
  };
}): Promise<{ reply: string; actions: SiteControlAction[] }> {
  const res = await postJson<{ reply: string; actions?: unknown }>(
    '/api/tutor/chat',
    params,
  );
  return {
    reply: res.reply || 'Je suis prêt à t’aider.',
    actions: sanitizeSiteActions(res.actions),
  };
}

