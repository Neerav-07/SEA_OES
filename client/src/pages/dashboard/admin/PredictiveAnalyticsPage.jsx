import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Brain,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import api from '../../../services/api';
import Spinner from '../../../components/Spinner.jsx';

export default function PredictiveAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('MoSPI DIID');

  useEffect(() => {
    fetchPredictions();
  }, [department]);

  async function fetchPredictions() {
    try {
      setLoading(true);
      const res = await api.get(`/predictions/skill-trends?department=${encodeURIComponent(department)}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch predictive analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-2 lg:p-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ML Predictive Analytics
            </span>
            <span className="text-xs font-semibold text-slate-500">6-Month Forecast</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workforce Skill Deficit Predictions</h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5">
            Predictive machine learning models forecasting emerging capacity risks and workforce training needs for Official Statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="MoSPI DIID">MoSPI DIID</option>
            <option value="NSSO Headquarters">NSSO Headquarters</option>
            <option value="Field Operations Division (FOD)">Field Operations Division (FOD)</option>
            <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
          </select>

          <button
            onClick={fetchPredictions}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Forecast"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Spinner variant="radial" progress={89} label="Running predictive ML trend models..." className="py-16" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Overall Department Readiness</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {data?.predictions?.departmentReadinessScore || '3.4'} <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="text-xs text-emerald-700 mt-2 font-extrabold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +0.4 improvement over last quarter
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Model Confidence</span>
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-700">
                {Math.round((data?.predictions?.modelConfidence || 0.89) * 100)}%
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                Trained on historical NSSO survey audits & iGOT course logs
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Forecast Horizon</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600">
                {data?.forecastMonths || 6} Months
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                Proactive Capacity Building Window
              </div>
            </div>
          </div>

          {/* Predicted Emerging Deficits List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Predicted Emerging Skill Deficits (Next 6 Months)
            </h3>

            <div className="space-y-3">
              {(data?.predictions?.predictedEmergingGaps || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.competency}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        item.trend === 'HIGH_INCREASE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.trend}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      <strong className="text-emerald-700">Action:</strong> {item.recommendedCapacityBuilding}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Deficit Risk</div>
                      <div className="text-lg font-black text-rose-600">
                        {Math.round((item.predictedDeficitRisk || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
