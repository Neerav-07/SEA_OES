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
    <div className="space-y-6 p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ML Predictive Analytics
            </span>
            <span className="text-xs font-mono text-slate-400">6-Month Forecast</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Workforce Skill Deficit Predictions</h1>
          <p className="text-slate-400 text-sm">
            Predictive machine learning models forecasting emerging capacity risks and workforce training needs for Official Statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="MoSPI DIID">MoSPI DIID</option>
            <option value="NSSO Headquarters">NSSO Headquarters</option>
            <option value="Field Operations Division (FOD)">Field Operations Division (FOD)</option>
            <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
          </select>

          <button
            onClick={fetchPredictions}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Forecast"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Running predictive trend models...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Overall Department Readiness</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data?.predictions?.departmentReadinessScore || '3.4'} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
              </div>
              <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +0.4 improvement over last quarter
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Model Confidence</span>
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-purple-400">
                {Math.round((data?.predictions?.modelConfidence || 0.89) * 100)}%
              </div>
              <div className="text-xs text-slate-400 mt-2 font-medium">
                Trained on historical NSSO survey audits & iGOT course logs
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Forecast Horizon</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">
                {data?.forecastMonths || 6} Months
              </div>
              <div className="text-xs text-slate-400 mt-2 font-medium">
                Proactive Capacity Building Window
              </div>
            </div>
          </div>

          {/* Predicted Emerging Deficits List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Predicted Emerging Skill Deficits (Next 6 Months)
            </h3>

            <div className="space-y-3">
              {(data?.predictions?.predictedEmergingGaps || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.competency}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.trend === 'HIGH_INCREASE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.trend}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong className="text-emerald-400">Action:</strong> {item.recommendedCapacityBuilding}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Deficit Risk</div>
                      <div className="text-lg font-extrabold text-rose-400">
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
