import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, BarChart3, GraduationCap, FileCheck, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, Check,
  FileText, Database, History, Layers, Cpu, Brain, BookOpen, Lock, UserCheck, ChevronDown,
} from 'lucide-react';
import KshamataLogo from '../../components/KshamataLogo';
import KarmayogiLogo from '../../components/common/KarmayogiLogo';
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
    badge: 'AI Assessment Studio',
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
    icon: KarmayogiLogo,
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
    badge: 'ACBP Dossier Studio',
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

const HOW_IT_WORKS_OFFICER = [
  {
    step: '01',
    badge: 'Sync & Onboard',
    title: 'Sync iGOT Karmayogi Profile',
    desc: 'Sign in with your official Gov email. Instantly sync verified training history, certifications, and service details from iGOT Karmayogi with zero manual entry.',
    icon: KarmayogiLogo,
  },
  {
    step: '02',
    badge: 'Taxonomy Alignment',
    title: 'FRAC Benchmark Alignment',
    desc: 'The platform automatically maps your cadre and designation to statutory MoSPI FRAC competency benchmarks across statistical methods, data governance, and analytics.',
    icon: Layers,
  },
  {
    step: '03',
    badge: 'Grounded Testing',
    title: 'Attempt Grounded Diagnostics',
    desc: 'Take realistic case-study assessments synthesized directly from official MoSPI survey manuals, national accounts circulars, and statistical guidelines with zero hallucination.',
    icon: FileCheck,
  },
  {
    step: '04',
    badge: 'Gap Intelligence',
    title: 'Automated Skill Gap Detection',
    desc: 'Instant diagnostic scoring identifies specific competency deficits against role requirements, accompanied by cryptographic evidence audit hashes.',
    icon: BarChart3,
  },
  {
    step: '05',
    badge: 'Personalized Training',
    title: 'Personalized Pathway Enrolment',
    desc: 'Receive AI-ranked course allocations targeted directly at your skill gaps, combining iGOT web modules and NSSTA in-person training calendars.',
    icon: GraduationCap,
  },
  {
    step: '06',
    badge: 'Capacity Readiness',
    title: 'Continuous Elevation & Ledger',
    desc: 'Complete recommended courses to retake diagnostics, elevate your FRAC proficiency levels, and maintain a permanent evidence ledger for promotions.',
    icon: Award,
  },
];

