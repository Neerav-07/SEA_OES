import React from 'react';

/**
 * Kshamata Brand Wordmark & Official Emblem Component
 * Displays the authentic high-resolution graduation scholar & blooming knowledge book emblem
 * alongside the crisp Kshamata typography, or icon-only when collapsed.
 * Supports `boxed` prop for dark areas (footer, auth pages) to contain logo and text in a sleek light box.
 */
export default function KshamataLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showTagline = false,
  light = false,
  collapsed = false,
  variant = 'full', // 'full' | 'icon'
  boxed = false,
}) {
  const isIconOnly = collapsed || variant === 'icon';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const currentIconSize = iconSizes[size] || iconSizes.md;
  const currentTextSize = textSizes[size] || textSizes.md;
  const effectiveLight = boxed ? false : light;

  if (isIconOnly) {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${
          boxed ? 'bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200/80' : ''
        } ${className}`}
        title="Kshamata"
      >
        <img
          src="/logo.png"
          alt="Kshamata"
          className={`${currentIconSize} object-contain transition-transform duration-300 hover:scale-110 drop-shadow-xs shrink-0`}
        />
      </div>
    );
  }

  const containerClasses = boxed
    ? `inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/90 select-none hover:shadow-lg transition-all ${className}`
    : `inline-flex items-center gap-1.5 select-none ${className}`;

  return (
    <div className={containerClasses}>
      {/* Official Realistic Emblem */}
      <img
        src="/logo.png"
        alt="Kshamata Logo"
        className={`${currentIconSize} object-contain transition-transform duration-300 hover:scale-105 drop-shadow-xs shrink-0`}
      />

      {/* Brand Typography */}
      <div className="flex flex-col items-start leading-none whitespace-nowrap">
        <div className={`tracking-tight font-black ${currentTextSize} flex items-center`}>
          <span
            className={
              effectiveLight
                ? 'text-white'
                : 'bg-gradient-to-r from-[#1E3A8A] via-[#0F172A] to-[#020617] bg-clip-text text-transparent'
            }
          >
            Kshamata
          </span>
        </div>

        {showTagline && (
          <span
            className={`mt-1 text-[9.5px] font-extrabold uppercase tracking-[0.2em] transition-opacity duration-200 ${
              effectiveLight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Competency Intelligence
          </span>
        )}
      </div>
    </div>
  );
}


