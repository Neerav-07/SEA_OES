import React from 'react';

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
	const baseStyles = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed select-none';

	const variantStyles = {
		primary:
			'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white font-bold hover:from-blue-900 hover:to-slate-900 active:scale-95 shadow-xs transition-all',
		secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold shadow-2xs transition-all',
		tertiary: 'text-[#1E3A8A] hover:bg-blue-50 font-bold transition-all',
		danger: 'bg-red-700 text-white font-bold hover:bg-red-800 active:scale-95 shadow-xs transition-all',
		success: 'bg-emerald-700 text-white font-bold hover:bg-emerald-800 active:scale-95 shadow-xs transition-all',
		ghost: 'bg-transparent text-slate-700 font-semibold hover:bg-slate-100 transition-all',
	};

	const sizeStyles = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
		xl: 'px-8 py-4 text-lg',
	};

	const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${fullWidth ? 'w-full' : ''} ${className}`;

	const renderContent = () => {
		if (!loading) {
			return children;
		}

		// When loading, check if there is an existing icon in children
		// If a refresh/rotate/cycle icon is present, spin that existing icon directly!
		// If another static icon is present, replace it with the spinner so no duplicate icon appears side-by-side.
		let hasHandledFirstIcon = false;
		const childrenArray = React.Children.toArray(children);
		const hasLeadingIcon = childrenArray.length > 0 && React.isValidElement(childrenArray[0]);

		if (!hasLeadingIcon) {
			return (
				<>
					<span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 opacity-90' />
					{children}
				</>
			);
		}

		return React.Children.map(children, (child) => {
			if (!hasHandledFirstIcon && React.isValidElement(child)) {
				hasHandledFirstIcon = true;
				const typeName =
					child.type?.displayName ||
					child.type?.name ||
					(typeof child.type === 'string' ? child.type : '');
				const classStr = child.props?.className || '';
				const isRefreshOrSync =
					/refresh|rotate|sync|repeat|reload/i.test(typeName) ||
					/refresh|rotate|sync|repeat|reload/i.test(classStr);

				if (isRefreshOrSync) {
					return React.cloneElement(child, {
						className: classStr.includes('animate-spin')
							? classStr
							: `${classStr} animate-spin`.trim(),
					});
				}

				// For other static icons, smoothly substitute with the spinner
				return (
					<span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 opacity-90' />
				);
			}
			return child;
		});
	};

	return (
		<Component
			type={Component === 'button' ? type : undefined}
			onClick={onClick}
			disabled={disabled || loading}
			className={styles}
			{...props}
		>
			{renderContent()}
		</Component>
	);
};

export default Button;