const HOW_IT_WORKS_ADMIN = [
  {
    step: '01',
    badge: 'Knowledge Base',
    title: 'Upload Official Source Library',
    desc: 'Ingest official MoSPI survey manuals, national accounts guidelines, and training curricula with automated deduplication and vector chunking.',
    icon: Database,
  },
  {
    step: '02',
    badge: 'AI Question Studio',
    title: 'Configure Assessment Blueprints',
    desc: 'Set Bloom’s taxonomy distribution, competencies, and cognitive difficulty to generate zero-hallucination diagnostic items with verbatim clause citations.',
    icon: Cpu,
  },
  {
    step: '03',
    badge: 'Statutory Review',
    title: 'NSSTA Quality Review Queue',
    desc: 'Inspect, edit, approve, or reject AI-generated questions through the administrative governance queue to ensure 100% statutory precision.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    badge: 'Workforce Analytics',
    title: 'Workforce Readiness Analytics',
    desc: 'Audit real-time competency heatmaps, divisional readiness indices, and critical skill gap concentrations across DIID, NAD, PSD, and FOD.',
    icon: BarChart3,
  },
  {
    step: '05',
    badge: 'Predictive ML',
    title: 'Predictive Deficit Forecasting',
    desc: 'ML time-series models forecast impending workforce skill deficits across statistical cadres before upcoming nationwide censuses and surveys.',
    icon: Brain,
  },
  {
    step: '06',
    badge: 'Statutory Export',
    title: 'Export Statutory ACBP Report',
    desc: 'Synthesize department-wide training allocations and export the official Annual Capacity Building Plan (ACBP) as an A4 PDF with digital DSC stamps.',
    icon: FileText,
  },
];

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState('OFFICER');
  const currentSteps = activeRole === 'OFFICER' ? HOW_IT_WORKS_OFFICER : HOW_IT_WORKS_ADMIN;

  const renderStepCard = (item, isFinal = false) => {
    const Icon = item.icon;
    const isIgotStep = Icon === KarmayogiLogo;

    return (
      <div
        key={item.step}
        className={`group relative rounded-2xl border bg-white/95 p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[200px] overflow-hidden text-left ${
          isFinal
            ? 'border-emerald-300 ring-1 ring-emerald-100/80'
            : 'border-slate-200/90 hover:border-blue-300'
        }`}
      >
        {/* Watermark Icon in top-right with clean fade towards text and tilt only on hover */}
        <div
          className="absolute -top-1 -right-1 sm:top-1 sm:right-1 pointer-events-none transition-all duration-300 ease-out transform rotate-0 group-hover:rotate-12 group-hover:scale-110"
          style={{
            maskImage: 'linear-gradient(to bottom left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 85%)',
            WebkitMaskImage: 'linear-gradient(to bottom left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 85%)',
          }}
        >
          {isIgotStep ? (
            <KarmayogiLogo size={68} width={68} height={68} className="w-[68px] h-[68px] opacity-35 group-hover:opacity-60 transition-opacity" />
          ) : (
            <Icon size={64} strokeWidth={1.5} className="text-[#1E3A8A]/12 group-hover:text-[#1E3A8A]/25 transition-colors" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3.5 pr-14">
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                isFinal
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-[#1E3A8A] border border-blue-200/80'
              }`}
            >
              {item.step}
            </span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1.5">
              {isIgotStep && <KarmayogiLogo className="h-3.5 w-3.5 inline-block shrink-0" />}
              <span>{item.badge}</span>
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 tracking-tight pr-12">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {item.desc}
          </p>
        </div>

        {isFinal && (
          <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            <span>{activeRole === 'OFFICER' ? 'Cadre Goal Completed' : 'Statutory Target Achieved'}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Background aurora glows */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-2 lg:py-2.5 lg:px-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <KshamataLogo size="lg" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[#1E3A8A] px-5 py-1.5 text-sm font-bold !text-white shadow-sm hover:bg-[#172554] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Split Hero (Left Text Copy + Right Interactive Product Story Demo) ── */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12 min-h-[calc(100vh-58px)] flex flex-col justify-center py-4 lg:py-6">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Text Column (Clean Cohesive Layout Aligned with Monitor) */}
          <div className="lg:col-span-5 xl:col-span-5 text-left space-y-4 lg:space-y-5">
            <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-[#020617] sm:text-4xl lg:text-[42px] xl:text-[50px]">
              <span className="block whitespace-nowrap">Empowering India's</span>
              <span className="block mt-1 whitespace-nowrap bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8] bg-clip-text text-transparent pb-1">
                Statistical Workforce
              </span>
            </h1>

            <p className="max-w-xl text-base text-slate-700 font-medium sm:text-lg leading-relaxed">
              AI-driven competency diagnostics, grounded question blueprints, and dynamic learning pathways aligned with the MoSPI FRAC framework and iGOT Karmayogi.
            </p>

            {/* ── Core 6 PS Checks & Official iGOT Karmayogi Logo (Clean Gradient Blended Layout) ── */}
            <div className="pt-1">
              <div className="grid grid-cols-11 gap-2 sm:gap-3 items-center">
                {/* 3 Left Core Checks (Clean Elegant Micro-Badges) */}
                <div className="col-span-4 flex flex-col justify-between gap-3">
                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        FRAC Role Blueprints
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        L1–L5 Baseline Competencies
                      </span>
                    </div>
                  </div>

                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        Grounded RAG Studio
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        Zero-Hallucination NSS MCQs
                      </span>
                    </div>
                  </div>

                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        Evidence Fusion Ledger
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        SHA-256 Multi-Modal Proof
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Clean Official Karmayogi Bharat Emblem (Borderless Blended Aura) */}
                <div className="col-span-3 flex items-center justify-center relative py-0.5">
                  {/* Soft ambient gradient aura for seamless canvas blending */}
                  <div className="absolute inset-0 bg-radial from-amber-400/15 via-blue-400/5 to-transparent blur-xl pointer-events-none rounded-full" />
                  <img
                    src="/official-igot.png"
                    alt="Karmayogi Bharat"
                    className="w-auto h-24 sm:h-28 object-contain mix-blend-multiply select-none transition-transform duration-300 hover:scale-105 relative z-10"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>

                {/* 3 Right Core Checks (Clean Elegant Micro-Badges) */}
                <div className="col-span-4 flex flex-col justify-between gap-3">
                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        Skill Gap Intelligence
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        Real-Time Deficit Vectors (ΔC)
                      </span>
                    </div>
                  </div>

                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        Personalized Pathways
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        Direct iGOT & NSSTA Modules
                      </span>
                    </div>
                  </div>

                  <div className="group flex items-start gap-2.5 transition-all duration-150">
                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-200">
                      <Check size={13} strokeWidth={3} className="text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-[12.5px] text-slate-900 group-hover:text-blue-950 leading-tight block truncate transition-colors">
                        Statutory ACBP Dossier
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium leading-tight block mt-0.5 truncate tracking-tight">
                        NIC e-Sign & Annual Plan PDF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left: Clean Dark Black-Blue Gradient "How It Works?" Button (No Arrow, Clean Proximity) */}
            <div className="pt-2 flex items-center">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#020617] via-[#0B1528] to-[#1E3A8A] hover:from-[#0B1528] hover:via-[#13223f] hover:to-[#2563EB] text-white font-bold text-xs sm:text-[13px] tracking-wide shadow-md hover:shadow-lg hover:shadow-blue-950/25 border border-slate-800/80 hover:border-blue-400/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                How It Works?
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Product Story Demo */}
          <div className="lg:col-span-7 xl:col-span-7 w-full flex justify-end items-center">
            <HeroProductStoryDemo />
          </div>
        </div>
      </section>

      {/* ── How It Works? Interactive Zig-Zag Workflow Section ── */}
      <section id="how-it-works" className="relative z-10 py-16 lg:py-20 px-6 lg:px-16 border-t border-slate-200 bg-white/75 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#020617] tracking-tight">
            How It Works?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Clear, transparent operational flow from baseline competency sync to verified capacity elevation and statutory ACBP governance.
          </p>
        </div>

        {/* 2 Tabs: Officer & Admin (Authentic Dark Blue Theme) */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveRole('OFFICER')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'OFFICER'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E3A8A]'
              }`}
            >
              <UserCheck size={16} />
              <span>For Statistical Officers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('ADMIN')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'ADMIN'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E3A8A]'
              }`}
            >
              <ShieldCheck size={16} />
              <span>For Ministry Administrators</span>
            </button>
          </div>
        </div>

        {/* Desktop 3x2 Zig-Zag Flow with Border-to-Border Diagram Arrows */}
        <div className="hidden lg:grid grid-cols-3 gap-y-12 gap-x-10 relative max-w-6xl mx-auto w-full">
          {/* Row 1: Step 01 -> Step 02 -> Step 03 */}
          <div className="relative">
            {renderStepCard(currentSteps[0])}
            <div className="absolute top-1/2 left-full w-10 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <svg className="w-10 h-4 overflow-visible" viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="33" y2="8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                <polygon points="32,4 40,8 32,12" fill="#1E3A8A" />
              </svg>
            </div>
          </div>

          <div className="relative">
            {renderStepCard(currentSteps[1])}
            <div className="absolute top-1/2 left-full w-10 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <svg className="w-10 h-4 overflow-visible" viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="33" y2="8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                <polygon points="32,4 40,8 32,12" fill="#1E3A8A" />
              </svg>
            </div>
          </div>

          <div className="relative">
            {renderStepCard(currentSteps[2])}
            <div className="absolute top-full left-1/2 w-4 h-12 -translate-x-1/2 flex items-center justify-center pointer-events-none z-10">
              <svg className="w-4 h-12 overflow-visible" viewBox="0 0 16 48" fill="none">
                <line x1="8" y1="0" x2="8" y2="41" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                <polygon points="4,40 8,48 12,40" fill="#1E3A8A" />
              </svg>
            </div>
          </div>

          {/* Row 2: Step 06 <- Step 05 <- Step 04 */}
          <div className="relative">
            {renderStepCard(currentSteps[5], true)}
          </div>

          <div className="relative">
            {renderStepCard(currentSteps[4])}
            <div className="absolute top-1/2 right-full w-10 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <svg className="w-10 h-4 overflow-visible" viewBox="0 0 40 16" fill="none">
                <line x1="40" y1="8" x2="7" y2="8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                <polygon points="8,4 0,8 8,12" fill="#1E3A8A" />
              </svg>
            </div>
          </div>

          <div className="relative">
            {renderStepCard(currentSteps[3])}
            <div className="absolute top-1/2 right-full w-10 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <svg className="w-10 h-4 overflow-visible" viewBox="0 0 40 16" fill="none">
                <line x1="40" y1="8" x2="7" y2="8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                <polygon points="8,4 0,8 8,12" fill="#1E3A8A" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Vertical Flow */}
        <div className="lg:hidden flex flex-col gap-3 max-w-md mx-auto">
          {currentSteps.map((stepItem, idx) => (
            <div key={stepItem.step} className="flex flex-col items-center">
              <div className="w-full">
                {renderStepCard(stepItem, idx === 5)}
              </div>
              {idx < 5 && (
                <div className="py-2 flex items-center justify-center pointer-events-none">
                  <svg className="w-4 h-8 overflow-visible" viewBox="0 0 16 32" fill="none">
                    <line x1="8" y1="0" x2="8" y2="24" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="square" />
                    <polygon points="4,23 8,31 12,23" fill="#1E3A8A" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Callout - Wide to match layout width */}
        <div className="mt-14 max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border border-slate-200/90 shadow-2xs">
            <div className="text-left">
              <h4 className="text-base font-bold text-slate-900">
                {activeRole === 'OFFICER'
                  ? 'Ready to evaluate and elevate your statistical competencies?'
                  : 'Ready to manage workforce capacity planning and statutory ACBP reports?'}
              </h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {activeRole === 'OFFICER'
                  ? 'Sign in or sync your verified iGOT profile to begin your customized competency diagnostic.'
                  : 'Access the administrative governance console with authorized Ministry credentials.'}
              </p>
            </div>
            <Link
              to={activeRole === 'OFFICER' ? '/register' : '/login'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] px-8 py-3 text-sm font-bold !text-white shadow-sm transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{activeRole === 'OFFICER' ? 'Start as Officer' : 'Access Admin Portal'}</span>
              <ArrowRight size={16} className="!text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Enterprise Features Grid / Comprehensive Platform Architecture ── */}
      <section id="features" className="relative z-10 border-t border-slate-200/90 bg-slate-50/50 py-16 lg:py-20 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-[#020617] tracking-tight">
              Comprehensive Platform Architecture
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
        </div>
      </section>

      {/* ── Official Enterprise Footer ── */}
      <Footer />
    </div>
  );
}
