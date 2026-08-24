import React from 'react';

/**
 * Kshamata Brand Logo Component
 * Renders the vector mark, wordmark, and subtitle matching the official branding.
 */
export default function KshamataLogo({ 
  variant = 'full', // 'full' | 'compact' | 'icon'
  size = 'md',      // 'sm' | 'md' | 'lg'
  className = '',
  showSubtitle = true
}) {
  // Height sizing
  const heightMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  const currentHeight = heightMap[size] || heightMap.md;

  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={`${currentHeight} w-auto ${className}`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="kGraphGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        {/* K base backbone */}
        <path d="M 22 18 L 36 18 L 36 82 L 22 82 Z" fill="#0F172A" />
        {/* Person head dot */}
        <circle cx="48" cy="24" r="9" fill="#7C3AED" />
        {/* Upward dynamic arrow leg */}
        <path 
          d="M 28 62 C 38 48 54 36 78 22 L 78 38 L 68 28 L 78 22 L 84 32" 
          stroke="url(#kGraphGrad)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Downward leg */}
        <path d="M 36 50 L 72 82 L 56 82 L 28 58 Z" fill="#0F172A" />
      </svg>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className={`flex items-center gap-2.5 ${currentHeight}`}>
        {/* Vector SVG Brand Mark */}
        <svg 
          viewBox="0 0 540 130" 
          className="h-full w-auto" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Arrow & K Swoosh Gradient */}
            <linearGradient id="kSwooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="45%" stopColor="#4F46E5" />
              <stop offset="90%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>

            {/* ATA Purple Gradient */}
            <linearGradient id="ataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            {/* Line Gradient */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="80%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* ── STYLIZED 'K' WITH UPWARD ARROW & PERSON ── */}
          {/* Stem */}
          <rect x="20" y="24" width="18" height="82" rx="4" fill="#0F172A" />
          {/* Person Head */}
          <circle cx="58" cy="22" r="10" fill="#7C3AED" />
          {/* Dynamic Arrow Arc */}
          <path 
            d="M 24 74 C 36 62 58 44 88 24" 
            stroke="url(#kSwooshGrad)" 
            strokeWidth="15" 
            strokeLinecap="round" 
          />
          {/* Arrowhead */}
          <path d="M 88 24 L 72 26 L 86 38 Z" fill="#9333EA" />
          {/* K lower leg */}
          <path d="M 38 60 L 80 106 H 60 L 26 68 Z" fill="#0F172A" />

          {/* ── WORDMARK 'sham' ── */}
          {/* s */}
          <path d="M 112 60 C 112 50 122 46 134 46 C 146 46 156 50 156 60 C 156 74 114 72 114 90 C 114 102 126 108 138 108 C 150 108 160 102 160 94 H 144 C 144 98 138 100 134 100 C 128 100 124 96 124 90 C 124 78 166 80 166 60 C 166 48 152 40 134 40 C 116 40 102 48 102 60 Z" fill="#0F172A" />
          
          {/* h */}
          <path d="M 172 24 H 188 V 56 C 192 48 202 44 212 44 C 226 44 234 52 234 68 V 106 H 218 V 70 C 218 60 212 54 204 54 C 194 54 188 62 188 74 V 106 H 172 Z" fill="#0F172A" />

          {/* a */}
          <path d="M 264 44 C 246 44 238 56 238 76 C 238 96 248 108 264 108 C 274 108 282 102 286 96 V 106 H 300 V 46 H 286 V 56 C 282 48 274 44 264 44 Z M 270 94 C 260 94 254 88 254 76 C 254 64 260 58 270 58 C 280 58 286 64 286 76 C 286 88 280 94 270 94 Z" fill="#0F172A" />

          {/* m with internal Chart Icon */}
          <path d="M 308 46 H 322 V 56 C 326 48 334 44 344 44 C 354 44 360 50 364 58 C 370 48 380 44 392 44 C 404 44 412 52 412 68 V 106 H 396 V 70 C 396 60 392 54 384 54 C 376 54 370 62 370 74 V 106 H 354 V 70 C 354 60 350 54 342 54 C 334 54 328 62 328 74 V 106 H 308 Z" fill="#0F172A" />
          {/* Embedded Bar Chart inside 'm' */}
          <rect x="336" y="86" width="4" height="12" rx="1" fill="#7C3AED" />
          <rect x="343" y="80" width="4" height="18" rx="1" fill="#4F46E5" />
          <rect x="350" y="74" width="4" height="24" rx="1" fill="#0284C7" />

          {/* ── WORDMARK 'ata' (VIOLET GRADIENT) ── */}
          {/* a */}
          <path d="M 438 44 C 420 44 412 56 412 76 C 412 96 422 108 438 108 C 448 108 456 102 460 96 V 106 H 474 V 46 H 460 V 56 C 456 48 448 44 438 44 Z M 444 94 C 434 94 428 88 428 76 C 428 64 434 58 444 58 C 454 58 460 64 460 76 C 460 88 454 94 444 94 Z" fill="url(#ataGrad)" />

          {/* t */}
          <path d="M 488 32 V 46 H 478 V 58 H 488 V 88 C 488 98 494 106 506 106 C 510 106 514 104 518 102 L 514 88 C 512 89 510 90 506 90 C 502 90 500 87 500 82 V 58 H 516 V 46 H 500 V 32 Z" fill="url(#ataGrad)" />

          {/* a */}
          <path d="M 540 44 C 522 44 514 56 514 76 C 514 96 524 108 540 108 C 550 108 558 102 562 96 V 106 H 576 V 46 H 562 V 56 C 558 48 550 44 540 44 Z M 546 94 C 536 94 530 88 530 76 C 530 64 536 58 546 58 C 556 58 562 64 562 76 C 562 88 556 94 546 94 Z" fill="url(#ataGrad)" />
        </svg>
      </div>

      {/* Subtitle baseline */}
      {showSubtitle && variant === 'full' && (
        <div className="flex items-center gap-2 mt-0.5 px-0.5">
          <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-purple-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 whitespace-nowrap">
            Competency <span className="text-purple-600 font-black">•</span> Learning <span className="text-purple-600 font-black">•</span> Future-Ready
          </span>
          <div className="h-[1px] flex-1 min-w-[24px] bg-gradient-to-l from-transparent to-purple-400" />
        </div>
      )}
    </div>
  );
}
