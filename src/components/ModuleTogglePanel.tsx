import React from 'react';

interface ModuleTogglePanelProps {
  reformHighlight: string;
  switchOn: boolean;
  onToggleSwitch: () => void;
  onOpenDocuments: () => void;
}

export const ModuleTogglePanel: React.FC<ModuleTogglePanelProps> = ({
  reformHighlight,
  switchOn,
  onToggleSwitch,
  onOpenDocuments,
}) => {
  return (
    <section
      aria-label="Réformes et affichage"
      className="sg-card-l3 flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[18px] md:h-full md:min-h-0"
    >
      {/* Top area */}
      <div className="p-4 pb-2">
        <span className="inline-flex items-center rounded-full bg-[#141414] px-3 py-1 text-[11px] font-semibold text-white">
          Repères & Réformes
        </span>
        <p className="mt-2 text-xs leading-relaxed text-[#3A3C40] line-clamp-3">
          {reformHighlight}
        </p>
      </div>

      {/* Inset warm-stone bottom drawer */}
      <div className="mx-[3px] mb-[3px] flex flex-col justify-between gap-3 rounded-[15px] border border-[#D4D4CF] bg-[#EBEBE6] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-[#141414]">Vue détaillée</div>
            <div className="text-[11px] text-[#66686C]">
              {switchOn ? 'Notions complètes' : 'Résumé synthétique'}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            aria-label="Basculer entre vue détaillée et synthétique"
            onClick={onToggleSwitch}
            className={`sg-focus-ring flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-all duration-150 ${
              switchOn
                ? 'bg-[#0E4FD6] shadow-[0_0_14px_rgba(37,99,235,0.6)] ring-2 ring-[#60A5FA]/35'
                : 'border border-[#A4A5A2] bg-[#C8C9C5]'
            }`}
          >
            <span
              className={`h-[12px] w-[12px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
                switchOn ? 'translate-x-[14px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenDocuments}
          className="sg-focus-ring sg-btn-primary h-[34px] w-full whitespace-nowrap rounded-full text-xs font-semibold text-white transition-all duration-150"
        >
          Ouvrir les guides PDF
        </button>
      </div>
    </section>
  );
};
