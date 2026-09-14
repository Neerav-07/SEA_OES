import React, { useState, useEffect } from 'react';

/**
 * Enterprise Consistent Continuous Sliding Loader
 * Features a single, continuous progress bar that slides calmly and steadily from left to right,
 * with real-time continuous percentage progression and zero visual clutter (no blinking dots or live tags).
 */
export default function Spinner({
  size = 'md',
  variant = 'bar',
  label = '',
  description = '',
  subtext = '',
  progress = null,
  fullScreen = false,
  className = '',
}) {
  const isDeterminate = progress !== null && progress !== undefined && !Number.isNaN(Number(progress));
  const clampedProgress = isDeterminate ? Math.min(100, Math.max(0, Number(progress))) : null;
  const displayDesc = description || subtext;

  // Continuous steady progression for indeterminate loading
  const [simulatedPct, setSimulatedPct] = useState(14);

  useEffect(() => {
    if (isDeterminate) return;

    // Steady, consistent, continuous progression that glides calmly forward without stalling
    const interval = setInterval(() => {
      setSimulatedPct((prev) => {
        if (prev < 40) return prev + 0.8;
        if (prev < 75) return prev + 0.5;
        if (prev < 92) return prev + 0.25;
        if (prev < 98.8) return prev + 0.08;
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isDeterminate]);

  const displayPercent = isDeterminate ? clampedProgress : Math.min(99, simulatedPct);

  // Size styling configuration
  const trackHeight = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5';
  const barHeight = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2';
  const maxWidth = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-xl' : 'max-w-lg';

  const barContent = (
    <div className={`flex flex-col items-center justify-center space-y-2 p-6 text-center select-none ${className}`}>
      {/* Continuous Sliding Progress Bar Track */}
      <div className={`w-full ${maxWidth} bg-slate-100 border border-slate-200/90 rounded-full ${trackHeight} p-0.5 shadow-inner relative overflow-hidden`}>
        <div
          className={`${barHeight} rounded-full bg-gradient-to-r from-blue-700 via-[#1E3A8A] to-slate-900 transition-all duration-150 ease-out shadow-xs`}
          style={{ width: `${Math.min(100, Math.max(3, displayPercent))}%` }}
        />
      </div>

      {/* Clean Label & Continuous Percentage (Zero visual clutter, no blinking dots or badges) */}
      <div className={`flex items-center justify-between w-full ${maxWidth} text-xs sm:text-sm font-semibold text-slate-800 px-0.5 pt-0.5`}>
        <span className="truncate">{label || 'Loading workspace data...'}</span>
        <span className="font-mono font-bold text-slate-700 text-xs sm:text-sm ml-4 tabular-nums shrink-0">
          {Math.round(displayPercent)}%
        </span>
      </div>

      {/* Optional Description */}
      {displayDesc && (
        <p className={`text-xs font-normal text-slate-500 ${maxWidth} text-center pt-0.5 leading-relaxed`}>
          {displayDesc}
        </p>
      )}
    </div>
  );

  const radialContent = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          className="w-16 h-16 transform -rotate-90"
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            className="stroke-slate-200 fill-none"
            strokeWidth="3.5"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            className="stroke-[#1E3A8A] fill-none transition-all duration-150 ease-out"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * displayPercent) / 100}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono text-slate-800 tabular-nums">
            {Math.round(displayPercent)}%
          </span>
        </div>
      </div>
      {label && (
        <div className="mt-3 text-xs sm:text-sm font-semibold text-slate-800">
          {label}
        </div>
      )}
      {displayDesc && (
        <p className="text-xs font-normal text-slate-500 max-w-sm text-center mt-1 leading-relaxed">
          {displayDesc}
        </p>
      )}
    </div>
  );

  const content = (variant === 'radial' || variant === 'circle') ? radialContent : barContent;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
