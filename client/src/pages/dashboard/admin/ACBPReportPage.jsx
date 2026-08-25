import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Building,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';
import api from '../../../services/api';

export default function ACBPReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchACBPReport();
  }, []);

  async function fetchACBPReport() {
    try {
      setLoading(true);
      const res = await api.get('/reports/acbp');
      setReport(res.data.acbpReport);
    } catch (err) {
      console.error('Failed to fetch ACBP report:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 print:p-0 print:bg-white print:text-black">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Government Capacity Building Plan
            </span>
            <span className="text-xs font-mono text-slate-400">Mission Karmayogi Aligned</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Annual Capacity Building Plan (ACBP)</h1>
          <p className="text-slate-400 text-sm">
            MoSPI official organizational capacity-building plan generated from evidence-driven FRAC competency analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / PDF Export
          </button>
          <button
            onClick={fetchACBPReport}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Compiling Annual Capacity Building Plan...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Document Cover Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Official MoSPI Governance Record
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {report?.title || 'Annual Capacity Building Plan (ACBP) 2026–2027'}
                </h2>
                <p className="text-slate-300 text-sm mt-2">
                  {report?.organization} — {report?.department}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Generated: {new Date(report?.generatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> {report?.fracMetrics?.fracFrameworkVersion}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 md:w-64 text-center flex-shrink-0">
                <div className="text-xs text-slate-400 font-semibold">FRAC Compliance Rate</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {report?.fracMetrics?.complianceRatePercentage}%
                </div>
                <div className="text-[11px] text-slate-300 mt-2">
                  Target: {report?.fracMetrics?.annualTrainingTargetHoursPerOfficial} hrs / official / year
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Assessed Workforce</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {report?.summary?.totalWorkforce || 0}
              </div>
              <div className="text-xs text-slate-400 mt-2">Officials covered across DIID & NSSO</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Priority Skill Deficits</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">
                {report?.prioritySkillDeficits?.length || 0}
              </div>
              <div className="text-xs text-slate-400 mt-2">Mapped directly to learning interventions</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Projected Capacity Hours</span>
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {report?.fracMetrics?.projectedTotalTrainingHours || 0} hrs
              </div>
              <div className="text-xs text-slate-400 mt-2">iGOT & NSSTA TPAC combined target</div>
            </div>
          </div>

          {/* Priority Skill Deficits Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Priority Organizational Skill Deficits
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Competency</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Affected Workforce</th>
                    <th className="pb-3">Avg Gap Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(report?.prioritySkillDeficits || []).map((def, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-3 font-semibold text-white">{def.competency}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium border border-slate-700">
                          {def.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 font-medium">{def.affectedOfficialsCount} officials</td>
                      <td className="py-3 font-bold text-amber-400">{def.averageSeverityScore} / 5.0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Capacity Building Strategic Action Plan
            </h3>

            <div className="space-y-3">
              {(report?.actionPlan || []).map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{act}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
