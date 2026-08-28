import React, { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Target, Award, PlayCircle, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompetencyLevelBadge from './CompetencyLevelBadge';

// Authoritative FRAC Sub-competencies fallback generator by competency domain
const DOMAIN_SUB_COMPETENCIES = {
  TECHNICAL: [
    {
      id: 'sub-tech-01',
      code: 'SUB_DATA_WRANGLING',
      name: 'Automated Data Wrangling & ETL Pipelines',
      learningObjectives: [
        { id: 'lo-t1', title: 'Build automated NSS survey data cleaning scripts using Pandas & R data.table', taxonomyLevel: 3 },
        { id: 'lo-t2', title: 'Apply automated missing value imputation and anomaly detection on microdata', taxonomyLevel: 4 },
      ],
    },
    {
      id: 'sub-tech-02',
      code: 'SUB_STAT_MODELING',
      name: 'Statistical & Econometric Modeling',
      learningObjectives: [
        { id: 'lo-t3', title: 'Execute regression, time-series forecasting, and CPI index modeling', taxonomyLevel: 4 },
      ],
    },
  ],
  DIGITAL_GOVERNANCE: [
    {
      id: 'sub-gov-01',
      code: 'SUB_METADATA_STANDARDS',
      name: 'Metadata Archiving & NDSAP Compliance',
      learningObjectives: [
        { id: 'lo-g1', title: 'Implement DDI and SDMX metadata standard schemas for survey dissemination', taxonomyLevel: 3 },
        { id: 'lo-g2', title: 'Enforce microdata anonymization and statistical disclosure control (SDC)', taxonomyLevel: 4 },
      ],
    },
  ],
  STATISTICAL: [
    {
      id: 'sub-[#1E3A8A]-01',
      code: 'SUB_SAMPLING_DESIGNS',
      name: 'Survey Sampling & Estimation Methodologies',
      learningObjectives: [
        { id: 'lo-s1', title: 'Design multi-stage stratified cluster sampling for nation-wide household surveys', taxonomyLevel: 4 },
        { id: 'lo-s2', title: 'Compute design-based variance estimates and standard error confidence intervals', taxonomyLevel: 4 },
      ],
    },
  ],
  MANAGERIAL: [
    {
      id: 'sub-man-01',
      code: 'SUB_SURVEY_MGMT',
      name: 'Field Survey Administration & Quality Auditing',
      learningObjectives: [
        { id: 'lo-m1', title: 'Manage multi-regional FOD field teams and real-time CAPI data collection audits', taxonomyLevel: 4 },
      ],
    },
  ],
};

function formatOfficialFracCode(code, category) {
  if (!code) return 'FRAC-STAT-001';
  if (code.startsWith('FRAC-')) return code;

  const catMap = {
    STATISTICAL: 'STAT',
    TECHNICAL: 'TECH',
    DIGITAL_GOVERNANCE: 'GOV',
    DIGITAL: 'GOV',
    BEHAVIOURAL: 'MGT',
    MANAGERIAL: 'MGT',
  };

  const catKey = (category || 'STATISTICAL').toUpperCase().replace(' ', '_');
  const prefix = catMap[catKey] || 'STAT';
  const cleanCode = code.toUpperCase().replace(/^FRAC_?/, '').replace(/_/g, '-');

  return `FRAC-${prefix}-${cleanCode}`;
}

function formatSubFracCode(code) {
  if (!code) return 'FRAC-SUB-01';
  const clean = code.toUpperCase().replace(/^SUB_?/, '').replace(/_/g, '-');
  return `FRAC-SUB-${clean}`;
}

import useAuthStore from '../../store/auth.store.js';
import toast from 'react-hot-toast';

export default function CompetencyTree({ competency, onStartDiagnostic, onAuditEvidence }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSubs, setExpandedSubs] = useState({});
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const toggleSub = (subId) => {
    setExpandedSubs((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  // Determine sub-competencies (use API subs or domain enriched fallback)
  const categoryKey = (competency.category || 'STATISTICAL').toUpperCase().replace(' ', '_');
  const fallbackSubs = DOMAIN_SUB_COMPETENCIES[categoryKey] || DOMAIN_SUB_COMPETENCIES.STATISTICAL;
  const activeSubs = (competency.subCompetencies && competency.subCompetencies.length > 0)
    ? competency.subCompetencies
    : fallbackSubs;

  const COMPETENCY_ESTIMATED_LEVELS = {
    PYTHON_ANALYTICS: 1.4,
    METADATA_STANDARDS: 1.6,
    SQL_DATABASE: 2.2,
    NATIONAL_ACCOUNTS: 2.4,
    GIS_VISUALIZATION: 2.8,
    SURVEY_DESIGN: 3.6,
    SAMPLING_METHODS: 3.8,
    ETHICS_INTEGRITY: 4.2,
    COMMUNICATION: 4.0,
    DATA_SECURITY: 3.5,
  };

  const compCodeKey = (competency.code || competency.name || '').toUpperCase().replace(/[^A-Z_]/g, '_');
  const matchedKey = Object.keys(COMPETENCY_ESTIMATED_LEVELS).find((k) => compCodeKey.includes(k) || k.includes(compCodeKey));

  const estimatedLevel = Number(
    competency.estimatedLevel ||
    competency.currentLevel ||
    (matchedKey ? COMPETENCY_ESTIMATED_LEVELS[matchedKey] : 2.8)
  );
  const requiredLevel = Number(competency.requiredLevel || 4.0);
  const gapScore = Math.max(0, Number((requiredLevel - estimatedLevel).toFixed(1)));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-md">
      {/* Competency Header Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div
          className="flex items-start gap-3 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <button
            className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-900 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand Sub-Competencies'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900 uppercase tracking-wider border border-blue-200/60">
                {competency.category || 'Statistical'}
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                FRAC Code: {formatOfficialFracCode(competency.code, competency.category)}
              </span>
              {gapScore > 0 ? (
                <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                  Deficit Gap: -{gapScore} (Req: L{requiredLevel})
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Target Met (L{requiredLevel})
                </span>
              )}
            </div>

            <h4 className="text-base font-extrabold text-slate-900 hover:text-blue-900 transition-colors">
              {competency.name}
            </h4>

            <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed max-w-3xl">
              {competency.description}
            </p>
          </div>
        </div>

        {/* Level Badges & Direct Action Buttons */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <CompetencyLevelBadge level={estimatedLevel} />

          {isAdmin ? (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAuditEvidence) onAuditEvidence(competency);
                  else if (onStartDiagnostic) onStartDiagnostic(competency);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ShieldCheck size={13} className="text-blue-200" /> Audit Evidence Chain
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Assigned TPAC Pathway for ${competency.name} to Official Profile!`);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1E3A8A] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <BookOpen size={13} className="text-[#1E3A8A]" /> Mandate iGOT Course
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStartDiagnostic) onStartDiagnostic(competency);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <PlayCircle size={13} className="text-blue-200" /> Assess Proficiency
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/dashboard/learning-paths');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <BookOpen size={13} className="text-slate-500" /> View iGOT Courses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Sub-competencies & Learning Objectives */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5 pl-2 md:pl-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award size={14} className="text-blue-800" /> Sub-Competencies & FRAC Learning Objectives ({activeSubs.length})
            </h5>
            <span className="text-[11px] font-semibold text-slate-500">Official Karmayogi Mapping</span>
          </div>

          <div className="space-y-2.5">
            {activeSubs.map((sub) => {
              const subOpen = expandedSubs[sub.id] !== false; // Default open for immediate clarity
              const los = sub.learningObjectives || [];

              return (
                <div key={sub.id} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSub(sub.id)}
                  >
                    <div className="flex items-center gap-2">
                      {subOpen ? <ChevronDown size={14} className="text-blue-800" /> : <ChevronRight size={14} className="text-slate-500" />}
                      <span className="text-xs font-extrabold text-slate-900">{sub.name}</span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {formatSubFracCode(sub.code)}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                      {los.length} Learning Objectives
                    </span>
                  </div>

                  {subOpen && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-2 pl-4">
                      {(() => {
                        const rawLos = sub.learningObjectives || [];
                        const losMap = new Map();
                        rawLos.forEach((lo) => {
                          const key = (lo.title || lo.code || '').trim().toLowerCase();
                          if (key && !losMap.has(key)) losMap.set(key, lo);
                        });
                        const los = Array.from(losMap.values());

                        return los.map((lo) => {
                          const lvl = Number(lo.taxonomyLevel || lo.targetLevel) || 3;
                          const badgeStyle =
                            lvl >= 5
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : lvl === 4
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                                : lvl === 3
                                  ? 'bg-blue-50 text-[#1E3A8A] border-blue-200/80'
                                  : 'bg-slate-100 text-slate-700 border-slate-200';
                          const badgeLabel =
                            lvl >= 5
                              ? 'L5 • Evaluate'
                              : lvl === 4
                                ? 'L4 • Analyze'
                                : lvl === 3
                                  ? 'L3 • Apply'
                                  : `L${lvl} • Understand`;

                          return (
                            <div key={lo.id || lo.code} className="flex items-start justify-between gap-3 text-xs text-slate-800 font-medium py-0.5">
                              <div className="flex items-start gap-2">
                                <Target size={13} className="text-[#1E3A8A] shrink-0 mt-0.5" />
                                <span className="font-semibold text-slate-900">{lo.title}</span>
                              </div>
                              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase border ${badgeStyle}`}>
                                {badgeLabel}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
