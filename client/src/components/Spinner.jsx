import React, { useState, useEffect } from 'react';

/**
 * Enterprise Minimalist Loader Suite with Dynamic Growing Percentage
 * 
 * Variants:
 *  - 'bar': Clean horizontal progress bar with growing percentage & mild description
 *  - 'radial': Circular percentage progress ring with smooth growing counter
 *  - 'circular': Minimalist spinning ring with dark blue-black gradient
 */
export default function Spinner({
  size = 'md',
  variant = 'bar',      // 'bar' | 'radial' | 'circular'
  label = '',
  description = 'Initializing workspace & validating FRAC competency models...',
  progress = null,     // optional target percentage (0 - 100)
  fullScreen = false,
  className = '',
}) {
  const [currentVal, setCurrentVal] = useState(0);

  const targetValue = progress !== null ? progress : 84;

  // Smooth percentage growing animation
  useEffect(() => {
    setCurrentVal(0);
    const duration = 1200; // ms
    const interval = 20; // ms
    const totalSteps = duration / interval;
    const increment = targetValue / totalSteps;
    let val = 0;

    const timer = setInterval(() => {
      val += increment;
      if (val >= targetValue) {
        setCurrentVal(targetValue);
        clearInterval(timer);
      } else {
        setCurrentVal(val);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [progress, targetValue]);

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
    xl: 'w-18 h-18 border-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ── 1. BAR VARIANT (Horizontal Progress Bar with Growing % & Subtext) ──────
  if (variant === 'bar') {
    const barContent = (
      <div className={`flex flex-col items-center justify-center space-y-2.5 p-6 text-center select-none ${className}`}>
        {/* Progress Bar Track */}
        <div className="w-full max-w-sm bg-slate-100 border border-slate-200/90 rounded-full p-1 shadow-inner relative overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 transition-all duration-150 ease-out shadow-xs"
            style={{ width: `${Math.min(100, Math.max(2, currentVal))}%` }}
          />
        </div>

        {/* Label & Growing Percentage */}
        <div className="flex items-center justify-between w-full max-w-sm text-xs font-extrabold text-slate-800 px-1 pt-0.5">
          <span className="truncate">{label || 'Processing...'}</span>
          <span className="text-blue-900 font-mono font-black text-sm ml-2">
            {Math.round(currentVal)}%
          </span>
        </div>

        {/* Small Mild Description */}
        {description && (
          <p className="text-[11px] font-medium text-slate-500 max-w-sm leading-tight">
            {description}
          </p>
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

  // ── 2. RADIAL VARIANT (Circular Progress Ring with Growing Counter) ────────
  if (variant === 'radial') {
    const strokeDashoffset = 100 - currentVal;

    const radialContent = (
      <div className={`flex flex-col items-center justify-center space-y-2.5 p-6 text-center select-none ${className}`}>
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
              className="text-slate-950 transition-all duration-150 stroke-current"
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
            <span className="text-xs font-black text-slate-900 font-mono">{Math.round(currentVal)}%</span>
          </div>
        </div>

        {label && <p className="text-xs font-bold text-slate-800 max-w-xs">{label}</p>}
        {description && <p className="text-[11px] font-medium text-slate-500 max-w-xs leading-tight">{description}</p>}
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
      {label && <p className="text-xs font-bold text-slate-800 max-w-xs">{label}</p>}
      {description && <p className="text-[11px] font-medium text-slate-500 max-w-xs leading-tight">{description}</p>}
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
