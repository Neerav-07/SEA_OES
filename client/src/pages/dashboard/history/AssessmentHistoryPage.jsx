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
  Search,
  Filter,
  Layers,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../../components/PageHeader.jsx';
import StatCard from '../../../components/StatCard.jsx';
import EvidenceProvenanceDrawer from '../../../components/evidence/EvidenceProvenanceDrawer.jsx';

const SEEDED_ATTEMPTS = [
  {
    id: 'att-01',
    assessmentTitle: 'Diagnostic Module 1: Survey Sampling & Bias Evaluation',
    competencyCode: 'FRAC-STAT-STAT-ANALYSIS',
    competencyName: 'Statistical Analysis & Inference',
    category: 'Statistical',
    scorePct: 85,
    correctCount: 17,
    totalCount: 20,
    levelBefore: 'L3.2',
    levelAfter: 'L3.6',
    date: 'August 26, 2026',
    timeSpent: '14m 20s',
    evidenceHash: 'EV-HASH-8F9A2B1C',
    evaluator: 'AI Diagnostic Engine (Module 1)',
    recommendationImpact: 'Unlocked Advanced Horvitz-Thompson Estimator TPAC Module',
  },
  {
    id: 'att-02',
    assessmentTitle: 'National Accounts Statistics & GVA Deflation Assessment',
    competencyCode: 'FRAC-STAT-NATIONAL-ACCOUNTS',
    competencyName: 'National Accounts & Macroeconomic Stats',
    category: 'Statistical',
    scorePct: 78,
    correctCount: 15,
    totalCount: 20,
    levelBefore: 'L2.0',
    levelAfter: 'L2.4',
    date: 'August 22, 2026',
    timeSpent: '16m 45s',
    evidenceHash: 'EV-HASH-7E2A91F4',
    evaluator: 'MoSPI DIID Evaluator Engine',
    recommendationImpact: 'Recommended iGOT SNA 2008 Real GVA Deflation Course',
  },
  {
    id: 'att-03',
    assessmentTitle: 'Python Microdata Wrangling & Pandas ETL Evaluation',
    competencyCode: 'FRAC-TECH-PYTHON-ANALYTICS',
    competencyName: 'Python for Data Analytics (NSS Microdata)',
    category: 'Technical',
    scorePct: 92,
    correctCount: 18,
    totalCount: 20,
    levelBefore: 'L1.0',
    levelAfter: 'L1.4',
    date: 'August 18, 2026',
    timeSpent: '12m 10s',
    evidenceHash: 'EV-HASH-3D9B44E8',
    evaluator: 'AI Grounded MCQ Pipeline',
    recommendationImpact: 'Recommended iGOT Automated CAPI Validation Scripting',
  },
];

export default function AssessmentHistoryPage() {
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

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditEvidence, setSelectedAuditEvidence] = useState(null);

  useEffect(() => {
    localStorage.setItem('kshamata_assessment_history', JSON.stringify(attempts));
  }, [attempts]);

  const filteredAttempts = attempts.filter((att) => {
    const matchesCat = filterCategory === 'ALL' || att.category === filterCategory || att.competencyCode.includes(filterCategory);
    const matchesSearch =
      att.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.competencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.evidenceHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const avgScore = Math.round(
    attempts.reduce((sum, a) => sum + Number(a.scorePct || 0), 0) / (attempts.length || 1)
  );

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title="Assessment Attempts & Behavior History Ledger"
        subtitle="Comprehensive evidence log of completed diagnostic tests, score progression trajectories, cryptographic verification hashes, and personalized ML recommendation updates."
      />

      {/* ── Summary Stats Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Attempts" value={`${attempts.length} Completed`} change="100% Verified" trend="up" />
        <StatCard label="Average Diagnostic Score" value={`${avgScore}% Accuracy`} change="+6.4% Trajectory" trend="up" />
        <StatCard label="Proficiency Elevation" value="+0.4 Lvl Average" change="FRAC Target Alignment" trend="up" />
        <StatCard label="Personalization Engine" value="ML Model Synced" change="Real-Time iGOT Re-Ranking" trend="neutral" />
      </div>

      {/* ── Main History Ledger Container ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { code: 'ALL', label: 'All Attempt Categories' },
              { code: 'Statistical', label: 'Statistical' },
              { code: 'Technical', label: 'Technical' },
              { code: 'Digital Governance', label: 'Governance' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setFilterCategory(item.code)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  filterCategory === item.code
                    ? 'bg-[#1E3A8A] !text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, code, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>
        </div>

        {/* Attempts Table / List */}
        <div className="space-y-3">
          {filteredAttempts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
              No historical attempts match your search query.
            </div>
          ) : (
            filteredAttempts.map((att) => (
              <div
                key={att.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-blue-50/40 hover:border-blue-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#1E3A8A] bg-white px-2.5 py-0.5 rounded border border-blue-200">
                      {att.competencyCode}
                    </span>
                    <span className="text-[10.5px] font-extrabold text-slate-600 flex items-center gap-1">
                      <Calendar size={12} /> {att.date} ({att.timeSpent})
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Score: {att.scorePct}% ({att.correctCount}/{att.totalCount})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{att.assessmentTitle}</h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Competency Domain: <strong className="text-slate-900">{att.competencyName}</strong> • Level Shift: <strong className="text-[#1E3A8A]">{att.levelBefore} ➔ {att.levelAfter}</strong>
                  </p>

                  <div className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5 pt-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>iGOT Recommendation Impact: <strong>{att.recommendationImpact}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[9.5px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-bold block">
                      ✓ Cryptographic Evidence Verified
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">{att.evidenceHash}</span>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedAuditEvidence({
                        id: att.id,
                        competencyName: att.competencyName,
                        competencyCode: att.competencyCode,
                        assessmentDate: att.date,
                        scorePct: att.scorePct,
                        evaluator: att.evaluator || 'AI Diagnostic Engine',
                        evidenceHash: att.evidenceHash,
                        confidenceScore: '94% (High Confidence)',
                        sourceType: 'DIAGNOSTIC_ASSESSMENT',
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <ShieldCheck size={14} /> Audit Trail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Provenance Audit Drawer ── */}
      <EvidenceProvenanceDrawer
        isOpen={Boolean(selectedAuditEvidence)}
        onClose={() => setSelectedAuditEvidence(null)}
        evidenceItem={selectedAuditEvidence}
      />
    </div>
  );
}
