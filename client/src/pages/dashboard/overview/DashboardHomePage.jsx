import { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

import useAuthStore from '../../../store/auth.store.js';
import StatCard from '../../../components/StatCard.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Button from '../../../components/Button.jsx';

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
  },
  {
    id: 2,
    label: 'Enrolled in iGOT Course: Python Data Analytics & Automated Processing (14 Hours)',
    time: '1 hr ago',
    status: 'active',
  },
  {
    id: 3,
    label: 'Competency Level Updated: Statistical Analysis & Inference (L3.2 → L3.6)',
    time: 'Yesterday',
    status: 'done',
  },
  {
    id: 4,
    label: 'Ingested Training Manual: NSS Household Survey Manual 2026 (94% Match Score)',
    time: '2 days ago',
    status: 'done',
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
  },
  {
    id: 2,
    label: '15 Grounded MCQs generated for Python Microdata Blueprint by AI Engine',
    time: '1 hr ago',
    status: 'pending',
  },
  {
    id: 3,
    label: 'Annual Capacity Building Plan (ACBP 2026-27) Report Generated for Ministry Leadership',
    time: '3 hrs ago',
    status: 'done',
  },
  {
    id: 4,
    label: 'Priya Sharma (AD, NSSO) enrolled in iGOT Course: National Accounts Statistics & GVA Deflation',
    time: 'Yesterday',
    status: 'active',
  },
];

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 font-bold border border-amber-200',
  done: 'bg-blue-50 text-[#1E3A8A] font-bold border border-blue-200',
};

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const stats = isAdmin ? ADMIN_STATS : LEARNER_STATS;
  const activity = isAdmin ? ADMIN_ACTIVITY : LEARNER_ACTIVITY;

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

      {/* ── Recent Activity Feed ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock size={16} className="text-[#1E3A8A]" />
            {isAdmin ? 'MoSPI Workforce Activity & Audit Telemetry' : 'My Recent Competency & Learning Activity'}
          </h3>
          <span className="text-xs font-semibold text-slate-500">Real-Time Event Stream</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {activity.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.time}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                  STATUS_STYLES[item.status] || STATUS_STYLES.done
                }`}
              >
                {item.status === 'pending' ? 'Needs Review' : item.status === 'active' ? 'In Progress' : 'Verified'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
