import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  FileText,
  Award,
  TrendingDown,
  GraduationCap,
  Sparkles,
  FileCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  UserCheck,
  BarChart3,
  Check,
  Lock,
  BookOpen,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../../store/auth.store.js';
import { useReportStore } from '../../../store/report.store.js';
import StatCard from '../../../components/StatCard.jsx';
import PageHeader from '../../../components/PageHeader.jsx';

const LEARNER_STATS = [
  { label: 'Assessed Competencies', value: '14 / 18', change: '84% Conf', trend: 'up' },
  { label: 'Evaluated Proficiency Level', value: '3.6 / 5', change: '+0.4 Lvl', trend: 'up' },
  { label: 'Critical Skill Deficits', value: '2 Priority', change: '-2 Closed', trend: 'down' },
  { label: 'Active iGOT Enrolments', value: '3 Courses', change: '2 In Progress', trend: 'neutral' },
];

const LEARNER_ACTIVITY = [
  {
    id: 1,
    label: 'Diagnostic Assessment completed: Survey Sampling & Bias Evaluation (Scored 85%)',
    time: '10 mins ago',
    status: 'done',
    actionText: 'View Audit Scorecard',
    actionType: 'AUDIT_DIAGNOSTIC',
  },
  {
    id: 2,
    label: 'Enrolled in iGOT Course: Python Data Analytics & Automated Processing (14 Hours)',
    time: '1 hr ago',
    status: 'active',
    actionText: 'Continue Course',
    route: '/dashboard/learning-paths',
  },
  {
    id: 3,
    label: 'Competency Level Updated: Statistical Analysis & Inference (L3.2 → L3.6)',
    time: 'Yesterday',
    status: 'done',
    actionText: 'Inspect Skill Gaps',
    route: '/dashboard/skill-gaps',
  },
  {
    id: 4,
    label: 'Ingested Training Manual: NSS Household Survey Manual 2026 (94% Match Score)',
    time: '2 days ago',
    status: 'done',
    actionText: 'Explore Pathways',
    route: '/dashboard/learning-paths',
  },
];

const ADMIN_STATS = [
  { label: 'Tracked MoSPI Workforce', value: '248 Officials', change: 'DIID, NAD, FOD, ESD', trend: 'up' },
  { label: 'Workforce Gap Closure Rate', value: '78.4%', change: '+4.2% QoQ', trend: 'up' },
  { label: 'Question Review Queue', value: '12 Pending', change: 'Requires Approval', trend: 'down' },
  { label: 'Approved ACBP Pathways', value: '16 Courses', change: 'NSSTA TPAC Catalogue', trend: 'neutral' },
];

