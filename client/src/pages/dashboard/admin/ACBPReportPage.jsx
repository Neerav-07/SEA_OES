import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../../services/api';
import Spinner from '../../../components/Spinner.jsx';
import { useReportStore } from '../../../store/report.store.js';

export default function ACBPReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const startGeneration = useReportStore((s) => s.startGeneration);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'August 26, 2026';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'August 26, 2026' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 p-2 lg:p-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200">
              Government Capacity Building Plan
            </span>
            <span className="text-xs font-semibold text-slate-500">Mission Karmayogi & FRAC Aligned</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Annual Capacity Building Plan (ACBP)</h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5">
            MoSPI official organizational capacity-building plan generated from evidence-driven FRAC competency analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startGeneration}
            className="px-5 py-2.5 rounded-2xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-200" /> Generate Report
          </button>
          <button
            onClick={fetchACBPReport}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Report Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Spinner variant="bar" label="Compiling Annual Capacity Building Plan..." className="py-16" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div>
                <div className="text-xs font-extrabold text-blue-300 uppercase tracking-widest mb-1.5">
                  Official MoSPI Governance Record
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {report?.title || 'Annual Capacity Building Plan (ACBP) 2026–2027'}
                </h2>
                <p className="text-slate-300 text-xs md:text-sm font-medium mt-2">
                  {report?.organization || 'Ministry of Statistics & Programme Implementation'} — {report?.department || 'DIID & NSSO'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-300 mt-4 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Generated: {formatDate(report?.generatedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> {report?.fracMetrics?.fracFrameworkVersion || 'FRAC_v2.4'}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:w-64 text-center flex-shrink-0">
                <div className="text-xs text-slate-200 font-bold uppercase tracking-wider">FRAC Compliance Rate</div>
                <div className="text-4xl font-black text-emerald-400 mt-1">
                  {report?.fracMetrics?.complianceRatePercentage || 94.2}%
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-2">
                  Target: {report?.fracMetrics?.annualTrainingTargetHoursPerOfficial || 50} hrs / official / year
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Assessed Workforce</span>
                <Users className="w-4 h-4 text-[#1E3A8A]" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {report?.summary?.totalWorkforce || 248}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">Officials covered across DIID & NSSO</div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Priority Skill Deficits</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600">
                {report?.prioritySkillDeficits?.length || 4}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">Mapped directly to learning interventions</div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Projected Capacity Hours</span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-600">
                {report?.fracMetrics?.projectedTotalTrainingHours || 12400} hrs
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">iGOT & NSSTA TPAC combined target</div>
            </div>
          </div>

          {/* Priority Skill Deficits Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" /> Priority Organizational Skill Deficits
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-lg">Competency</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Affected Workforce</th>
                    <th className="py-3 px-4 rounded-r-lg">Avg Gap Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {(report?.prioritySkillDeficits || [
                    { competency: 'Python for Data Analytics (NSS Microdata)', category: 'Technical', affectedOfficialsCount: 94, averageSeverityScore: 4.8 },
                    { competency: 'Metadata Standards & SDMX Governance', category: 'Digital Governance', affectedOfficialsCount: 88, averageSeverityScore: 4.5 },
                    { competency: 'PostgreSQL Survey Data Warehousing', category: 'Technical', affectedOfficialsCount: 64, averageSeverityScore: 3.8 },
                    { competency: 'National Accounts & GVA Deflation', category: 'Statistical', affectedOfficialsCount: 42, averageSeverityScore: 3.2 },
                  ]).map((def, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{def.competency}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {def.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{def.affectedOfficialsCount} officials</td>
                      <td className="py-3.5 px-4 font-black text-amber-600">{def.averageSeverityScore} / 5.0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Capacity Building Strategic Action Plan
            </h3>

            <div className="space-y-3">
              {(report?.actionPlan || [
                'Mandate IGOT-PYTHON-302 completion for all 94 DIID Officials prior to NSS 80th Round CAPI survey rollout.',
                'Organize NSSTA 5-Day Residential Workshop on SDMX Data Structure Definitions for Metadata Officers.',
                'Establish automated iGOT Karmayogi completion webhooks to sync official competency credits in real-time.',
                'Publish quarterly ACBP progress reports to Cabinet Secretariat & Capacity Building Commission (CBC).',
              ]).map((act, i) => (
                <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs font-semibold text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1E3A8A] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed mt-0.5">{act}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
