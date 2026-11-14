import React, { useRef, useState } from 'react';
import {
  CheckSquare,
  FlipHorizontal2,
  ImagePlus,
  Loader2,
  PencilLine,
  Plus,
  ScanSearch,
  Sigma,
  Square,
  Table2,
  Timer,
  Trash2,
  Type,
  X,
} from 'lucide-react';
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
import { NoveltyAnalysisResult } from '../utils/tutorAgent';
import { SketchPad } from './SketchPad';
import { StudyTimerBlock } from './StudyTimerBlock';

interface CustomTileCardProps {
  tile: TileRect;
  locked: boolean;
  tutorName?: string;
  availableSubjects?: string[];
  analysisState?: { loading: boolean; error?: string; result?: NoveltyAnalysisResult };
  onUpdateTile: (updated: TileRect) => void;
  onDeleteTile: () => void;
  onAnalyzeTile?: () => void;
  onOpenFullPage?: () => void;
}

export const CustomTileCard: React.FC<CustomTileCardProps> = ({
  tile,
  locked,
  tutorName,
  availableSubjects = [],
  analysisState,
  onUpdateTile,
  onDeleteTile,
  onAnalyzeTile,
  onOpenFullPage,
}) => {
  const blocks = normalizeTileBlocks(tile);
  const themeKey: CustomTileTheme = tile.theme ?? 'default';
  const themeStyle = CUSTOM_TILE_THEME_STYLES[themeKey] ?? CUSTOM_TILE_THEME_STYLES.default;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetImageBlockIdRef = useRef<string | null>(null);

  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [sketchEditorBlockId, setSketchEditorBlockId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [newCheckItems, setNewCheckItems] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const commitTileUpdate = (patch: Partial<TileRect>, nextBlocks?: CustomTileBlock[]) => {
    const resolvedBlocks = nextBlocks ?? blocks;
    const candidate: TileRect = {
      ...tile,
      ...patch,
      blocks: resolvedBlocks,
    };
    onUpdateTile({
      ...candidate,
      note: summarizeCustomTileText(candidate),
    });
  };

  const updateBlock = (blockId: string, updater: (blk: CustomTileBlock) => CustomTileBlock) => {
    const nextBlocks = blocks.map((b) => (b.id === blockId ? updater(b) : b));
    commitTileUpdate({}, nextBlocks);
  };

  const removeBlock = (blockId: string) => {
    const remaining = blocks.filter((b) => b.id !== blockId);
    commitTileUpdate({}, remaining.length > 0 ? remaining : [createBlock('text', { text: '' })]);
  };

  const handleAddBlock = (type: CustomTileBlockType) => {
    const blk = createBlock(type);
    const hasOnlyEmptyText =
      blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].text.trim();
    const nextBlocks = hasOnlyEmptyText && type !== 'text' ? [blk] : [...blocks, blk];
    commitTileUpdate({}, nextBlocks);
    if (type === 'sketch') {
      setSketchEditorBlockId(blk.id);
    } else if (type === 'flashcard') {
      setEditingCardId(blk.id);
    }
  };

  const handleApplyTemplate = (templateId: CustomTileTemplateId) => {
    const tpl = buildTemplateBlocks(templateId, tile.subject);
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
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files?.length) {
      await handleImageFiles(event.dataTransfer.files);
    }
  };

  const isBlankTile =
    blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].text.trim();
  const checklistStats = computeChecklistStats(blocks);

  return (
    <section
      aria-label={tile.title || 'Carreau personnalisé'}
      onPaste={(e) => void handlePaste(e)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => void handleDrop(e)}
      className={`${themeStyle.surfaceClass} relative flex h-full w-full min-w-0 flex-col justify-between gap-2 overflow-hidden rounded-[22px] px-3.5 pt-5 pb-3 transition-shadow ${
        isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
      }`}
    >
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

      {/* Header row with generous top padding clear of hover expand handle */}
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <input
            type="text"
            value={tile.title ?? ''}
            onChange={(e) => commitTileUpdate({ title: e.target.value })}
            aria-label="Titre du carreau"
            placeholder="Titre du carreau…"
            className="sg-focus-ring min-w-0 flex-1 rounded-md bg-transparent px-1 text-[13px] font-bold text-[#121417] placeholder:text-[#7A7D84]"
          />
          {availableSubjects.length > 0 && (
            <select
              value={tile.subject ?? ''}
              onChange={(e) =>
                commitTileUpdate({ subject: e.target.value || undefined })
              }
              aria-label="Matière associée au carreau"
              className="sg-focus-ring max-w-[92px] truncate rounded-full border border-white/80 bg-white/65 px-2 py-0.5 text-[10px] font-semibold text-[#36393F]"
            >
              <option value="">Matière</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onAnalyzeTile && (
            <button
              type="button"
              disabled={analysisState?.loading}
              onClick={onAnalyzeTile}
              aria-label={`Analyser ${tile.title || 'ce carreau'} avec ${tutorName ?? 'le tuteur'}`}
              title={`Analyser avec ${tutorName ?? 'le tuteur'}`}
              className="sg-focus-ring sg-btn-secondary flex h-[23px] shrink-0 items-center gap-1 rounded-full px-2 text-[10px] font-semibold text-[var(--accent)] whitespace-nowrap"
            >
              {analysisState?.loading ? (
                <Loader2 className="h-[10.5px] w-[10.5px] animate-spin" />
              ) : (
                <ScanSearch className="h-[10.5px] w-[10.5px]" strokeWidth={2.2} />
              )}
              <span>{tutorName ?? 'Analyser'}</span>
            </button>
          )}
          {!locked && (
            <button
              type="button"
              onClick={onDeleteTile}
              aria-label={`Supprimer ${tile.title || 'ce carreau'}`}
              title="Supprimer ce carreau"
              className="sg-focus-ring flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full text-[#55585F] transition-colors hover:bg-white/85 hover:text-[#DC2626]"
            >
              <Trash2 className="h-[12.5px] w-[12.5px]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Starter template quick strip when blank */}
      {isBlankTile && (
        <div className="flex shrink-0 flex-wrap items-center gap-1 text-[10px]">
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
              className="sg-focus-ring rounded-md border border-white/85 bg-white/70 px-1.5 py-0.5 font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] whitespace-nowrap"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}

      {/* Multi-block interactive studio area */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {blocks.map((blk) => {
          if (blk.type === 'text') {
            return (
              <div
                key={blk.id}
                className="group/blk relative rounded-[12px] border border-white/80 bg-white/70 p-2"
              >
                {blocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBlock(blk.id)}
                    aria-label="Supprimer ce bloc texte"
                    className="sg-focus-ring absolute top-1.5 right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/90 text-[#666A72] opacity-0 transition-opacity group-hover/blk:opacity-100 hover:text-[#DC2626] focus-visible:opacity-100"
                  >
                    <X className="h-[10px] w-[10px]" />
                  </button>
                )}
                <textarea
                  rows={blocks.length === 1 ? 3 : 2}
                  value={blk.text}
                  onChange={(e) =>
                    updateBlock(blk.id, (b) =>
                      b.type === 'text' ? { ...b, text: e.target.value } : b,
                    )
                  }
                  aria-label="Zone d’écriture du carreau"
                  placeholder="Écris tes notes, résumés, exemples ou colles une image (Ctrl+V)…"
                  className="sg-focus-ring w-full resize-none bg-transparent text-[11.5px] leading-relaxed text-[#1C1E22] placeholder:text-[#666A72]"
                />
              </div>
            );
          }

          if (blk.type === 'image') {
            const hasBroken = brokenImages[blk.id];
            return (
              <div
                key={blk.id}
                className="relative flex flex-col gap-1.5 rounded-[12px] border border-white/85 bg-white/80 p-2"
              >
                <div className="flex items-center justify-between gap-1 text-[10.5px] font-semibold text-[#4B4E54]">
                  <span>Image</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => triggerImagePicker(blk.id)}
                      className="sg-focus-ring rounded px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] whitespace-nowrap"
                    >
                      Changer
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(blk.id)}
                      aria-label="Supprimer cette image"
                      className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                    >
                      <X className="h-[10.5px] w-[10.5px]" />
                    </button>
                  </div>
                </div>

                {blk.dataUrl && !hasBroken ? (
                  <button
                    type="button"
                    onClick={onOpenFullPage}
                    className="sg-focus-ring overflow-hidden rounded-[9px] border border-[#E2E8F0] bg-[#F8FAFC]"
                    title="Ouvrir le carreau en page pour voir en grand"
                  >
                    <img
                      src={blk.dataUrl}
                      alt={blk.caption || 'Illustration ajoutée au carreau'}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [blk.id]: true }))
                      }
                      className="max-h-[140px] w-full object-contain"
                    />
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5 rounded-[9px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => triggerImagePicker(blk.id)}
                      className="sg-focus-ring sg-btn-secondary mx-auto flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[var(--accent)] whitespace-nowrap"
                    >
                      <ImagePlus className="h-[12.5px] w-[12.5px]" />
                      <span>Choisir une image</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <input
                        type="url"
                        value={urlDrafts[blk.id] ?? ''}
                        onChange={(e) =>
                          setUrlDrafts((prev) => ({ ...prev, [blk.id]: e.target.value }))
                        }
                        placeholder="Ou coller l’adresse d’une image…"
                        aria-label="Adresse URL de l’image"
                        className="sg-focus-ring h-[24px] min-w-0 flex-1 rounded-md border border-[#D7DCE6] bg-white px-2 text-[10.5px] text-[#121417]"
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
                        className="sg-focus-ring h-[24px] rounded-md bg-[#121417] px-2 text-[10px] font-semibold text-white whitespace-nowrap"
                      >
                        OK
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
                  placeholder="Légende ou explication de l’image…"
                  aria-label="Légende de l’image"
                  className="sg-focus-ring w-full rounded bg-transparent px-1 text-[10.5px] text-[#4B4E54] placeholder:text-[#8E939E]"
                />
              </div>
            );
          }

          if (blk.type === 'sketch') {
            const editingThis = sketchEditorBlockId === blk.id || !blk.dataUrl;
            return (
              <div
                key={blk.id}
                className="flex flex-col gap-1.5 rounded-[12px] border border-white/85 bg-white/85 p-2"
              >
                <div className="flex items-center justify-between gap-1 text-[10.5px] font-semibold text-[#4B4E54]">
                  <span>Croquis / Schéma</span>
                  <div className="flex items-center gap-1">
                    {blk.dataUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setSketchEditorBlockId((cur) =>
                            cur === blk.id ? null : blk.id,
                          )
                        }
                        className="sg-focus-ring rounded px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] whitespace-nowrap"
                      >
                        {editingThis ? 'Aperçu' : 'Redessiner'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeBlock(blk.id)}
                      aria-label="Supprimer ce croquis"
                      className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                    >
                      <X className="h-[10.5px] w-[10.5px]" />
                    </button>
                  </div>
                </div>

                {editingThis ? (
                  <SketchPad
                    initialDataUrl={blk.dataUrl}
                    heightPx={150}
                    onSave={(dataUrl) => {
                      updateBlock(blk.id, (b) =>
                        b.type === 'sketch' ? { ...b, dataUrl } : b,
                      );
                      setSketchEditorBlockId(null);
                    }}
                    onCancel={blk.dataUrl ? () => setSketchEditorBlockId(null) : undefined}
                  />
                ) : (
                  <img
                    src={blk.dataUrl}
                    alt={blk.caption || 'Schéma dessiné'}
                    className="max-h-[135px] w-full rounded-[9px] border border-[#E2E8F0] bg-white object-contain"
                  />
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
                  aria-label="Légende du schéma"
                  className="sg-focus-ring w-full rounded bg-transparent px-1 text-[10.5px] text-[#4B4E54]"
                />
              </div>
            );
          }

          if (blk.type === 'checklist') {
            return (
              <div
                key={blk.id}
                className="flex flex-col gap-1.5 rounded-[12px] border border-white/85 bg-white/80 p-2"
              >
                <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#4B4E54]">
                  <span>
                    Checklist ({checklistStats.done}/{checklistStats.total})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBlock(blk.id)}
                    aria-label="Supprimer cette liste"
                    className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                  >
                    <X className="h-[10.5px] w-[10.5px]" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  {blk.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5">
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
                          <CheckSquare className="h-[14px] w-[14px]" />
                        ) : (
                          <Square className="h-[14px] w-[14px] text-[#7A7D84]" />
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
                                    it.id === item.id
                                      ? { ...it, label: e.target.value }
                                      : it,
                                  ),
                                }
                              : b,
                          )
                        }
                        className={`sg-focus-ring min-w-0 flex-1 bg-transparent text-[11px] ${
                          item.done ? 'text-[#7A7D84] line-through' : 'text-[#1C1E22]'
                        }`}
                      />
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
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={newCheckItems[blk.id] ?? ''}
                    onChange={(e) =>
                      setNewCheckItems((prev) => ({ ...prev, [blk.id]: e.target.value }))
                    }
                    placeholder="+ Ajouter une tâche…"
                    aria-label="Nouvel élément de checklist"
                    className="sg-focus-ring h-[23px] min-w-0 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 text-[10.5px] text-[#121417]"
                  />
                  <button
                    type="submit"
                    aria-label="Ajouter à la checklist"
                    className="sg-focus-ring flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]"
                  >
                    <Plus className="h-[11px] w-[11px]" />
                  </button>
                </form>
              </div>
            );
          }

          if (blk.type === 'flashcard') {
            const flipped = Boolean(flippedCardIds[blk.id]);
            const isEditing = editingCardId === blk.id;
            return (
              <div
                key={blk.id}
                className="flex flex-col gap-1 rounded-[12px] border border-[var(--accent-border)]/45 bg-white/85 p-2"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--accent)]">
                  <span>{flipped ? 'Réponse' : 'Carte mémoire · Cliquer pour retourner'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCardId((cur) => (cur === blk.id ? null : blk.id))
                      }
                      className="sg-focus-ring rounded px-1.5 py-0.5 font-semibold text-[#4B4E54] hover:bg-[#F1F5F9]"
                    >
                      {isEditing ? 'OK' : 'Éditer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(blk.id)}
                      aria-label="Supprimer cette carte"
                      className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                    >
                      <X className="h-[10.5px] w-[10.5px]" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={blk.question}
                      onChange={(e) =>
                        updateBlock(blk.id, (b) =>
                          b.type === 'flashcard' ? { ...b, question: e.target.value } : b,
                        )
                      }
                      placeholder="Question / Recto…"
                      aria-label="Question de la carte"
                      className="sg-focus-ring h-[26px] rounded-md border border-[#D7DCE6] bg-white px-2 text-[11px] font-semibold text-[#121417]"
                    />
                    <input
                      type="text"
                      value={blk.answer}
                      onChange={(e) =>
                        updateBlock(blk.id, (b) =>
                          b.type === 'flashcard' ? { ...b, answer: e.target.value } : b,
                        )
                      }
                      placeholder="Réponse / Verso…"
                      aria-label="Réponse de la carte"
                      className="sg-focus-ring h-[26px] rounded-md border border-[#D7DCE6] bg-white px-2 text-[11px] text-[#36393F]"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setFlippedCardIds((prev) => ({
                        ...prev,
                        [blk.id]: !prev[blk.id],
                      }))
                    }
                    className="sg-focus-ring flex items-center justify-between gap-2 rounded-[9px] bg-[#F7F9FF] px-2.5 py-2 text-left text-[11.5px] font-semibold text-[#121417]"
                  >
                    <span className="min-w-0 flex-1">
                      {flipped ? blk.answer : blk.question}
                    </span>
                    <FlipHorizontal2 className="h-[13px] w-[13px] shrink-0 text-[var(--accent)]" />
                  </button>
                )}
              </div>
            );
          }

          if (blk.type === 'formula') {
            return (
              <div
                key={blk.id}
                className="flex flex-col gap-1 rounded-[12px] border border-[var(--accent-border)]/45 bg-[var(--accent-soft)]/50 p-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <input
                    type="text"
                    value={blk.label}
                    onChange={(e) =>
                      updateBlock(blk.id, (b) =>
                        b.type === 'formula' ? { ...b, label: e.target.value } : b,
                      )
                    }
                    aria-label="Titre de la formule"
                    className="sg-focus-ring min-w-0 flex-1 bg-transparent text-[10.5px] font-bold text-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeBlock(blk.id)}
                    aria-label="Supprimer cette formule"
                    className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                  >
                    <X className="h-[10.5px] w-[10.5px]" />
                  </button>
                </div>
                <input
                  type="text"
                  value={blk.expression}
                  onChange={(e) =>
                    updateBlock(blk.id, (b) =>
                      b.type === 'formula' ? { ...b, expression: e.target.value } : b,
                    )
                  }
                  placeholder="Ex : E = mc², Δ = b² - 4ac, définition clé…"
                  aria-label="Formule ou définition"
                  className="sg-focus-ring rounded-md bg-white/85 px-2 py-1 font-mono text-[11.5px] font-semibold text-[#121417]"
                />
              </div>
            );
          }

          if (blk.type === 'table') {
            return (
              <div
                key={blk.id}
                className="flex flex-col gap-1 rounded-[12px] border border-white/85 bg-white/80 p-2"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#4B4E54]">
                  <span>Tableau comparatif</span>
                  <button
                    type="button"
                    onClick={() => removeBlock(blk.id)}
                    aria-label="Supprimer ce tableau"
                    className="sg-focus-ring flex h-[18px] w-[18px] items-center justify-center rounded-full text-[#666A72] hover:text-[#DC2626]"
                  >
                    <X className="h-[10.5px] w-[10.5px]" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                  <input
                    type="text"
                    value={blk.leftHeader}
                    onChange={(e) =>
                      updateBlock(blk.id, (b) =>
                        b.type === 'table' ? { ...b, leftHeader: e.target.value } : b,
                      )
                    }
                    className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-bold text-[#121417]"
                  />
                  <input
                    type="text"
                    value={blk.rightHeader}
                    onChange={(e) =>
                      updateBlock(blk.id, (b) =>
                        b.type === 'table' ? { ...b, rightHeader: e.target.value } : b,
                      )
                    }
                    className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-bold text-[#121417]"
                  />
                  {blk.rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <input
                        type="text"
                        value={row.left}
                        placeholder="…"
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
                        className="rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[#1C1E22]"
                      />
                      <input
                        type="text"
                        value={row.right}
                        placeholder="…"
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
                        className="rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[#1C1E22]"
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          }

          if (blk.type === 'timer') {
            return (
              <div key={blk.id} className="relative">
                <button
                  type="button"
                  onClick={() => removeBlock(blk.id)}
                  aria-label="Supprimer le minuteur"
                  className="sg-focus-ring absolute -top-1 -right-1 z-10 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-white text-[#666A72] shadow-xs hover:text-[#DC2626]"
                >
                  <X className="h-[9.5px] w-[9.5px]" />
                </button>
                <StudyTimerBlock
                  label={blk.label}
                  minutes={blk.minutes}
                  compact
                  onChange={(next) =>
                    updateBlock(blk.id, (b) =>
                      b.type === 'timer'
                        ? { ...b, label: next.label, minutes: next.minutes }
                        : b,
                    )
                  }
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {analysisState?.error && (
        <p className="shrink-0 text-[10.5px] font-medium text-[#991B1B]">
          {analysisState.error}
        </p>
      )}

      {analysisState?.result && (
        <div className="sg-glass-subtile shrink-0 rounded-[10px] px-2.5 py-1.5 text-[10.5px] leading-snug text-[#121417]">
          <span className="font-bold text-[var(--accent)]">
            {tutorName ?? 'Tuteur'} :{' '}
          </span>
          <span className="line-clamp-2">{analysisState.result.summary}</span>
        </div>
      )}

      {/* Rich bottom action strip (always single row) */}
      <div className="flex shrink-0 flex-nowrap items-center gap-1 overflow-x-auto border-t border-white/75 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => handleAddBlock('text')}
          aria-label="Ajouter du texte"
          title="Ajouter un bloc texte"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <Type className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Texte</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('image')}
          aria-label="Ajouter une image"
          title="Importer ou lier une image"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <ImagePlus className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Image</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('sketch')}
          aria-label="Ajouter un croquis"
          title="Dessiner un schéma"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <PencilLine className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Dessin</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('checklist')}
          aria-label="Ajouter une checklist"
          title="Checklist de révision"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <CheckSquare className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Liste</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('flashcard')}
          aria-label="Ajouter une carte mémoire"
          title="Carte question / réponse"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <FlipHorizontal2 className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Carte</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('formula')}
          aria-label="Ajouter une formule"
          title="Formule ou définition clé"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <Sigma className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Formule</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('table')}
          aria-label="Ajouter un tableau"
          title="Tableau comparatif"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <Table2 className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Tableau</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock('timer')}
          aria-label="Ajouter un minuteur"
          title="Chronomètre d’étude"
          className="sg-focus-ring flex h-[22px] shrink-0 items-center gap-1 rounded-md bg-white/80 px-1.5 text-[10px] font-semibold text-[#1C1E22] hover:bg-white whitespace-nowrap"
        >
          <Timer className="h-[10px] w-[10px] text-[var(--accent)]" />
          <span>Chrono</span>
        </button>
      </div>
    </section>
  );
};
