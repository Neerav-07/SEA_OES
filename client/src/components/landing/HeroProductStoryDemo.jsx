import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  Award,
  TrendingDown,
  GraduationCap,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Search,
  Bell,
  Check,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  FileCheck,
  Briefcase,
  Target,
  ShieldAlert,
  ClipboardCheck,
  UserCheck,
  RefreshCw,
  LogOut,
  Lock,
  Building2,
  Database,
  BarChart3,
  Layers,
  FileText,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Camera,
  Maximize2,
} from 'lucide-react';
import KshamataLogo from '../KshamataLogo';
import KarmayogiLogo from '../common/KarmayogiLogo';

// Real navigation items matching DashboardLayout.jsx
const NAV_ITEMS = [
  { id: 'competencies', label: 'Competency Profiles', icon: Award },
  { id: 'exam-placeholder', label: 'Diagnostic Exam Room', icon: FileCheck },
  { id: 'score', label: 'Assessment Ledger', icon: History },
  { id: 'skill-gaps', label: 'Skill Gap Analysis', icon: TrendingDown },
  { id: 'learning-paths', label: 'iGOT & NSSTA Pathways', icon: GraduationCap },
];

// 5-Stage Story Configuration with Full Proctored Exam Room & Human Pacing
const STORY_STAGES = [
  {
    id: 'selection',
    isProctoredExam: false,
    sidebarTab: 'competencies',
    stagePill: '1. Exam Selection',
    path: '/dashboard/competencies',
    title: 'Kshamata | Select FRAC Diagnostic Assessment',
    api: 'GET /api/competencies?cadre=ISS&role=SO',
    status: '200 OK',
    time: '24ms',
    initialCursor: { x: 50, y: 35 },
    targetCursor: { x: 88, y: 32 }, // "Start Diagnostic" button
  },
  {
    id: 'exam',
    isProctoredExam: true, // FULL-SCREEN PROCTORED SUITE — NO SIDEBAR!
    sidebarTab: null,
    stagePill: '2. Proctored Exam Suite',
    path: '/dashboard/assessments/take/ASSESS-2026-NSS',
    title: 'MoSPI Official Proctored Exam Suite | Q3 of 15',
    api: 'POST /api/assessments/start-session',
    status: '200 OK',
    time: '18ms',
    initialCursor: { x: 42, y: 48 }, // Reading question context
    targetCursor: { x: 88, y: 89 }, // "Submit Diagnostic" button
  },
  {
    id: 'score',
    isProctoredExam: false,
    sidebarTab: 'history',
    stagePill: '3. Result & Accreditation',
    path: '/dashboard/assessments/result/CERT-8842',
    title: 'MoSPI Official Competency Assessment Result & Verification',
    api: 'POST /api/attempts/verify-and-certify',
    status: '200 OK',
    time: '31ms',
    initialCursor: { x: 50, y: 40 },
    targetCursor: { x: 82, y: 88 }, // "Sync Evidence & Analyze Skill Gaps" button inside the result modal
  },
  {
    id: 'skill-gaps',
    isProctoredExam: false,
    sidebarTab: 'skill-gaps',
    stagePill: '4. Skill Gap Matrix',
    path: '/dashboard/skill-gaps',
    title: 'Kshamata | Automated Deficit Intelligence',
    api: 'GET /api/skill-gaps/evidence-matrix',
    status: '200 OK',
    time: '22ms',
    initialCursor: { x: 45, y: 35 },
    targetCursor: { x: 84, y: 64 }, // "View Matched Pathway" button
  },
  {
    id: 'recommendation',
    isProctoredExam: false,
    sidebarTab: 'learning-paths',
    stagePill: '5. iGOT & NSSTA Pathways',
    path: '/dashboard/learning-paths',
    title: 'Kshamata | Personalized Training Pathways',
    api: 'GET /api/pathways/recommendations?status=ACTIVE',
    status: '200 OK',
    time: '36ms',
    initialCursor: { x: 45, y: 35 },
    targetCursor: { x: 86, y: 66 }, // "Continue on iGOT" button
  },
];

// Human-like Pacing Constants (Total ~3.8 seconds per view with comfortable reading time)
const READING_DELAY = 2000; // 2.0 full seconds of still reading time
const GLIDE_DURATION = 700; // 700ms smooth human pointer glide
const HOVER_PAUSE = 350;    // 350ms hover over button before clicking
const CLICK_DEPRESS = 140;  // 140ms button depress & ripple
const TOTAL_STAGE_TIME = 3800; // 3.8s total stage duration

