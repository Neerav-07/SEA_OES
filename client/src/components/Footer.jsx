import { Link } from 'react-router-dom';
import { Mail, Terminal, Globe, Users, ExternalLink } from 'lucide-react';
import Container from './Container';

export default function Footer() {
	return (
		<footer className='border-t border-(--app-color-border) bg-(--app-color-surface) pt-20 pb-10'>
			<Container>
				<div className='grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr] pb-16'>
					<div className='space-y-6'>
						<Link to='/' className='flex items-center gap-3 logo-brand group'>
							<img src='/navlogo.png' alt='Kshamata' className='h-9 w-9 object-contain transition-transform duration-500 group-hover:rotate-12' />
							<div className="flex items-baseline gap-1.5">
								<span className="text-[22px] font-black tracking-tight text-[#172554]">Ksham<span className="text-[#4F46E5]">ata</span></span>
								<span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7C3AED] border border-violet-200">AI</span>
							</div>
						</Link>
						<p className='max-w-xs text-sm leading-7 text-(--app-color-text-muted)'>
							Evidence-driven competency intelligence and AI-enabled capacity building for India's Official Statistical System (MoSPI DIID & NSSTA).
						</p>
						<div className='flex items-center gap-4'>
							<a href='#' className='p-2 rounded-full border border-(--app-color-border) text-(--app-color-text-muted) hover:text-(--app-color-primary) hover:border-(--app-color-primary) transition-all'>
								<Globe size={18} />
							</a>
							<a href='#' className='p-2 rounded-full border border-(--app-color-border) text-(--app-color-text-muted) hover:text-(--app-color-primary) hover:border-(--app-color-primary) transition-all'>
								<Users size={18} />
							</a>
							<a href='#' className='p-2 rounded-full border border-(--app-color-border) text-(--app-color-text-muted) hover:text-(--app-color-primary) hover:border-(--app-color-primary) transition-all'>
								<Terminal size={18} />
							</a>
						</div>
					</div>

					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-(--app-color-text) mb-6'>Platform</h4>
						<ul className='space-y-4 text-sm text-(--app-color-text-muted)'>
							<li><a href='#product' className='hover:text-(--app-color-primary) transition-colors'>Competency Frameworks</a></li>
							<li><a href='#capabilities' className='hover:text-(--app-color-primary) transition-colors'>Skill Gap Intelligence</a></li>
							<li><a href='#workflow' className='hover:text-(--app-color-primary) transition-colors'>iGOT Karmayogi API</a></li>
							<li><Link to='/register' className='hover:text-(--app-color-primary) transition-colors'>Learner Onboarding</Link></li>
						</ul>
					</div>

					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-(--app-color-text) mb-6'>Ecosystem</h4>
						<ul className='space-y-4 text-sm text-(--app-color-text-muted)'>
							<li className='flex items-center gap-2'>
								<ExternalLink size={14} className='text-(--app-color-primary)' />
								<a href='https://mospi.gov.in' target='_blank' rel='noreferrer' className='hover:text-(--app-color-primary) transition-colors'>MoSPI Official</a>
							</li>
							<li className='flex items-center gap-2'>
								<ExternalLink size={14} />
								<a href='https://nssta.gov.in' target='_blank' rel='noreferrer' className='hover:text-(--app-color-primary) transition-colors'>NSSTA Training</a>
							</li>
							<li className='flex items-center gap-2'>
								<ExternalLink size={14} />
								<a href='https://igotkarmayogi.gov.in' target='_blank' rel='noreferrer' className='hover:text-(--app-color-primary) transition-colors'>iGOT Karmayogi</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-(--app-color-text) mb-6'>Governance</h4>
						<ul className='space-y-4 text-sm text-(--app-color-text-muted)'>
							<li><a href='#' className='hover:text-(--app-color-primary) transition-colors'>DIID Division</a></li>
							<li><a href='#' className='hover:text-(--app-color-primary) transition-colors'>Cyber Security Guidelines</a></li>
							<li><a href='#' className='hover:text-(--app-color-primary) transition-colors'>Data Privacy Framework</a></li>
							<li className='pt-2'>
								<span className='inline-flex items-center rounded-lg bg-(--app-color-primary-soft) px-2.5 py-1 text-[10px] font-bold text-(--app-color-primary) uppercase tracking-wider'>
									SIH 2026 PS 26101
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div className='pt-10 border-t border-(--app-color-border) flex flex-col md:flex-row items-center justify-between gap-6'>
					<p className='text-xs text-(--app-color-text-muted) font-medium'>
						© {new Date().getFullYear()} Kshamata (MoSPI DIID & NSSTA). All rights reserved.
					</p>
					<p className='text-xs text-(--app-color-text-muted)'>
						Built for <span className='font-bold text-(--app-color-text)'>India's Official Statistical System</span>
					</p>
					<div className='flex items-center gap-6 text-xs font-semibold text-(--app-color-text-muted) uppercase tracking-widest'>
						<a href='#' className='hover:text-(--app-color-text) transition-colors'>Cookie Policy</a>
						<a href='#' className='hover:text-(--app-color-text) transition-colors'>GDPR</a>
					</div>
				</div>
			</Container>
		</footer>
	);
}
