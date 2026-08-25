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

  if (collapsed) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 shadow-md ring-1 ring-blue-500/30 group hover:scale-105 transition-transform">
          <span className="font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">
            K
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className={`tracking-tight ${currentSize} flex items-center leading-none`}>
        <span className={`${light ? "text-white" : "text-[#020617]"} font-medium tracking-tight`}>Ksham</span>
        <span className="font-bold tracking-tight bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
          ata
        </span>
      </div>
      {showTagline && (
        <span className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${light ? 'text-slate-400' : 'text-slate-600'}`}>
          Competency Intelligence
        </span>
      )}
    </div>
  );
}
