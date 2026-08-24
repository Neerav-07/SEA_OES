import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Role Competency Frameworks',
    desc: 'Maps statistical, technical, digital governance, and managerial competencies across official roles in MoSPI and state statistical departments.',
  },
  {
    icon: '📊',
    title: 'Evidence-Driven Skill Gaps',
    desc: 'Evaluates existing capabilities against required role profiles using diagnostic evidence, confidence scores, and auditable provenance.',
  },
  {
    icon: '🎓',
    title: 'iGOT & NSSTA Integration',
    desc: 'Recommends personalized learning pathways directly integrated with iGOT Karmayogi modules and NSSTA TPAC training programmes.',
  },
  {
    icon: '📝',
    title: 'Intelligent Assessment Engine',
    desc: 'Generates grounded MCQs and quizzes directly from uploaded documents, presentations, and training materials with instant feedback.',
  },
  {
    icon: '📈',
    title: 'Learner & Admin Dashboards',
    desc: 'Empowers officials with personal progress tracking and gives administrators organization-wide workforce analytics and predictive insights.',
  },
  {
    icon: '🔒',
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
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Kshamata Logo" className="h-10 w-10 object-contain" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-[#172554]">Ksham<span className="text-[#4F46E5]">ata</span></span>
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-[#7C3AED] border border-violet-200">AI</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-(--app-color-text) hover:bg-slate-200/60 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[#4F46E5] px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-[#4338CA] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center lg:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#4F46E5] backdrop-blur shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#7C3AED] animate-pulse" />
          Kshamata | MoSPI DIID & NSSTA Capacity Building
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[1.15] tracking-tight text-[#172554] lg:text-6xl">
          AI-Enabled Competency Intelligence for <br />
          <span className="text-[#4F46E5]">India's Official Statistical System</span>
        </h1>

        <p className="mx-auto mb-10 max-w-3xl text-lg text-[#64748B] leading-relaxed">
          Bridging skill gaps, personalizing iGOT Karmayogi & NSSTA TPAC pathways, and generating grounded assessments for continuous workforce capacity building.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
            Explore Competency Portal →
          </Link>
          <Link to="/login" className="rounded-2xl border border-(--app-color-border) bg-white/70 px-8 py-4 text-base font-semibold text-(--app-color-text) backdrop-blur hover:bg-white transition-colors">
            Official Login
          </Link>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-4 text-center text-3xl font-black tracking-tight text-(--app-color-text)">
          Core Platform Capabilities
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-(--app-color-text-muted)">
          Transforming government workforce development through evidence, personalized learning, and grounded assessment intelligence.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-(--app-color-border)/60 bg-white/70 p-6 backdrop-blur transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="mb-4 text-3xl">{feat.icon}</div>
              <h3 className="mb-2 text-base font-bold text-(--app-color-text)">{feat.title}</h3>
              <p className="text-sm text-(--app-color-text-muted) leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center">
        <h2 className="mb-4 text-3xl font-black text-(--app-color-text)">Strengthen Official Statistical Capacity Today</h2>
        <p className="mb-8 text-(--app-color-text-muted)">Empowering officials with target training, evidence, and actionable competency insights.</p>
        <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-10 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
          Access Portal Now →
        </Link>
      </section>
    </div>
  );
}
