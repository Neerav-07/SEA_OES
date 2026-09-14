/**
 * ProgressBar Component
 * Visual progress indicator with smooth hardware-accelerated transitions
 */

const ProgressBar = ({
	value = 0,
	max = 100,
	size = 'md',
	color = 'primary',
	showLabel = true,
	label = '',
	animated = true,
	className = '',
}) => {
	const percentage = Math.min(Math.max(value, 0), max);
	const percent = max > 0 ? (percentage / max) * 100 : 0;

	const sizeClasses = {
		sm: 'h-1.5',
		md: 'h-2.5',
		lg: 'h-3.5',
		xl: 'h-5',
	};

	const colorClasses = {
		primary: 'bg-gradient-to-r from-blue-700 via-[#1E3A8A] to-slate-950',
		success: 'bg-gradient-to-r from-emerald-600 to-teal-700',
		warning: 'bg-gradient-to-r from-amber-500 to-amber-600',
		danger: 'bg-gradient-to-r from-red-600 to-rose-700',
		info: 'bg-gradient-to-r from-blue-600 to-indigo-700',
	};

	return (
		<div className={`select-none ${className}`}>
			<div className={`w-full bg-slate-100/90 border border-slate-200/80 rounded-full p-0.5 shadow-inner overflow-hidden relative ${sizeClasses[size] || sizeClasses.md}`}>
				<div
					className={`${colorClasses[color] || colorClasses.primary} ${animated ? 'transition-all duration-500 ease-out' : ''} h-full rounded-full relative overflow-hidden shadow-xs`}
					style={{ width: `${Math.min(100, Math.max(percent > 0 ? 2 : 0, percent))}%` }}
				>
					{animated && percent > 0 && (
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full animate-shimmer-sweep pointer-events-none" />
					)}
				</div>
			</div>
			{showLabel && (
				<div className='flex items-center justify-between text-xs font-semibold text-slate-600 mt-1.5 px-0.5'>
					<span>{label}</span>
					<span className='font-mono font-bold text-slate-900 tabular-nums ml-auto'>
						{Math.round(percent)}%
					</span>
				</div>
			)}
		</div>
	);
};

export default ProgressBar;
