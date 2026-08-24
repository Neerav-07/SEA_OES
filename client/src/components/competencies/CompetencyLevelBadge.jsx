import { COMPETENCY_LEVELS } from '../../utils/constants';

export default function CompetencyLevelBadge({ level = 1, showDescription = false }) {
  const roundedLevel = Math.min(5, Math.max(1, Math.round(level)));
  const config = COMPETENCY_LEVELS[roundedLevel] || COMPETENCY_LEVELS[1];

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-bold ${config.badgeBg}`}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
        Level {level} • {config.title.split('— ')[1] || 'Awareness'}
      </span>
      {showDescription && (
        <p className="text-[11px] text-slate-500 font-medium leading-normal">{config.desc}</p>
      )}
    </div>
  );
}
