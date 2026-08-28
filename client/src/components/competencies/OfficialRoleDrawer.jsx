import { useState } from 'react';
import { X, Briefcase, CheckCircle2, RefreshCw, Award, Sparkles } from 'lucide-react';
import Button from '../Button';

export default function OfficialRoleDrawer({ isOpen, onClose, official, roles = [], onRoleUpdated }) {
  const [selectedRoleId, setSelectedRoleId] = useState(official?.roleId || roles[0]?.id || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsUpdating(true);
    try {
      if (onRoleUpdated) {
        await onRoleUpdated(selectedRoleId);
      }
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto border-l border-slate-200">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Target FRAC Role Benchmark</h3>
                <p className="text-xs text-slate-500 font-medium">{official?.userName || 'Official User'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 space-y-1 text-xs">
              <span className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <Sparkles size={14} /> Career Progression & Skill Gap Benchmark
              </span>
              <p className="text-slate-600 font-medium leading-relaxed">
                Selecting a target role dynamically re-evaluates required competency levels (`L3.0` vs `L4.0` vs `L5.0`), recalculates deficit gaps, and updates course pathway recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Available Target Roles
              </label>
              {roles.map((r) => {
                const isSelected = selectedRoleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-blue-50/80 ring-2 ring-[#1E3A8A]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{r.title}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-[#1E3A8A]" />}
                    </div>
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 mb-1.5">
                      {r.department}
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{r.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isUpdating}
            disabled={isUpdating || !selectedRoleId}
            fullWidth
            className="text-xs !text-white"
          >
            <RefreshCw size={14} className="mr-1.5 !text-white" /> Re-evaluate FRAC Gaps
          </Button>
        </div>
      </div>
    </div>
  );
}
