import { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Target, Award } from 'lucide-react';
import CompetencyLevelBadge from './CompetencyLevelBadge';

export default function CompetencyTree({ competency }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSubs, setExpandedSubs] = useState({});

  const toggleSub = (subId) => {
    setExpandedSubs((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-blue-200">
      {/* Competency Header */}
      <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <button className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#1E3A8A] transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                {competency.category || 'Statistical'}
              </span>
              <span className="text-xs font-semibold text-slate-600">ID: {competency.code}</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 hover:text-[#1E3A8A] transition-colors">
              {competency.name}
            </h4>
            <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
              {competency.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <CompetencyLevelBadge level={competency.estimatedLevel || 1.0} />
          {competency.gap > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              Gap: -{competency.gap} (Req: {competency.requiredLevel})
            </span>
          )}
        </div>
      </div>

      {/* Expanded Sub-competencies & Learning Objectives */}
      {isExpanded && (
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-4 pl-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Award size={14} className="text-[#1E3A8A]" /> Sub-Competencies & Learning Objectives
          </h5>

          {(competency.subCompetencies || []).length === 0 ? (
            <p className="text-xs text-slate-600 font-medium italic">No sub-competencies mapped yet.</p>
          ) : (
            competency.subCompetencies.map((sub) => {
              const subOpen = expandedSubs[sub.id];
              return (
                <div key={sub.id} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSub(sub.id)}>
                    <div className="flex items-center gap-2">
                      {subOpen ? <ChevronDown size={14} className="text-[#1E3A8A]" /> : <ChevronRight size={14} className="text-slate-600" />}
                      <span className="text-xs font-bold text-slate-900">{sub.name}</span>
                      <span className="text-[10px] text-slate-600 font-mono">({sub.code})</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                      {(sub.learningObjectives || []).length} Objectives
                    </span>
                  </div>

                  {subOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2 pl-4">
                      {(sub.learningObjectives || []).map((lo) => (
                        <div key={lo.id} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                          <Target size={13} className="text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900">{lo.title}</span>
                            <span className="ml-2 rounded bg-purple-50 px-1.5 py-0.2 text-[9px] font-bold text-purple-700">
                              Taxonomy Level {lo.taxonomyLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
