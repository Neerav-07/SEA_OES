import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
} from 'lucide-react';
import KarmayogiLogo from './KarmayogiLogo.jsx';
import { howItWorksTabs } from '../../data/howItWorksData.js';

/**
 * HowItWorksModal Component
 * Renders a large, beautiful, and accessible guide modal detailing
 * the genuine step-by-step workflow of the active tab.
 */
export default function HowItWorksModal({ isOpen, onClose, tabKey }) {
  const tabData = howItWorksTabs[tabKey] || howItWorksTabs['officer-overview'];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Dark Black-Blue Theme Accent */}
        <div className="relative px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0A192F] to-[#1E3A8A] text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  <ShieldCheck size={12} className="text-blue-300" />
                  {tabData.role}
                </span>
                {tabData.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                    {tabData.badge}
                  </span>
                )}
              </div>
              <h2
                id="how-it-works-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1"
              >
                {tabData.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                {tabData.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-white/10"
              aria-label="Close guide modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers size={14} className="text-[#1E3A8A]" />
              Step-by-Step Guided Workflow
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {tabData.steps?.length || 5} Connected Steps
            </span>
          </div>

          {/* Numbered Steps List */}
          <div className="space-y-3">
            {tabData.steps?.map((step, idx) => {
              const isIgotRelated =
                step.title?.toLowerCase().includes('igot') ||
                step.description?.toLowerCase().includes('igot') ||
                step.tag?.toLowerCase().includes('igot') ||
                tabKey === 'igot-explore';

              return (
                <div
                  key={idx}
                  className="group relative flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all overflow-hidden"
                >
                  {/* Subtle iGOT emblem watermark for iGOT-connected steps */}
                  {isIgotRelated && (
                    <div
                      className="absolute -top-1 -right-1 pointer-events-none transition-all duration-300 transform rotate-0 group-hover:rotate-12 group-hover:scale-105"
                      style={{
                        maskImage: 'linear-gradient(to bottom left, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0) 80%)',
                        WebkitMaskImage: 'linear-gradient(to bottom left, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0) 80%)',
                      }}
                    >
                      <KarmayogiLogo size={60} width={60} height={60} className="w-15 h-15 opacity-25 group-hover:opacity-45 transition-opacity" />
                    </div>
                  )}

                  {/* Step Number Badge */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A192F] to-[#1E3A8A] text-white font-black text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform z-10">
                    {step.stepNumber}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0 space-y-1 z-10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                        {step.title}
                      </h4>
                      {step.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1E3A8A] border border-blue-100 shrink-0 flex items-center gap-1">
                          {isIgotRelated && <KarmayogiLogo className="h-3 w-3 inline-block shrink-0" />}
                          <span>{step.tag}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statutory Callout Card */}
          {tabData.callout && (
            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/60 flex items-start gap-3 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-blue-100 text-[#1E3A8A] shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1 text-xs sm:text-[12.5px] text-slate-700 leading-relaxed font-medium">
                <strong className="text-[#1E3A8A] font-bold block mb-0.5">
                  Official Standard & Alignment
                </strong>
                {tabData.callout}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11.5px] text-slate-500 font-medium hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-sm text-[10px] font-mono">Esc</kbd> anytime to close
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#0A192F] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