const ADMIN_ACTIVITY = [
  {
    id: 1,
    label: 'Dr. Rajesh Kumar (SSO, DIID) completed Diagnostic Assessment: Survey Sampling (Score: 85%)',
    time: '10 mins ago',
    status: 'done',
    actionText: 'Audit Scorecard →',
    actionType: 'AUDIT_DIAGNOSTIC',
  },
  {
    id: 2,
    label: '15 Grounded MCQs generated for Python Microdata Blueprint by AI Engine',
    time: '1 hr ago',
    status: 'pending',
    actionText: 'Review Questions →',
    route: '/dashboard/admin/review-queue',
  },
  {
    id: 3,
    label: 'Annual Capacity Building Plan (ACBP 2026-27) Report Generated for Ministry Leadership',
    time: '3 hrs ago',
    status: 'done',
    actionText: 'Generate / View ACBP →',
    actionType: 'ACBP_REPORT',
  },
  {
    id: 4,
    label: 'Priya Sharma (AD, NSSO) enrolled in iGOT Course: National Accounts Statistics & GVA Deflation',
    time: 'Yesterday',
    status: 'active',
    actionText: 'Inspect Cadre Analytics',
    route: '/dashboard/analytics',
  },
];

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 font-bold border border-amber-200',
  done: 'bg-blue-50 text-[#1E3A8A] font-bold border border-blue-200',
};

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const startReportGen = useReportStore((s) => s.startGeneration);
  const [selectedAuditItem, setSelectedAuditItem] = useState(null);
  const [isOfficerDrawerOpen, setIsOfficerDrawerOpen] = useState(false);

  const stats = isAdmin ? ADMIN_STATS : LEARNER_STATS;
  const activity = isAdmin ? ADMIN_ACTIVITY : LEARNER_ACTIVITY;

  const handleActivityClick = (item) => {
    if (item.actionType === 'ACBP_REPORT') {
      startReportGen();
    } else if (item.actionType === 'AUDIT_DIAGNOSTIC') {
      setSelectedAuditItem({
        officerName: user?.name || 'Senior Statistical Officer',
        designation: user?.designation || 'Senior Statistical Officer (SSO)',
        department: user?.department || 'Data Informatics & Innovation Division (DIID)',
        cadre: user?.cadre || 'ISS (Indian Statistical Service)',
        assessmentName: 'Diagnostic Module 1: Survey Sampling & Bias Evaluation',
        score: '85%',
        questionsCorrect: '17 / 20 Questions Correct',
        competencyCode: 'FRAC-STAT-STAT-ANALYSIS',
        competencyName: 'Statistical Analysis & Inference',
        levelShift: 'L3.2 ➔ L3.6 (Advanced Proficiency)',
        confidenceScore: '94% (High Confidence)',
        auditTimestamp: 'Today, 10:15 AM IST',
        evidenceHash: 'EV-HASH-8F9A2B1C4E7D',
      });
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title={`Welcome back, ${user?.name ?? (isAdmin ? 'Director' : 'Official')}`}
        subtitle={
          isAdmin
            ? 'NSSTA Academic Governance & MoSPI Workforce Capacity Building Intelligence Overview.'
            : 'Personalized Competency Profile & iGOT Capacity Building Intelligence.'
        }
      />

      {/* ── Summary Stats Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} change={s.change} trend={s.trend} />
        ))}
      </div>

      {/* ── Admin Action Bar ── */}
      {isAdmin && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles size={16} className="text-[#1E3A8A]" /> Quick Governance & Trainer Shortcuts
            </h3>
            <span className="text-xs font-semibold text-slate-500">NSSTA Academic Management</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/dashboard/assessments"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-bold text-slate-900 group"
            >
              <span className="flex items-center gap-2">
                <FileCheck size={16} className="text-[#1E3A8A]" /> Assessment Studio
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
            </Link>

            <Link
              to="/dashboard/admin/review-queue"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-bold text-slate-900 group"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-600" /> Review Queue (12)
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
            </Link>

            <Link
              to="/dashboard/admin/acbp-report"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-bold text-slate-900 group"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" /> ACBP Report Export
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
            </Link>

            <Link
              to="/dashboard/sources"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-bold text-slate-900 group"
            >
              <span className="flex items-center gap-2">
                <Database size={16} className="text-indigo-600" /> Source Library
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Interactive Recent Activity & Telemetry Stream ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock size={16} className="text-[#1E3A8A]" />
            {isAdmin ? 'MoSPI Workforce Activity & Audit Telemetry' : 'My Recent Competency & Learning Activity'}
          </h3>
          <span className="text-xs font-semibold text-slate-500">Interactive Action Stream</span>
        </div>

        <ul className="space-y-2">
          {activity.map((item) => (
            <li
              key={item.id}
              onClick={() => handleActivityClick(item)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors flex items-center gap-2">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                  <span>{item.time}</span>
                  <span>•</span>
                  <span className="text-slate-600 font-semibold">{item.actionText}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                    STATUS_STYLES[item.status] || STATUS_STYLES.done
                  }`}
                >
                  {item.status === 'pending' ? 'Needs Review' : item.status === 'active' ? 'In Progress' : 'Verified'}
                </span>

                <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#1E3A8A] group-hover:border-blue-300 transition-all">
                  <ChevronRight size={14} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Diagnostic Assessment Audit Scorecard Modal ── */}
      {selectedAuditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-blue-200" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Diagnostic Assessment Audit Scorecard
                </span>
              </div>
              <button
                onClick={() => setSelectedAuditItem(null)}
                className="p-1 rounded-xl text-blue-200 hover:bg-blue-800 text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Officer Header Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-white shadow-xs">
                  <UserCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A] border border-blue-200">
                      {selectedAuditItem.cadre}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{selectedAuditItem.department}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{selectedAuditItem.officerName}</h4>
                  <p className="text-xs text-slate-600 font-medium">{selectedAuditItem.designation}</p>
                </div>
              </div>

              {/* Assessment Score Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Assessment Score
                  </span>
                  <span className="text-2xl font-black text-emerald-900 block mt-1">
                    {selectedAuditItem.score}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">{selectedAuditItem.questionsCorrect}</span>
                </div>

                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                    Competency Elevation
                  </span>
                  <span className="text-base font-black text-slate-900 block mt-2">
                    {selectedAuditItem.levelShift}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700">{selectedAuditItem.confidenceScore}</span>
                </div>
              </div>

              {/* Assessment Details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Assessment Module:</span>
                  <span className="font-bold text-slate-900">{selectedAuditItem.assessmentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">FRAC Competency Code:</span>
                  <span className="font-mono font-bold text-[#1E3A8A]">{selectedAuditItem.competencyCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Audit Timestamp:</span>
                  <span className="font-semibold text-slate-700">{selectedAuditItem.auditTimestamp}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Evidence Verification Hash:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedAuditItem.evidenceHash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedAuditItem(null);
                    setIsOfficerDrawerOpen(true);
                  }}
                  className="flex-1 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] py-2.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck size={14} /> Open Officer Competency Audit Slide-Over →
                </button>
                <button
                  onClick={() => setSelectedAuditItem(null)}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Officer Competency Audit Drawer ── */}
      {isOfficerDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
              {/* Header */}
              <div className="bg-[#1E3A8A] text-white p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block mb-1">
                    MoSPI DIID Official Cadre Audit
                  </span>
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                    <UserCheck size={20} className="text-blue-200" /> {user?.name || 'Official Officer'}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">
                    {user?.designation || 'Senior Statistical Officer (SSO)'} • {user?.cadre || 'ISS Cadre'} • {user?.department || 'MoSPI DIID Headquarters'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOfficerDrawerOpen(false)}
                  className="p-2 rounded-xl text-blue-200 hover:bg-blue-800 text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
                {/* Target FRAC Benchmark Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Evaluated Target FRAC Role Benchmark
                    </span>
                    <span className="text-sm font-bold text-[#1E3A8A] flex items-center gap-1.5 mt-0.5">
                      {user?.designation || 'Statistical Officer (SO)'} • Required Level 4.0
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                    78.4% FRAC Match
                  </span>
                </div>

                {/* Mapped Competency Deficits List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers size={14} className="text-[#1E3A8A]" /> Official Mapped Competencies & Audit Status
                  </h4>

                  <div className="space-y-2">
                    {/* Comp 1 */}
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9.5px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            FRAC-STAT-ANALYSIS
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            L3.6 / L4.0 (Deficit: -0.4)
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">Statistical Analysis & Inference</h5>
                        <p className="text-[11px] text-slate-500 font-medium">Verified by Diagnostic Score (85%) • High Confidence (94%)</p>
                      </div>
                      <button
                        onClick={() => toast.success(`TPAC-STAT-104 Pathway assigned to ${user?.name || 'Official'}!`)}
                        className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Mandate Course
                      </button>
                    </div>

                    {/* Comp 2 */}
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9.5px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                            FRAC-STAT-NATIONAL-ACCOUNTS
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            L2.4 / L4.0 (Deficit: -1.6)
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">National Accounts Statistics (SNA 2008)</h5>
                        <p className="text-[11px] text-slate-500 font-medium">iGOT Course Enrolment Active • Pending Final Evaluation</p>
                      </div>
                      <button
                        onClick={() => toast.success(`TPAC-SNA-208 Pathway assigned to ${user?.name || 'Official'}!`)}
                        className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Mandate Course
                      </button>
                    </div>

                    {/* Comp 3 */}
                    <div className="p-4 rounded-2xl border border-red-200 bg-red-50/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9.5px] font-mono font-bold text-red-800 bg-white px-2 py-0.5 rounded border border-red-200">
                            FRAC-TECH-PYTHON-ANALYTICS
                          </span>
                          <span className="text-[10px] font-extrabold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                            L1.4 / L4.0 (Critical Deficit: -2.6)
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">Python for Data Analytics (NSS Microdata)</h5>
                        <p className="text-[11px] text-slate-500 font-medium">No Evidence Found • Mandated TPAC Course Recommended</p>
                      </div>
                      <button
                        onClick={() => toast.success(`TPAC-PYTHON-302 Pathway assigned to ${user?.name || 'Official'}!`)}
                        className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                      >
                        Mandate Course
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Evidence Trail Box */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={16} /> Verified Evidence Chain Audit
                    </span>
                    <span className="font-mono text-[10px] text-emerald-700">EV-HASH-8F9A2B1C4E7D</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 font-medium space-y-1 list-disc pl-4">
                    <li>Diagnostic Assessment Module 1 completed with 85% Score (Verified)</li>
                    <li>iGOT Karmayogi Completion Webhook Synced (Pending final assessment)</li>
                    <li>Ph.D. Academic Credential Verified via MoSPI Service Record</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsOfficerDrawerOpen(false);
                    startReportGen();
                  }}
                  className="rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText size={14} /> Export Officer Audit Certificate (.PDF)
                </button>
                <button
                  onClick={() => setIsOfficerDrawerOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
