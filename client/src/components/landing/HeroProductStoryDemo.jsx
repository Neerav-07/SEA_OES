import { useState, useEffect } from 'react';
import { Award, FileCheck, BarChart3, GraduationCap, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

const SCENES = [
  {
    id: 'taxonomy',
    step: '01',
    label: 'Role Taxonomy',
    title: 'MoSPI Competency Framework Mapping',
    subtitle: 'Maps 14+ statistical & digital governance competencies across official roles.',
    icon: Award,
  },
  {
    id: 'diagnostic',
    step: '02',
    label: 'Diagnostic Test',
    title: 'Multi-Source Evidence Assessment',
    subtitle: 'Evaluates baseline capability using diagnostic MCQs and scenario decisions.',
    icon: FileCheck,
  },
  {
    id: 'skillgap',
    step: '03',
    label: 'Skill Gap Engine',
    title: 'Target vs Estimated Gap Analytics',
    subtitle: 'Computes exact gap scores and confidence percentages for each official.',
    icon: BarChart3,
  },
  {
    id: 'pathways',
    step: '04',
    label: 'iGOT Pathways',
    title: 'iGOT & NSSTA Personalized Learning',
    subtitle: 'Composes prerequisite-aware training paths to systematically close gaps.',
    icon: GraduationCap,
  },
  {
    id: 'governance',
    step: '05',
    label: 'Recalibration',
    title: 'Closed-Loop Governance & Recency Decay',
    subtitle: 'Audits evidence freshness (>90 days) and tracks org-wide readiness.',
    icon: RefreshCw,
  },
];

export default function HeroProductStoryDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCENES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentScene = SCENES[activeIdx];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full rounded-3xl border border-slate-200/90 bg-white/95 p-5 lg:p-7 shadow-[0_20px_50px_rgba(30,58,138,0.12)] backdrop-blur-xl transition-all duration-500 hover:border-blue-300 hover:shadow-[0_25px_60px_rgba(30,58,138,0.18)] overflow-hidden text-left"
    >
      {/* Subtle top rainbow accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />

      {/* ── Demo Window Header ── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400/90" />
            <span className="h-3 w-3 rounded-full bg-amber-400/90" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
          </div>
          <span className="ml-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Kshamata Engine v1.0 • LIVE ARCHITECTURE
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Interactive Demo
        </div>
      </div>

      {/* ── Interactive Step Tabs Header ── */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl mb-6 border border-slate-200/60">
        {SCENES.map((scene, idx) => {
          const Icon = scene.icon;
          const isActive = idx === activeIdx;
          return (
            <button
              key={scene.id}
              onClick={() => {
                setActiveIdx(idx);
                setIsPaused(true);
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 text-center ${
                isActive
                  ? 'bg-[#1E3A8A] text-white shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white mb-1' : 'text-slate-500 mb-1'} />
              <span className="text-[10px] font-extrabold uppercase tracking-tight">{scene.step}</span>
              <span className="hidden sm:inline-block text-[9px] font-bold truncate max-w-full px-1">
                {scene.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Animated Scene Content Container ── */}
      <div className="relative min-h-[290px] flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 overflow-hidden">
        {/* Scene Title & Badge */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A] border border-blue-100">
              <Sparkles size={12} className="text-[#1E3A8A]" /> Stage {currentScene.step}: {currentScene.label}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Step {activeIdx + 1} of 5</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">{currentScene.title}</h3>
          <p className="text-xs text-slate-600 font-medium mb-4">{currentScene.subtitle}</p>
        </div>

        {/* Dynamic UI Previews */}
        <div className="transition-all duration-500">
          {/* SCENE 1: Taxonomy */}
          {activeIdx === 0 && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Senior Statistical Officer • ISS Cadre • Assigned Role: <span className="font-bold text-[#1E3A8A]">Statistical Officer (SO)</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Competency</span>
                  <span className="font-bold text-slate-800">Statistical Analysis</span>
                  <span className="block text-[11px] font-bold text-[#1E3A8A] mt-0.5">Required: Level 4.0</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Competency</span>
                  <span className="font-bold text-slate-800">National Accounts</span>
                  <span className="block text-[11px] font-bold text-[#1E3A8A] mt-0.5">Required: Level 4.0</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: Diagnostic */}
          {activeIdx === 1 && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Diagnostic Quiz Item #1</span>
                <span className="text-emerald-700 font-extrabold">+40% Weight (Knowledge)</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Which sampling method is optimal for NSS household surveys with high intra-cluster variance?
              </p>
              <div className="rounded-xl border border-emerald-500 bg-emerald-50/80 p-2.5 text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>Stratified Multi-Stage Cluster Sampling</span>
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-1">
                <span>Score: <strong className="text-slate-900">5.0 / 5.0</strong></span>
                <span>Confidence: <strong className="text-emerald-700">85% Verified</strong></span>
              </div>
            </div>
          )}

          {/* SCENE 3: Skill Gap */}
          {activeIdx === 2 && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Statistical Analysis & Inference</span>
                <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                  Gap: -0.8 Level
                </span>
              </div>

              {/* Bar Comparison */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Required Role Target</span>
                    <span>Level 4.0</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#1E3A8A] w-[80%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Estimated Fused Capability</span>
                    <span className="text-amber-700">Level 3.2</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[64%]" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium pt-1">
                Confidence Score: <strong className="text-slate-900">82%</strong> • Priority: <strong className="text-rose-600">HIGH</strong>
              </p>
            </div>
          )}

          {/* SCENE 4: Pathways */}
          {activeIdx === 3 && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Personalized Pathway</span>
                <span className="text-indigo-700">3 Courses • 36 Hours</span>
              </div>

              <div className="space-y-2">
                <div className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between text-xs bg-slate-50">
                  <div>
                    <span className="font-mono font-bold text-slate-400 text-[10px]">NSSTA-TPAC-102</span>
                    <h5 className="font-bold text-slate-900 text-xs">Advanced Stratified Sampling & Survey Design</h5>
                  </div>
                  <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-bold shrink-0">
                    +0.8 Gap Impact
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between text-xs bg-slate-50">
                  <div>
                    <span className="font-mono font-bold text-slate-400 text-[10px]">IGOT-STAT-401</span>
                    <h5 className="font-bold text-slate-900 text-xs">National Accounts Statistics & Sectoral GVA Deflation</h5>
                  </div>
                  <span className="rounded-md bg-indigo-100 text-indigo-900 px-2 py-0.5 text-[10px] font-bold shrink-0">
                    +1.6 Gap Impact
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: Governance */}
          {activeIdx === 4 && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">MoSPI Department Readiness</span>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  System Confidence: 82.5%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400">MoSPI DIID</span>
                  <span className="text-sm font-black text-[#1E3A8A]">84%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400">NSSO Field</span>
                  <span className="text-sm font-black text-indigo-700">72%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400">NAD Stats</span>
                  <span className="text-sm font-black text-emerald-700">88%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                <span>Stale Evidence Flags: <strong className="text-amber-700">6 Items</strong></span>
                <span className="text-[#1E3A8A]">Recency Audit Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Timeline Indicator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Hover to pause • Click tabs to jump</span>
          <div className="flex items-center gap-1.5 text-[#1E3A8A] font-bold text-xs">
            Next Stage <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
