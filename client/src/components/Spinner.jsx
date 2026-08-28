import React, { useState, useEffect } from 'react';

/**
 * Enterprise Minimalist Loader Suite with Standard Dynamic Growing Percentage
 * Unified across all tabs in both Employee & Admin roles.
 */
export default function Spinner({
  size = 'md',
  variant = 'bar',
  label = '',
  description = 'Initializing workspace & validating FRAC competency models...',
  progress = null,
  fullScreen = false,
  className = '',
}) {
  const [currentVal, setCurrentVal] = useState(0);

  const targetValue = progress !== null ? progress : 84;

  useEffect(() => {
    setCurrentVal(0);
    const duration = 1100; // ms
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

  const barContent = (
    <div className={`flex flex-col items-center justify-center space-y-2 p-6 text-center select-none ${className}`}>
      {/* Progress Bar Track */}
      <div className="w-full max-w-lg bg-slate-100/90 border border-slate-200/90 rounded-full h-3 p-0.5 shadow-inner relative overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 transition-all duration-150 ease-out shadow-xs"
          style={{ width: `${Math.min(100, Math.max(2, currentVal))}%` }}
        />
      </div>

      {/* Label & Growing Percentage */}
      <div className="flex items-center justify-between w-full max-w-lg text-sm font-bold text-slate-900 px-1 pt-1">
        <span className="truncate">{label || 'Processing workspace data...'}</span>
        <span className="text-blue-900 font-mono font-bold text-sm ml-2">
          {Math.round(currentVal)}%
        </span>
      </div>

      {/* Mild Description */}
      {description && (
        <p className="text-xs font-normal text-slate-500 max-w-lg text-center pt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full">
          {barContent}
        </div>
      </div>
    );
  }

  return barContent;
}
