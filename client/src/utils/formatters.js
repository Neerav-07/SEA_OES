/**
 * Utility Formatters for Kshamata Frontend
 */

export function formatCompetencyLevel(level, max = 5.0) {
  if (level === undefined || level === null) return 'Not Assessed';
  const num = Number(level);
  return `Level ${num.toFixed(1)} / ${max.toFixed(1)}`;
}

export function formatConfidence(confidence) {
  if (confidence === undefined || confidence === null) return '0%';
  const val = Number(confidence);
  const percentage = val > 1 ? val : val * 100;
  return `${Math.round(percentage)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getCompetencyBadgeStyle(level) {
  const l = Number(level) || 0;
  if (l >= 4.0) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (l >= 3.0) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (l >= 2.0) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
}
