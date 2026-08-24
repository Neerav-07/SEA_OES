import { Link } from 'react-router-dom';
import KshamataLogo from './KshamataLogo';

const Header = ({
	logoHref = '/',
	navItems = [],
	userMenu = null,
	onLogoClick = null,
	position = 'sticky',
	className = '',
	style,
}) => {
	const positionClass = position === 'fixed' ? 'fixed inset-x-0 top-0' : 'sticky top-0';

	const brand = onLogoClick ? (
		<button
			type='button'
			className='flex items-center gap-3 group text-left'
			onClick={onLogoClick}
		>
			<KshamataLogo size="md" />
		</button>
	) : (
		<Link to={logoHref} className='flex items-center gap-3 group'>
			<KshamataLogo size="md" />
		</Link>
	);

	return (
		<header
			className={`${positionClass} z-50 border-b border-(--app-color-border) shadow-xs ${className}`}
			style={{
				backdropFilter: 'blur(16px)',
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				...style,
			}}
		>
			<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
				{brand}

				<nav className='hidden items-center gap-6 md:flex'>
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<a
								key={item.label}
								href={item.href}
								className='flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#1D4ED8] transition-colors'
							>
								{Icon && <Icon size={16} className="text-[#1D4ED8]" />}
								{item.label}
							</a>
						);
					})}
				</nav>

				<div className='flex items-center gap-3'>{userMenu}</div>
			</div>
		</header>
	);
};

export default Header;
