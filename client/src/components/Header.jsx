import { Link } from 'react-router-dom';

/**
 * Header Component
 * Top navigation bar with logo, nav items, and user menu
 */

const Header = ({
	logo = 'Kshamata',
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
			className='flex items-center gap-3 logo-brand group'
			onClick={onLogoClick}
		>
			<img src='/navlogo.png' alt='Kshamata' className='h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110' />
			<div className="flex items-baseline gap-1.5">
				<span className="text-[22px] font-black tracking-tight text-[#172554]">Ksham<span className="text-[#4F46E5]">ata</span></span>
				<span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7C3AED] border border-violet-200">AI</span>
			</div>
		</button>
	) : (
		<Link to={logoHref} className='flex items-center gap-3 logo-brand group'>
			<img src='/navlogo.png' alt='Kshamata' className='h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110' />
			<div className="flex items-baseline gap-1.5">
				<span className="text-[22px] font-black tracking-tight text-[#172554]">Ksham<span className="text-[#4F46E5]">ata</span></span>
				<span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7C3AED] border border-violet-200">AI</span>
			</div>
		</Link>
	);

	return (
		<header
			className={`${positionClass} z-50 border-b border-(--app-color-border) shadow-[0_10px_30px_rgba(11,20,34,0.04)] ${className}`}
			style={{
				backdropFilter: 'blur(18px)',
				backgroundColor: 'rgba(247, 250, 252, 0.84)',
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
								className='nav-link-underline flex items-center gap-2 text-sm font-medium'
							>
								{Icon && <Icon size={16} className="text-(--app-color-success)/70" />}
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
