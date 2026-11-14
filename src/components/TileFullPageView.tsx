import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal2,
  ImagePlus,
  Loader2,
  PencilLine,
  Plus,
  ScanSearch,
  Sigma,
  Sparkles,
  Square,
  Table2,
  Timer,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { ClassExperience } from '../data/studyData';
import { TileRect } from '../utils/bentoLayout';
import {
  buildTemplateBlocks,
  compressImageFileToDataUrl,
  computeChecklistStats,
  createBlock,
  createBlockId,
  CUSTOM_TILE_THEME_STYLES,
  CustomTileBlock,
  CustomTileBlockType,
  CustomTileTemplateId,
  CustomTileTheme,
  normalizeTileBlocks,
  summarizeCustomTileText,
} from '../utils/customTile';
import { NoveltyAnalysisResult, SubjectTutorPersona } from '../utils/tutorAgent';
import { FORMAT_META, FormatIndex } from '../utils/wireframeState';
import type { BuiltInTileSlot } from './BentoTileCanvas';
import { SketchPad } from './SketchPad';
import { StudyTimerBlock } from './StudyTimerBlock';

interface TileFullPageViewProps {
  open: boolean;
  formatIndex: FormatIndex;
  experience: ClassExperience;
  tiles: TileRect[];
  activeTileId: string | null;
  slots: BuiltInTileSlot[];
  locked: boolean;
  tutor?: SubjectTutorPersona;
  onSelectTileId: (tileId: string) => void;
  onUpdateTile: (updated: TileRect) => void;
  onDeleteTile: (tileId: string) => void;
  onAnalyzeTile?: (tile: TileRect) => Promise<NoveltyAnalysisResult>;
  onOpenTutor?: () => void;
  onClose: () => void;
}

const BUILTIN_TILE_LABELS: Record<string, string> = {
  'cours-main': 'Espace du cours',
  'cours-subjects': 'Choisir une matière',
  'cours-progress': 'Progression du cours',
  'cours-next': 'Leçon suivante',
  'cours-lessons': 'Leçons de la matière',
  'ex-filters': 'Choisir un entraînement',
  'ex-session': 'Mon entraînement',
  'ex-progress': 'Progression',
  'ex-main': 'Exercices & examens',
  'ex-nav': 'Série active',
  'rev-main': 'Outils de révision',
  'rev-lessons': 'Mes leçons',
  'rev-tool': 'Lancer la révision',
  'rev-session': 'Ma séance',
  'exam-target': 'Examen préparé',
  'exam-date': 'Date de l’examen',
  'exam-days': 'Jours restants',
  'exam-plan': 'Plan de préparation',
  'exam-subjects': 'Matières à réviser',
};

export function getTilePageLabel(tile: TileRect): string {
  if (tile.isCustom) {
    return tile.title?.trim() || 'Carreau personnalisé';
  }
  return BUILTIN_TILE_LABELS[tile.id] ?? 'Carreau';
}

