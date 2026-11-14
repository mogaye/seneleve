import React from 'react';
import { ExternalLink, Search, X } from 'lucide-react';
import { type CurriculumClassItem, type CycleDefinition } from '../data/senegalCurriculum';

interface HeroPanelProps {
  cycle: CycleDefinition;
  classItem: CurriculumClassItem;
  activePill: number;
  detailedMode: boolean;
  showReadingGuide: boolean;
  showSearch: boolean;
  showDomainsOverview: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectPill: (index: number) => void;
  onNextClass: () => void;
  onToggleReadingGuide: () => void;
}

const TAB_LABELS = ['Programme', 'Notions & Séries', 'Évaluation', 'Guides & PDF'];

export const HeroPanel: React.FC<HeroPanelProps> = ({
  cycle,
  classItem,
  activePill,
  detailedMode,
  showReadingGuide,
  showSearch,
  showDomainsOverview,
  searchQuery,
  onSearchChange,
  onSelectPill,
  onNextClass,
  onToggleReadingGuide,
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSubjects = classItem.subjects.filter((subject) => {
    if (!normalizedQuery) return true;
    return (
      subject.name.toLowerCase().includes(normalizedQuery) ||
      subject.items.some((item) => item.toLowerCase().includes(normalizedQuery))
    );
  });

  const linksToShow = classItem.links ?? cycle.links;

  return (
    <section
      aria-label={`Contenu du programme : ${classItem.title}`}
      className="sg-card-l2 flex min-h-[340px] flex-col justify-between rounded-[18px] p-4 md:h-full md:min-h-0 md:p-[18px]"
    >
      {/* Top header row: 1 dark cycle pill + 4 tab pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7E7E2]">
        <button
          type="button"
          onClick={onToggleReadingGuide}
          className="sg-focus-ring h-[28px] shrink-0 whitespace-nowrap rounded-full bg-[#141414] px-3.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-[#2A2C32] active:scale-[0.98]"
        >
          {cycle.shortLabel} · {classItem.shortCode}
        </button>

        <div className="flex flex-wrap items-center gap-[6px]" role="tablist" aria-label="Sections du programme">
          {TAB_LABELS.map((label, index) => {
            const isSelected = activePill === index;
            return (
              <div key={label} className="flex flex-col items-center gap-[3px]">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectPill(index)}
                  className={`sg-focus-ring h-[26px] shrink-0 whitespace-nowrap rounded-full px-3 text-[11px] font-semibold transition-all duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'sg-btn-primary text-white'
                      : 'border border-[#BDBDB8] bg-[#E5E5E0] text-[#3A3C40] hover:border-[#2B66DC] hover:bg-[#DCE6FA] hover:text-[#0E4FD6]'
                  }`}
                >
                  {label}
                </button>
                <span
                  aria-hidden="true"
                  className={`h-[2.5px] w-[26px] rounded-full transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#0E4FD6] shadow-[0_0_12px_rgba(37,99,235,0.7)]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main scrollable content body */}
      <div className="sg-scroll flex-1 min-h-0 overflow-y-auto py-3 pr-1.5">
        {showSearch && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#2B66DC]/60 bg-[#F4F7FE] px-3 py-1.5 shadow-[0_0_14px_rgba(37,99,235,0.14)]">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#0E4FD6]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrer une matière ou notion (ex. Thalès, fractions, SVT)…"
              aria-label="Filtrer une matière ou notion"
              className="w-full bg-transparent text-xs text-[#141414] placeholder:text-[#66686C] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Effacer le filtre"
                className="text-[#66686C] hover:text-[#141414]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {showReadingGuide && (
          <div className="mb-3 rounded-xl border border-[#2B66DC]/40 bg-[#EFF4FE] p-3 text-xs text-[#1E2430]">
            <div className="flex items-center justify-between gap-2 font-semibold text-[#0E4FD6]">
              <span>Programmes scolaires du Sénégal — Synthèse du 14 novembre 2026</span>
              <button
                type="button"
                onClick={onToggleReadingGuide}
                className="text-[11px] font-semibold underline hover:no-underline"
              >
                Fermer
              </button>
            </div>
            <p className="mt-1 leading-relaxed text-[#3A3C40]">
              Couvre Petite Section à Terminale (séries L1a/L1b/L’1, L2, S1–S5, STEG ex-G, STIDD ex-T1/T2, F6 et Franco-arabe). L’élémentaire suit une progression en spirale sur trois étapes : CI-CP, CE1-CE2 et CM1-CM2.
            </p>
          </div>
        )}

        {showDomainsOverview && (
          <div className="mb-3 rounded-xl border border-[#C8C9C4] bg-[#F5F5F1] p-3 text-xs text-[#3A3C40]">
            <p className="font-semibold text-[#141414]">{cycle.label} — Cadre général</p>
            <p className="mt-1 leading-relaxed">{cycle.overviewNote}</p>
          </div>
        )}

        {/* Class Title & Metadata */}
        <div className="mb-3">
          <h1 className="text-lg font-bold tracking-tight text-[#141414] md:text-[21px]">
            {classItem.title}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#66686C]">
            <span>{cycle.label}</span>
            <span aria-hidden="true">·</span>
            <span>{classItem.subtitle}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{classItem.subjects.length} rubriques</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#34363A]">
            {classItem.summary}
          </p>
        </div>

        {/* TAB 0: Programme */}
        {activePill === 0 && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 lg:grid-cols-2">
            {filteredSubjects.length === 0 ? (
              <p className="col-span-full py-4 text-xs text-[#66686C]">
                Aucune matière ne correspond à « {searchQuery} » dans cette classe.
              </p>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject.name}
                  className="border-t border-[#E6E6E1] pt-2.5"
                >
                  <h2 className="text-[13px] font-semibold text-[#141414]">
                    {subject.name}
                  </h2>
                  {detailedMode ? (
                    <ul className="mt-1 space-y-1 text-[12px] leading-relaxed text-[#45474D]">
                      {subject.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-[6px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#0E4FD6]" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-[12px] leading-relaxed text-[#52545A] line-clamp-2">
                      {subject.items.join(' ')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 1: Notions clés & Tableau des 12 séries (Lycée) */}
        {activePill === 1 && (
          <div className="space-y-4">
            <div className="space-y-2 border-t border-[#E6E6E1] pt-2.5">
              <h2 className="text-[13px] font-semibold text-[#141414]">
                Points essentiels à retenir
              </h2>
              <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-[#3A3C40]">
                {classItem.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#0E4FD6] tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            </div>

            {classItem.seriesTable && (
              <div className="border-t border-[#E6E6E1] pt-2.5">
                <h2 className="mb-2 text-[13px] font-semibold text-[#141414]">
                  Séries et parcours du lycée ({classItem.seriesTable.length})
                </h2>
                <div className="overflow-x-auto rounded-lg border border-[#D4D4CF]">
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#D4D4CF] bg-[#F2F2ED] text-[#141414]">
                        <th className="px-3 py-1.5 font-semibold whitespace-nowrap">Parcours</th>
                        <th className="px-3 py-1.5 font-semibold">Dominante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E2]">
                      {classItem.seriesTable.map((row) => (
                        <tr key={row.code} className="hover:bg-[#F5F8FE]">
                          <td className="px-3 py-1.5 font-semibold text-[#0E4FD6] whitespace-nowrap">
                            {row.code}
                          </td>
                          <td className="px-3 py-1.5 text-[#3A3C40]">
                            {row.dominante}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Évaluation & Cadre pédagogique */}
        {activePill === 2 && (
          <div className="space-y-3 border-t border-[#E6E6E1] pt-2.5 text-[12.5px] leading-relaxed text-[#3A3C40]">
            <div>
              <h2 className="text-[13px] font-semibold text-[#141414]">
                Évaluation et validation
              </h2>
              <p className="mt-1">{classItem.evaluationNote}</p>
            </div>
            <div className="border-t border-[#E6E6E1] pt-2.5">
              <h2 className="text-[13px] font-semibold text-[#141414]">
                Organisation du cycle ({cycle.label})
              </h2>
              <p className="mt-1">{cycle.overviewNote}</p>
              <p className="mt-1 text-xs font-medium text-[#0E4FD6]">{cycle.spiralOrExamNote}</p>
            </div>
            <div className="border-t border-[#E6E6E1] pt-2.5 text-xs text-[#66686C]">
              Pour une planification officielle de classe, vérifier la version du programme, les horaires et la répartition annuelle transmis par l’établissement, l’IEF, l’IA ou l’Office du baccalauréat.
            </div>
          </div>
        )}

        {/* TAB 3: Guides & PDF officiels */}
        {activePill === 3 && (
          <div className="border-t border-[#E6E6E1] pt-2.5">
            <h2 className="mb-2 text-[13px] font-semibold text-[#141414]">
              Références et documents officiels ({linksToShow.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {linksToShow.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sg-focus-ring group flex items-center justify-between gap-2 rounded-xl border border-[#D4D4CF] bg-[#FAFAF7] px-3 py-2 text-xs transition-all duration-150 hover:border-[#2B66DC] hover:bg-[#EFF4FE] hover:shadow-[0_0_12px_rgba(37,99,235,0.16)]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#141414] group-hover:text-[#0E4FD6]">
                      {link.label}
                    </div>
                    {link.category && (
                      <div className="text-[11px] text-[#66686C]">{link.category}</div>
                    )}
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#66686C] group-hover:text-[#0E4FD6]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom row: primary cobalt pill button + 4 indicator dashes */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E7E7E2]">
        <button
          type="button"
          onClick={onNextClass}
          className="sg-focus-ring sg-btn-primary h-[28px] shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-semibold text-white transition-all duration-150"
        >
          Classe suivante →
        </button>

        <div aria-hidden="true" className="flex items-center gap-[4px]">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`block h-[2.5px] rounded-full transition-all duration-150 ${
                activePill === idx
                  ? 'w-[28px] bg-[#0E4FD6] shadow-[0_0_12px_rgba(37,99,235,0.75)]'
                  : 'w-[4px] bg-[#B4B5B3]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
