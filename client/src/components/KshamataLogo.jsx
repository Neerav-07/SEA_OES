import React from 'react';

/**
 * Kshamata Brand Wordmark Component
 * Renders pure, sleek HTML/CSS typography with deepest midnight navy & dark sapphire blue styling.
 */
export default function KshamataLogo({ 
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showTagline = false,
  light = false,
  collapsed = false,
}) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl lg:text-5xl',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex flex-col items-start select-none overflow-hidden ${className}`}>
      <div className={`tracking-tight ${currentSize} flex items-center leading-none whitespace-nowrap`}>
        {/* Sleek Gradient K Anchor */}
        <span className="font-extrabold tracking-tighter bg-gradient-to-br from-[#020617] via-[#1E3A8A] to-[#0F172A] bg-clip-text text-transparent transform transition-transform duration-300 hover:scale-105">
          K
        </span>

        {/* Smooth Collapsing Characters: "sham" + "ata" */}
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${
            collapsed ? 'max-w-0 opacity-0 -translate-x-2 overflow-hidden' : 'max-w-xs opacity-100 translate-x-0'
          }`}
        >
          <span className={`${light ? "text-white" : "text-[#020617]"} font-medium tracking-tight`}>
            sham
          </span>
          <span className="font-bold tracking-tight bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
            ata
          </span>
        </div>
      </div>

      {showTagline && !collapsed && (
        <span className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity duration-200 ${light ? 'text-slate-400' : 'text-slate-600'}`}>
          Competency Intelligence
        </span>
      )}
    </div>
  );
}
