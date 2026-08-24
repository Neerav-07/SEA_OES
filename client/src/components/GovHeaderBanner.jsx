import React from 'react';

/**
 * Official Indian Government Top Utility Header
 * Standard compliance header for MoSPI / GIGW portal interfaces.
 */
export default function GovHeaderBanner() {
  return (
    <div className="bg-[#0F172A] text-slate-200 border-b border-slate-800 text-[11px] font-medium py-1.5 px-4 lg:px-12">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left side: Ministry & Government identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
            <span className="font-semibold text-slate-100">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Government of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-300">सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 font-semibold">MoSPI DIID & NSSTA</span>
          </div>
        </div>

        {/* Right side: Accessibility & Quick Gov Links */}
        <div className="flex items-center gap-4 text-[10px] text-slate-300">
          <div className="hidden md:flex items-center gap-3 border-r border-slate-700 pr-3">
            <a href="https://mospi.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              MoSPI Portal
            </a>
            <span>•</span>
            <a href="https://igotkarmayogi.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              iGOT Karmayogi
            </a>
            <span>•</span>
            <a href="https://nssta.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              NSSTA
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-300">GIGW Compliant</span>
            <span className="text-slate-400 font-bold">English</span>
          </div>
        </div>
      </div>
    </div>
  );
}
