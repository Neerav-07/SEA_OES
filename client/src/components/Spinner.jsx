import React from 'react';

/**
 * Enterprise Minimalist Loader Suite
 * 
 * Variants:
 *  - 'circular' (default): Minimalist spinning ring with dark blue-black gradient
 *  - 'bar': Clean horizontal progress bar with dark blue-black gradient
 *  - 'radial': Clean circular percentage ring
 */
export default function Spinner({
  size = 'md',
  variant = 'circular', // 'circular' | 'bar' | 'radial'
  label = '',
  progress = null,     // optional percentage (0 - 100)
  fullScreen = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ── 1. BAR VARIANT (Horizontal Clean Progress Bar) ─────────────────────────
  if (variant === 'bar') {
    const barContent = (
      <div className={`flex flex-col items-center justify-center space-y-2.5 p-6 text-center select-none ${className}`}>
        {/* Progress Bar Track */}
        <div className="w-full max-w-xs bg-slate-100 border border-slate-200/80 rounded-full p-0.5 shadow-inner relative overflow-hidden">
          <div
            className={`h-2 rounded-full bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 transition-all duration-300 ${
              progress === null ? 'w-full animate-progress-indefinite' : ''
            }`}
            style={progress !== null ? { width: `${Math.min(100, Math.max(0, progress))}%` } : {}}
          />
        </div>

        {/* Label & Percentage */}
        {label && (
          <div className="flex items-center justify-between w-full max-w-xs text-xs font-semibold text-slate-600 px-0.5">
            <span className="truncate">{label}</span>
            {progress !== null && (
              <span className="text-slate-900 font-mono font-bold ml-2">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl">
            {barContent}
          </div>
        </div>
      );
    }
    return barContent;
  }

  // ── 2. RADIAL VARIANT (Clean Circular Counter) ────────────────────────────
  if (variant === 'radial') {
    const displayProgress = progress !== null ? Math.round(progress) : 80;
    const strokeDashoffset = 100 - displayProgress;

    const radialContent = (
      <div className={`flex flex-col items-center justify-center space-y-2.5 p-6 text-center select-none ${className}`}>
        <div className="relative flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-slate-950 transition-all duration-500 stroke-current"
              strokeWidth="3.5"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              style={{ stroke: 'url(#gradient-radial)' }}
            />
            <defs>
              <linearGradient id="gradient-radial" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="50%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black text-slate-900 font-mono">{displayProgress}%</span>
          </div>
        </div>

        {label && <p className="text-xs font-semibold text-slate-600 max-w-xs">{label}</p>}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl">
            {radialContent}
          </div>
        </div>
      );
    }
    return radialContent;
  }

  // ── 3. CIRCULAR VARIANT (Default Sleek Spinning Ring) ─────────────────────
  const circularContent = (
    <div className={`flex flex-col items-center justify-center space-y-3 p-6 text-center select-none ${className}`}>
      <div
        className={`${currentSize} rounded-full border-t-slate-950 border-r-blue-900 border-b-indigo-900 border-l-slate-200 animate-spin shadow-xs`}
      />
      {label && <p className="text-xs font-semibold text-slate-600 max-w-xs">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl">
          {circularContent}
        </div>
      </div>
    );
  }

  return circularContent;
}
