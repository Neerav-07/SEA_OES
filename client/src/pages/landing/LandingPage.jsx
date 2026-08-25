import { Link } from 'react-router-dom';
import { Award, BarChart3, GraduationCap, FileCheck, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import KshamataLogo from '../../components/KshamataLogo';
import Footer from '../../components/Footer';
import HeroProductStoryDemo from '../../components/landing/HeroProductStoryDemo';

const FEATURES = [
  {
    icon: Award,
    badge: 'MoSPI Taxonomy',
    title: 'Role Competency Frameworks',
    desc: 'Maps statistical, technical, digital governance, and managerial competencies across official roles in MoSPI DIID and state statistical departments.',
  },
  {
    icon: BarChart3,
    badge: 'Evidence Fusion',
    title: 'Evidence-Driven Skill Gaps',
    desc: 'Evaluates existing capabilities against required role profiles using diagnostic evidence, confidence scores, and auditable provenance.',
  },
  {
    icon: GraduationCap,
    badge: 'iGOT Karmayogi',
    title: 'iGOT & NSSTA Integration',
    desc: 'Recommends personalized learning pathways directly integrated with iGOT Karmayogi modules and NSSTA TPAC training programmes.',
  },
  {
    icon: FileCheck,
    badge: 'AI MCQ Generator',
    title: 'Intelligent Assessment Engine',
    desc: 'Generates grounded MCQs and diagnostic quizzes directly from uploaded documents, presentations, and training materials with instant evaluation.',
  },
  {
    icon: TrendingUp,
    badge: 'Workforce Analytics',
    title: 'Learner & Admin Dashboards',
    desc: 'Empowers officials with personal progress tracking and gives administrators organization-wide workforce analytics and predictive capacity insights.',
  },
  {
    icon: ShieldCheck,
    badge: 'GIGW & Cyber Standard',
    title: 'Cloud-Ready & Cyber Compliant',
    desc: 'Built with role-based access control (RBAC), SSO integration, and strict alignment with official government cybersecurity guidelines.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Background aurora glows */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <KshamataLogo size="lg" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[#1E3A8A] px-5 py-2 text-sm font-bold !text-white shadow-sm hover:bg-[#172554] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Split Hero (Mild Dark Black-Blue Shine Animation Background) ── */}
      <section className="relative z-10 mx-4 my-4 lg:mx-12 lg:my-6 rounded-3xl hero-dark-shine-container text-white shadow-2xl border border-blue-900/40">
        {/* Mild Shine Beam Overlay */}
        <div className="hero-shine-beam-overlay" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-300 ring-1 ring-blue-400/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
                Official Statistical System • PS 26101
              </div>

              <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-white sm:text-4xl lg:text-[46px] xl:text-[54px]">
                <span className="block whitespace-nowrap">Empowering India's</span>
                <span className="block mt-1 whitespace-nowrap bg-gradient-to-r from-blue-300 via-indigo-200 to-white bg-clip-text text-transparent pb-1">
                  statistical workforce!
                </span>
              </h1>

              <p className="text-lg lg:text-xl font-medium text-slate-300 tracking-wide mt-1">
                AI-Enabled Competency Intelligence & Capacity Building Platform for MoSPI
              </p>

              <div className="text-xs lg:text-sm font-medium tracking-wide text-slate-300 flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black text-sm">✓</span>
                  <span>MoSPI FRAC Framework</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black text-sm">✓</span>
                  <span>iGOT Karmayogi Pathways</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black text-sm">✓</span>
                  <span>AI MCQ RAG Generator</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black text-sm">✓</span>
                  <span>Predictive Deficit Analytics</span>
                </span>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row pt-4">
                <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold !text-white shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105">
                  Explore Competency Portal <ArrowRight size={18} className="!text-white" />
                </Link>
                <Link to="/login" className="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-8 py-4 text-base font-semibold text-white backdrop-blur hover:bg-slate-800 transition-colors">
                  Official Login
                </Link>
              </div>
            </div>

            {/* Right Product Story Demo Animation Column */}
            <div className="lg:col-span-6 flex justify-end w-full">
              <div className="w-full max-w-lg lg:mr-0 lg:ml-auto">
                <HeroProductStoryDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid (Sleek & Professional Compact Cards) ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-2.5">
            <CheckCircle2 size={14} className="text-[#1E3A8A]" /> Enterprise Capabilities
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#020617]">
            Core Platform Capabilities
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600 font-medium text-sm">
            Transforming government workforce development through evidence, personalized learning, and grounded assessment intelligence.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 lg:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 flex flex-col justify-between overflow-hidden text-left"
              >
                {/* Bottom subtle highlight glow */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center justify-center rounded-xl bg-blue-50/90 p-3 ring-1 ring-blue-100/80 group-hover:bg-[#1E3A8A] group-hover:scale-105 transition-all duration-300">
                      <Icon size={20} className="text-[#1E3A8A] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 group-hover:bg-blue-50 group-hover:text-[#1E3A8A] transition-colors">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mb-2 text-base font-bold text-[#020617] group-hover:text-[#1E3A8A] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-20 text-center border-t border-slate-200 bg-white/70 backdrop-blur-md">
        <h2 className="mb-4 text-3xl lg:text-4xl font-black text-[#020617]">Strengthen Official Statistical Capacity Today</h2>
        <p className="mb-8 text-slate-600 font-medium max-w-xl mx-auto">Empowering officials with targeted training, evidence, and actionable competency insights.</p>
        <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-10 py-4 text-base font-bold !text-white shadow-xl hover:bg-[#172554] transition-all hover:scale-105">
          Access Portal Now <ArrowRight size={18} className="!text-white" />
        </Link>
      </section>

      {/* ── Official Enterprise Footer ── */}
      <Footer />
    </div>
  );
}
