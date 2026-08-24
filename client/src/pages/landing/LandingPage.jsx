import { Link } from 'react-router-dom';
import { Award, BarChart3, GraduationCap, FileCheck, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import KshamataLogo from '../../components/KshamataLogo';

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

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center lg:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1E3A8A] backdrop-blur shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-[#1E3A8A] animate-pulse" />
          Kshamata | MoSPI DIID & NSSTA Capacity Building
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[1.15] tracking-tight text-[#020617] lg:text-6xl">
          AI-Enabled Competency Intelligence for <br />
          <span className="bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8] bg-clip-text text-transparent">
            India's Official Statistical System
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-700 leading-relaxed font-medium">
          Bridging skill gaps, personalizing iGOT Karmayogi & NSSTA TPAC pathways, and generating grounded assessments for continuous workforce capacity building.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-8 py-4 text-base font-bold !text-white shadow-lg hover:bg-[#172554] transition-all hover:scale-105">
            Explore Competency Portal <ArrowRight size={18} className="!text-white" />
          </Link>
          <Link to="/login" className="rounded-2xl border border-slate-300 bg-white/90 px-8 py-4 text-base font-semibold text-slate-900 backdrop-blur hover:bg-white transition-colors">
            Official Login
          </Link>
        </div>
      </section>

      {/* ── Features Grid (Sleek & Professional Animation) ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-3">
            <CheckCircle2 size={14} className="text-[#1E3A8A]" /> Enterprise Capabilities
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#020617]">
            Core Platform Capabilities
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 font-medium">
            Transforming government workforce development through evidence, personalized learning, and grounded assessment intelligence.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 flex flex-col justify-between overflow-hidden"
              >
                {/* Top subtle highlight glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-600/0 to-transparent group-hover:via-blue-600 transition-all duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center justify-center rounded-xl bg-blue-50/90 p-3.5 text-[#1E3A8A] ring-1 ring-blue-100 group-hover:bg-[#1E3A8A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 group-hover:bg-blue-50 group-hover:text-[#1E3A8A] transition-colors">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-[#020617] group-hover:text-[#1E3A8A] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
}
