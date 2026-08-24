import { useState } from 'react';
import { X, Briefcase, CheckCircle2, RefreshCw } from 'lucide-react';
import Button from '../Button';

export default function OfficialRoleDrawer({ isOpen, onClose, official, roles = [], onRoleUpdated }) {
  const [selectedRoleId, setSelectedRoleId] = useState(official?.roleId || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsUpdating(true);
    try {
      await onRoleUpdated(selectedRoleId);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between h-full overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign / Change Role</h3>
                <p className="text-xs text-slate-600 font-medium">{official?.userName || 'Official User'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Changing an official's role automatically re-evaluates their required competency profile and recalculates skill gaps against existing diagnostic evidence.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Official Role
              </label>
              {roles.map((r) => {
                const isSelected = selectedRoleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{r.title}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-[#1E3A8A]" />}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{r.department}</p>
                    <p className="mt-2 text-[11px] text-slate-600 line-clamp-2">{r.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isUpdating}
            disabled={isUpdating || !selectedRoleId}
            fullWidth
            className="!text-white"
          >
            <RefreshCw size={14} className="mr-1.5" /> Reevaluate Gaps
          </Button>
        </div>
      </div>
    </div>
  );
}
