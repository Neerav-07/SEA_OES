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
        {/* Sleek Gradient K Anchor (Deep Dark Blue to Midnight Black) */}
        <span
          className={`font-black tracking-tighter transition-transform duration-300 hover:scale-105 ${
            light
              ? 'text-white'
              : 'bg-gradient-to-r from-[#1E3A8A] via-[#0F172A] to-[#020617] bg-clip-text text-transparent'
          }`}
        >
          K
        </span>

        {/* Smooth Collapsing Characters: "shamata" (Continuing Dark Blue to Black Gradient) */}
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${
            collapsed ? 'max-w-0 opacity-0 -translate-x-2 overflow-hidden' : 'max-w-xs opacity-100 translate-x-0'
          }`}
        >
          <span
            className={`font-bold tracking-tight ${
              light
                ? 'text-slate-100'
                : 'bg-gradient-to-r from-[#1E3A8A] via-[#0F172A] to-[#020617] bg-clip-text text-transparent'
            }`}
          >
            shamata
          </span>
        </div>
      </div>

      {showTagline && !collapsed && (
        <span className={`mt-1 text-[10px] font-extrabold uppercase tracking-[0.22em] transition-opacity duration-200 ${light ? 'text-slate-400' : 'text-slate-500'}`}>
          Competency Intelligence
        </span>
      )}
    </div>
  );
}
