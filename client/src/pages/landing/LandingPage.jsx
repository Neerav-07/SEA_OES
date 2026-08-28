import { Link } from 'react-router-dom';
import {
  Award, BarChart3, GraduationCap, FileCheck, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2,
  FileText, Database, History, Layers, Sparkles, Brain, BookOpen, Lock,
} from 'lucide-react';
import KshamataLogo from '../../components/KshamataLogo';
import Footer from '../../components/Footer';
import HeroProductStoryDemo from '../../components/landing/HeroProductStoryDemo';

const FEATURES = [
  {
    icon: Award,
    badge: 'FRAC Taxonomy',
    title: 'FRAC Role Competency Mapping',
    desc: 'Maps statistical, technical, digital governance, and managerial competencies across all MoSPI official roles using FRAC (Framework for Roles, Activities, and Competencies) taxonomy alignment.',
  },
  {
    icon: FileCheck,
    badge: 'AI Assessment Engine',
    title: 'Grounded MCQ & Blueprint Studio',
    desc: 'Generates diagnostic quiz questions directly from ingested MoSPI manuals and training materials with zero hallucination, full source citation, and configurable cognitive-level distribution.',
  },
  {
    icon: BarChart3,
    badge: 'Evidence Fusion',
    title: 'Evidence-Driven Skill Gap Analysis',
    desc: 'Evaluates existing capabilities against required role profiles using diagnostic scores, cryptographic evidence hashes, confidence intervals, and auditable provenance chains.',
  },
  {
    icon: GraduationCap,
    badge: 'iGOT Karmayogi',
    title: 'Personalized iGOT & NSSTA Pathways',
    desc: 'Recommends AI-personalized learning pathways integrated with iGOT Karmayogi modules and NSSTA TPAC training catalogue, dynamically re-ranked from past assessment performance.',
  },
  {
    icon: TrendingUp,
    badge: 'Predictive Analytics',
    title: 'Workforce Capacity Forecasting',
    desc: 'Predicts future skill deficits across MoSPI divisions using ML time-series models, enabling proactive annual capacity building planning before gaps become critical.',
  },
  {
    icon: FileText,
    badge: 'ACBP Report Engine',
    title: 'Official ACBP Report Generator',
    desc: 'Compiles and exports the official MoSPI Annual Capacity Building Plan (ACBP) as a production-ready A4 PDF with government emblems, digital signatures, and NIC e-Sign DSC stamps.',
  },
  {
    icon: ShieldCheck,
    badge: 'Governance & Review',
    title: 'Admin Question Review Queue',
    desc: 'Empowers NSSTA governance officers with a dedicated quality review pipeline for AI-generated questions, supporting approve, reject, revise, and validate workflows.',
  },
  {
    icon: Database,
    badge: 'RAG Knowledge Base',
    title: 'Source Library & Vector Grounding',
    desc: 'Ingest official manuals, video lecture transcripts, and dataset schemas into a traceable vector knowledge base for retrieval-augmented grounded AI question generation.',
  },
  {
    icon: History,
    badge: 'Behavior Tracking',
    title: 'Assessment History & Score Ledger',
    desc: 'Permanently tracks every diagnostic attempt, score trajectory, proficiency elevation, cryptographic evidence hashes, and timestamps for ML-driven personalized recommendation updates.',
  },
  {
    icon: Brain,
    badge: 'AI Virtual Assistant',
    title: 'Kshamata AI Copilot',
    desc: 'An always-available AI virtual assistant that answers competency queries, explains FRAC standards, and guides officials through diagnostic and learning workflows in natural language.',
  },
  {
    icon: Layers,
    badge: 'Dual-Role Platform',
    title: 'Learner & Admin Governance Views',
    desc: 'Role-segregated dashboards: Officials track personal competency growth and take diagnostics, while Admins audit workforce analytics, mandate courses, and generate ACBP reports.',
  },
  {
    icon: Lock,
    badge: 'GIGW & Cyber Standard',
    title: 'Cloud-Ready & Cyber Compliant',
    desc: 'Built with role-based access control (RBAC), SSO-ready authentication, production-grade JWT sessions, and strict alignment with official government cybersecurity guidelines.',
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

      {/* ── Split Hero (Left Text Copy + Right Interactive Product Story Demo) ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-4 pb-12 lg:pt-8 lg:pb-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 text-left space-y-6">
            <h1 className="text-3xl font-black leading-[1.2] tracking-tight text-[#020617] sm:text-4xl lg:text-[46px] xl:text-[54px]">
              <span className="block whitespace-nowrap">Empowering India's</span>
              <span className="block mt-1 whitespace-nowrap bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8] bg-clip-text text-transparent pb-1">
                statistical workforce!
              </span>
            </h1>

            <p className="text-lg lg:text-xl font-semibold text-slate-500 tracking-wide mt-1">
              For India's Official Statistical System
            </p>

            <div className="text-xs lg:text-sm font-medium tracking-wide text-slate-500 flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span>FRAC Competency Mapping</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span>AI Grounded Assessments</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span>Personalized Pathways</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span>ACBP Report Engine</span>
              </span>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row pt-4">
              <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-8 py-4 text-base font-bold !text-white shadow-lg hover:bg-[#172554] transition-all hover:scale-105">
                Explore Competency Portal <ArrowRight size={18} className="!text-white" />
              </Link>
              <Link to="/login" className="rounded-2xl border border-slate-300 bg-white/90 px-8 py-4 text-base font-semibold text-slate-900 backdrop-blur hover:bg-white transition-colors">
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
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-2.5">
            <Sparkles size={14} className="text-[#1E3A8A]" /> 12 Production-Ready Capabilities
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#020617]">
            Enterprise Platform Features
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-slate-600 font-medium text-sm">
            Every module is built, tested, and production-deployed — from AI-grounded question generation and FRAC taxonomy mapping to official ACBP report exports with digital signatures.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 flex flex-col justify-between overflow-hidden text-left"
              >
                {/* Bottom subtle highlight glow */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center justify-center rounded-xl bg-blue-50/90 p-2.5 ring-1 ring-blue-100/80 group-hover:bg-[#1E3A8A] group-hover:scale-105 transition-all duration-300">
                      <Icon size={18} className="text-[#1E3A8A] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 group-hover:bg-blue-50 group-hover:text-[#1E3A8A] transition-colors">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mb-1.5 text-sm font-bold text-[#020617] group-hover:text-[#1E3A8A] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
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
        <p className="mb-8 text-slate-600 font-medium max-w-xl mx-auto">
          AI-powered competency diagnostics, grounded assessments, and personalized iGOT pathways for India's statistical workforce.
        </p>
        <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-[#1E3A8A] px-10 py-4 text-base font-bold !text-white shadow-xl hover:bg-[#172554] transition-all hover:scale-105">
          Access Portal Now <ArrowRight size={18} className="!text-white" />
        </Link>
      </section>

      {/* ── Official Enterprise Footer ── */}
      <Footer />
    </div>
  );
}
