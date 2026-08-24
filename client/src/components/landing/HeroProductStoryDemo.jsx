import { useState, useEffect } from 'react';
import { MousePointer2, Award, FileCheck, BarChart3, GraduationCap, RefreshCw, CheckCircle2, ShieldCheck, User, Sparkles } from 'lucide-react';

const TOTAL_STEPS = 5;
const STEP_DURATION_MS = 4200;

const STEPS_META = [
  { step: '01', title: 'Official Role & Required Competencies', icon: Award },
  { step: '02', title: 'Baseline Diagnostic Assessment & Evidence Fusion', icon: FileCheck },
  { step: '03', title: 'Target vs Estimated Skill Gap Engine', icon: BarChart3 },
  { step: '04', title: 'iGOT & NSSTA Pathway Composition', icon: GraduationCap },
  { step: '05', title: 'Governance Recalibration Audit & Recency Decay', icon: RefreshCw },
];

export default function HeroProductStoryDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  
  // High-accuracy cursor target coordinates
  const [cursorPos, setCursorPos] = useState({ x: 78, y: 22 });
  const [isClicking, setIsClicking] = useState(false);
  const [testSelected, setTestSelected] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState(false);

  // Main continuous workflow loop
  useEffect(() => {
    const intervalMs = 50;
    const increment = (50 / (TOTAL_STEPS * STEP_DURATION_MS)) * 100;

    const timer = setInterval(() => {
      setProgressPct((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          setCurrentStep(0);
          setTestSelected(false);
          setEnrolledCourse(false);
          return 0;
        }
        const newStep = Math.min(TOTAL_STEPS - 1, Math.floor((next / 100) * TOTAL_STEPS));
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentStep]);

  // Precise cursor positioning and click trigger timing
  useEffect(() => {
    if (currentStep === 0) {
      // Target: Change Role button top right
      setCursorPos({ x: 78, y: 22 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 250);
      }, 1500);
      return () => clearTimeout(t1);
    } else if (currentStep === 1) {
      // Target: Stratified Sampling Choice Card
      setCursorPos({ x: 55, y: 55 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTestSelected(true);
        setTimeout(() => setIsClicking(false), 250);
      }, 1400);
      return () => clearTimeout(t1);
    } else if (currentStep === 2) {
      // Target: Gap Identified Badge top right
      setCursorPos({ x: 75, y: 22 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 250);
      }, 1500);
      return () => clearTimeout(t1);
    } else if (currentStep === 3) {
      // Target: Enroll Now Button top right
      setCursorPos({ x: 82, y: 38 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setEnrolledCourse(true);
        setTimeout(() => setIsClicking(false), 250);
      }, 1500);
      return () => clearTimeout(t1);
    } else if (currentStep === 4) {
      // Target: MoSPI DIID Readiness Card
      setCursorPos({ x: 30, y: 48 });
      const t1 = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 250);
      }, 1500);
      return () => clearTimeout(t1);
    }
  }, [currentStep]);

  const activeMeta = STEPS_META[currentStep];
  const IconHeader = activeMeta.icon;

  return (
    <div className="group relative w-full max-w-xl mx-auto rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_20px_50px_rgba(30,58,138,0.12)] backdrop-blur-xl transition-all duration-500 overflow-hidden text-left">
      {/* Top subtle accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />

      {/* ── Enterprise Clean Window Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="ml-1.5 text-xs font-bold text-slate-700">
            Kshamata Competency Platform
          </span>
        </div>

        <span className="text-[11px] font-bold text-slate-500">
          MoSPI DIID & NSSTA
        </span>
      </div>

      {/* ── Step Header ── */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1E3A8A] text-white shadow-xs">
            <IconHeader size={15} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#1E3A8A]">
              Step {activeMeta.step} of 05
            </span>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">{activeMeta.title}</h4>
          </div>
        </div>
      </div>

      {/* ── Progress Indicator Line ── */}
      <div className="relative h-1 w-full rounded-full bg-slate-100 mb-3.5 overflow-hidden">
        <div
          className="h-full bg-[#1E3A8A] transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Action Screen Box ── */}
      <div className="relative min-h-[280px] rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 overflow-hidden flex flex-col justify-between">
        {/* ── STEP 1: Official Profile & Role Taxonomy ── */}
        {currentStep === 0 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Senior Statistical Officer • ISS Cadre</p>
                  </div>
                </div>
                <button className="rounded-xl bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1E3A8A] border border-blue-100 hover:bg-blue-100 transition-colors">
                  Change Role
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/70">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Assigned Role</span>
                  <span className="font-extrabold text-[#1E3A8A]">Statistical Officer (SO)</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/70">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Target Level</span>
                  <span className="font-extrabold text-emerald-700">Level 4.0 (Advanced)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/90 p-2.5 border border-blue-100 flex items-center justify-between text-xs text-[#1E3A8A]">
              <span className="font-bold text-[11px]">Mapped Competency Requirements: 14 Domains Active</span>
              <Sparkles size={14} className="text-[#1E3A8A] shrink-0" />
            </div>
          </div>
        )}

        {/* ── STEP 2: Baseline Diagnostic Assessment & Evidence Fusion ── */}
        {currentStep === 1 && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Diagnostic Quiz Item #1</span>
                <span className="text-emerald-700 font-bold">+40% Weight (Knowledge)</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Which sampling method is optimal for NSS household surveys with high intra-cluster variance?
              </p>

              <button
                className={`w-full rounded-xl border p-2.5 text-xs font-bold transition-all text-left flex items-center justify-between ${
                  testSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <span>Stratified Multi-Stage Cluster Sampling</span>
                {testSelected && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
              </button>
            </div>

            {testSelected && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 animate-slideUp">
                <span>Score: 5.0 / 5.0 • Evidence Weighted & Fused</span>
                <span>Confidence: 85%</span>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Target vs Estimated Skill Gap Engine ── */}
        {currentStep === 2 && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Statistical Analysis & Inference</span>
                <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-extrabold text-rose-700">
                  Gap Identified: -0.8 Level
                </span>
              </div>

              {/* Bar comparison graph */}
              <div className="space-y-2 pt-0.5">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Required Role Target</span>
                    <span>Level 4.0</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#1E3A8A] w-[80%] transition-all duration-1000" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Estimated Fused Capability</span>
                    <span className="text-amber-700">Level 3.2</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
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

        {/* ── STEP 4: iGOT & NSSTA Pathway Composition ── */}
        {currentStep === 3 && (
          <div className="space-y-2 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] font-bold text-slate-400">NSSTA-TPAC-102</span>
                <h5 className="text-xs font-bold text-slate-900">Advanced Stratified Sampling & Survey Design</h5>
                <span className="text-[10px] text-slate-500 font-medium">Provider: NSSTA Academy • 12 Hours</span>
              </div>

              <button
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  enrolledCourse
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
                }`}
              >
                {enrolledCourse ? '✓ Enrolled (+0.8 Impact)' : 'Enroll Now'}
              </button>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-slate-200 shadow-2xs flex items-center justify-between opacity-90">
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

        {/* ── STEP 5: Governance Recalibration Audit ── */}
        {currentStep === 4 && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>MoSPI Department Readiness</span>
                <span className="text-emerald-700">System Confidence: 82.5%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button className="rounded-xl bg-blue-50/80 p-2 border border-blue-200 text-left">
                  <span className="block text-[9px] font-bold text-slate-500">MoSPI DIID</span>
                  <span className="text-sm font-black text-[#1E3A8A]">84%</span>
                </button>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/70 text-left">
                  <span className="block text-[9px] font-bold text-slate-400">NSSO Field</span>
                  <span className="text-sm font-black text-indigo-700">72%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/70 text-left">
                  <span className="block text-[9px] font-bold text-slate-400">NAD Stats</span>
                  <span className="text-sm font-black text-emerald-700">88%</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Automated Recency Decay Audit Active (&gt;90 days)</span>
              <ShieldCheck size={16} className="text-amber-700" />
            </div>
          </div>
        )}

        {/* ── Virtual Animated Mouse Cursor ── */}
        <div
          className="absolute pointer-events-none transition-all duration-700 ease-in-out z-30"
          style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
        >
          <MousePointer2
            size={20}
            className={`text-slate-900 fill-white transition-transform ${
              isClicking ? 'scale-75 text-blue-600' : 'scale-100'
            }`}
          />
          {isClicking && (
            <span className="absolute -top-1 -left-1 h-6 w-6 rounded-full border-2 border-blue-500 animate-ping" />
          )}
        </div>
      </div>
    </div>
  );
}
