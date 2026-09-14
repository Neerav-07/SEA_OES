import { useState, useEffect } from 'react';
import { X, Briefcase, CheckCircle2, RefreshCw, TrendingUp, Award, Building2, ChevronRight, ShieldCheck } from 'lucide-react';
import Button from '../Button';

export default function OfficialRoleDrawer({ isOpen, onClose, official, roles = [], onRoleUpdated }) {
  const [selectedRoleId, setSelectedRoleId] = useState(official?.roleId || roles[0]?.id || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync selected role when drawer opens or official changes
  useEffect(() => {
    if (isOpen && official?.roleId) {
      setSelectedRoleId(official.roleId);
    }
  }, [isOpen, official?.roleId]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
  };

  const handleSave = async () => {
    if (!selectedRoleId || selectedRoleId === official?.roleId) {
      onClose();
      return;
    }
    setIsUpdating(true);
    try {
      await onRoleUpdated?.(selectedRoleId);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRole = roles.find((r) => r.id === (official?.roleId || 'role-01'));
  const targetRole = roles.find((r) => r.id === selectedRoleId) || currentRole;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Background Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-docked Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="pointer-events-auto w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200/90 animate-in slide-in-from-right duration-300 ease-out">
          
          {/* Drawer Header (Fixed at top) */}
          <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A] ring-1 ring-blue-100 shrink-0">
                <Briefcase size={22} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Configure Cadre Role
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-50 text-[#1E3A8A] text-[10px] font-extrabold border border-blue-200 uppercase tracking-wider shrink-0">
                    FRAC Matrix
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs text-slate-700 font-bold truncate">
                    {official?.userName || 'Official User'}
                  </p>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    {official?.cadre || 'ISS Cadre'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/40">
            
            {/* Ministry Progression & FRAC Calibration Callout */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#1E3A8A] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp size={15} /> Career Progression & Benchmark
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  MoSPI FRAC-v2.4
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Selecting a target cadre role benchmarks your competencies against higher official responsibilities, dynamically recalculates required proficiency levels, and customizes your iGOT Karmayogi learning recommendations.
              </p>
              
              {/* Clean Proficiency Level Badges */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">
                  <strong className="text-slate-900">L3.0</strong> Working
                </span>
                <span className="text-slate-400 text-xs">→</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-[#1E3A8A] shadow-2xs">
                  <strong className="text-[#1E3A8A]">L4.0</strong> Advanced
                </span>
                <span className="text-slate-400 text-xs">→</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 shadow-2xs">
                  <strong className="text-indigo-800">L5.0</strong> Strategic Expert
                </span>
              </div>
            </div>

            {/* Target Roles List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Available Cadre Roles
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {roles.length} Roles Configured
                </span>
              </div>

              <div className="space-y-3">
                {roles.map((r) => {
                  const isSelected = selectedRoleId === r.id;
                  const isCurrent = official?.roleId === r.id || official?.roleTitle === r.title;

                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-blue-50/70 ring-2 ring-[#1E3A8A]/20 shadow-sm'
                          : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50/60 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Row: Title & Selection Indicator */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <span className={`text-sm font-bold leading-snug block transition-colors ${
                            isSelected ? 'text-[#1E3A8A]' : 'text-slate-900 group-hover:text-blue-900'
                          }`}>
                            {r.title}
                          </span>
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white shadow-2xs">
                              <CheckCircle2 size={15} className="stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400 transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Department & Cadre Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200/80">
                          <Building2 size={11} className="text-slate-500" />
                          {r.department}
                        </span>
                        {r.cadreLevel && (
                          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200/60">
                            {r.cadreLevel}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={11} /> Current Assigned Role
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-2.5">
                        {r.description}
                      </p>

                      {/* Target Competency Expectation Benchmark */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Award size={12} className="text-[#1E3A8A]" />
                          Target Benchmark:
                        </span>
                        <span className="font-bold text-slate-800">
                          {r.targetLevel || 'Level 4.0 - Advanced'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Target Summary */}
            {targetRole && (
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Benchmark
                  </span>
                  <span className="font-bold text-slate-800 truncate block">
                    {targetRole.title}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] font-extrabold text-[11px] border border-blue-200 shrink-0">
                  {selectedRoleId === official?.roleId ? 'Active Role' : 'Role Transition'}
                </span>
              </div>
            )}
          </div>

          {/* Drawer Footer (Cleanly docked inside drawer bottom) */}
          <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/90 backdrop-blur-xs flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer justify-center shadow-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isUpdating}
              disabled={isUpdating || !selectedRoleId}
              className="flex-1 py-2.5 text-xs font-black bg-[#1E3A8A] hover:bg-blue-900 text-white cursor-pointer justify-center shadow-md !text-white"
            >
              <RefreshCw size={14} className={`mr-1.5 text-white ${isUpdating ? 'animate-spin' : ''}`} />
              Re-evaluate FRAC Gaps
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

