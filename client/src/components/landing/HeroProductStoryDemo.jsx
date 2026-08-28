import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MousePointer2, User, BarChart3, BookOpen, Shield,
  ChevronRight, CheckCircle2, Search, Bell, Settings,
  LayoutDashboard, FileText, TrendingUp,
  Award, Clock, ArrowUpRight, Home, LogOut,
  Activity, Layers, Star, Hash
} from 'lucide-react';

const STEP_DURATION = 4200;

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

  const [quizAnswered, setQuizAnswered] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [auditRun, setAuditRun] = useState(false);

  const clickTargets = useRef([
    { x: 82, y: 16 },  // View Competencies button
    { x: 50, y: 58 },  // Option B in Diagnostic Quiz
    { x: 50, y: 84 },  // View Detailed Breakdown button
    { x: 82, y: 28 },  // Enroll button
    { x: 50, y: 90 },  // Run Recalibration Audit button
  ]);

  const doClick = useCallback(() => {
    setClicking(true);
    setTimeout(() => setClicking(false), 200);
  }, []);

  useEffect(() => {
    let mounted = true;

    const runScene = (idx) => {
      if (!mounted) return;
      const target = clickTargets.current[idx];

      setCursorX(target.x);
      setCursorY(target.y);
      setHovering(true);

      const clickTimer = setTimeout(() => {
        if (!mounted) return;
        doClick();
        setHovering(false);
        if (idx === 1) setQuizAnswered(true);
        if (idx === 3) setEnrolled(true);
        if (idx === 4) setAuditRun(true);
      }, 1400);

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

  const sidebarItems = [
    { icon: Home, label: 'Home', active: scene === 0 },
    { icon: FileText, label: 'Tests', active: scene === 1 },
    { icon: TrendingUp, label: 'Gaps', active: scene === 2 },
    { icon: BookOpen, label: 'Learn', active: scene === 3 },
    { icon: Shield, label: 'Audit', active: scene === 4 },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mr-0 lg:ml-auto" style={{ fontFamily: 'var(--app-font-sans, "Plus Jakarta Sans", "Inter", sans-serif)' }}>
      {/* Tablet device frame */}
      <div className="relative rounded-[28px] border-[6px] border-slate-800 bg-slate-800 shadow-[0_30px_80px_rgba(2,6,23,0.25),0_0_0_1px_rgba(255,255,255,0.05)_inset] overflow-hidden">
        {/* Tablet camera notch */}
        <div className="flex items-center justify-center py-1.5 bg-slate-800">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
        </div>

        {/* App viewport */}
        <div ref={containerRef} className="bg-white overflow-hidden select-none" style={{ minHeight: 520 }}>

          {/* ═══ TOP NAV BAR ═══ */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#020617] text-white">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-sm">
                <Award size={13} className="text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wide block leading-none">KSHAMATA</span>
                <span className="text-[8px] text-slate-400 font-medium">Competency Intelligence Platform</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Search size={14} className="text-slate-400" />
              <div className="relative">
                <Bell size={14} className="text-slate-400" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 border border-[#020617]" />
              </div>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] flex items-center justify-center text-[9px] font-bold shadow-sm">RK</div>
            </div>
          </div>

          <div className="flex" style={{ minHeight: 480 }}>
            {/* ═══ SIDEBAR ═══ */}
            <div className="w-[56px] shrink-0 border-r border-slate-100 bg-slate-50/90 flex flex-col items-center py-3 gap-1">
              {sidebarItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-300 w-10 ${
                    item.active
                      ? 'bg-[#1E3A8A] text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <item.icon size={15} />
                  <span className={`text-[7px] font-bold ${item.active ? 'text-white' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="mt-auto flex flex-col items-center gap-2 pb-1">
                <Settings size={13} className="text-slate-300" />
                <LogOut size={13} className="text-slate-300" />
              </div>
            </div>

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              {/* Breadcrumb */}
              <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <LayoutDashboard size={10} />
                  <span>Dashboard</span>
                  <ChevronRight size={9} />
                  <span className="text-slate-800 font-bold">{SCENES[scene].label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-slate-400 tabular-nums">{scene + 1}/{SCENES.length}</span>
                </div>
              </div>

              {/* Scene content */}
              <div className="flex-1 p-4 relative overflow-hidden">

                {/* ── SCENE 1: Officer Profile ── */}
                {scene === 0 && (
                  <div className="animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Officer Profile</h3>
                      <button className="rounded-lg bg-[#1E3A8A] text-white px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        View Competencies <ChevronRight size={11} />
                      </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white flex items-center justify-center shadow-sm">
                        <User size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</span>
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">Active</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Senior Statistical Officer • ISS Cadre</span>
                        <span className="text-[9px] text-slate-400">MoSPI DIID Headquarters, New Delhi</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Role', value: 'Statistical Officer', color: 'text-[#1E3A8A]' },
                        { label: 'Target Level', value: 'Level 4.0', color: 'text-emerald-700' },
                        { label: 'Domains', value: '14 Active', color: 'text-indigo-700' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                          <span className="block text-[7px] font-bold uppercase text-slate-400 tracking-wider">{item.label}</span>
                          <span className={`text-[11px] font-extrabold ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent Activity mini-table */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-900 flex items-center gap-1"><Activity size={11} /> Recent Activity</span>
                        <span className="text-[9px] text-slate-400 font-medium">Last 7 days</span>
                      </div>
                      {[
                        { action: 'Completed Data Science Fundamentals', time: '2h ago', badge: 'bg-emerald-100 text-emerald-800' },
                        { action: 'Diagnostic assessment scheduled', time: '1d ago', badge: 'bg-blue-100 text-[#1E3A8A]' },
                      ].map((a, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-t border-slate-50">
                          <span className="text-[9px] text-slate-700 font-medium">{a.action}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${a.badge}`}>{a.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-blue-50/80 p-2.5 border border-blue-100 flex items-center justify-between">
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
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> 12:45
                        </span>
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-[#1E3A8A]">Q1 of 15</span>
                      </div>
                    </div>

                    {/* Progress of quiz */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#1E3A8A] rounded-full w-[7%]" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400">7%</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 font-bold text-[#1E3A8A]">Knowledge</span>
                        <span className="text-slate-400 font-medium">Weight: 40%</span>
                        <span className="ml-auto text-[9px] text-slate-400 flex items-center gap-1"><Layers size={9} /> Statistical Methods</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 leading-relaxed">
                        Which sampling method is optimal for NSS household surveys with high intra-cluster variance?
                      </p>

                      <div className="space-y-1.5">
                        {[
                          { text: 'Simple Random Sampling', id: 'A' },
                          { text: 'Stratified Multi-Stage Cluster Sampling', id: 'B', correct: true },
                          { text: 'Systematic Sampling', id: 'C' },
                          { text: 'Convenience Sampling', id: 'D' },
                        ].map((opt) => {
                          const isCorrect = opt.correct && quizAnswered;
                          return (
                            <div
                              key={opt.id}
                              className={`rounded-xl border p-2.5 text-[10px] font-medium flex items-center justify-between transition-all duration-300 ${
                                isCorrect
                                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
                                  : 'border-slate-200 bg-slate-50/80 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[8px] font-bold transition-all ${
                                  isCorrect
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-slate-300 text-slate-400'
                                }`}>
                                  {isCorrect ? '✓' : opt.id}
                                </span>
                                {opt.text}
                              </div>
                              {isCorrect && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {quizAnswered && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 flex items-center justify-between text-[10px] font-bold text-emerald-800 animate-slideUp">
                        <span>✓ Correct • Evidence fused with 85% confidence</span>
                        <span className="text-emerald-600">+5.0 pts</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SCENE 3: Gap Analysis ── */}
                {scene === 2 && (
                  <div className="animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Skill Gap Analysis</h3>
                      <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                        1 Gap Detected
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-rose-50">
                            <BarChart3 size={13} className="text-rose-600" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-900">Statistical Analysis & Inference</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600">-0.8 gap</span>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                            <span>Required Target</span>
                            <span>Level 4.0</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-[#1E3A8A] rounded-full transition-all duration-1000" style={{ width: '80%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                            <span>Current Estimate</span>
                            <span className="text-amber-600">Level 3.2</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: '64%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Confidence', value: '82%', color: 'text-[#1E3A8A]' },
                        { label: 'Priority', value: 'HIGH', color: 'text-rose-600' },
                        { label: 'Evidence', value: '4 sources', color: 'text-indigo-700' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-center">
                          <span className="block text-[7px] font-bold uppercase text-slate-400 tracking-wider">{item.label}</span>
                          <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Competency breakdown mini list */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-900">Other Competencies</span>
                      {[
                        { name: 'Data Visualization', level: '4.2 / 4.0', ok: true },
                        { name: 'Survey Design', level: '3.8 / 4.0', ok: false },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-t border-slate-50 text-[9px]">
                          <span className="text-slate-600 font-medium">{c.name}</span>
                          <span className={`font-bold ${c.ok ? 'text-emerald-700' : 'text-amber-600'}`}>{c.level}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full rounded-xl border border-blue-200 bg-blue-50 p-2 text-[10px] font-bold text-[#1E3A8A] flex items-center justify-center gap-1">
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

                    {/* Course card 1 */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[8px] font-bold text-indigo-800">NSSTA</span>
                          <span className="text-[8px] font-mono text-slate-400">TPAC-102</span>
                        </div>
                        <button
                          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                            enrolled
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                          }`}
                        >
                          {enrolled ? '✓ Enrolled' : 'Enroll'}
                        </button>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-900 leading-snug">Advanced Stratified Sampling & Survey Design</h5>
                      <div className="flex items-center gap-3 text-[9px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={9} /> 12 Hours</span>
                        <span className="flex items-center gap-1"><Star size={9} /> 4.8 Rating</span>
                        <span className="flex items-center gap-1"><Hash size={9} /> Gap Impact +0.8</span>
                      </div>
                      {/* Progress bar placeholder */}
                      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full bg-emerald-500 rounded-full transition-all duration-700 ${enrolled ? 'w-[5%]' : 'w-0'}`} />
                      </div>
                    </div>

                    {/* Course card 2 */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 opacity-80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[8px] font-bold text-orange-800">iGOT</span>
                          <span className="text-[8px] font-mono text-slate-400">STAT-401</span>
                        </div>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                          Enroll
                        </span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-900 leading-snug">National Accounts Statistics & Sectoral Deflation</h5>
                      <div className="flex items-center gap-3 text-[9px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={9} /> 16 Hours</span>
                        <span className="flex items-center gap-1"><Star size={9} /> 4.6 Rating</span>
                        <span className="flex items-center gap-1"><Hash size={9} /> Gap Impact +1.6</span>
                      </div>
                    </div>

                    {enrolled && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] font-bold text-emerald-800 animate-slideUp flex items-center justify-between">
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
                        <span className="text-[10px] font-bold text-emerald-700">Online</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'MoSPI DIID', value: '84%', color: 'text-[#1E3A8A]', border: 'border-blue-200 bg-blue-50/50' },
                        { label: 'NSSO Field', value: '72%', color: 'text-indigo-700', border: 'border-slate-200 bg-slate-50' },
                        { label: 'NAD Stats', value: '88%', color: 'text-emerald-700', border: 'border-slate-200 bg-slate-50' },
                      ].map((d, i) => (
                        <div key={i} className={`rounded-xl border ${d.border} p-2.5 text-center`}>
                          <span className="block text-[7px] font-bold uppercase text-slate-400 tracking-wider">{d.label}</span>
                          <span className={`text-lg font-black ${d.color}`}>{d.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Audit log table */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-900">Recency Decay Audit Log</span>
                        <span className="font-bold text-amber-700">3 flagged</span>
                      </div>
                      {[
                        { name: 'A. Sharma', dept: 'NSSO', days: '112 days', status: 'Decay Applied' },
                        { name: 'M. Patel', dept: 'NAD', days: '98 days', status: 'Decay Applied' },
                        { name: 'R. Gupta', dept: 'DIID', days: '94 days', status: 'Pending' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-t border-slate-50 text-[9px]">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500">{row.name.charAt(0)}</div>
                            <div>
                              <span className="text-slate-800 font-bold block leading-tight">{row.name}</span>
                              <span className="text-slate-400">{row.dept} • {row.days}</span>
                            </div>
                          </div>
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                            row.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>{row.status}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E3A8A] to-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: auditRun ? '100%' : '0%' }}
                        />
                      </div>
                      <button
                        className={`w-full rounded-xl px-3 py-2 text-[10px] font-bold transition-all ${
                          auditRun
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                        }`}
                      >
                        {auditRun ? '✓ Audit Complete — 3 Officers Recalibrated' : 'Run Recalibration Audit'}
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

              {/* Bottom progress bar */}
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

        {/* Tablet home indicator */}
        <div className="flex items-center justify-center py-2 bg-slate-800">
          <div className="h-1 w-20 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
}
