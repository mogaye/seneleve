import React, { useEffect, useRef, useState } from 'react';
import { Eraser, Grid, RotateCcw, Save, Trash2 } from 'lucide-react';

interface SketchPadProps {
  initialDataUrl?: string;
  heightPx?: number;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

const PEN_COLORS = [
  { id: 'ink', label: 'Noir', hex: '#121417' },
  { id: 'blue', label: 'Bleu', hex: '#0E4FD6' },
  { id: 'green', label: 'Vert', hex: '#0D8A4E' },
  { id: 'amber', label: 'Ambre', hex: '#B85D04' },
  { id: 'red', label: 'Rouge', hex: '#C81E2B' },
] as const;

export const SketchPad: React.FC<SketchPadProps> = ({
  initialDataUrl,
  heightPx = 280,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);

  const [color, setColor] = useState<string>('#121417');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  const paintBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 960;
    canvas.height = Math.round((heightPx / 480) * 960);
    paintBackground(ctx, canvas.width, canvas.height);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        paintBackground(ctx, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        historyRef.current = [canvas.toDataURL('image/png')];
        setCanUndo(false);
      };
      img.src = initialDataUrl;
    } else {
      historyRef.current = [canvas.toDataURL('image/png')];
      setCanUndo(false);
    }
  }, [initialDataUrl, heightPx]);

  const getCoords = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * canvas.width,
      y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * canvas.height,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    event.preventDefault();
    event.stopPropagation();
    canvas.setPointerCapture(event.pointerId);

    const pt = getCoords(event);
    drawingRef.current = true;
    lastPointRef.current = pt;

    ctx.beginPath();
    ctx.arc(
      pt.x,
      pt.y,
      (eraserMode ? lineWidth * 3 : lineWidth) / 2,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = eraserMode ? '#FFFFFF' : color;
    ctx.fill();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prev = lastPointRef.current;
    if (!canvas || !ctx || !prev) return;

    event.preventDefault();
    const next = getCoords(event);

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.strokeStyle = eraserMode ? '#FFFFFF' : color;
    ctx.lineWidth = eraserMode ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPointRef.current = next;
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snap = canvas.toDataURL('image/png');
    historyRef.current = [...historyRef.current.slice(-14), snap];
    setCanUndo(historyRef.current.length > 1);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || historyRef.current.length <= 1) return;
    const nextHistory = historyRef.current.slice(0, -1);
    const prevSnap = nextHistory[nextHistory.length - 1];
    historyRef.current = nextHistory;
    setCanUndo(nextHistory.length > 1);
    const img = new Image();
    img.onload = () => {
      paintBackground(ctx, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = prevSnap;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    paintBackground(ctx, canvas.width, canvas.height);
    const snap = canvas.toDataURL('image/png');
    historyRef.current = [...historyRef.current.slice(-14), snap];
    setCanUndo(historyRef.current.length > 1);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div
      data-no-swipe="true"
      className="flex flex-col gap-2.5 rounded-[16px] border border-[#D7DCE6] bg-white p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {PEN_COLORS.map((c) => {
            const active = !eraserMode && color === c.hex;
            return (
              <button
                key={c.id}
                type="button"
                aria-label={`Couleur ${c.label}`}
                title={c.label}
                onClick={() => {
                  setEraserMode(false);
                  setColor(c.hex);
                }}
                className={`sg-focus-ring h-[22px] w-[22px] rounded-full border-2 transition-transform ${
                  active ? 'scale-110 border-[#121417]' : 'border-white shadow-xs'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}

          <div className="mx-1 h-4 w-px bg-[#E2E8F0]" aria-hidden="true" />

          {[
            { label: 'Fin', size: 2.5 },
            { label: 'Moyen', size: 4.5 },
            { label: 'Épais', size: 8 },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                setEraserMode(false);
                setLineWidth(opt.size);
              }}
              className={`sg-focus-ring h-[24px] rounded-md px-2 text-[11px] font-semibold whitespace-nowrap ${
                !eraserMode && lineWidth === opt.size
                  ? 'bg-[#121417] text-white'
                  : 'bg-[#F1F5F9] text-[#36393F] hover:bg-[#E2E8F0]'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setEraserMode((v) => !v)}
            aria-pressed={eraserMode}
            className={`sg-focus-ring flex h-[24px] items-center gap-1 rounded-md px-2 text-[11px] font-semibold whitespace-nowrap ${
              eraserMode
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[#F1F5F9] text-[#36393F] hover:bg-[#E2E8F0]'
            }`}
          >
            <Eraser className="h-[11.5px] w-[11.5px]" />
            <span>Gomme</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            aria-pressed={showGrid}
            title="Afficher le quadrillage"
            className={`sg-focus-ring flex h-[24px] items-center gap-1 rounded-md px-2 text-[11px] font-semibold whitespace-nowrap ${
              showGrid
                ? 'bg-[#E8F0FE] text-[#0E4FD6]'
                : 'bg-[#F1F5F9] text-[#36393F] hover:bg-[#E2E8F0]'
            }`}
          >
            <Grid className="h-[11.5px] w-[11.5px]" />
            <span>Grille</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={handleUndo}
            aria-label="Annuler le dernier trait"
            className="sg-focus-ring flex h-[24px] items-center gap-1 rounded-md bg-[#F1F5F9] px-2 text-[11px] font-semibold text-[#36393F] disabled:opacity-40 whitespace-nowrap"
          >
            <RotateCcw className="h-[11px] w-[11px]" />
            <span>Annuler</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Effacer le dessin"
            className="sg-focus-ring flex h-[24px] items-center gap-1 rounded-md bg-[#FEE2E2] px-2 text-[11px] font-semibold text-[#991B1B] whitespace-nowrap"
          >
            <Trash2 className="h-[11px] w-[11px]" />
            <span>Effacer</span>
          </button>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-[12px] border border-[#E2E8F0]"
        style={{
          height: `${heightPx}px`,
          backgroundImage: showGrid
            ? 'linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)'
            : undefined,
          backgroundSize: showGrid ? '20px 20px' : undefined,
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full cursor-crosshair touch-none opacity-95"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="sg-focus-ring sg-nav-idle h-[30px] rounded-full px-3.5 text-[11.5px] font-semibold text-[#1C1E22] whitespace-nowrap"
          >
            Fermer
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="sg-focus-ring sg-btn-primary flex h-[30px] items-center gap-1.5 rounded-full px-4 text-[11.5px] font-semibold text-white whitespace-nowrap"
        >
          <Save className="h-[12px] w-[12px]" />
          <span>Enregistrer le croquis</span>
        </button>
      </div>
    </div>
  );
};
