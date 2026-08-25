import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

/**
 * Kshamata Executive Loader & Spinner Suite
 * 
 * Variants:
 *  - 'circular' (default): Sleek spinning ring with deep dark blue to black gradient and glowing core dot
 *  - 'bar': Horizontal percentage/shimmer progress bar with dark blue-black gradient
 *  - 'radial': Circular percentage progress ring with live percentage counter
 */
export default function Spinner({
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  variant = 'circular', // 'circular' | 'bar' | 'radial'
  label = '',
  progress = null,     // optional 0 - 100 percentage
  fullScreen = false,
  className = '',
}) {
  // Size mapping for circular spinner
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
    xl: 'w-20 h-20 border-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ── 1. BAR VARIANT (Horizontal Progress Bar) ──────────────────────────────
  if (variant === 'bar') {
    const barContent = (
      <div className={`flex flex-col items-center justify-center space-y-3 p-6 text-center select-none ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-slate-950 text-blue-400 border border-slate-800 shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse text-blue-400" />
          </div>
          <span className="text-xs font-black tracking-tight text-slate-900">Kshamata Intelligence</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xs bg-slate-100 border border-slate-200/90 rounded-full p-1 shadow-inner relative overflow-hidden">
          <div
            className={`h-2.5 rounded-full bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 transition-all duration-300 ${
              progress === null ? 'w-full animate-progress-indefinite' : ''
            }`}
            style={progress !== null ? { width: `${Math.min(100, Math.max(0, progress))}%` } : {}}
          />
        </div>

        {/* Label & Percentage */}
        <div className="flex items-center justify-between w-full max-w-xs text-xs px-1 font-bold">
          <span className="text-slate-600 truncate">{label || 'Processing...'}</span>
          <span className="text-blue-900 font-mono font-black ml-2">
            {progress !== null ? `${Math.round(progress)}%` : '84%'}
          </span>
        </div>
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl">
            {barContent}
          </div>
        </div>
      );
    }
    return barContent;
  }

  // ── 2. RADIAL VARIANT (Circular Progress with Counter) ───────────────────
  if (variant === 'radial') {
    const displayProgress = progress !== null ? Math.round(progress) : 75;
    const strokeDashoffset = 100 - displayProgress;

    const radialContent = (
      <div className={`flex flex-col items-center justify-center space-y-3 p-6 text-center select-none ${className}`}>
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black text-slate-900 font-mono">{displayProgress}%</span>
          </div>
        </div>

        {label && <p className="text-xs font-bold text-slate-700 max-w-xs">{label}</p>}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl">
            {radialContent}
          </div>
        </div>
      );
    }
    return radialContent;
  }

  // ── 3. CIRCULAR VARIANT (Default Sleek Spinning Gradient Ring) ────────────
  const circularContent = (
    <div className={`flex flex-col items-center justify-center space-y-3.5 p-6 text-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing aura */}
        <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-sm animate-pulse"></div>

        {/* Spinning Gradient Ring */}
        <div
          className={`${currentSize} rounded-full border-t-slate-950 border-r-blue-900 border-b-indigo-900 border-l-slate-200 animate-spin shadow-xs`}
        />

        {/* Glowing Center Core */}
        <div className="absolute w-2 h-2 rounded-full bg-blue-600 shadow-sm animate-ping"></div>
      </div>

      {label && (
        <div className="space-y-1 max-w-sm">
          <p className="text-xs font-black tracking-tight text-slate-900">{label}</p>
          <p className="text-[11px] font-semibold text-slate-500">MoSPI Kshamata Engine</p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl">
          {circularContent}
        </div>
      </div>
    );
  }

  return circularContent;
}
