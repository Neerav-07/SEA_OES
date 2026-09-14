import React from 'react';
import Loader from './loadnet';

const GlobalLoader = ({ showTagline = false, isExiting = false }) => {
	return (
		<div
			className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none bg-[var(--app-gradient-auth-login)] ${
				isExiting ? 'animate-loader-exit' : ''
			}`}
			style={{ background: 'var(--app-gradient-auth-login)' }}
		>
			{/* Animated Background Elements */}
			<div className='absolute inset-0 opacity-25 pointer-events-none'>
				<div className='absolute -left-1/4 -top-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-blue-600/25 blur-[120px]' />
				<div className='absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-indigo-600/25 blur-[120px]' />
			</div>

			<div className='relative flex flex-col items-center gap-8'>
				<div className='scale-150'>
					<Loader size={1.8} color='#1E3A8A' />
				</div>

				{showTagline && (
					<div className='animate-tagline-reveal space-y-2.5 text-center px-4'>
						<h1 className='text-3xl font-black uppercase tracking-tight text-white lg:text-4xl'>
							KSHAMATA <br />
							<span className='text-blue-400 font-semibold text-lg lg:text-xl tracking-normal normal-case'>
								Capacity Building & Skill Intelligence Platform
							</span>
						</h1>
						<div className='mx-auto h-0.5 w-16 rounded-full bg-blue-400/60' />
						<p className='text-xs font-semibold text-slate-300 tracking-wider uppercase'>
							Ministry of Statistics and Programme Implementation
						</p>
					</div>
				)}
			</div>

			{/* Loading Progress Indicator (Subtle) */}
			{!showTagline && (
				<div className='absolute bottom-12 flex flex-col items-center gap-3'>
					<div className='h-1.5 w-48 overflow-hidden rounded-full bg-white/15 border border-white/10 relative'>
						<div className='h-full w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600 animate-shimmer-sweep' />
					</div>
					<div className='flex items-center gap-2'>
						<span className='relative flex h-1.5 w-1.5'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
							<span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400'></span>
						</span>
						<p className='text-[10px] font-bold uppercase tracking-[0.25em] text-white/70'>
							Establishing Secure Session
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default GlobalLoader;
