/**
 * StatCard Component
 * Displays key metrics with consistent enterprise formatting,
 * optional icons, and clean trend indicators.
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  label,
  value,
  change = null,
  trend = null,
  trendUp = true,
  trendLabel = '',
  subtitle = '',
  icon: Icon = null,
  className = '',
}) => {
  // Normalize trend state
  const isUp = trend === 'up' || (trendUp && trend !== 'down' && trend !== 'neutral');
  const isDown = trend === 'down' || (!trendUp && trend !== 'neutral');
  const isNeutral = trend === 'neutral';

  // Display text for the trend badge
  const displayText =
    change ||
    (trend && trend !== 'up' && trend !== 'down' && trend !== 'neutral' ? trend : '');

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1.5 truncate">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex-shrink-0 rounded-xl bg-blue-50 p-2.5 text-[#1E3A8A] border border-blue-100">
            <Icon className="w-5 h-5 text-[#1E3A8A]" />
          </div>
        )}
      </div>

      {displayText && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          {isNeutral ? (
            <span className="flex items-center gap-1 text-slate-500">
              <Minus size={13} className="text-slate-400" />
              <span>{displayText}</span>
            </span>
          ) : isUp ? (
            <span className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={13} className="text-emerald-600 shrink-0" />
              <span>{displayText}</span>
            </span>
          ) : isDown ? (
            <span className="flex items-center gap-1 text-rose-600">
              <TrendingDown size={13} className="text-rose-600 shrink-0" />
              <span>{displayText}</span>
            </span>
          ) : (
            <span className="text-slate-500">{displayText}</span>
          )}
          {trendLabel && <span className="text-slate-400 font-normal text-[11px]">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;

