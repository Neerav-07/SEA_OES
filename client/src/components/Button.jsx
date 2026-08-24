/**
 * Button Component
 * Modular button with multiple variants and states
 * Follows the central theme color palette with crisp white text on dark background
 */

const Button = ({
	onClick,
	children,
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	type = 'button',
	className = '',
	as: Component = 'button',
	fullWidth = false,
	...props
}) => {
	const baseStyles = 'font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

	const variantStyles = {
		primary:
			'bg-[#1E3A8A] text-white font-bold hover:bg-[#172554] active:scale-95 shadow-md',
		secondary: 'bg-[var(--app-color-surface-elevated)] text-[var(--app-color-text)] border border-[var(--app-color-border)] hover:bg-slate-200/80 font-semibold',
		tertiary: 'text-[#1E3A8A] hover:bg-blue-50 font-bold',
		danger: 'bg-red-700 text-white font-bold hover:bg-red-800 active:scale-95 shadow-md',
		success: 'bg-emerald-700 text-white font-bold hover:bg-emerald-800 active:scale-95 shadow-md',
		ghost: 'bg-transparent text-slate-700 font-semibold hover:bg-slate-100',
	};

	const sizeStyles = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
		xl: 'px-8 py-4 text-lg',
	};

	const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${fullWidth ? 'w-full' : ''} ${className}`;

	return (
		<Component
			type={Component === 'button' ? type : undefined}
			onClick={onClick}
			disabled={disabled || loading}
			className={styles}
			{...props}
		>
			{loading && <span className='inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
			{children}
		</Component>
	);
};

export default Button;
