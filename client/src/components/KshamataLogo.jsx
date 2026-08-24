import React from 'react';

/**
 * Kshamata Brand Wordmark Component
 * Renders pure, sleek HTML/CSS typography with exact brand deep blue styling:
 * - 'Ksham': Deep Midnight Navy (#0F172A)
 * - 'ata': Deep Blue Gradient (#1D4ED8 -> #2563EB -> #3B82F6)
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
      <div className={`font-black tracking-tight ${currentSize} flex items-center leading-none`}>
        <span className="text-[#0F172A]">Ksham</span>
        <span className="bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
          ata
        </span>
        <span className="ml-2 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#1D4ED8] border border-blue-200/80 shadow-2xs">
          AI
        </span>
      </div>
      {showTagline && (
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Competency Intelligence
        </span>
      )}
    </div>
  );
}
