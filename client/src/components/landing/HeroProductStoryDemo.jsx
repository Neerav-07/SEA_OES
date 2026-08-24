import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, MousePointer2, Award, FileCheck, BarChart3, GraduationCap, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, User, Sparkles, Zap } from 'lucide-react';

const TOTAL_SCENES = 5;
const SCENE_DURATION_MS = 5000;

const SCENES_META = [
  { step: '01', title: 'Role Taxonomy & Required Targets', icon: Award },
  { step: '02', title: 'Baseline Diagnostic Test & Evidence Fusion', icon: FileCheck },
  { step: '03', title: 'Target vs Estimated Skill Gap Calculation', icon: BarChart3 },
  { step: '04', title: 'iGOT & NSSTA Learning Pathway Composition', icon: GraduationCap },
  { step: '05', title: 'Closed-Loop Governance & Recency Audit', icon: RefreshCw },
];

export default function HeroProductStoryDemo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // Simulated Cursor Animation state
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 45 });
  const [isClicking, setIsClicking] = useState(false);
  const [testSelected, setTestSelected] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState(false);

  // Main video animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50 / playbackSpeed;
    const increment = (50 / (TOTAL_SCENES * SCENE_DURATION_MS)) * 100 * playbackSpeed;

    const timer = setInterval(() => {
      setProgressPct((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          setCurrentScene(0);
          setTestSelected(false);
          setEnrolledCourse(false);
          return 0;
        }
        const newScene = Math.min(TOTAL_SCENES - 1, Math.floor((next / 100) * TOTAL_SCENES));
        if (newScene !== currentScene) {
          setCurrentScene(newScene);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentScene, playbackSpeed]);

  // Handle Cursor Micro-Interactions based on scene timeline
  useEffect(() => {
    if (!isPlaying) return;

    if (currentScene === 0) {
      // Scene 0: Glide cursor to Role badge
      setCursorPos({ x: 80, y: 35 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 2000);
      return () => clearTimeout(t1);
    } else if (currentScene === 1) {
      // Scene 1: Glide cursor to Option B in Quiz & click
      setCursorPos({ x: 65, y: 55 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTestSelected(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 1800);
      return () => clearTimeout(t1);
    } else if (currentScene === 2) {
      // Scene 2: Glide cursor to Skill Gap card
      setCursorPos({ x: 85, y: 40 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 2200);
      return () => clearTimeout(t1);
    } else if (currentScene === 3) {
      // Scene 3: Glide cursor to Enroll button & click
      setCursorPos({ x: 82, y: 48 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setEnrolledCourse(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 2000);
      return () => clearTimeout(t1);
    } else if (currentScene === 4) {
      // Scene 4: Glide cursor to Recalibration Audit sweep
      setCursorPos({ x: 50, y: 75 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 2100);
      return () => clearTimeout(t1);
    }
  }, [currentScene, isPlaying]);

  const handleJumpToScene = (idx) => {
    setCurrentScene(idx);
    setProgressPct((idx / TOTAL_SCENES) * 100);
  };

  const handleReset = () => {
    setCurrentScene(0);
    setProgressPct(0);
    setTestSelected(false);
    setEnrolledCourse(false);
    setIsPlaying(true);
  };

  const activeMeta = SCENES_META[currentScene];
  const IconHeader = activeMeta.icon;

  return (
    <div className="group relative w-full rounded-3xl border border-slate-200/90 bg-white/95 p-5 lg:p-6 shadow-[0_25px_60px_rgba(30,58,138,0.15)] backdrop-blur-xl transition-all duration-500 overflow-hidden text-left">
      {/* Top rainbow accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />

      {/* ── Player Header Bar ── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/90" />
            <span className="h-3 w-3 rounded-full bg-amber-500/90" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/90" />
          </div>
          <span className="ml-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Kshamata Simulation Engine • 60 FPS
          </span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100 transition-colors"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Replay Video"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => setPlaybackSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0))}
            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* ── Live Video Progress Timeline ── */}
      <div className="relative h-1.5 w-full rounded-full bg-slate-100 mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-indigo-600 transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── 5 Stage Navigation Pills ── */}
      <div className="grid grid-cols-5 gap-1.5 mb-5">
        {SCENES_META.map((meta, idx) => (
          <button
            key={meta.step}
            onClick={() => handleJumpToScene(idx)}
            className={`py-1.5 px-1 rounded-xl text-center transition-all ${
              idx === currentScene
                ? 'bg-[#1E3A8A] !text-white shadow-sm font-black scale-[1.02]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold'
            }`}
          >
            <span className="block text-[10px] uppercase">Step {meta.step}</span>
          </button>
        ))}
      </div>

      {/* ── Animated Video Screen Container ── */}
      <div className="relative min-h-[300px] rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 overflow-hidden flex flex-col justify-between">
        {/* Dynamic Scene Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
              <IconHeader size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                Phase {activeMeta.step} of 05
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-none mt-0.5">{activeMeta.title}</h4>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Zap size={10} className="text-emerald-600 fill-emerald-600" /> LIVE APP SIMULATION
          </span>
        </div>

        {/* ── SCENE 1: Official Profile & Role Requirements ── */}
        {currentScene === 0 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Senior Statistical Officer • ISS Cadre</p>
                  </div>
                </div>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A]">
                  MoSPI DIID HQ
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/60">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Assigned Role</span>
                  <span className="font-extrabold text-[#1E3A8A]">Statistical Officer (SO)</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/60">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Target Level</span>
                  <span className="font-extrabold text-emerald-700">Level 4.0 (Advanced)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/80 p-3 border border-blue-100 flex items-center justify-between text-xs text-[#1E3A8A]">
              <span className="font-bold text-[11px]">Mapped Competency Requirements: 14 Domains Active</span>
              <Sparkles size={14} className="text-[#1E3A8A] shrink-0" />
            </div>
          </div>
        )}

        {/* ── SCENE 2: Baseline Diagnostic Assessment ── */}
        {currentScene === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Diagnostic Test Item #1</span>
                <span className="text-emerald-700 font-bold">+40% Weight (Knowledge)</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Which sampling method is optimal for NSS household surveys with high intra-cluster variance?
              </p>

              <div
                className={`rounded-xl border p-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                  testSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <span>Stratified Multi-Stage Cluster Sampling</span>
                {testSelected && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 animate-bounce" />}
              </div>
            </div>

            {testSelected && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 animate-slideUp">
                <span>Score: 5.0 / 5.0 • Evidence Weighted & Fused</span>
                <span>Confidence: 85%</span>
              </div>
            )}
          </div>
        )}

        {/* ── SCENE 3: Target vs Estimated Skill Gap Calculation ── */}
        {currentScene === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Statistical Analysis & Inference</span>
                <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-extrabold text-rose-700 animate-pulse">
                  Gap Identified: -0.8 Level
                </span>
              </div>

              {/* Bar comparison graph */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Required Role Target</span>
                    <span>Level 4.0</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#1E3A8A] w-[80%] transition-all duration-1000" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Estimated Fused Capability</span>
                    <span className="text-amber-700">Level 3.2</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[64%] transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 p-2.5 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>Confidence Score: 82%</span>
              <span className="text-rose-600">Priority Level: HIGH</span>
            </div>
          </div>
        )}

        {/* ── SCENE 4: iGOT Pathways ── */}
        {currentScene === 3 && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] font-bold text-slate-400">NSSTA-TPAC-102</span>
                <h5 className="text-xs font-bold text-slate-900">Advanced Stratified Sampling & Survey Design</h5>
                <span className="text-[10px] text-slate-500 font-medium">Provider: NSSTA Academy • 12 Hours</span>
              </div>

              <button
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  enrolledCourse
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                }`}
              >
                {enrolledCourse ? '✓ Enrolled (+0.8 Impact)' : 'Enroll Now'}
              </button>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between opacity-90">
              <div>
                <span className="font-mono text-[9px] font-bold text-slate-400">IGOT-STAT-401</span>
                <h5 className="text-xs font-bold text-slate-900">National Accounts Statistics & Sectoral Deflation</h5>
                <span className="text-[10px] text-slate-500 font-medium">Provider: iGOT Karmayogi • 16 Hours</span>
              </div>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-900">
                +1.6 Gap Impact
              </span>
            </div>
          </div>
        )}

        {/* ── SCENE 5: Governance Recalibration Audit ── */}
        {currentScene === 4 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>MoSPI Department Readiness</span>
                <span className="text-emerald-700">System Confidence: 82.5%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
                  <span className="block text-[9px] font-bold text-slate-400">MoSPI DIID</span>
                  <span className="text-sm font-black text-[#1E3A8A]">84%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
                  <span className="block text-[9px] font-bold text-slate-400">NSSO Field</span>
                  <span className="text-sm font-black text-indigo-700">72%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60">
                  <span className="block text-[9px] font-bold text-slate-400">NAD Stats</span>
                  <span className="text-sm font-black text-emerald-700">88%</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Automated Recency Decay Audit Active (&gt;90 days)</span>
              <ShieldCheck size={14} className="text-amber-700" />
            </div>
          </div>
        )}

        {/* ── Virtual Floating Animated Mouse Cursor ── */}
        <div
          className="absolute pointer-events-none transition-all duration-700 ease-in-out z-30"
          style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
        >
          <MousePointer2
            size={22}
            className={`text-slate-900 fill-white transition-transform ${
              isClicking ? 'scale-75 text-blue-600' : 'scale-100'
            }`}
          />
          {isClicking && (
            <span className="absolute -top-1 -left-1 h-7 w-7 rounded-full border-2 border-blue-500 animate-ping" />
          )}
        </div>

        {/* Bottom Status Footer */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>Simulation Active • Step {currentScene + 1} of 5</span>
          <span className="text-[#1E3A8A] font-bold">Auto Flowing...</span>
        </div>
      </div>
    </div>
  );
}
