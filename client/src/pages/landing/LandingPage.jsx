import { Link } from 'react-router-dom';
import { Award, BarChart3, GraduationCap, FileCheck, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import KshamataLogo from '../../components/KshamataLogo';

const FEATURES = [
  {
    icon: Award,
    title: 'Role Competency Frameworks',
    desc: 'Maps statistical, technical, digital governance, and managerial competencies across official roles in MoSPI and state statistical departments.',
  },
  {
    icon: BarChart3,
    title: 'Evidence-Driven Skill Gaps',
    desc: 'Evaluates existing capabilities against required role profiles using diagnostic evidence, confidence scores, and auditable provenance.',
  },
  {
    icon: GraduationCap,
    title: 'iGOT & NSSTA Integration',
    desc: 'Recommends personalized learning pathways directly integrated with iGOT Karmayogi modules and NSSTA TPAC training programmes.',
  },
  {
    icon: FileCheck,
    title: 'Intelligent Assessment Engine',
    desc: 'Generates grounded MCQs and quizzes directly from uploaded documents, presentations, and training materials with instant feedback.',
  },
  {
    icon: TrendingUp,
    title: 'Learner & Admin Dashboards',
    desc: 'Empowers officials with personal progress tracking and gives administrators organization-wide workforce analytics and predictive insights.',
  },
  {
    icon: ShieldCheck,
    title: 'Cloud-Ready & Cyber Compliant',
    desc: 'Built with role-based access control (RBAC), SSO integration, and strict alignment with government cybersecurity guidelines.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Aurora background blobs */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <KshamataLogo size="lg" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[#1D4ED8] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1E40AF] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center lg:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1D4ED8] backdrop-blur shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-[#1D4ED8] animate-pulse" />
          Kshamata | MoSPI DIID & NSSTA Capacity Building
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[1.15] tracking-tight text-[#0F172A] lg:text-6xl">
          AI-Enabled Competency Intelligence for <br />
          <span className="bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
            India's Official Statistical System
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-600 leading-relaxed font-medium">
          Bridging skill gaps, personalizing iGOT Karmayogi & NSSTA TPAC pathways, and generating grounded assessments for continuous workforce capacity building.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-[#1D4ED8] px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-[#1E40AF] transition-all hover:scale-105">
            Explore Competency Portal <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="rounded-2xl border border-slate-300 bg-white/90 px-8 py-4 text-base font-semibold text-slate-800 backdrop-blur hover:bg-white transition-colors">
            Official Login
          </Link>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-4 text-center text-3xl font-black tracking-tight text-[#0F172A]">
          Core Platform Capabilities
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600 font-medium">
          Transforming government workforce development through evidence, personalized learning, and grounded assessment intelligence.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-50 p-3 text-[#1D4ED8]">
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 text-base font-bold text-[#0F172A]">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center border-t border-slate-200 bg-white/60">
        <h2 className="mb-4 text-3xl font-black text-[#0F172A]">Strengthen Official Statistical Capacity Today</h2>
        <p className="mb-8 text-slate-600 font-medium">Empowering officials with targeted training, evidence, and actionable competency insights.</p>
        <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-[#1D4ED8] px-10 py-4 text-base font-bold text-white shadow-lg hover:bg-[#1E40AF] transition-all hover:scale-105">
          Access Portal Now <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
