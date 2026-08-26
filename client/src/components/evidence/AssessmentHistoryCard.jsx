import { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SEEDED_ATTEMPTS = [
  {
    id: 'att-01',
    assessmentTitle: 'Diagnostic Module 1: Survey Sampling & Bias Evaluation',
    competencyCode: 'FRAC-STAT-STAT-ANALYSIS',
    competencyName: 'Statistical Analysis & Inference',
    scorePct: 85,
    correctCount: 17,
    totalCount: 20,
    levelBefore: 'L3.2',
    levelAfter: 'L3.6',
    date: 'August 26, 2026',
    timeSpent: '14m 20s',
    evidenceHash: 'EV-HASH-8F9A2B1C',
    recommendationImpact: 'Unlocked Advanced Horvitz-Thompson Estimator TPAC Module',
  },
  {
    id: 'att-02',
    assessmentTitle: 'National Accounts Statistics & GVA Deflation Assessment',
    competencyCode: 'FRAC-STAT-NATIONAL-ACCOUNTS',
    competencyName: 'National Accounts & Macroeconomic Stats',
    scorePct: 78,
    correctCount: 15,
    totalCount: 20,
    levelBefore: 'L2.0',
    levelAfter: 'L2.4',
    date: 'August 22, 2026',
    timeSpent: '16m 45s',
    evidenceHash: 'EV-HASH-7E2A91F4',
    recommendationImpact: 'Recommended iGOT SNA 2008 Real GVA Deflation Course',
  },
  {
    id: 'att-03',
    assessmentTitle: 'Python Microdata Wrangling & Pandas ETL Evaluation',
    competencyCode: 'FRAC-TECH-PYTHON-ANALYTICS',
    competencyName: 'Python for Data Analytics (NSS Microdata)',
    scorePct: 92,
    correctCount: 18,
    totalCount: 20,
    levelBefore: 'L1.0',
    levelAfter: 'L1.4',
    date: 'August 18, 2026',
    timeSpent: '12m 10s',
    evidenceHash: 'EV-HASH-3D9B44E8',
    recommendationImpact: 'Recommended iGOT Automated CAPI Validation Scripting',
  },
];

export default function AssessmentHistoryCard() {
  const [attempts, setAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem('kshamata_assessment_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return SEEDED_ATTEMPTS;
  });

  const [filterCode, setFilterCode] = useState('ALL');

  useEffect(() => {
    localStorage.setItem('kshamata_assessment_history', JSON.stringify(attempts));
  }, [attempts]);

  const filteredAttempts = attempts.filter((att) => {
    if (filterCode === 'ALL') return true;
    return att.competencyCode.includes(filterCode);
  });

  const avgScore = Math.round(
    attempts.reduce((sum, a) => sum + Number(a.scorePct || 0), 0) / (attempts.length || 1)
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A] border border-blue-100 flex items-center gap-1">
              <History size={13} /> Assessment Attempts & Behavior History Ledger
            </span>
            <span className="text-xs font-semibold text-slate-500">Persistent Evidence Trail</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Historical Diagnostic Attempts & Proficiency Trajectory</h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Every completed diagnostic test score, attempt timestamp, evidence hash, and score progression is permanently tracked to personalize your iGOT learning recommendations.
          </p>
        </div>

        {/* Stats Chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#1E3A8A]">Total Attempts</span>
            <span className="text-sm font-black text-slate-900">{attempts.length} Completed</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-emerald-800">Average Score</span>
            <span className="text-sm font-black text-emerald-900">{avgScore}% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { code: 'ALL', label: 'All Past Attempts' },
            { code: 'STAT', label: 'Statistical' },
            { code: 'TECH', label: 'Technical' },
            { code: 'GOV', label: 'Governance' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setFilterCode(item.code)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filterCode === item.code
                  ? 'bg-[#1E3A8A] !text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
          <Sparkles size={14} /> Synced with ML Recommendation Engine
        </span>
      </div>

      {/* Attempt History List */}
      <div className="space-y-3">
        {filteredAttempts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
            No historical attempts found for this category filter.
          </div>
        ) : (
          filteredAttempts.map((att) => (
            <div
              key={att.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-blue-50/40 hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-mono font-bold text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-blue-200">
                    {att.competencyCode}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-600 flex items-center gap-1">
                    <Calendar size={12} /> {att.date} ({att.timeSpent})
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{att.assessmentTitle}</h4>
                <p className="text-[11px] text-slate-600 font-medium flex items-center gap-2">
                  <span>Score: <strong className="text-emerald-700">{att.scorePct}%</strong> ({att.correctCount}/{att.totalCount})</span>
                  <span>•</span>
                  <span>Proficiency Shift: <strong className="text-[#1E3A8A]">{att.levelBefore} ➔ {att.levelAfter}</strong></span>
                </p>
                <div className="text-[10.5px] text-indigo-900 font-semibold flex items-center gap-1 mt-0.5">
                  <Sparkles size={12} className="text-indigo-600" /> {att.recommendationImpact}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold block">
                    ✓ VERIFIED EVIDENCE
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-500 block mt-0.5">{att.evidenceHash}</span>
                </div>

                <button
                  onClick={() => toast.success(`Viewing full diagnostic attempt audit log for ${att.evidenceHash}`)}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-[#1E3A8A] transition-colors"
                  title="View Audit Log"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