export const TileFullPageView: React.FC<TileFullPageViewProps> = ({
  open,
  formatIndex,
  experience,
  tiles,
  activeTileId,
  slots,
  locked,
  tutor,
  onSelectTileId,
  onUpdateTile,
  onDeleteTile,
  onAnalyzeTile,
  onOpenTutor,
  onClose,
}) => {
  const activeTile = tiles.find((t) => t.id === activeTileId) ?? null;
  const activeSlot = activeTile && !activeTile.isCustom
    ? slots.find((s) => s.id === activeTile.id)
    : undefined;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetImageBlockIdRef = useRef<string | null>(null);

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [sketchEditingIds, setSketchEditingIds] = useState<Record<string, boolean>>({});
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [newCheckItems, setNewCheckItems] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysisState, setAnalysisState] = useState<{
    tileId: string;
    loading: boolean;
    error?: string;
    result?: NoveltyAnalysisResult;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    setFlippedCards({});
    setSketchEditingIds({});
    setBrokenImages({});
    setIsDragOver(false);
  }, [activeTileId]);

  if (!open || !activeTile) return null;

  const formatMeta = FORMAT_META[formatIndex];
  const classTag = `${experience.classLevel}${experience.serie ? ` (${experience.serie})` : ''}`;

  const navigableTiles = tiles.filter(
    (t) => t.isCustom || (t.id !== 'cours-main' && slots.some((s) => s.id === t.id)),
  );
  const currentIdx = navigableTiles.findIndex((t) => t.id === activeTile.id);
  const prevTile =
    navigableTiles.length > 1
      ? navigableTiles[(currentIdx - 1 + navigableTiles.length) % navigableTiles.length]
      : null;
  const nextTile =
    navigableTiles.length > 1
      ? navigableTiles[(currentIdx + 1) % navigableTiles.length]
      : null;

  const blocks = activeTile.isCustom ? normalizeTileBlocks(activeTile) : [];
  const themeKey: CustomTileTheme = activeTile.theme ?? 'default';
  const themeStyle = CUSTOM_TILE_THEME_STYLES[themeKey] ?? CUSTOM_TILE_THEME_STYLES.default;
  const checklistStats = computeChecklistStats(blocks);

  const commitTileUpdate = (patch: Partial<TileRect>, nextBlocks?: CustomTileBlock[]) => {
    const resolvedBlocks = nextBlocks ?? blocks;
    const candidate: TileRect = {
      ...activeTile,
      ...patch,
      blocks: resolvedBlocks,
    };
    onUpdateTile({
      ...candidate,
      note: summarizeCustomTileText(candidate),
    });
  };

  const updateBlock = (blockId: string, updater: (blk: CustomTileBlock) => CustomTileBlock) => {
    commitTileUpdate(
      {},
      blocks.map((b) => (b.id === blockId ? updater(b) : b)),
    );
  };

  const removeBlock = (blockId: string) => {
    const remaining = blocks.filter((b) => b.id !== blockId);
    commitTileUpdate({}, remaining.length > 0 ? remaining : [createBlock('text', { text: '' })]);
  };

  const moveBlock = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    commitTileUpdate({}, next);
  };

  const handleAddBlock = (type: CustomTileBlockType) => {
    const blk = createBlock(type);
    const hasOnlyEmptyText =
      blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].text.trim();
    const nextBlocks = hasOnlyEmptyText && type !== 'text' ? [blk] : [...blocks, blk];
    commitTileUpdate({}, nextBlocks);
    if (type === 'sketch') {
      setSketchEditingIds((prev) => ({ ...prev, [blk.id]: true }));
    }
  };

  const handleApplyTemplate = (templateId: CustomTileTemplateId) => {
    const tpl = buildTemplateBlocks(templateId, activeTile.subject);
    commitTileUpdate(
      {
        title: tpl.title,
        theme: tpl.theme,
      },
      tpl.blocks,
    );
  };

  const triggerImagePicker = (blockId: string | null) => {
    targetImageBlockIdRef.current = blockId;
    fileInputRef.current?.click();
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!imageFile) return;

    const dataUrl = await compressImageFileToDataUrl(imageFile);
    const targetId = targetImageBlockIdRef.current;
    targetImageBlockIdRef.current = null;

    if (targetId) {
      updateBlock(targetId, (b) =>
        b.type === 'image' ? { ...b, dataUrl, caption: b.caption || imageFile.name } : b,
      );
      setBrokenImages((prev) => ({ ...prev, [targetId]: false }));
    } else {
      const hasOnlyEmptyText =
        blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].text.trim();
      const newBlk = createBlock('image', {
        dataUrl,
        caption: imageFile.name.replace(/\.[^/.]+$/, ''),
      });
      commitTileUpdate({}, hasOnlyEmptyText ? [newBlk] : [...blocks, newBlk]);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLElement>) => {
    if (!activeTile.isCustom) return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          const dataUrl = await compressImageFileToDataUrl(file);
          const newBlk = createBlock('image', { dataUrl, caption: 'Image collée' });
          commitTileUpdate({}, [...blocks, newBlk]);
          break;
        }
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLElement>) => {
    if (!activeTile.isCustom) return;
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files?.length) {
      await handleImageFiles(event.dataTransfer.files);
    }
  };

  const handleAnalyzeCustomTile = async () => {
    if (!onAnalyzeTile || !activeTile.isCustom) return;
    setAnalysisState({ tileId: activeTile.id, loading: true });
    try {
      const result = await onAnalyzeTile(activeTile);
      setAnalysisState({ tileId: activeTile.id, loading: false, result });
    } catch (err) {
      setAnalysisState({
        tileId: activeTile.id,
        loading: false,
        error: err instanceof Error ? err.message : 'Analyse indisponible.',
      });
    }
  };

  const activeAnalysis =
    analysisState && analysisState.tileId === activeTile.id ? analysisState : null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Page du carreau — ${getTilePageLabel(activeTile)}`}
      data-no-swipe="true"
      className={`${formatMeta.themeClass} ${experience.cycleClass} styleguide-canvas fixed inset-0 z-[104] flex flex-col overflow-hidden`}
    >
      {/* Top reader bar */}
      <header className="sg-glass-shell z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-none border-x-0 border-t-0 px-3 py-2.5 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="sg-focus-ring sg-nav-idle flex h-[34px] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-[#121417] whitespace-nowrap"
          >
            <ArrowLeft className="h-[14px] w-[14px]" />
            <span>Retour aux carreaux</span>
          </button>

          <span className="hidden truncate text-[12.5px] font-semibold text-[#4B4E54] sm:inline">
            {formatMeta.bottomLabel} · {getTilePageLabel(activeTile)} · {classTag}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {prevTile && nextTile && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectTileId(prevTile.id)}
                aria-label={`Carreau précédent : ${getTilePageLabel(prevTile)}`}
                title={`Précédent : ${getTilePageLabel(prevTile)}`}
                className="sg-focus-ring sg-nav-idle flex h-[30px] items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold text-[#1C1E22]"
              >
                <ChevronLeft className="h-[13px] w-[13px]" />
                <span className="hidden md:inline max-w-[120px] truncate">
                  {getTilePageLabel(prevTile)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTileId(nextTile.id)}
                aria-label={`Carreau suivant : ${getTilePageLabel(nextTile)}`}
                title={`Suivant : ${getTilePageLabel(nextTile)}`}
                className="sg-focus-ring sg-nav-idle flex h-[30px] items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold text-[#1C1E22]"
              >
                <span className="hidden md:inline max-w-[120px] truncate">
                  {getTilePageLabel(nextTile)}
                </span>
                <ChevronRight className="h-[13px] w-[13px]" />
              </button>
            </div>
          )}

          {tutor && onOpenTutor && (
            <button
              type="button"
              onClick={onOpenTutor}
              className="sg-focus-ring sg-btn-secondary flex h-[32px] items-center gap-1.5 rounded-full pr-3 pl-1.5 text-[11.5px] font-semibold text-[var(--accent)] whitespace-nowrap"
            >
              <span className="sg-btn-primary flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10.5px] font-bold text-white">
                {tutor.initial}
              </span>
              <span className="hidden sm:inline">{tutor.name}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main spacious page viewport */}
      <div
        onPaste={(e) => void handlePaste(e)}
        onDragOver={(e) => {
          if (activeTile.isCustom && e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => void handleDrop(e)}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-8 md:py-7"
      >
        {activeTile.isCustom ? (
          <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 pb-10">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void handleImageFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <article
              className={`${themeStyle.surfaceClass} flex flex-col gap-5 rounded-[28px] p-5 transition-shadow md:p-8 ${
                isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
              }`}
            >
              {/* Title + Subject + Theme + Actions */}
              <div className="flex flex-col gap-3 border-b border-white/80 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-semibold text-[var(--accent)]">
                  <span>
                    Carreau personnalisé · {classTag}
                    {activeTile.subject ? ` · ${activeTile.subject}` : ''}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Theme swatches */}
                    <div className="flex items-center gap-1" role="group" aria-label="Couleur du carreau">
                      {(Object.keys(CUSTOM_TILE_THEME_STYLES) as CustomTileTheme[]).map((key) => {
                        const item = CUSTOM_TILE_THEME_STYLES[key];
                        const selected = themeKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => commitTileUpdate({ theme: key })}
                            title={`Thème ${item.label}`}
                            aria-label={`Thème ${item.label}`}
                            aria-pressed={selected}
                            className={`sg-focus-ring flex h-[22px] items-center gap-1 rounded-full border px-2 text-[10.5px] font-semibold transition-all ${
                              selected
                                ? 'border-[var(--accent)] bg-white text-[#121417] shadow-xs'
                                : 'border-white/80 bg-white/55 text-[#55585F] hover:bg-white'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="h-[8px] w-[8px] rounded-full"
                              style={{ backgroundColor: item.dotColor }}
                            />
                            <span className="hidden sm:inline">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {onAnalyzeTile && (
                      <button
                        type="button"
                        disabled={activeAnalysis?.loading}
                        onClick={() => void handleAnalyzeCustomTile()}
                        className="sg-focus-ring sg-btn-secondary flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[var(--accent)] whitespace-nowrap"
                      >
                        {activeAnalysis?.loading ? (
                          <Loader2 className="h-[12px] w-[12px] animate-spin" />
                        ) : (
                          <ScanSearch className="h-[12px] w-[12px]" />
                        )}
                        <span>Analyser avec {tutor?.name ?? 'le tuteur'}</span>
                      </button>
                    )}

                    {!locked && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTile(activeTile.id);
                          onClose();
                        }}
                        className="sg-focus-ring flex h-[28px] items-center gap-1 rounded-full border border-[#FCA5A5] bg-white/80 px-3 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] whitespace-nowrap"
                      >
                        <Trash2 className="h-[12px] w-[12px]" />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={activeTile.title ?? ''}
                    onChange={(e) => commitTileUpdate({ title: e.target.value })}
                    placeholder="Donne un titre à ta page d’étude…"
                    aria-label="Titre du carreau"
                    className="sg-focus-ring min-w-[220px] flex-1 rounded-lg bg-transparent px-1 py-0.5 text-[23px] font-bold tracking-tight text-[#121417] placeholder:text-[#8E939E] md:text-[27px]"
                  />
                  <select
                    value={activeTile.subject ?? ''}
                    onChange={(e) =>
                      commitTileUpdate({ subject: e.target.value || undefined })
                    }
                    aria-label="Matière du carreau"
                    className="sg-focus-ring h-[34px] rounded-full border border-white/85 bg-white/85 px-3 text-[12px] font-semibold text-[#1C1E22]"
                  >
                    <option value="">Toutes matières</option>
                    {experience.subjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick templates + block insert toolbar */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#55585F]">
                      Ajouter :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('text')}
                      className="sg-focus-ring flex h-[26px] items-center gap-1 rounded-full border border-white/85 bg-white/85 px-2.5 text-[11px] font-semibold text-[#1C1E22] hover:border-[var(--accent-border)] hover:text-[var(--accent)] whitespace-nowrap"
                    >
                      <Type className="h-[11.5px] w-[11.5px] text-[var(--accent)]" />
                      <span>Texte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('image')}
                      className="sg-focus-ring flex h-[26px] items-center gap-1 rounded-full border border-white/85 bg-white/85 px-2.5 text-[11px] font-semibold text-[#1C1E22] hover:border-[var(--accent-border)] hover:text-[var(--accent)] whitespace-nowrap"
                    >
                      <ImagePlus className="h-[11.5px] w-[11.5px] text-[var(--accent)]" />
                      <span>Image</span>
                    </button>
                    {(
                      [
                        { type: 'sketch', label: 'Dessin / Schéma', icon: <PencilLine className="h-[11.5px] w-[11.5px]" /> },
                        { type: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-[11.5px] w-[11.5px]" /> },
                        { type: 'flashcard', label: 'Carte mémoire', icon: <FlipHorizontal2 className="h-[11.5px] w-[11.5px]" /> },
                        { type: 'formula', label: 'Formule / Définition', icon: <Sigma className="h-[11.5px] w-[11.5px]" /> },
                        { type: 'table', label: 'Tableau', icon: <Table2 className="h-[11.5px] w-[11.5px]" /> },
                        { type: 'timer', label: 'Minuteur', icon: <Timer className="h-[11.5px] w-[11.5px]" /> },
                      ] as { type: CustomTileBlockType; label: string; icon: React.ReactNode }[]
                    ).map((tool) => (
                      <button
                        key={tool.type}
                        type="button"
                        onClick={() => handleAddBlock(tool.type)}
                        className="sg-focus-ring flex h-[26px] items-center gap-1 rounded-full border border-white/85 bg-white/85 px-2.5 text-[11px] font-semibold text-[#1C1E22] hover:border-[var(--accent-border)] hover:text-[var(--accent)] whitespace-nowrap"
                      >
                        <span className="text-[var(--accent)]">{tool.icon}</span>
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="font-semibold text-[#55585F]">Modèles :</span>
                    {(
                      [
                        { id: 'fiche', label: 'Fiche cours' },
                        { id: 'schema', label: 'Schéma' },
                        { id: 'flashcards', label: 'Flashcards' },
                        { id: 'chrono', label: 'Séance 25m' },
                      ] as { id: CustomTileTemplateId; label: string }[]
                    ).map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl.id)}
                        className="sg-focus-ring rounded-full border border-[var(--accent-border)]/45 bg-[var(--accent-soft)]/70 px-2.5 py-0.5 font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] whitespace-nowrap"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blocks list */}
              <div className="flex flex-col gap-4">
                {blocks.map((blk, index) => (
                  <div
                    key={blk.id}
                    className="rounded-[20px] border border-white/90 bg-white/85 p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[#55585F]">
                      <span>
                        {blk.type === 'text' && 'Bloc texte'}
                        {blk.type === 'image' && 'Image illustrée'}
                        {blk.type === 'sketch' && 'Planche de dessin / schéma'}
                        {blk.type === 'checklist' &&
                          `Checklist (${checklistStats.done}/${checklistStats.total})`}
                        {blk.type === 'flashcard' && 'Carte mémoire'}
                        {blk.type === 'formula' && 'Formule ou définition clé'}
                        {blk.type === 'table' && 'Tableau comparatif'}
                        {blk.type === 'timer' && 'Minuteur de concentration'}
                      </span>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveBlock(index, -1)}
                            aria-label="Monter ce bloc"
                            className="sg-focus-ring flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] text-[#4B4E54] hover:text-[var(--accent)]"
                          >
                            <ArrowUp className="h-[12px] w-[12px]" />
                          </button>
                        )}
                        {index < blocks.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveBlock(index, 1)}
                            aria-label="Descendre ce bloc"
                            className="sg-focus-ring flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] text-[#4B4E54] hover:text-[var(--accent)]"
                          >
                            <ArrowDown className="h-[12px] w-[12px]" />
                          </button>
                        )}
                        {blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlock(blk.id)}
                            aria-label="Supprimer ce bloc"
                            className="sg-focus-ring flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] text-[#4B4E54] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                          >
                            <X className="h-[12px] w-[12px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {blk.type === 'text' && (
                      <textarea
                        rows={5}
                        value={blk.text}
                        onChange={(e) =>
                          updateBlock(blk.id, (b) =>
                            b.type === 'text' ? { ...b, text: e.target.value } : b,
                          )
                        }
                        placeholder="Rédige ton cours, tes remarques, une synthèse ou colle une image directement (Ctrl+V)…"
                        className="sg-focus-ring w-full resize-y rounded-[14px] border border-[#E2E8F0] bg-[#FAFBFD] p-3.5 text-[14.5px] leading-relaxed text-[#121417] placeholder:text-[#7A7D84]"
                      />
                    )}

                    {blk.type === 'image' && (
                      <div className="flex flex-col gap-3">
                        {blk.dataUrl && !brokenImages[blk.id] ? (
                          <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                            <img
                              src={blk.dataUrl}
                              alt={blk.caption || 'Illustration du carreau'}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setBrokenImages((prev) => ({ ...prev, [blk.id]: true }))
                              }
                              className="max-h-[420px] w-full rounded-[10px] object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => triggerImagePicker(blk.id)}
                              className="sg-focus-ring sg-btn-secondary h-[28px] rounded-full px-3 text-[11.5px] font-semibold text-[var(--accent)]"
                            >
                              Remplacer l’image
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 rounded-[16px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
                            <p className="text-[12.5px] text-[#4B4E54]">
                              Glisse une image ici, colle-la avec Ctrl+V ou choisis un fichier sur ton appareil.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => triggerImagePicker(blk.id)}
                                className="sg-focus-ring sg-btn-primary flex h-[32px] items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-white"
                              >
                                <ImagePlus className="h-[14px] w-[14px]" />
                                <span>Choisir un fichier image</span>
                              </button>
                            </div>
                            <div className="mx-auto flex w-full max-w-md items-center gap-1.5">
                              <input
                                type="url"
                                value={urlDrafts[blk.id] ?? ''}
                                onChange={(e) =>
                                  setUrlDrafts((prev) => ({ ...prev, [blk.id]: e.target.value }))
                                }
                                placeholder="Ou colle l’adresse URL d’une image…"
                                className="sg-focus-ring h-[30px] flex-1 rounded-lg border border-[#D7DCE6] bg-white px-3 text-[12px] text-[#121417]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const url = (urlDrafts[blk.id] ?? '').trim();
                                  if (!url) return;
                                  setBrokenImages((prev) => ({ ...prev, [blk.id]: false }));
                                  updateBlock(blk.id, (b) =>
                                    b.type === 'image' ? { ...b, dataUrl: url } : b,
                                  );
                                }}
                                className="sg-focus-ring h-[30px] rounded-lg bg-[#121417] px-3 text-[11.5px] font-semibold text-white"
                              >
                                Charger
                              </button>
                            </div>
                          </div>
                        )}
                        <input
                          type="text"
                          value={blk.caption}
                          onChange={(e) =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'image' ? { ...b, caption: e.target.value } : b,
                            )
                          }
                          placeholder="Légende ou commentaire sous l’image…"
                          className="sg-focus-ring rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12.5px] text-[#36393F]"
                        />
                      </div>
                    )}

                    {blk.type === 'sketch' && (
                      <div className="flex flex-col gap-2.5">
                        {sketchEditingIds[blk.id] || !blk.dataUrl ? (
                          <SketchPad
                            initialDataUrl={blk.dataUrl}
                            heightPx={320}
                            onSave={(dataUrl) => {
                              updateBlock(blk.id, (b) =>
                                b.type === 'sketch' ? { ...b, dataUrl } : b,
                              );
                              setSketchEditingIds((prev) => ({ ...prev, [blk.id]: false }));
                            }}
                            onCancel={
                              blk.dataUrl
                                ? () =>
                                    setSketchEditingIds((prev) => ({
                                      ...prev,
                                      [blk.id]: false,
                                    }))
                                : undefined
                            }
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[#E2E8F0] bg-white p-3">
                            <img
                              src={blk.dataUrl}
                              alt={blk.caption || 'Schéma dessiné'}
                              className="max-h-[360px] w-full rounded-[10px] object-contain"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setSketchEditingIds((prev) => ({ ...prev, [blk.id]: true }))
                              }
                              className="sg-focus-ring sg-btn-secondary h-[28px] rounded-full px-3 text-[11.5px] font-semibold text-[var(--accent)]"
                            >
                              Modifier le dessin
                            </button>
                          </div>
                        )}
                        <input
                          type="text"
                          value={blk.caption}
                          onChange={(e) =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'sketch' ? { ...b, caption: e.target.value } : b,
                            )
                          }
                          placeholder="Titre / légende du schéma…"
                          className="sg-focus-ring rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12.5px] text-[#36393F]"
                        />
                      </div>
                    )}

                    {blk.type === 'checklist' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1.5">
                          {blk.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateBlock(blk.id, (b) =>
                                    b.type === 'checklist'
                                      ? {
                                          ...b,
                                          items: b.items.map((it) =>
                                            it.id === item.id ? { ...it, done: !it.done } : it,
                                          ),
                                        }
                                      : b,
                                  )
                                }
                                aria-label={item.done ? `Décocher ${item.label}` : `Cocher ${item.label}`}
                                className="sg-focus-ring shrink-0 text-[var(--accent)]"
                              >
                                {item.done ? (
                                  <CheckSquare className="h-[17px] w-[17px]" />
                                ) : (
                                  <Square className="h-[17px] w-[17px] text-[#7A7D84]" />
                                )}
                              </button>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) =>
                                  updateBlock(blk.id, (b) =>
                                    b.type === 'checklist'
                                      ? {
                                          ...b,
                                          items: b.items.map((it) =>
                                            it.id === item.id ? { ...it, label: e.target.value } : it,
                                          ),
                                        }
                                      : b,
                                  )
                                }
                                className={`sg-focus-ring flex-1 rounded px-2 py-1 text-[13.5px] ${
                                  item.done ? 'text-[#7A7D84] line-through' : 'text-[#121417]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateBlock(blk.id, (b) =>
                                    b.type === 'checklist'
                                      ? { ...b, items: b.items.filter((it) => it.id !== item.id) }
                                      : b,
                                  )
                                }
                                aria-label="Retirer cette tâche"
                                className="sg-focus-ring flex h-[22px] w-[22px] items-center justify-center rounded-full text-[#7A7D84] hover:text-[#DC2626]"
                              >
                                <X className="h-[12px] w-[12px]" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const draft = (newCheckItems[blk.id] ?? '').trim();
                            if (!draft) return;
                            updateBlock(blk.id, (b) =>
                              b.type === 'checklist'
                                ? {
                                    ...b,
                                    items: [
                                      ...b.items,
                                      { id: createBlockId('chk'), label: draft, done: false },
                                    ],
                                  }
                                : b,
                            );
                            setNewCheckItems((prev) => ({ ...prev, [blk.id]: '' }));
                          }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={newCheckItems[blk.id] ?? ''}
                            onChange={(e) =>
                              setNewCheckItems((prev) => ({ ...prev, [blk.id]: e.target.value }))
                            }
                            placeholder="+ Ajouter un élément à vérifier…"
                            className="sg-focus-ring h-[32px] flex-1 rounded-lg border border-[#D7DCE6] bg-white px-3 text-[12.5px] text-[#121417]"
                          />
                          <button
                            type="submit"
                            className="sg-focus-ring sg-btn-secondary flex h-[32px] items-center gap-1 rounded-lg px-3 text-[12px] font-semibold text-[var(--accent)]"
                          >
                            <Plus className="h-[13px] w-[13px]" />
                            <span>Ajouter</span>
                          </button>
                        </form>
                      </div>
                    )}

                    {blk.type === 'flashcard' && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11.5px] font-semibold text-[#4B4E54]">
                            Question (Recto)
                            <input
                              type="text"
                              value={blk.question}
                              onChange={(e) =>
                                updateBlock(blk.id, (b) =>
                                  b.type === 'flashcard' ? { ...b, question: e.target.value } : b,
                                )
                              }
                              className="sg-focus-ring mt-1 h-[34px] w-full rounded-lg border border-[#D7DCE6] bg-white px-3 text-[13px] font-semibold text-[#121417]"
                            />
                          </label>
                          <label className="text-[11.5px] font-semibold text-[#4B4E54]">
                            Réponse (Verso)
                            <input
                              type="text"
                              value={blk.answer}
                              onChange={(e) =>
                                updateBlock(blk.id, (b) =>
                                  b.type === 'flashcard' ? { ...b, answer: e.target.value } : b,
                                )
                              }
                              className="sg-focus-ring mt-1 h-[34px] w-full rounded-lg border border-[#D7DCE6] bg-white px-3 text-[13px] text-[#36393F]"
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFlippedCards((prev) => ({
                              ...prev,
                              [blk.id]: !prev[blk.id],
                            }))
                          }
                          className="sg-focus-ring flex min-h-[116px] flex-col items-start justify-between rounded-[16px] border border-[var(--accent-border)]/45 bg-[var(--accent-soft)]/55 p-4 text-left transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          <div className="flex w-full items-center justify-between text-[11px] font-bold text-[var(--accent)]">
                            <span>{flippedCards[blk.id] ? 'Réponse' : 'Question · Cliquer pour retourner'}</span>
                            <FlipHorizontal2 className="h-[15px] w-[15px]" />
                          </div>
                          <div className="text-[15px] font-bold text-[#121417]">
                            {flippedCards[blk.id] ? blk.answer : blk.question}
                          </div>
                        </button>
                      </div>
                    )}

                    {blk.type === 'formula' && (
                      <div className="flex flex-col gap-2 rounded-[16px] border border-[var(--accent-border)]/40 bg-[var(--accent-soft)]/45 p-3.5">
                        <input
                          type="text"
                          value={blk.label}
                          onChange={(e) =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'formula' ? { ...b, label: e.target.value } : b,
                            )
                          }
                          placeholder="Nom de la règle / théorème / formule…"
                          className="sg-focus-ring rounded bg-transparent px-1 text-[12px] font-bold text-[var(--accent)]"
                        />
                        <input
                          type="text"
                          value={blk.expression}
                          onChange={(e) =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'formula' ? { ...b, expression: e.target.value } : b,
                            )
                          }
                          placeholder="Ex : Δ = b² - 4ac, U = R × I, définition exacte…"
                          className="sg-focus-ring rounded-xl border border-white bg-white px-3.5 py-2.5 font-mono text-[15px] font-semibold text-[#121417]"
                        />
                        <input
                          type="text"
                          value={blk.explanation ?? ''}
                          onChange={(e) =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'formula' ? { ...b, explanation: e.target.value } : b,
                            )
                          }
                          placeholder="Condition d’application ou précision (optionnel)…"
                          className="sg-focus-ring rounded bg-white/70 px-3 py-1.5 text-[12.5px] text-[#36393F]"
                        />
                      </div>
                    )}

                    {blk.type === 'table' && (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={blk.leftHeader}
                            onChange={(e) =>
                              updateBlock(blk.id, (b) =>
                                b.type === 'table' ? { ...b, leftHeader: e.target.value } : b,
                              )
                            }
                            className="sg-focus-ring rounded-lg bg-[#EFF3FA] px-3 py-1.5 text-[12.5px] font-bold text-[#121417]"
                          />
                          <input
                            type="text"
                            value={blk.rightHeader}
                            onChange={(e) =>
                              updateBlock(blk.id, (b) =>
                                b.type === 'table' ? { ...b, rightHeader: e.target.value } : b,
                              )
                            }
                            className="sg-focus-ring rounded-lg bg-[#EFF3FA] px-3 py-1.5 text-[12.5px] font-bold text-[#121417]"
                          />
                        </div>
                        {blk.rows.map((row) => (
                          <div key={row.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={row.left}
                              placeholder="Colonne 1…"
                              onChange={(e) =>
                                updateBlock(blk.id, (b) =>
                                  b.type === 'table'
                                    ? {
                                        ...b,
                                        rows: b.rows.map((r) =>
                                          r.id === row.id ? { ...r, left: e.target.value } : r,
                                        ),
                                      }
                                    : b,
                                )
                              }
                              className="sg-focus-ring flex-1 rounded-lg border border-[#D7DCE6] bg-white px-3 py-1.5 text-[13px] text-[#121417]"
                            />
                            <input
                              type="text"
                              value={row.right}
                              placeholder="Colonne 2…"
                              onChange={(e) =>
                                updateBlock(blk.id, (b) =>
                                  b.type === 'table'
                                    ? {
                                        ...b,
                                        rows: b.rows.map((r) =>
                                          r.id === row.id ? { ...r, right: e.target.value } : r,
                                        ),
                                      }
                                    : b,
                                )
                              }
                              className="sg-focus-ring flex-1 rounded-lg border border-[#D7DCE6] bg-white px-3 py-1.5 text-[13px] text-[#121417]"
                            />
                            {blk.rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateBlock(blk.id, (b) =>
                                    b.type === 'table'
                                      ? { ...b, rows: b.rows.filter((r) => r.id !== row.id) }
                                      : b,
                                  )
                                }
                                aria-label="Supprimer cette ligne"
                                className="sg-focus-ring flex h-[24px] w-[24px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                              >
                                <X className="h-[12px] w-[12px]" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(blk.id, (b) =>
                              b.type === 'table'
                                ? {
                                    ...b,
                                    rows: [...b.rows, { id: createBlockId('row'), left: '', right: '' }],
                                  }
                                : b,
                            )
                          }
                          className="sg-focus-ring sg-btn-secondary flex h-[28px] w-fit items-center gap-1 rounded-full px-3 text-[11.5px] font-semibold text-[var(--accent)]"
                        >
                          <Plus className="h-[12px] w-[12px]" />
                          <span>Ajouter une ligne</span>
                        </button>
                      </div>
                    )}

                    {blk.type === 'timer' && (
                      <StudyTimerBlock
                        label={blk.label}
                        minutes={blk.minutes}
                        onChange={(next) =>
                          updateBlock(blk.id, (b) =>
                            b.type === 'timer'
                              ? { ...b, label: next.label, minutes: next.minutes }
                              : b,
                          )
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Tutor novelty analysis result */}
              {activeAnalysis?.error && (
                <p className="text-[12.5px] font-medium text-[#991B1B]">{activeAnalysis.error}</p>
              )}

              {activeAnalysis?.result && (
                <div className="rounded-[20px] border border-[var(--accent-border)]/45 bg-white/90 p-4 text-[13px] leading-relaxed text-[#121417]">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--accent)]">
                    <Sparkles className="h-[14px] w-[14px]" />
                    <span>Analyse de {tutor?.name ?? 'ton tuteur'}</span>
                  </div>
                  <p className="mt-1">{activeAnalysis.result.summary}</p>
                  {activeAnalysis.result.keyPoints.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[12.5px] text-[#36393F]">
                      {activeAnalysis.result.keyPoints.map((pt, i) => (
                        <li key={i}>• {pt}</li>
                      ))}
                    </ul>
                  )}
                  {activeAnalysis.result.suggestedQuestion && (
                    <p className="mt-2 font-semibold text-[var(--accent)]">
                      Défi rapide : {activeAnalysis.result.suggestedQuestion}
                    </p>
                  )}
                </div>
              )}
            </article>
          </div>
        ) : (
          <div className="mx-auto flex h-[calc(100vh-132px)] min-h-[420px] w-full max-w-[980px] flex-col">
            <div className="@container flex min-h-0 flex-1 flex-col [&>*]:flex-1 [&>*]:h-full">
              {activeSlot?.render()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};