export default function HeroProductStoryDemo() {
  const [stageIdx, setStageIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cursorPos, setCursorPos] = useState(STORY_STAGES[0].initialCursor);
  const [isCursorMoving, setIsCursorMoving] = useState(false);
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const timersRef = useRef([]);

  const currentStage = STORY_STAGES[stageIdx];
  const activeTab = currentStage.sidebarTab;

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Human-like sequenced execution: Read -> Glide -> Hover -> Click -> Next Stage
  const runHumanSequence = useCallback((idx) => {
    clearAllTimers();
    const stage = STORY_STAGES[idx];

    // Step 1: Arrive on view, cursor at comfortable reading position
    setCursorPos(stage.initialCursor);
    setIsCursorMoving(false);
    setIsHoveringTarget(false);
    setIsClicking(false);
    setIsApiLoading(false);

    // Step 2: After 2.0 seconds of comfortable reading, glide to target button
    const glideTimer = setTimeout(() => {
      setIsCursorMoving(true);
      setCursorPos(stage.targetCursor);
    }, READING_DELAY);
    timersRef.current.push(glideTimer);

    // Step 3: Arrive on target button and hover naturally
    const hoverTimer = setTimeout(() => {
      setIsCursorMoving(false);
      setIsHoveringTarget(true);
    }, READING_DELAY + GLIDE_DURATION);
    timersRef.current.push(hoverTimer);

    // Step 4: Depress click with visual ripple and trigger API pill flash
    const clickTimer = setTimeout(() => {
      setIsClicking(true);
      setIsApiLoading(true);
    }, READING_DELAY + GLIDE_DURATION + HOVER_PAUSE);
    timersRef.current.push(clickTimer);

    // Step 5: Release click
    const releaseTimer = setTimeout(() => {
      setIsClicking(false);
      setIsApiLoading(false);
    }, READING_DELAY + GLIDE_DURATION + HOVER_PAUSE + CLICK_DEPRESS);
    timersRef.current.push(releaseTimer);

    // Step 6: Transition to next stage
    const nextStageTimer = setTimeout(() => {
      setStageIdx((prev) => (prev + 1) % STORY_STAGES.length);
    }, TOTAL_STAGE_TIME);
    timersRef.current.push(nextStageTimer);
  }, [clearAllTimers]);

  // Run sequence when stageIdx changes (if not paused)
  useEffect(() => {
    if (isPaused) {
      clearAllTimers();
      return;
    }
    runHumanSequence(stageIdx);
    return () => clearAllTimers();
  }, [stageIdx, isPaused, runHumanSequence, clearAllTimers]);

  const handleStageJump = (idx) => {
    clearAllTimers();
    setStageIdx(idx);
  };

  return (
    <div
      className="relative w-full max-w-[720px] select-none flex flex-col items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ fontFamily: 'var(--app-font-sans, "Plus Jakarta Sans", "Inter", sans-serif)' }}
    >
      {/* ══════════════════════════════════════════════════════════════════════════
          REALISTIC UHD 16:9 PC MONITOR HOUSING (MATCHING USER REFERENCE IMAGE)
      ══════════════════════════════════════════════════════════════════════════ */}
      
      {/* Monitor Chassis with 3px Bezel */}
      <div className="w-full relative rounded-t-sm border-[3px] border-slate-900 border-b-0 bg-slate-950 shadow-[0_20px_50px_-10px_rgba(2,6,23,0.35)] overflow-hidden">

        {/* ── Display Canvas with Browser Chrome & Dynamic Workspace ── */}
        <div className="w-full aspect-[16/10.3] bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden relative">

          {/* ═══════════════════════════════════════════════════════════════════
              AUTHENTIC BROWSER CHROME STRIP (SYNCED WITH LIVE ROUTE & API TELEMETRY)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="w-full bg-slate-200/90 border-b border-slate-300/80 shrink-0 select-none text-slate-700">
            {/* Top Tab Bar with Window Control Buttons */}
            <div className="flex items-center justify-between px-2 pt-1 pb-0.5 bg-slate-200 border-b border-slate-300/60">
              {/* Window Controls (Red, Amber, Green macOS Style) */}
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FF5F56] border border-red-500/40" />
                <span className="h-2 w-2 rounded-full bg-[#FFBD2E] border border-amber-500/40" />
                <span className="h-2 w-2 rounded-full bg-[#27C93F] border border-emerald-500/40" />
              </div>

              {/* Active Tab Pill with Live Title & Favicon */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-t-md border-t border-x border-slate-300/80 shadow-2xs">
                <img src="/logo.png" alt="Favicon" className="w-2.5 h-2.5 object-contain" />
                <span className="text-[7.5px] font-bold text-slate-800 truncate max-w-[210px]">
                  {currentStage.title}
                </span>
                <span className="text-slate-400 hover:text-slate-700 text-[8px] ml-0.5 leading-none">×</span>
              </div>

              {/* 5 Stage Workflow Progress Pills (Clickable for Manual Inspection!) */}
              <div className="flex items-center gap-1">
                {STORY_STAGES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageJump(idx)}
                    className={`px-1.5 py-0.2 rounded text-[6px] font-extrabold transition-all cursor-pointer ${
                      idx === stageIdx
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-slate-300/70 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {s.stagePill}
                  </button>
                ))}
              </div>
            </div>

            {/* Omnibox / URL Bar & Real-time API Hit Telemetry Pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/95">
              {/* Back / Forward / Refresh */}
              <div className="flex items-center gap-1 text-slate-400">
                <ArrowLeft size={9} className="cursor-pointer hover:text-slate-700 transition-colors" />
                <ArrowRight size={9} className="opacity-40" />
                <RefreshCw size={8} className={`cursor-pointer hover:text-slate-700 ${isApiLoading ? 'animate-spin text-blue-600' : ''}`} />
              </div>

              {/* Address Bar with SSL Lock and Full Official Domain */}
              <div className="flex-1 flex items-center justify-between rounded bg-slate-100/90 border border-slate-200 px-2 py-0.5">
                <div className="flex items-center gap-1 font-mono text-[7px] text-slate-600 truncate">
                  <Lock size={7.5} className="text-emerald-600 shrink-0" />
                  <span className="text-slate-900 font-bold">https://kshamata.gov.in</span>
                  <span className="text-blue-700 font-semibold">{currentStage.path}</span>
                </div>

                {/* Synchronous Real Backend API Telemetry Pill */}
                <div className="flex items-center gap-1 bg-slate-900 text-slate-100 rounded px-1.5 py-0.2 font-mono text-[6px] tracking-tight shrink-0 shadow-2xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${isApiLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="text-amber-300 font-bold">{currentStage.api}</span>
                  <span className="text-emerald-400 font-semibold">{currentStage.status} ({currentStage.time})</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              APP WORKSPACE (DYNAMIC: SIDEBAR IN DASHBOARD VS FULL-SCREEN IN EXAM)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">

            {/* ── SIDEBAR: VISIBLE IN NORMAL DASHBOARD, DYNAMICALLY HIDDEN IN PROCTORED EXAM! ── */}
            {!currentStage.isProctoredExam && (
              <aside className="w-[155px] shrink-0 border-r border-slate-200/90 bg-white flex flex-col justify-between p-2 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  {/* Scaled Compact Logo Header */}
                  <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-100">
                    <img src="/logo.png" alt="Kshamata" className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs" />
                    <span className="text-[8.5px] font-extrabold tracking-tight text-slate-900 leading-none">
                      Kshamata
                    </span>
                  </div>

                  {/* Navigation Items (Micro-scaled, proportional to monitor screen, zero overflow) */}
                  <nav className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === activeTab;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const targetIdx = STORY_STAGES.findIndex((s) => s.sidebarTab === item.id);
                            if (targetIdx !== -1) handleStageJump(targetIdx);
                          }}
                          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left transition-all ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs ring-1 ring-blue-500/20'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          style={{ fontSize: '7.5px', lineHeight: '11px' }}
                        >
                          <Icon className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} style={{ width: '10px', height: '10px' }} />
                          <span className="whitespace-nowrap tracking-tight font-semibold" style={{ fontSize: '7.5px', lineHeight: '11px' }}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Sidebar User Footer */}
                <div className="border-t border-slate-100 pt-1 px-0.5">
                  <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-1 border border-slate-100">
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-2xs"
                      style={{ width: '16px', height: '16px', fontSize: '6px' }}
                    >
                      RK
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate leading-tight" style={{ fontSize: '7px', lineHeight: '9px' }}>
                        Dr. Rajesh Kumar
                      </p>
                      <p className="font-medium text-slate-500 truncate leading-tight" style={{ fontSize: '5.8px', lineHeight: '8px' }}>
                        Senior Statistical Officer
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* ── STAGE 1, 3, 4, 5: DASHBOARD MAIN CONTENT (WITH TOP BREADCRUMB) ── */}
            {!currentStage.isProctoredExam && (
              <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
                {/* Top Breadcrumb Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-3 py-1 shrink-0">
                  <div className="flex items-center gap-1 text-[8px] font-medium text-slate-500">
                    <span className="text-slate-400">Dashboard</span>
                    <ChevronRight size={8} className="text-slate-400" />
                    <span className="font-bold text-slate-900">
                      {NAV_ITEMS.find((t) => t.id === activeTab)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.2 text-[6.5px] text-slate-400">
                      <Search size={7} />
                      <span>Search FRAC standards...</span>
                    </div>
                    <div className="relative">
                      <Bell size={9} className="text-slate-400" />
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </div>
                  </div>
                </div>

                {/* Dynamic Real Content Viewport */}
                <div className="flex-1 p-2 space-y-1.5 overflow-hidden">

                  {/* ─────────────────────────────────────────────────────────────
                      STAGE 1: EXAM SELECTION (Select Grounded Assessment)
                  ───────────────────────────────────────────────────────────── */}
                  {currentStage.id === 'selection' && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight">
                          Official Competency Profiles & Diagnostic Blueprints
                        </h3>
                        <p className="text-[7px] text-slate-500 font-medium">
                          Select an authoritative MoSPI FRAC competency assessment synthesized from official survey manuals.
                        </p>
                      </div>

                      {/* Official Profile Banner */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-2xs flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shadow-2xs">
                            <UserCheck size={12} className="!text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="rounded bg-blue-50 px-1 py-0.2 text-[6.5px] font-bold text-[#1E3A8A] border border-blue-100">
                                ISS Cadre
                              </span>
                              <span className="text-[7px] text-slate-500 font-medium">MoSPI DIID</span>
                            </div>
                            <p className="text-[8.5px] font-bold text-slate-900 leading-tight">Dr. Rajesh Kumar</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded-lg border border-slate-200/80 flex items-center gap-2">
                          <div>
                            <span className="block text-[6px] font-bold uppercase text-slate-400">Target FRAC</span>
                            <span className="text-[7px] font-bold text-[#1E3A8A] flex items-center gap-1">
                              <Briefcase size={7.5} /> Statistical Officer (SO)
                            </span>
                          </div>
                          <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[6.5px] font-bold border border-emerald-200">
                            Target Level: 4.0
                          </span>
                        </div>
                      </div>

                      {/* Featured Diagnostic Assessment Card to Launch */}
                      <div className="rounded-xl border-2 border-blue-300 bg-blue-50/60 p-2 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shadow-2xs">
                              <Sparkles size={12} />
                            </div>
                            <div>
                              <span className="text-[8.5px] font-extrabold text-[#020617] block">
                                Diagnostic Assessment: Survey Sampling & Estimation (NSS Manual 2026)
                              </span>
                              <span className="text-[6.5px] text-slate-600 block">
                                Code: FRAC-STAT-01 • 15 Grounded Case-Study MCQs • Time Limit: 20 Mins • Zero Hallucination
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`rounded-lg bg-[#1E3A8A] px-2.5 py-1 text-white font-bold shadow-md transition-all flex items-center gap-1.5 ring-2 ring-blue-400/40 ${
                              isHoveringTarget ? 'scale-105 bg-[#172554] ring-blue-500' : ''
                            } ${isClicking ? 'scale-95' : ''}`}
                            style={{ fontSize: '7.5px', lineHeight: '10px' }}
                          >
                            Start Diagnostic <ArrowRight size={8} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-blue-200/60 text-[6.5px]">
                          <div className="bg-white/90 rounded p-1 border border-blue-100">
                            <span className="text-slate-400 block font-bold">Cognitive Bloom Levels</span>
                            <span className="text-slate-900 font-extrabold">EVALUATE & ANALYZE (Case-Based)</span>
                          </div>
                          <div className="bg-white/90 rounded p-1 border border-blue-100">
                            <span className="text-slate-400 block font-bold">Official Knowledge Source</span>
                            <span className="text-slate-900 font-extrabold">NSS 79th Round Manual (Sec 4.2)</span>
                          </div>
                          <div className="bg-white/90 rounded p-1 border border-blue-100">
                            <span className="text-slate-400 block font-bold">Evidence Anchoring</span>
                            <span className="text-emerald-700 font-extrabold">Cryptographic SHA-256 Ledger</span>
                          </div>
                        </div>
                      </div>

                      {/* Rich Populated Competency Blueprints List (Matching Real App) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[6.5px] font-bold text-slate-500 px-0.5">
                          <span>Additional Cadre Competency Profiles (3)</span>
                          <span className="text-[#1E3A8A] font-bold">FRAC Taxonomy Matched</span>
                        </div>

                        {/* Competency 2 */}
                        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs flex items-center justify-between">
                          <div className="min-w-0 flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-[6px] shrink-0 border border-blue-100">
                              02
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[7.5px] font-bold text-slate-900 truncate">
                                  National Accounts & Macroeconomic Stats
                                </span>
                                <span className="text-[5.5px] font-mono px-1 rounded bg-slate-100 text-slate-500">FRAC-STAT-02</span>
                              </div>
                              <span className="text-[6px] text-slate-500 block leading-tight">
                                GVA Deflation • SNA 2008 Framework • 92% Evidence Confidence
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="block text-[6px] font-bold text-emerald-700">Level 3.6 / 4.0</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                <div className="w-[90%] h-full bg-emerald-500 rounded-full" />
                              </div>
                            </div>
                            <span className="rounded bg-emerald-50 text-emerald-800 px-1 py-0.2 text-[5.5px] font-black border border-emerald-200">
                              Benchmark Met
                            </span>
                          </div>
                        </div>

                        {/* Competency 3 */}
                        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs flex items-center justify-between">
                          <div className="min-w-0 flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[6px] shrink-0 border border-amber-100">
                              03
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[7.5px] font-bold text-slate-900 truncate">
                                  Python for Data Analytics (NSS Microdata)
                                </span>
                                <span className="text-[5.5px] font-mono px-1 rounded bg-slate-100 text-slate-500">FRAC-TECH-03</span>
                              </div>
                              <span className="text-[6px] text-slate-500 block leading-tight">
                                Automated Data Wrangling • NSS Unit-Level Microdata • 94% Confidence
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="block text-[6px] font-bold text-rose-600">Level 1.4 / 4.0</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                <div className="w-[35%] h-full bg-rose-500 rounded-full" />
                              </div>
                            </div>
                            <span className="rounded bg-rose-50 text-rose-800 px-1 py-0.2 text-[5.5px] font-black border border-rose-200">
                              -2.6 Deficit
                            </span>
                          </div>
                        </div>

                        {/* Competency 4 */}
                        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs flex items-center justify-between">
                          <div className="min-w-0 flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[6px] shrink-0 border border-indigo-100">
                              04
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[7.5px] font-bold text-slate-900 truncate">
                                  Metadata Standards & SDMX Governance
                                </span>
                                <span className="text-[5.5px] font-mono px-1 rounded bg-slate-100 text-slate-500">FRAC-GOV-04</span>
                              </div>
                              <span className="text-[6px] text-slate-500 block leading-tight">
                                NDSAP Open Data Standards • GIGW Compliance • 88% Confidence
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="block text-[6px] font-bold text-amber-700">Level 1.6 / 4.0</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                <div className="w-[40%] h-full bg-amber-500 rounded-full" />
                              </div>
                            </div>
                            <span className="rounded bg-amber-50 text-amber-800 px-1 py-0.2 text-[5.5px] font-black border border-amber-200">
                              -2.4 Gap
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Official Evidence & Audit Strip */}
                      <div className="rounded bg-slate-100/95 px-2 py-0.5 text-[6px] font-medium text-slate-600 flex items-center justify-between border border-slate-200">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={7} className="text-emerald-700" />
                          <span>SHA-256 Ledger: <strong>0x7f4a...882b</strong> • MoSPI FRAC v2.6 Synced</span>
                        </span>
                        <span className="text-slate-800 font-bold">iGOT Bharat SSO Connected</span>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      STAGE 3: OFFICIAL RESULT & ACCREDITATION CERTIFICATE MODAL
                  ───────────────────────────────────────────────────────────── */}
                  {currentStage.id === 'score' && (
                    <div className="space-y-1 animate-in fade-in duration-300">
                      
                      {/* Official MoSPI Result Modal (Pops up over proctored assessment) */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-xl space-y-1.5 relative overflow-hidden ring-1 ring-slate-900/5">
                        {/* Top subtle tri-color/navy accent strip */}
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-emerald-600" />
                        
                        {/* Top Multi-Agency Official Logos Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <div className="flex items-center">
                            <img
                              src="/NSSTA-official-logo.png"
                              alt="Government of India - Ministry of Statistics & Programme Implementation"
                              className="h-6 sm:h-7 object-contain"
                            />
                          </div>

                          {/* Agency Logos: MoSPI Crest, Kshamata & Karmayogi Bharat */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <img src="/MoSPI-logo.png" alt="MoSPI" className="h-5 sm:h-5.5 object-contain" />
                            <img src="/logo.png" alt="Kshamata" className="h-4 sm:h-4.5 object-contain" />
                            <img src="/official-igot.png" alt="Karmayogi Bharat" className="h-5.5 sm:h-6 object-contain" />
                          </div>
                        </div>

                        {/* Official Certification Ribbon & Header */}
                        <div className="flex items-center justify-between pt-0.5">
                          <div>
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[6px] font-black tracking-wider uppercase">
                              <ShieldCheck size={7} className="text-emerald-600" />
                              MoSPI FRAC Official Civil Service Assessment • Verified Certification
                            </div>
                            <h4 className="text-[9px] font-black text-slate-900 tracking-tight mt-0.5">
                              Diagnostic Verification: Survey Sampling & Estimation
                            </h4>
                            <p className="text-[6px] text-slate-500 font-medium">
                              Audited Candidate: <strong className="text-slate-800">Dr. Rajesh Kumar, ISS</strong> • Senior Statistical Officer, DIID
                            </p>
                          </div>

                          <div className="border border-emerald-300 bg-emerald-50/70 px-1.5 py-0.5 rounded text-right shrink-0">
                            <span className="block text-[5.5px] font-black text-emerald-800 uppercase">✓ MoSPI STAMPED</span>
                            <span className="block font-mono text-[5px] text-slate-500">CERT-2026-NSS-8842</span>
                          </div>
                        </div>

                        {/* 4 Real Performance & Analysis Metric Cards */}
                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                          <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-1 text-center">
                            <span className="text-[5.5px] font-bold uppercase text-slate-500 block">Score</span>
                            <div className="text-[11px] font-black text-emerald-700 leading-tight">4.3 <span className="text-[6px] text-slate-400">/ 5.0</span></div>
                            <span className="inline-block text-[5px] font-black px-1 rounded bg-emerald-100 text-emerald-800">Level 3.6</span>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-1 text-center">
                            <span className="text-[5.5px] font-bold uppercase text-slate-500 block">Accuracy</span>
                            <div className="text-[11px] font-black text-[#1E3A8A] leading-tight">86%</div>
                            <span className="inline-block text-[5px] font-black px-1 rounded bg-blue-100 text-blue-800">FRAC +12%</span>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-1 text-center">
                            <span className="text-[5.5px] font-bold uppercase text-slate-500 block">Evaluated</span>
                            <div className="text-[11px] font-black text-amber-700 leading-tight">13 / 15</div>
                            <span className="inline-block text-[5px] font-black px-1 rounded bg-amber-100 text-amber-800">Grounded</span>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-1 text-center">
                            <span className="text-[5.5px] font-bold uppercase text-slate-500 block">Ledger Hash</span>
                            <div className="font-mono text-[7px] font-black text-slate-800 truncate mt-0.5">EV-8F9A2B</div>
                            <span className="inline-block text-[5px] font-black px-1 rounded bg-emerald-100 text-emerald-800">SHA-256</span>
                          </div>
                        </div>

                        {/* Cognitive Breakdown & Skill Gap Findings */}
                        <div className="grid grid-cols-3 gap-1 text-[6px]">
                          <div className="bg-slate-50 rounded p-1 border border-slate-200">
                            <span className="text-slate-500 block font-bold">Evaluate (NSS Frame)</span>
                            <span className="text-emerald-700 font-extrabold">85% Mastery</span>
                          </div>
                          <div className="bg-slate-50 rounded p-1 border border-slate-200">
                            <span className="text-slate-500 block font-bold">Analyze (SNA Deflation)</span>
                            <span className="text-emerald-700 font-extrabold">92% Mastery</span>
                          </div>
                          <div className="bg-slate-50 rounded p-1 border border-slate-200">
                            <span className="text-slate-500 block font-bold">Apply (Microdata SDC)</span>
                            <span className="text-amber-700 font-extrabold">75% Deficit</span>
                          </div>
                        </div>

                        {/* Bottom Action Bar: Review Solutions vs Target Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[6px] text-slate-500 font-medium flex items-center gap-1">
                            <Database size={7} className="text-emerald-600" />
                            <span>Deficit detected in Microdata SDC (-0.6) • Auto-syncing gap matrix...</span>
                          </span>

                          <button
                            type="button"
                            className={`rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-black px-2.5 py-1 shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                              isHoveringTarget ? 'scale-105 bg-[#172554] ring-2 ring-blue-300 shadow-md' : ''
                            } ${isClicking ? 'scale-95' : ''}`}
                            style={{ fontSize: '6.5px', lineHeight: '8.5px' }}
                          >
                            Sync Evidence & Analyze Skill Gaps <ArrowRight size={7} />
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      STAGE 4: SKILL GAP ANALYSIS (Automated Deficit Intelligence)
                  ───────────────────────────────────────────────────────────── */}
                  {currentStage.id === 'skill-gaps' && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight">
                          Automated Skill-Gap Analysis & Deficit Intelligence
                        </h3>
                        <p className="text-[7px] text-slate-500 font-medium">
                          Auditable evidence-driven skill gap identification comparing assessed capabilities.
                        </p>
                      </div>

                      {/* 4 SummaryCard Row */}
                      <div className="grid grid-cols-4 gap-1">
                        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                          <span className="text-[6px] font-bold uppercase text-slate-400 block">Total Tracked</span>
                          <span className="text-[9.5px] font-black text-[#1E3A8A] block leading-tight">14</span>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                          <span className="text-[6px] font-bold uppercase text-slate-400 block">Critical Gaps</span>
                          <span className="text-[9.5px] font-black text-red-600 block leading-tight">2 Deficits</span>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                          <span className="text-[6px] font-bold uppercase text-slate-400 block">High-Priority</span>
                          <span className="text-[9.5px] font-black text-amber-600 block leading-tight">2 Deficits</span>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                          <span className="text-[6px] font-bold uppercase text-slate-400 block">Target Met</span>
                          <span className="text-[9.5px] font-black text-emerald-600 block leading-tight">10 Met</span>
                        </div>
                      </div>

                      {/* Gap Item 1: Critical Deficit Identified */}
                      <div className="rounded-xl border-2 border-rose-300 bg-white p-1.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="p-0.5 rounded bg-rose-50 text-rose-600">
                              <AlertTriangle size={10} />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-900 block leading-tight">Statistical Analysis & Inference</span>
                              <span className="text-[6.5px] text-slate-400">Critical Benchmark Deficit Detected</span>
                            </div>
                          </div>
                          <span className="text-[7.5px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            -0.8 Gap
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div>
                            <div className="flex justify-between text-[6px] font-bold text-slate-500 mb-0.2">
                              <span>Target (SO Benchmark)</span>
                              <span>Level 4.0</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: '80%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[6px] font-bold text-slate-500 mb-0.2">
                              <span>Assessed Proficiency</span>
                              <span className="text-amber-600">Level 3.2</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '64%' }} />
                            </div>
                          </div>
                        </div>

                        <div className="rounded bg-slate-50 p-1 border border-slate-100 text-[6.5px] text-slate-600 flex items-center justify-between">
                          <span>Evidence Confidence: <strong>84%</strong> (Grounded assessment results)</span>
                          <button
                            type="button"
                            className={`rounded bg-[#1E3A8A] text-white px-2 py-0.5 font-bold shadow-2xs transition-all ${
                              isHoveringTarget ? 'scale-105 bg-[#172554]' : ''
                            } ${isClicking ? 'scale-95' : ''}`}
                            style={{ fontSize: '6.5px', lineHeight: '9px' }}
                          >
                            View Matched Pathway →
                          </button>
                        </div>
                      </div>

                      {/* Deficit 2: Python Microdata Analysis */}
                      <div className="rounded-lg border border-rose-200 bg-white p-1.5 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertTriangle size={9} className="text-rose-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[7.5px] font-bold text-slate-800 block truncate">Python for Data Analytics (NSS Microdata)</span>
                            <span className="text-[6px] text-slate-500 block">Unit-level data wrangling & automated validation scripts</span>
                          </div>
                        </div>
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[6px] font-black text-rose-700 border border-rose-200 shrink-0">
                          -2.6 Gap • Level 1.4 / 4.0
                        </span>
                      </div>

                      {/* Deficit 3: Metadata Standards & SDMX Governance */}
                      <div className="rounded-lg border border-amber-200 bg-white p-1.5 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertTriangle size={9} className="text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[7.5px] font-bold text-slate-800 block truncate">Metadata Standards & SDMX Governance</span>
                            <span className="text-[6px] text-slate-500 block">NDSAP Open Data alignment & GIGW compliance</span>
                          </div>
                        </div>
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[6px] font-black text-amber-700 border border-amber-200 shrink-0">
                          -2.4 Gap • Level 1.6 / 4.0
                        </span>
                      </div>

                      {/* Deficit 4: Microdata Anonymization */}
                      <div className="rounded-lg border border-amber-200 bg-white p-1 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={9} className="text-amber-600" />
                          <span className="text-[7.5px] font-bold text-slate-800">Microdata Anonymization & SDC Tools</span>
                        </div>
                        <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[6px] font-bold text-amber-700 border border-amber-200">
                          -0.6 Gap • Level 2.9 / 3.5
                        </span>
                      </div>

                      {/* Bottom Audit Trail & ACBP Deficit Projection Strip */}
                      <div className="rounded bg-slate-100/90 px-2 py-0.5 text-[6px] font-medium text-slate-600 flex items-center justify-between border border-slate-200">
                        <span>Statutory ACBP Deficit Projection: <strong>28 Days</strong> to Bridge Gaps</span>
                        <span className="text-[#1E3A8A] font-bold">Auto-Allocating iGOT Pathways</span>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      STAGE 5: PERSONALIZED iGOT & NSSTA PATHWAYS ALLOCATION
                  ───────────────────────────────────────────────────────────── */}
                  {currentStage.id === 'recommendation' && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight">
                          Personalized iGOT & NSSTA Training Pathways
                        </h3>
                        <p className="text-[7px] text-slate-500 font-medium">
                          Dual-stream competency mapping combining iGOT e-learning with NSSTA TPAC circulars.
                        </p>
                      </div>

                      {/* Target Role Summary Banner */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-2xs flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-slate-950 via-[#1E3A8A] to-[#1D4ED8]" />
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center">
                            <GraduationCap size={13} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-blue-50 px-1 py-0.2 text-[6.5px] font-bold text-[#1E3A8A] border border-blue-100">
                                Target Role: Statistical Officer
                              </span>
                              <span className="text-[7px] text-slate-500 font-medium">Dr. Rajesh Kumar</span>
                            </div>
                            <p className="text-[8px] font-bold text-slate-900 leading-tight">Auto-Enrolled Pathway to Close Skill Gaps</p>
                          </div>
                        </div>
                        <span className="text-[7px] font-bold text-slate-500">4 Core Courses • 2 Enrolled</span>
                      </div>

                      {/* Course 1: Recommended iGOT Online Course */}
                      <div className="rounded-xl border-2 border-emerald-300 bg-white p-1.5 shadow-2xs space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                              <KarmayogiLogo size={12} />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-900 block leading-tight">
                                Advanced Survey Sampling & Estimation Techniques
                              </span>
                              <span className="text-[6.5px] text-slate-500 block">
                                iGOT Karmayogi • Course ID: iGOT-C8842 • 14 Hours • Matched to FRAC-STAT-01
                              </span>
                            </div>
                          </div>
                          <span className="rounded bg-emerald-100 text-emerald-800 px-1 py-0.2 text-[6px] font-bold">
                            Recommended
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[6px] font-bold text-slate-500">
                            <span>Pathway Progress (2 of 4 Modules Completed)</span>
                            <span className="text-emerald-700 font-bold">65%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[6.5px] font-medium text-slate-600">Next: Weighting & Post-Stratification</span>
                          <button
                            type="button"
                            className={`rounded-md bg-[#1E3A8A] px-2.5 py-0.5 font-bold text-white shadow-2xs hover:bg-[#172554] flex items-center gap-1 transition-all ${
                              isHoveringTarget ? 'scale-105 bg-[#172554]' : ''
                            } ${isClicking ? 'scale-95' : ''}`}
                            style={{ fontSize: '6.5px', lineHeight: '9px' }}
                          >
                            Continue on iGOT <ExternalLink size={7} />
                          </button>
                        </div>
                      </div>

                      {/* Course 2: In-Person NSSTA Residential TPAC Workshop */}
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-1.5 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                            <Building2 size={11} />
                          </div>
                          <div>
                            <span className="text-[7.5px] font-bold text-slate-900 block leading-tight">
                              National Accounts & Supply-Use Tables (SUT) Workshop
                            </span>
                            <span className="text-[6.5px] text-slate-500 block">
                              NSSTA Greater Noida Campus • 5-Day Intensive Residential • Batch #TPAC-26
                            </span>
                          </div>
                        </div>
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[6px] font-bold text-indigo-800 border border-indigo-200 shrink-0">
                          Confirmed Nomination
                        </span>
                      </div>

                      {/* Course 3: Blended Learning Technical Course */}
                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                            <Database size={11} />
                          </div>
                          <div>
                            <span className="text-[7.5px] font-bold text-slate-900 block leading-tight">
                              Python for NSS Microdata Analysis & Automated Validation
                            </span>
                            <span className="text-[6.5px] text-slate-500 block">
                              Blended Learning • MoSPI DIID Laboratory • 24 Hours • Code: TECH-PY-03
                            </span>
                          </div>
                        </div>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[6px] font-bold text-blue-800 border border-blue-200 shrink-0">
                          Enrolled
                        </span>
                      </div>

                      {/* Bottom Statutory ACBP Dossier Strip */}
                      <div className="rounded bg-slate-100/90 px-2 py-0.5 text-[6px] font-medium text-slate-600 flex items-center justify-between border border-slate-200">
                        <span>Statutory ACBP 2026-27 Dossier: 100% Core Deficits Covered</span>
                        <span className="text-emerald-700 font-bold">NIC e-Sign Validated</span>
                      </div>
                    </div>
                  )}

                </div>
              </main>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STAGE 2: FULL-SCREEN PROCTORED EXAMINATION SUITE (NO SIDEBAR!)
                CLEAN ENTERPRISE LIGHT THEME WITH DARK BLUE / NAVY ACCENTS
            ═══════════════════════════════════════════════════════════════════ */}
            {currentStage.isProctoredExam && (
              <div className="flex-1 w-full bg-slate-50 text-slate-900 flex flex-col justify-between p-2.5 overflow-hidden animate-in fade-in duration-300">
                
                {/* 1. Proctored Exam Top Enterprise Header Bar (Dark Navy / Black Enterprise Accent) */}
                <div className="px-2.5 py-1.5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#1E3A8A] text-white rounded-lg border border-slate-800 flex items-center justify-between shadow-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                      <FileCheck className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[6px] font-black bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                          MoSPI FRAC Official Exam
                        </span>
                        <span className="text-slate-400 text-[6px] font-mono">ID: DIID-2026-NSS</span>
                      </div>
                      <h3 className="text-[8.5px] font-black text-white tracking-tight leading-tight mt-0.5">
                        Survey Sampling & Estimation Diagnostic Examination
                      </h3>
                    </div>
                  </div>

                  {/* Right Header Status: Live Timer, Proctoring Pill, Question Counter */}
                  <div className="flex items-center gap-1.5">
                    {/* Live AI Proctoring Pill */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[6px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AI Proctor Active • Focus Monitored</span>
                    </div>

                    {/* Live Exam Countdown Timer */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-[6.5px] font-black">
                      <Clock className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                      <span>14:32</span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[6.5px] font-mono border border-slate-700">
                      Q 3 of 15
                    </span>
                  </div>
                </div>

                {/* 2. Main Question & Case Study Area (Two-Column Proctored Split in Clean Light Mode) */}
                <div className="grid grid-cols-12 gap-2 my-1 flex-1 min-h-0">
                  
                  {/* Left Column (7 cols): Grounded Context & Methodological Problem (Clean White Card) */}
                  <div className="col-span-7 bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between overflow-hidden shadow-2xs">
                    <div className="space-y-1">
                      {/* Official Source Provenance Citation */}
                      <div className="flex items-center justify-between text-[6.5px] pb-1 border-b border-slate-100">
                        <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                          <BookOpen size={7.5} /> Source: MoSPI NSS 79th Round Survey Manual (Sec 4.2)
                        </span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          <ShieldCheck size={7.5} /> 0% Hallucination Grounded
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 text-[5.5px] font-black uppercase">
                            HARD
                          </span>
                          <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 text-[5.5px] font-bold uppercase">
                            Bloom: EVALUATE
                          </span>
                          <span className="rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200 px-1.5 py-0.2 text-[5.5px] font-bold uppercase">
                            MoSPI Case Study
                          </span>
                        </div>
                        <p className="text-[7.5px] text-slate-800 font-medium leading-relaxed">
                          <strong className="text-slate-900 font-extrabold">Operational Scenario:</strong> In the 79th Round NSS, rural sub-strata of Region IX reported 14.2% unit non-response concentrated among high-income agricultural households. Simple mean substitution truncates wealth distribution upper tails.
                        </p>
                        <div className="pt-0.5 border-t border-slate-100">
                          <span className="text-[6px] font-black text-slate-500 uppercase tracking-wider block">
                            Methodological Problem Statement:
                          </span>
                          <p className="text-[7px] text-slate-900 font-bold leading-snug">
                            Which calibration estimator and auxiliary adjustment procedure must be programmatically executed in the data pipeline to neutralize non-response bias without inflating sample variance beyond NSSO limits?
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Grounded Parameters Box (Clean Off-White / Slate-50) */}
                    <div className="bg-slate-50/90 border border-slate-200 rounded p-1 text-[6px] text-slate-700 grid grid-cols-2 gap-1 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-[#1E3A8A] font-bold">•</span>
                        <span>Sample N: 450,000 HH</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#1E3A8A] font-bold">•</span>
                        <span>Auxiliary Correlation: r = 0.78</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#1E3A8A] font-bold">•</span>
                        <span>Non-Response: η = 14.2%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#1E3A8A] font-bold">•</span>
                        <span>Target Error: ±2.0% (95% CI)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): 4 Options (Clean Light Mode with Deep Navy / Blue Accents) */}
                  <div className="col-span-5 flex flex-col justify-between space-y-1">
                    <div className="space-y-1">
                      <div className="text-[6px] font-black text-slate-600 uppercase tracking-wider">
                        Select Methodologically Accurate Option:
                      </div>

                      {/* Option A */}
                      <div className="rounded border border-slate-200 bg-white p-1.5 text-[6.5px] text-slate-700 flex items-start gap-1 shadow-2xs hover:border-slate-300">
                        <span className="h-3 w-3 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[5.5px] shrink-0">A</span>
                        <span className="leading-tight">Apply simple mean imputation inside primary sampling unit (PSU).</span>
                      </div>

                      {/* Option B (Selected with Royal Blue / Navy Border & Blue-50 Background) */}
                      <div className="rounded border-2 border-[#1E3A8A] bg-blue-50/90 p-1.5 text-[6.5px] font-bold text-[#1E3A8A] flex items-start justify-between shadow-xs ring-1 ring-[#1E3A8A]/20">
                        <div className="flex items-start gap-1">
                          <span className="h-3 w-3 rounded bg-[#1E3A8A] text-white flex items-center justify-center text-[5.5px] shrink-0">B</span>
                          <span className="leading-tight">Execute Generalized Regression Estimator (GREG) calibration using land holdings as auxiliary benchmark variables.</span>
                        </div>
                        <CheckCircle2 size={10} className="text-[#1E3A8A] shrink-0 ml-1 mt-0.5" />
                      </div>

                      {/* Option C */}
                      <div className="rounded border border-slate-200 bg-white p-1.5 text-[6.5px] text-slate-700 flex items-start gap-1 shadow-2xs hover:border-slate-300">
                        <span className="h-3 w-3 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[5.5px] shrink-0">C</span>
                        <span className="leading-tight">Drop non-responding households and re-scale sample weights uniformly.</span>
                      </div>

                      {/* Option D */}
                      <div className="rounded border border-slate-200 bg-white p-1.5 text-[6.5px] text-slate-700 flex items-start gap-1 shadow-2xs hover:border-slate-300">
                        <span className="h-3 w-3 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[5.5px] shrink-0">D</span>
                        <span className="leading-tight">Substitute missing records with median responses from urban clusters.</span>
                      </div>
                    </div>

                    {/* Option Feedback Rationale */}
                    <div className="rounded bg-emerald-50 border border-emerald-200 p-1 text-[6px] text-emerald-800 flex items-center gap-1 font-medium">
                      <ShieldCheck size={8} className="text-emerald-600 shrink-0" />
                      <span>GREG calibration neutralizes non-response bias under NSSO auditing standards.</span>
                    </div>
                  </div>

                </div>

                {/* 3. Bottom Examination Action Bar: Question Palette & Submit in Clean Light Theme */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 bg-white/80 px-2 py-1 rounded-lg shrink-0">
                  {/* Question Palette (1 to 15) */}
                  <div className="flex items-center gap-1 text-[6px] font-mono">
                    <span className="text-slate-500 font-bold uppercase mr-0.5">Palette:</span>
                    <span className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">1</span>
                    <span className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">2</span>
                    <span className="h-4 w-4 rounded bg-[#1E3A8A] text-white flex items-center justify-center font-bold ring-2 ring-blue-300 shadow-xs">3</span>
                    <span className="h-4 w-4 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">4</span>
                    <span className="h-4 w-4 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">5</span>
                    <span className="h-4 w-4 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">6</span>
                    <span className="h-4 w-4 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">7</span>
                    <span className="text-slate-400">...15</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    className={`rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40 ${
                      isHoveringTarget ? 'scale-105 bg-emerald-500 ring-emerald-300 shadow-md' : ''
                    } ${isClicking ? 'scale-95' : ''}`}
                    style={{ fontSize: '7.5px', lineHeight: '10px' }}
                  >
                    Submit Diagnostic Exam <Check size={8} />
                  </button>
                </div>

              </div>
            )}

            {/* ── REALISTIC OS DESKTOP MOUSE ARROW CURSOR ── */}
            <div
              className={`absolute pointer-events-none z-40 ${
                isCursorMoving ? 'transition-all duration-700 ease-out' : ''
              } ${isClicking ? 'translate-y-[1px] scale-90' : ''}`}
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                transform: 'translate(0px, 0px)',
              }}
            >
              {/* Hotspot click ripple animation */}
              {isClicking && (
                <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full border-2 border-blue-500/90 bg-blue-400/30 animate-ping pointer-events-none" />
              )}

              {/* Standard Classic OS Desktop White Pointer with Slate Outline */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              >
                <path
                  d="M0.5 0.5V14.5L4.8 10.3L7.8 15.5L9.8 14.3L6.8 9.2L11.5 9.2L0.5 0.5Z"
                  fill="#FFFFFF"
                  stroke="#0F172A"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

          </div>

        </div>

        {/* ── REALISTIC MONITOR CHIN ── */}
        <div className="h-3.5 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/60 flex items-center justify-between px-3">
          <div className="w-4" />
          <span className="text-[7px] font-black text-slate-500 tracking-widest uppercase">
            K S H A M A T A
          </span>
          {/* Micro Power LED on Bottom Right */}
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          AUTHENTIC MONITOR STAND (HOLLOW VERTICAL NECK & BEVELED BASE)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col items-center">
        {/* Monitor Neck with Hollow Cable Pass-Through Cutout */}
        <div className="w-14 h-8 bg-gradient-to-b from-slate-800 via-slate-900 to-black flex items-center justify-center border-x border-slate-700/50 shadow-inner">
          <div className="w-3.5 h-5 rounded-full bg-[#060913] border border-slate-700/60 shadow-inner" />
        </div>

        {/* Beveled Flat Rectangular Base Plate */}
        <div className="w-44 h-2.5 rounded-sm bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-t border-slate-500/60 shadow-[0_8px_20px_rgba(0,0,0,0.4)]" />

        {/* Soft Contact Shadow on Desk */}
        <div className="w-52 h-1.5 -mt-0.5 rounded-full bg-slate-950/30 blur-xs" />
      </div>

    </div>
  );
}
