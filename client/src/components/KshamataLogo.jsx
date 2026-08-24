import React from 'react';

/**
 * Kshamata Brand Wordmark Component
 * Renders pure, sleek HTML/CSS typography with exact brand gradient.
 * - 'Ksham': Deep Navy (#0F172A)
 * - 'ata': Sleek Violet/Purple Gradient (#7C3AED -> #9333EA)
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
        <span className="bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
          ata
        </span>
        <span className="ml-2 rounded-md bg-violet-100/80 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7C3AED] border border-violet-200/80">
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
