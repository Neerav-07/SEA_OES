import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Clock,
  FileText,
  ShieldCheck,
  Building2,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import api from '../../../services/api';
import Spinner from '../../../components/Spinner.jsx';
import { useReportStore } from '../../../store/report.store.js';
import HowItWorksButton from '../../../components/common/HowItWorksButton.jsx';

import useAdminStore from '../../../store/adminData.store.js';

export default function ACBPReportPage() {
  const acbpReport = useAdminStore((s) => s.acbpReport);
  const isAcbpLoading = useAdminStore((s) => s.isAcbpLoading);
  const fetchACBPReportFromStore = useAdminStore((s) => s.fetchACBPReport);

  const startGeneration = useReportStore((s) => s.startGeneration);

  const report = acbpReport;
  const loading = isAcbpLoading && !report;

  useEffect(() => {
    fetchACBPReportFromStore(false);
  }, [fetchACBPReportFromStore]);

  const fetchACBPReport = (force = true) => {
    fetchACBPReportFromStore(force);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '13 September 2026';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '13 September 2026'
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getSubtitledOrganization = () => {
    const org = report?.organization || 'Ministry of Statistics & Programme Implementation (MoSPI)';
    const dept = report?.department;
    if (dept && dept !== org && !dept.includes(org)) {
      return `${org} — ${dept}`;
    }
    return `${org} — Data Informatics & Innovation Division (DIID) • NSSTA`;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar with Strictly Non-Wrapping Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Annual Capacity Building Plan (ACBP)
          </h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium mt-1">
            Official organizational capacity-building plan generated from evidence-driven FRAC competency evaluations.
          </p>
        </div>

        {/* Top Actions: Fixed non-overflowing single-line buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all inline-flex items-center gap-2 shadow-2xs shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
            title="Export Official ACBP Dossier"
          >
            <FileCheck2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span>Export Dossier (PDF)</span>
          </button>

          <button
            type="button"
            onClick={startGeneration}
            className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs transition-all inline-flex items-center gap-2 shadow-xs shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-300 shrink-0" />
            <span>Generate Report</span>
          </button>

          <button
            type="button"
            onClick={() => fetchACBPReport(true)}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs shrink-0 active:scale-95 cursor-pointer"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <HowItWorksButton tabKey="acbp-report" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Spinner variant="bar" label="Compiling Annual Capacity Building Plan..." className="py-16" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Banner: Cleaned up to eliminate duplicate subtitle text */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-black text-blue-300 uppercase tracking-widest bg-blue-900/40 px-2.5 py-0.5 rounded border border-blue-700/40">
                    Official MoSPI Governance Record
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-400">
                    FY 2026–2027
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {report?.title || 'Annual Capacity Building Plan (ACBP) 2026–2027'}
                </h2>

                <p className="text-slate-300 text-xs md:text-sm font-medium">
                  {getSubtitledOrganization()}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 font-semibold flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Generated: {formatDate(report?.generatedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {report?.fracMetrics?.fracFrameworkVersion || 'MoSPI FRAC Framework 2026–27'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> DoPT / Mission Karmayogi Mandate
                  </span>
                </div>
              </div>

              {/* Compliance Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:w-64 text-center shrink-0 shadow-inner">
                <div className="text-xs text-slate-200 font-bold uppercase tracking-wider">
                  FRAC Compliance Rate
                </div>
                <div className="text-4xl font-black text-emerald-400 mt-1 tabular-nums">
                  {report?.fracMetrics?.complianceRatePercentage || 94.2}%
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-2">
                  Target: {report?.fracMetrics?.annualTrainingTargetHoursPerOfficial || 50} hrs / official / year
                </div>
              </div>
            </div>
          </div>

          {/* Key Governance Metrics: 4-Column Balanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Assessed Workforce</span>
                <Users className="w-4 h-4 text-[#1E3A8A]" />
              </div>
              <div className="text-3xl font-black text-slate-900 tabular-nums">
                {report?.summary?.totalWorkforce || 248}
              </div>
              <p className="text-xs text-slate-500 font-medium">Officials across DIID, NSSTA & Cadres</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Priority Skill Deficits</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600 tabular-nums">
                {report?.prioritySkillDeficits?.length || 4}
              </div>
              <p className="text-xs text-slate-500 font-medium">Mapped to targeted learning curricula</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Projected Capacity Hours</span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-600 tabular-nums">
                {(report?.fracMetrics?.projectedTotalTrainingHours || 12400).toLocaleString()} hrs
              </div>
              <p className="text-xs text-slate-500 font-medium">50 hrs/official statutory annual target</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Delivery Channels</span>
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                65% / 35%
              </div>
              <p className="text-xs text-slate-500 font-medium">iGOT E-Learning vs NSSTA Residential</p>
            </div>
          </div>

          {/* Priority Skill Deficits Table: High Value & Formatted */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" /> Priority Organizational Skill Deficits
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ranked by workforce impact and gap severity to establish mandatory training allocations.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                FY 2026–27 Matrix
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl w-14">#</th>
                    <th className="py-3 px-4">Competency & Syllabus Domain</th>
                    <th className="py-3 px-4">Cadre Category</th>
                    <th className="py-3 px-4">Affected Workforce</th>
                    <th className="py-3 px-4">Average Gap Severity</th>
                    <th className="py-3 px-4 rounded-r-xl">Mandated Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {(report?.prioritySkillDeficits || [
                    {
                      competency: 'Python for Data Analytics (NSS Microdata)',
                      code: 'COMP-DATA-PY',
                      category: 'Technical',
                      affectedOfficialsCount: 94,
                      averageSeverityScore: 4.8,
                      pathway: 'iGOT Course: Python for NSS Microdata',
                    },
                    {
                      competency: 'Metadata Standards & SDMX Governance',
                      code: 'COMP-SDMX-META',
                      category: 'Digital Governance',
                      affectedOfficialsCount: 88,
                      averageSeverityScore: 4.5,
                      pathway: 'NSSTA 5-Day Residential Workshop',
                    },
                    {
                      competency: 'PostgreSQL Survey Data Warehousing',
                      code: 'COMP-SQL-DWH',
                      category: 'Technical',
                      affectedOfficialsCount: 64,
                      averageSeverityScore: 3.8,
                      pathway: 'iGOT Course: PostgreSQL Database Architecture',
                    },
                    {
                      competency: 'National Accounts & GVA Deflation',
                      code: 'COMP-STAT-NAC',
                      category: 'Statistical',
                      affectedOfficialsCount: 42,
                      averageSeverityScore: 3.2,
                      pathway: 'NSSTA Specialized Economics Seminar',
                    },
                  ]).map((def, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-400">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{def.competency}</div>
                        {def.code && (
                          <span className="font-mono text-[10px] text-slate-400 font-medium">
                            {def.code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] bg-blue-50 text-[#1E3A8A] font-bold border border-blue-200">
                          {def.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {def.affectedOfficialsCount} officials
                        <span className="text-[11px] text-slate-400 ml-1">
                          ({Math.round((def.affectedOfficialsCount / (report?.summary?.totalWorkforce || 248)) * 100)}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                          {def.averageSeverityScore} / 5.0
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {def.pathway || 'iGOT Karmayogi & NSSTA Pathway'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Action Plan: Structured Implementation Phases */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Capacity Building Strategic Action Plan
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Phased statutory milestones to fulfill annual training hours and close identified competency deficits.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                Statutory Execution Plan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  phase: 'Phase 1: Q1–Q2 Mandatory Enrolment',
                  title: 'Core Technical Pathway Execution',
                  desc: 'Mandate IGOT-PYTHON-302 completion for all 94 DIID Officials prior to NSS 80th Round CAPI survey rollout.',
                  badge: 'Mandatory',
                  badgeColor: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
                },
                {
                  phase: 'Phase 2: Q2–Q3 Residential Academy',
                  title: 'NSSTA Greater Noida Practical Workshops',
                  desc: 'Organize 5-Day Residential Hands-on Workshop on SDMX Data Structure Definitions & Metadata Governance.',
                  badge: 'Residential',
                  badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
                },
                {
                  phase: 'Phase 3: Q3 Continuous Tracking',
                  title: 'Automated iGOT Competency Webhook Sync',
                  desc: 'Establish automated webhook listener to sync official competency credits and recalibrate deficits in real-time.',
                  badge: 'Real-Time',
                  badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                },
                {
                  phase: 'Phase 4: Q4 Governance Review',
                  title: 'Annual DoPT & CBC Submission',
                  desc: 'Compile finalized ACBP implementation brief for formal submission to Cabinet Secretariat & Capacity Building Commission.',
                  badge: 'Statutory',
                  badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 text-xs space-y-2 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A8A] text-[11px] uppercase tracking-wider">
                      {item.phase}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
