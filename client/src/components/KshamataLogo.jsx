import React from 'react';

/**
 * Kshamata Brand Wordmark Component
 * Renders pure, sleek HTML/CSS typography with deepest midnight navy & dark sapphire blue styling:
 * - 'Ksham': Deepest Midnight Navy (#020617)
 * - 'ata': Deep Dark Sapphire Blue Gradient (#1E3A8A -> #1D4ED8 -> #2563EB)
 */
export default function KshamataLogo({ 
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showTagline = false
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
        <span className="font-black italic tracking-tighter bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
          ata
        </span>
        <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-2xs border ${
          light 
            ? 'bg-white/15 text-white border-white/10' 
            : 'bg-blue-50/80 text-[#1D4ED8] border-blue-100'
        }`}>
          AI
        </span>
      </div>
      {showTagline && (
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Competency Intelligence
        </span>
      )}
    </div>
  );
}
