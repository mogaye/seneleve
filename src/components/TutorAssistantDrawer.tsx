import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Loader2,
  ScanSearch,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { ClassLevel, SerieOption } from '../data/studyData';
import { analyzeSiteNovelties, sendTutorChat } from '../services/tutorClient';
import {
  describeSiteAction,
  SiteControlAction,
  SiteNoveltyItem,
  SubjectTutorPersona,
  TutorChatMessage,
} from '../utils/tutorAgent';
import { FORMAT_META, FormatIndex } from '../utils/wireframeState';

interface TutorAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  tutor: SubjectTutorPersona;
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
  onExecuteActions: (actions: SiteControlAction[]) => void;
}

export const TutorAssistantDrawer: React.FC<TutorAssistantDrawerProps> = ({
  open,
  onClose,
  tutor,
  activeFormat,
  screenLabel,
  classLevel,
  serie,
  activeSubject,
  subjects,
  novelties,
  isFocusMode,
  isCourseReaderOpen,
  activeCourseTitle,
  activeCourseContent,
  onExecuteActions,
}) => {
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome',
      role: 'tutor',
      tutorName: tutor.name,
      text: `Bonjour ! Je suis ${tutor.name}. Je t’accompagne en ${tutor.subject} (${classLevel}${serie ? ` · ${serie}` : ''}) : je peux ouvrir tes cours complets, générer des quiz ou flashcards, créer et corriger des exercices, analyser tes nouveautés et piloter tout le site.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastTutorNameRef = useRef(tutor.name);

  useEffect(() => {
    if (lastTutorNameRef.current !== tutor.name) {
      lastTutorNameRef.current = tutor.name;
      setMessages((prev) => [
        ...prev,
        {
          id: `handoff-${Date.now()}`,
          role: 'tutor',
          tutorName: tutor.name,
          text: `Salut, c’est ${tutor.name} pour ${tutor.subject}. Dis-moi ce que tu veux travailler ou ce que tu veux que je configure pour toi.`,
        },
      ]);
    }
  }, [tutor.name, tutor.subject]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  if (!open || typeof document === 'undefined') return null;

  const submitMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: TutorChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await sendTutorChat({
        tutorName: tutor.name,
        subject: tutor.subject,
        message: trimmed,
        history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        siteContext: {
          activeFormat,
          screenLabel,
          classLevel,
          serie,
          activeSubject,
          subjects,
          novelties,
          isFocusMode,
          isCourseReaderOpen,
          activeCourseTitle,
          activeCourseContent,
        },
      });

      if (response.actions.length > 0) {
        onExecuteActions(response.actions);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          tutorName: tutor.name,
          text: response.reply,
          actions: response.actions,
        },
      ]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Impossible de contacter ton tuteur pour le moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAllNovelties = async () => {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-nov-${Date.now()}`,
        role: 'user',
        text:
          novelties.length > 0
            ? `Analyse mes ${novelties.length} nouveauté(s) ajoutée(s) sur le site.`
            : `Analyse l’espace actuel (${screenLabel}) et propose une piste de travail.`,
      },
    ]);

    try {
      const analysis = await analyzeSiteNovelties({
        tutorName: tutor.name,
        subject: tutor.subject,
        classLevel,
        serie,
        screenLabel,
        items: novelties.map((n) => ({
          id: n.id,
          title: n.title,
          note: n.note,
          kind: n.kind,
        })),
      });

      const formatted = [
        analysis.summary,
        analysis.keyPoints.length > 0
          ? `Points repérés :\n• ${analysis.keyPoints.join('\n• ')}`
          : '',
        analysis.suggestedQuestion ? `Question suggérée : ${analysis.suggestedQuestion}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-nov-${Date.now()}`,
          role: 'tutor',
          tutorName: tutor.name,
          text: formatted,
        },
      ]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Analyse impossible pour le moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Ouvre le cours complet en pleine page',
    'Prépare un quiz sur ce cours',
    'Donne-moi un exercice corrigé sur ce chapitre',
  ];

  return createPortal(
    <div
      data-no-swipe="true"
      className={`${FORMAT_META[activeFormat].themeClass} fixed inset-0 z-[115] flex justify-end bg-[#121417]/30`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Accompagnement avec ${tutor.name}`}
        className="flex h-full w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-none border border-[rgba(var(--accent-rgb),0.32)] bg-[#F7F8FC]/96 p-4 shadow-[0_24px_60px_rgba(18,20,23,0.28)] sm:m-3 sm:h-[calc(100%-24px)] sm:rounded-[26px]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5E8F0] pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="sg-btn-primary flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white">
              {tutor.initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-[14px] font-bold text-[#121417]">
                  {tutor.name}
                </h2>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] whitespace-nowrap">
                  {tutor.subject}
                </span>
              </div>
              <p className="truncate text-[11px] text-[#4B4E54]">
                {tutor.roleLabel} · {classLevel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Fermer ${tutor.name}`}
            className="sg-focus-ring sg-nav-idle flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[#30343B]"
          >
            <X className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>
        </div>

        {/* Novelty detector & quick site controls */}
        <div className="mt-2.5 flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            disabled={loading}
            onClick={handleAnalyzeAllNovelties}
            className="sg-focus-ring sg-btn-secondary flex h-[32px] w-full items-center justify-between gap-2 rounded-full px-3.5 text-[11.5px] font-semibold text-[var(--accent)]"
          >
            <span className="flex items-center gap-2 truncate">
              <ScanSearch className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
              <span className="truncate">
                {novelties.length > 0
                  ? `Analyser les nouveautés (${novelties.length})`
                  : `Analyser l’espace ${screenLabel}`}
              </span>
            </span>
            <ArrowRight className="h-[13px] w-[13px] shrink-0" />
          </button>

          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => submitMessage(prompt)}
                className="sg-focus-ring sg-nav-idle rounded-full px-2.5 py-1 text-[10.5px] font-medium text-[#1C1E22]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation history */}
        <div
          ref={listRef}
          className="my-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <span className="px-1 text-[10.5px] font-bold text-[var(--accent)]">
                    {msg.tutorName ?? tutor.name}
                  </span>
                )}
                <div
                  className={`max-w-[90%] whitespace-pre-line rounded-[16px] px-3.5 py-2.5 text-[12px] leading-relaxed ${
                    isUser
                      ? 'sg-btn-primary font-medium text-white'
                      : 'border border-[#E3E7F0] bg-white/95 text-[#121417] shadow-[0_2px_8px_rgba(18,20,23,0.04)]'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {msg.actions.map((act, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--accent)]"
                      >
                        <Sparkles className="h-[10px] w-[10px]" />
                        {describeSiteAction(act)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 px-1 text-[11.5px] font-medium text-[var(--accent)]">
              <Loader2 className="h-[14px] w-[14px] animate-spin" />
              <span>{tutor.name} prépare sa réponse…</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-[14px] border border-[#DC2626]/35 bg-[#FEE2E2]/80 px-3 py-2 text-[11.5px] font-medium text-[#991B1B]">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Message input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitMessage(input);
          }}
          className="flex shrink-0 items-center gap-2 border-t border-white/70 pt-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Demande à ${tutor.name}…`}
            aria-label={`Écrire à ${tutor.name}`}
            className="sg-focus-ring sg-glass-subtile h-[38px] min-w-0 flex-1 rounded-full px-4 text-[12.5px] text-[#121417] placeholder:text-[#666A72]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={`Envoyer à ${tutor.name}`}
            className="sg-focus-ring sg-btn-primary flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-white disabled:opacity-55"
          >
            <Send className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>
        </form>
      </aside>
    </div>,
    document.body,
  );
};
