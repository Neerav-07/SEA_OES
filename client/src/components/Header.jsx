import { Link } from 'react-router-dom';
import KshamataLogo from './KshamataLogo';
import GovHeaderBanner from './GovHeaderBanner';

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
			<KshamataLogo size="md" variant="full" />
		</button>
	) : (
		<Link to={logoHref} className='flex items-center gap-3 group'>
			<KshamataLogo size="md" variant="full" />
		</Link>
	);

	return (
		<div className={`${positionClass} z-50`}>
			<GovHeaderBanner />
			<header
				className={`border-b border-(--app-color-border) shadow-[0_10px_30px_rgba(11,20,34,0.04)] ${className}`}
				style={{
					backdropFilter: 'blur(18px)',
					backgroundColor: 'rgba(255, 255, 255, 0.92)',
					...style,
				}}
			>
				<div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
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
	</div>
	);
};

export default Header;
