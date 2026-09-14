import { Link } from 'react-router-dom';
import { Globe, Shield, BookOpen, Award, ExternalLink, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Container from './Container';
import KshamataLogo from './KshamataLogo';

export default function Footer() {
	return (
		<footer className='border-t border-slate-200 bg-slate-900 text-white pt-16 pb-12 relative overflow-hidden'>
			{/* Subtle accent line */}
			<div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />

			<Container>
				<div className='grid gap-12 sm:grid-cols-2 lg:grid-cols-5 pb-16 border-b border-slate-800'>
					{/* Brand Column */}
					<div className='lg:col-span-2 space-y-6'>
						<Link to='/' className='inline-block group'>
							<KshamataLogo size="md" boxed />
						</Link>
						<p className='max-w-md text-sm leading-relaxed text-slate-300 font-medium'>
							AI-enabled Competency Intelligence & Learning Platform for India's Official Statistical System.
							Designed for MoSPI Data Informatics & Innovation Division (DIID) and National Statistical Systems Training Academy (NSSTA).
						</p>
						<div className="flex flex-wrap items-center gap-3 pt-2">
							<span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-950/80 border border-blue-800/80 px-3 py-1 text-xs font-semibold text-blue-200">
								<Shield size={14} className="text-blue-400" /> National Statistical System
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 text-xs font-semibold text-emerald-200">
								<CheckCircle2 size={14} className="text-emerald-400" /> GIGW Compliant
							</span>
						</div>
					</div>

					{/* Capabilities Column */}
					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6'>Core Modules</h4>
						<ul className='space-y-3.5 text-sm text-slate-300 font-medium'>
							<li>
								<Link to="/dashboard/competencies" className='hover:text-white transition-colors flex items-center gap-1.5'>
									Competency Profiles
								</Link>
							</li>
							<li>
								<Link to="/dashboard/skill-gaps" className='hover:text-white transition-colors flex items-center gap-1.5'>
									Skill Gap Intelligence
								</Link>
							</li>
							<li>
								<Link to="/dashboard/learning-paths" className='hover:text-white transition-colors flex items-center gap-1.5'>
									iGOT & NSSTA Pathways
								</Link>
							</li>
							<li>
								<Link to="/dashboard/assessments" className='hover:text-white transition-colors flex items-center gap-1.5'>
									Assessment Studio
								</Link>
							</li>
							<li>
								<Link to="/dashboard/analytics" className='hover:text-white transition-colors flex items-center gap-1.5'>
									Workforce Analytics
								</Link>
							</li>
						</ul>
					</div>

					{/* Portals & Ecosystem */}
					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6'>Official Portals</h4>
						<ul className='space-y-3.5 text-sm text-slate-300 font-medium'>
							<li>
								<a href='https://mospi.gov.in' target='_blank' rel='noreferrer' className='hover:text-white transition-colors inline-flex items-center gap-1.5'>
									MoSPI Official Portal <ArrowUpRight size={13} className="text-slate-400" />
								</a>
							</li>
							<li>
								<a href='https://nssta.gov.in' target='_blank' rel='noreferrer' className='hover:text-white transition-colors inline-flex items-center gap-1.5'>
									NSSTA Academy <ArrowUpRight size={13} className="text-slate-400" />
								</a>
							</li>
							<li>
								<a href='https://igotkarmayogi.gov.in' target='_blank' rel='noreferrer' className='hover:text-white transition-colors inline-flex items-center gap-1.5'>
									iGOT Karmayogi <ArrowUpRight size={13} className="text-slate-400" />
								</a>
							</li>
							<li>
								<a href='https://ndap.niti.gov.in' target='_blank' rel='noreferrer' className='hover:text-white transition-colors inline-flex items-center gap-1.5'>
									NDAP Portal <ArrowUpRight size={13} className="text-slate-400" />
								</a>
							</li>
						</ul>
					</div>

					{/* Legal & Governance */}
					<div>
						<h4 className='text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6'>Governance</h4>
						<ul className='space-y-3.5 text-sm text-slate-300 font-medium'>
							<li><a href='#' className='hover:text-white transition-colors'>DIID Frameworks</a></li>
							<li><a href='#' className='hover:text-white transition-colors'>Cybersecurity Policy</a></li>
							<li><a href='#' className='hover:text-white transition-colors'>Data Privacy Policy</a></li>
							<li><a href='#' className='hover:text-white transition-colors'>Accessibility Statement</a></li>
							<li><a href='#' className='hover:text-white transition-colors'>Terms of Service</a></li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium'>
					<p>© {new Date().getFullYear()} Ministry of Statistics and Programme Implementation (MoSPI), Government of India.</p>
					<div className="flex items-center gap-6">
						<span>Security Audit Certified</span>
						<span>•</span>
						<span>GIGW Compliant</span>
						<span>•</span>
						<span>Digital India Initiative</span>
					</div>
				</div>
			</Container>
		</footer>
	);
}
