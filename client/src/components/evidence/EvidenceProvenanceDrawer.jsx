import { X, ShieldCheck, Calendar, Clock, Award, CheckCircle2, TrendingUp, BookOpen, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

function formatAuditDateTime(dateInput) {
  if (!dateInput) return 'Date Not Recorded';
  try {
    let d;
    if (typeof dateInput === 'string' && dateInput.includes(' ') && !dateInput.includes('T')) {
      d = new Date(dateInput.replace(' ', 'T') + (dateInput.endsWith('Z') ? '' : 'Z'));
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return 'Date Not Recorded';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Date Not Recorded';
  }
}

export default function EvidenceProvenanceDrawer({ isOpen, onClose, evidenceItem }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !evidenceItem) return null;

  const rawDate =
    evidenceItem.recordedAt ||
    evidenceItem.timestamp ||
    evidenceItem.submitted_at ||
    evidenceItem.started_at ||
    evidenceItem.created_at;
  const formattedDate = formatAuditDateTime(rawDate) || evidenceItem.assessmentDate || 'Recorded in Assessment Ledger';

  const correctCount = evidenceItem.correctCount ?? 0;
  const totalCount = evidenceItem.totalCount || evidenceItem.totalQuestions || 5;
  const scorePct =
    evidenceItem.scorePct ??
    Math.round((correctCount / totalCount) * 100);

  const numScore =
    evidenceItem.score !== undefined && evidenceItem.score !== null
      ? Number(evidenceItem.score)
      : Number(((correctCount / totalCount) * 5.0).toFixed(1));

  const displayScore = numScore % 1 === 0 ? numScore.toFixed(0) : numScore.toFixed(1);
  const maxScoreStr = evidenceItem.maxScore
    ? Number(evidenceItem.maxScore) % 1 === 0
      ? Number(evidenceItem.maxScore).toFixed(0)
      : Number(evidenceItem.maxScore).toFixed(1)
    : '5';

  const proficiency = evidenceItem.proficiency || {
    level: scorePct >= 75 ? 'L4.0' : scorePct >= 50 ? 'L3.0' : scorePct > 0 ? 'L1.5' : 'L1.0',
    label: scorePct >= 75 ? 'Level 4 (Advanced)' : scorePct >= 50 ? 'Level 3 (Practitioner)' : scorePct > 0 ? 'Level 1.5 (Developing Awareness)' : 'Level 1.0 (Awareness Baseline)',
    gap: scorePct >= 75 ? '0.0 (Benchmark Satisfied)' : `${Math.max(0, (4.0 - (scorePct / 20))).toFixed(1)} Deficit to Benchmark L4.0`,
  };

  const handleCopyHash = () => {
    if (evidenceItem.evidenceHash) {
      navigator.clipboard.writeText(evidenceItem.evidenceHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Assessment Details</h3>
                <p className="text-xs text-slate-500 font-medium">MoSPI / NSSTA Evaluation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 1. Assessment Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {evidenceItem.assessmentTitle || 'MoSPI Diagnostic Assessment'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-mono font-bold text-[#1E3A8A] bg-white px-2.5 py-0.5 rounded border border-blue-200 text-[11px]">
                {evidenceItem.competencyCode || 'STAT_ANALYSIS'}
              </span>
              <span className="text-slate-600 font-medium">
                {evidenceItem.competencyName || 'Statistical Analysis & Inference'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1.5 border-t border-slate-200/60 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" /> {evidenceItem.timeSpent || 'Complete'}
              </span>
            </div>
          </div>

          {/* 2. Real Evaluation Results */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score Summary</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  scorePct >= 75
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : scorePct >= 50
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {scorePct >= 75 ? 'Benchmark Met' : scorePct >= 50 ? 'Intermediate Level' : 'Needs Upskilling'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Questions Correct</span>
                <span className="text-lg font-black text-slate-900">
                  {correctCount} <span className="text-xs font-medium text-slate-500">/ {totalCount} ({scorePct}%)</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Score (Scale 1–5)</span>
                <span className="text-lg font-black text-slate-900">
                  {displayScore} <span className="text-xs font-medium text-slate-500">/ {maxScoreStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Skill Gap Analysis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <TrendingUp size={14} className="text-[#1E3A8A]" />
              Competency Level & Cadre Benchmark
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Demonstrated Level:</span>
                <strong className="text-slate-900">{proficiency.level} ({proficiency.label})</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Cadre Target:</span>
                <strong className="text-slate-900">Level 4.0 (SSS Cadre)</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">Deficit Gap:</span>
                <strong className={scorePct >= 75 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                  {proficiency.gap}
                </strong>
              </div>
            </div>
          </div>

          {/* 4. Personalized iGOT Pathway Recommendation */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              <BookOpen size={14} />
              Recommended Karmayogi Training
            </div>

            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {evidenceItem.recommendationImpact || 'Assigned to foundational module on Karmayogi Bharat.'}
            </p>

            <button
              onClick={() => {
                onClose();
                navigate('/dashboard/learning-paths');
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>View Recommended Courses</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 5. Verification & Audit Trail */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Record Verification & Audit Trail
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Issuing Body:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {evidenceItem.provenance || 'MoSPI / NSSTA Capacity Portal'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Record Status:</span>
                <span className="font-bold text-emerald-700">Verified Official Record</span>
              </div>
            </div>

            {evidenceItem.evidenceHash && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                <span className="font-mono text-[10.5px] text-slate-600 truncate">
                  {evidenceItem.evidenceHash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Copy SHA-256 Hash"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 mt-6">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Close Record
          </Button>
        </div>
      </div>
    </div>
  );
}


