import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';
import useAuthStore from '../../store/auth.store.js';
import { resolveTabKey, howItWorksTabs } from '../../data/howItWorksData.js';
import HowItWorksModal from './HowItWorksModal.jsx';

/**
 * HowItWorksButton Component
 * A clean, compact, professional info button with "How it works?"
 * Opens an authoritative modal detailing the tab's system workflow.
 */
export default function HowItWorksButton({ tabKey, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const activeTabKey = tabKey || resolveTabKey(location.pathname, isAdmin);

  if (!activeTabKey || !howItWorksTabs[activeTabKey]) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs transition-all shadow-xs hover:border-slate-300 hover:shadow-sm active:scale-95 cursor-pointer shrink-0 ${className}`}
        title="Understand how this section works"
        aria-label="How it works?"
      >
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200/80 group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors shrink-0">
          <Info className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
        <span className="text-slate-700 group-hover:text-slate-900 font-bold whitespace-nowrap">How it works?</span>
      </button>

      <HowItWorksModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tabKey={activeTabKey}
      />
    </>
  );
}
