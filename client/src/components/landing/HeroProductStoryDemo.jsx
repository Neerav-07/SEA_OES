import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MousePointer2, User, BarChart3, BookOpen, Shield,
  ChevronRight, CheckCircle2, Search, Bell, Settings,
  LayoutDashboard, Users, FileText, TrendingUp,
  Award, Clock, ArrowUpRight, ChevronDown
} from 'lucide-react';

const STEP_DURATION = 5000;

const SCENES = [
  { id: 'profile', label: 'Officer Profile' },
  { id: 'diagnostic', label: 'Diagnostic Test' },
  { id: 'gap', label: 'Gap Analysis' },
  { id: 'pathway', label: 'Learning Pathway' },
  { id: 'governance', label: 'Governance Audit' },
];

export default function HeroProductStoryDemo() {
  const [scene, setScene] = useState(0);
  const [cursorX, setCursorX] = useState(50);
  const [cursorY, setCursorY] = useState(50);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef(null);

  // Step-specific reactive states
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [auditRun, setAuditRun] = useState(false);

  // Click targets are specified as % of the content area (right panel)
  const clickTargets = useRef([
    { x: 76, y: 28 },  // "View Competencies" button
    { x: 50, y: 62 },  // Quiz option B
    { x: 72, y: 72 },  // "View Details" link
    { x: 82, y: 32 },  // "Enroll" button
    { x: 54, y: 72 },  // "Run Audit" button
  ]);

  const doClick = useCallback(() => {
    setClicking(true);
    setTimeout(() => setClicking(false), 200);
  }, []);

  // Orchestrate the whole flow
  useEffect(() => {
    let mounted = true;

    const runScene = (idx) => {
      if (!mounted) return;
      const target = clickTargets.current[idx];

      // Phase 1: Move cursor (hover)
      setCursorX(target.x);
      setCursorY(target.y);
      setHovering(true);

      // Phase 2: Click after cursor arrives
      const clickTimer = setTimeout(() => {
        if (!mounted) return;
        doClick();
        setHovering(false);

        // Trigger scene-specific state
        if (idx === 1) setQuizAnswered(true);
        if (idx === 3) setEnrolled(true);
        if (idx === 4) setAuditRun(true);
      }, 1200);

      // Phase 3: Advance to next scene
      const advanceTimer = setTimeout(() => {
        if (!mounted) return;
        const next = (idx + 1) % SCENES.length;
        if (next === 0) {
          setQuizAnswered(false);
          setEnrolled(false);
          setAuditRun(false);
        }
        setScene(next);
      }, STEP_DURATION);

      return () => {
        clearTimeout(clickTimer);
        clearTimeout(advanceTimer);
      };
    };

    const cleanup = runScene(scene);
    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [scene, doClick]);

  const progressPct = ((scene + 1) / SCENES.length) * 100;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(2,6,23,0.10)] text-left select-none"
      style={{ fontFamily: 'var(--app-font-sans, "Plus Jakarta Sans", "Inter", sans-serif)' }}
    >
      {/* ═══ TOP BAR (like a real SaaS app) ═══ */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#020617] text-white">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-[#1E3A8A] flex items-center justify-center">
            <Award size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-bold tracking-wide">KSHAMATA</span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Competency Intelligence</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Search size={13} className="text-slate-400" />
          <Bell size={13} className="text-slate-400" />
          <div className="h-5 w-5 rounded-full bg-[#1E3A8A] flex items-center justify-center text-[9px] font-bold">RK</div>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 310 }}>
        {/* ═══ SIDEBAR ═══ */}
        <div className="w-[52px] shrink-0 border-r border-slate-100 bg-slate-50/80 flex flex-col items-center py-3 gap-3">
          {[
            { icon: LayoutDashboard, active: scene === 0 },
            { icon: FileText, active: scene === 1 },
            { icon: TrendingUp, active: scene === 2 },
            { icon: BookOpen, active: scene === 3 },
            { icon: Shield, active: scene === 4 },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                item.active
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <item.icon size={15} />
            </div>
          ))}
          <div className="mt-auto">
            <Settings size={14} className="text-slate-300" />
          </div>
        </div>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 relative overflow-hidden">
          {/* Breadcrumb + Scene indicator */}
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>Dashboard</span>
              <ChevronRight size={10} />
              <span className="text-slate-700 font-bold">{SCENES[scene].label}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 tabular-nums">
              {scene + 1} / {SCENES.length}
            </span>
          </div>

          {/* Scene content */}
          <div className="p-4 relative" style={{ minHeight: 260 }}>

            {/* ── SCENE 1: Officer Profile ── */}
            {scene === 0 && (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Officer Profile</h3>
                  <button className="rounded-lg bg-[#1E3A8A] text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    View Competencies <ChevronRight size={11} />
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white flex items-center justify-center shadow-sm">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">Active</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Senior Statistical Officer • ISS Cadre • MoSPI DIID</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Role', value: 'Statistical Officer', color: 'text-[#1E3A8A]' },
                    { label: 'Target Level', value: 'Level 4.0', color: 'text-emerald-700' },
                    { label: 'Domains', value: '14 Active', color: 'text-indigo-700' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                      <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">{item.label}</span>
                      <span className={`text-[11px] font-extrabold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#1E3A8A]">14 competency domains mapped from FRAC framework</span>
                  <ArrowUpRight size={12} className="text-[#1E3A8A]" />
                </div>
              </div>
            )}

            {/* ── SCENE 2: Diagnostic Test ── */}
            {scene === 1 && (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Diagnostic Assessment</h3>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> Q1 of 15
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-[#1E3A8A]">Knowledge</span>
                    <span className="text-slate-400 font-medium">Weight: 40%</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 leading-relaxed">
                    Which sampling method is optimal for NSS household surveys with high intra-cluster variance?
                  </p>

                  {/* Options */}
                  <div className="space-y-1.5">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-600 font-medium flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                      Simple Random Sampling
                    </div>
                    <div
                      className={`rounded-lg border p-2 text-[10px] font-bold flex items-center justify-between transition-all duration-300 ${
                        quizAnswered
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-3.5 w-3.5 rounded-full border-2 shrink-0 transition-all ${
                          quizAnswered
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300'
                        }`} />
                        Stratified Multi-Stage Cluster Sampling
                      </div>
                      {quizAnswered && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-600 font-medium flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                      Systematic Sampling
                    </div>
                  </div>
                </div>

                {quizAnswered && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 flex items-center justify-between text-[10px] font-bold text-emerald-800 animate-slideUp">
                    <span>✓ Correct • Evidence fused with 85% confidence</span>
                    <span>+5.0 pts</span>
                  </div>
                )}
              </div>
            )}

            {/* ── SCENE 3: Gap Analysis ── */}
            {scene === 2 && (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Skill Gap Analysis</h3>
                  <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                    1 Gap Detected
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900">Statistical Analysis & Inference</span>
                    <span className="text-[10px] font-bold text-rose-600">-0.8 gap</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                        <span>Required Target</span>
                        <span>4.0</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#1E3A8A] rounded-full transition-all duration-1000" style={{ width: '80%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                        <span>Current Estimate</span>
                        <span className="text-amber-600">3.2</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: '64%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                    <span className="block text-[8px] font-bold uppercase text-slate-400">Confidence</span>
                    <span className="text-sm font-black text-[#1E3A8A]">82%</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                    <span className="block text-[8px] font-bold uppercase text-slate-400">Priority</span>
                    <span className="text-sm font-black text-rose-600">HIGH</span>
                  </div>
                </div>

                <button className="w-full rounded-lg border border-blue-200 bg-blue-50 p-2 text-[10px] font-bold text-[#1E3A8A] flex items-center justify-center gap-1">
                  View Detailed Breakdown <ChevronRight size={11} />
                </button>
              </div>
            )}

            {/* ── SCENE 4: Learning Pathway ── */}
            {scene === 3 && (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recommended Pathway</h3>
                  <span className="text-[10px] font-bold text-slate-400">2 courses matched</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[8px] font-bold text-indigo-800">NSSTA</span>
                      <span className="text-[9px] font-mono text-slate-400">TPAC-102</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Advanced Stratified Sampling & Survey Design</h5>
                    <span className="text-[9px] text-slate-500">12 Hours • Gap Impact +0.8</span>
                  </div>
                  <button
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all whitespace-nowrap ${
                      enrolled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                    }`}
                  >
                    {enrolled ? '✓ Enrolled' : 'Enroll'}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-2 opacity-80">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[8px] font-bold text-orange-800">iGOT</span>
                      <span className="text-[9px] font-mono text-slate-400">STAT-401</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">National Accounts Statistics & Deflation</h5>
                    <span className="text-[9px] text-slate-500">16 Hours • Gap Impact +1.6</span>
                  </div>
                  <span className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                    Enroll
                  </span>
                </div>

                {enrolled && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[10px] font-bold text-emerald-800 animate-slideUp flex items-center justify-between">
                    <span>✓ Pathway saved • Expected gap closure: +0.8 levels</span>
                    <ArrowUpRight size={12} />
                  </div>
                )}
              </div>
            )}

            {/* ── SCENE 5: Governance Audit ── */}
            {scene === 4 && (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Department Readiness</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-700">System Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'MoSPI DIID', value: '84%', color: 'text-[#1E3A8A]', border: 'border-blue-200 bg-blue-50/50' },
                    { label: 'NSSO Field', value: '72%', color: 'text-indigo-700', border: 'border-slate-200 bg-slate-50' },
                    { label: 'NAD Stats', value: '88%', color: 'text-emerald-700', border: 'border-slate-200 bg-slate-50' },
                  ].map((d, i) => (
                    <div key={i} className={`rounded-xl border ${d.border} p-2.5 text-center`}>
                      <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-wider">{d.label}</span>
                      <span className={`text-lg font-black ${d.color}`}>{d.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-900">Recency Decay Audit</span>
                    <span className="font-bold text-amber-700">3 officers flagged</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E3A8A] to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: auditRun ? '100%' : '0%' }}
                    />
                  </div>
                  <button
                    className={`w-full rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                      auditRun
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                    }`}
                  >
                    {auditRun ? '✓ Audit Complete — 3 Recalibrated' : 'Run Recalibration Audit'}
                  </button>
                </div>
              </div>
            )}

            {/* ── VIRTUAL MOUSE CURSOR ── */}
            <div
              className="absolute pointer-events-none z-30 transition-all ease-in-out"
              style={{
                left: `${cursorX}%`,
                top: `${cursorY}%`,
                transitionDuration: hovering ? '800ms' : '100ms',
              }}
            >
              <MousePointer2
                size={18}
                className={`drop-shadow-md transition-transform duration-150 ${
                  clicking
                    ? 'scale-[0.7] text-[#1E3A8A] fill-blue-100'
                    : 'scale-100 text-slate-800 fill-white'
                }`}
              />
              {clicking && (
                <span className="absolute -top-0.5 -left-0.5 h-5 w-5 rounded-full border-2 border-[#1E3A8A]/60 animate-ping" />
              )}
            </div>
          </div>

          {/* ── Bottom progress bar ── */}
          <div className="px-4 pb-3">
            <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#1E3A8A] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
