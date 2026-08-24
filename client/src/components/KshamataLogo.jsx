import React from 'react';

/**
 * Kshamata Brand Wordmark Component
 * Renders pure, sleek HTML/CSS typography with deepest midnight navy & dark sapphire blue styling.
 */
export default function KshamataLogo({ 
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showTagline = false,
  light = false
}) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl lg:text-5xl',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

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
