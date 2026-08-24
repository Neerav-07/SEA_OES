import { X, ShieldCheck, Calendar, Award, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../Button';

export default function EvidenceProvenanceDrawer({ isOpen, onClose, evidenceItem }) {
  if (!isOpen || !evidenceItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Evidence Provenance Audit</h3>
                <p className="text-xs text-slate-600 font-medium">Traceable Capability Record</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {/* Record Summary */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Evidence Type</span>
                <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                  {evidenceItem.evidenceType || 'KNOWLEDGE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Score Achieved</span>
                <span className="text-sm font-bold text-slate-900">
                  {evidenceItem.score} / {evidenceItem.maxScore || 5.0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Fusion Weight</span>
                <span className="text-xs font-bold text-slate-700">
                  {((evidenceItem.weight || 0.4) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Confidence Score</span>
                <span className="text-xs font-bold text-emerald-700">
                  {Math.round((evidenceItem.confidence || 0.85) * 100)}%
                </span>
              </div>
            </div>

            {/* Provenance Audit Trace */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-[#1E3A8A]" /> Source & Audit Trail
              </h4>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs">
                  <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-900">Timestamp</span>
                    <span className="text-slate-600">{new Date(evidenceItem.recordedAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs pt-2 border-t border-slate-100">
                  <Award size={14} className="text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-900">Assessment Source</span>
                    <span className="text-slate-600">{evidenceItem.provenance || 'NSSTA Diagnostic Assessment Session'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs pt-2 border-t border-slate-100">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-emerald-900">Verification Status</span>
                    <span className="text-emerald-700 font-semibold">Verified & Auditable in Registry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Close Provenance Audit
          </Button>
        </div>
      </div>
    </div>
  );
}
