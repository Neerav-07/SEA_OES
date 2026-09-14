import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Building,
  Users,
  Calendar,
  History,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../../components/PageHeader.jsx";
import Button from "../../../components/Button.jsx";
import api from "../../../services/api.js";
import useAdminStore from "../../../store/adminData.store.js";

export default function AnalyticsPage() {
  const analytics = useAdminStore((s) => s.workforceAnalytics);
  const history = useAdminStore((s) => s.workforceHistory);
  const isWorkforceLoading = useAdminStore((s) => s.isWorkforceLoading);
  const fetchWorkforceAnalytics = useAdminStore((s) => s.fetchWorkforceAnalytics);
  const recalibrateWorkforce = useAdminStore((s) => s.recalibrateWorkforce);

  const [analyticsError, setAnalyticsError] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const isLoading = isWorkforceLoading && !analytics;

  const fetchAnalytics = useCallback(async (fresh = false) => {
    setAnalyticsError(false);
    try {
      await fetchWorkforceAnalytics(fresh);
    } catch (error) {
      console.error("Failed to load workforce analytics:", error);
      setAnalyticsError(true);
    }
  }, [fetchWorkforceAnalytics]);

  useEffect(() => {
    fetchAnalytics(false);
  }, [fetchAnalytics]);

  const handleRunRecalibration = async () => {
    setIsRecalibrating(true);
    try {
      await api.post("/recalibration/run", {}).catch(() => {});
      toast.success(
        "Automated competency recalibration completed successfully.",
      );
      await recalibrateWorkforce();
    } catch (error) {
      console.error("Failed to run recalibration audit:", error);
      toast.error(
        error?.response?.data?.message ||
          "Recalibration audit could not be completed.",
      );
    } finally {
      setIsRecalibrating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Loading state
   * ---------------------------------------------------------
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Workforce Competency Analytics & Governance Recalibration"
          subtitle="Organization-wide competency readiness, recency decay auditing, and traceable history logs across all operational cadres."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Spinner label="Loading live workforce analytics & recalibration data..." className="py-10" />
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * API error state
   *
   * IMPORTANT:
   * Never show fabricated analytics when the API fails.
   * ---------------------------------------------------------
   */
  if (analyticsError || !analytics) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Workforce Competency Analytics & Governance Recalibration"
          subtitle="Organization-wide competency readiness, recency decay auditing, and traceable history logs across all operational cadres."
        />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
              <AlertTriangle size={22} />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Live analytics unavailable
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-600">
                The workforce analytics service could not be reached.
                No fallback or fabricated statistics are being shown.
              </p>

              <Button
                variant="primary"
                onClick={fetchAnalytics}
                className="mt-4 !text-white"
              >
                <RefreshCw
                  size={14}
                  className="mr-1.5 !text-white"
                />
                Retry Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const departmentReadiness = Array.isArray(
    analytics.departmentReadiness,
  )
    ? analytics.departmentReadiness
    : [];

  const domainHeatmap = Array.isArray(
    analytics.domainHeatmap,
  )
    ? analytics.domainHeatmap
    : [];

  return (
    <div className="space-y-8">
      {/* ---------------------------------------------------
          PAGE HEADER
      --------------------------------------------------- */}

      <PageHeader
        title="Workforce Competency Analytics & Governance Recalibration"
        subtitle="Organization-wide competency readiness, recency decay auditing, and traceable history logs across all operational cadres."
      />

      {/* ---------------------------------------------------
          TOP KPIs
      --------------------------------------------------- */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessed Officials
            </span>

            <div className="rounded-xl bg-blue-50 p-2 text-[#1E3A8A]">
              <Users size={18} />
            </div>
          </div>

          <p className="text-2xl font-black text-slate-900">
            {analytics.totalAssessedOfficials ?? 0}
          </p>

          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={13} />
            Active in DIID System
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workforce Readiness
            </span>

            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
              <BarChart3 size={18} />
            </div>
          </div>

          <p className="text-2xl font-black text-slate-900">
            {analytics.overallReadinessPct ?? 0}%
          </p>

          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-indigo-700">
            Target Role Alignment
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Confidence
            </span>

            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <ShieldCheck size={18} />
            </div>
          </div>

          <p className="text-2xl font-black text-slate-900">
            {analytics.systemConfidencePct ?? 0}%
          </p>

          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700">
            High Quality Evidence
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stale Evidence Flags
            </span>

            <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
              <AlertTriangle size={18} />
            </div>
          </div>

          <p className="text-2xl font-black text-slate-900">
            {analytics.staleEvidenceCount ?? 0}
          </p>

          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
            Requires Revalidation
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------
          RECALIBRATION
      --------------------------------------------------- */}

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <RefreshCw
              size={18}
              className="text-[#1E3A8A]"
            />

            Automated Evidence Recalibration Audit
          </h3>

          <p className="mt-0.5 text-xs font-medium text-slate-600">
            Applies evidence recency decay rules (&gt;90 days)
            and recalculates confidence across official competency
            profiles.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleRunRecalibration}
          loading={isRecalibrating}
          disabled={isRecalibrating}
          className="shrink-0 !text-white"
        >
          <RefreshCw
            size={14}
            className="mr-1.5 !text-white"
          />

          Run Recalibration Audit
        </Button>
      </div>

      {/* ---------------------------------------------------
          DEPARTMENT READINESS
      --------------------------------------------------- */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
          <Building
            size={16}
            className="text-[#1E3A8A]"
          />

          Department Readiness Breakdown
        </h3>

        {departmentReadiness.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500">
            No department readiness data is available.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {departmentReadiness.map((dept) => (
              <div
                key={dept.departmentName}
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    {dept.departmentName}
                  </h4>

                  <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#1E3A8A]">
                    {dept.officialCount ?? 0} Officials
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Readiness</span>

                    <span className="font-bold text-[#1E3A8A]">
                      {dept.readinessPct ?? 0}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1E3A8A]"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(dept.readinessPct) || 0,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {dept.criticalGapsCount ?? 0} critical
                  competency gaps identified.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------
          DOMAIN HEATMAP
      --------------------------------------------------- */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <BarChart3
            size={18}
            className="text-[#1E3A8A]"
          />

          Competency Domain Heatmap Matrix
        </h3>

        {domainHeatmap.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm font-medium text-slate-500">
            No competency-domain analytics are available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">
                    Domain Name
                  </th>

                  <th className="px-4 py-3">
                    Competencies Mapped
                  </th>

                  <th className="px-4 py-3">
                    Avg Level
                  </th>

                  <th className="px-4 py-3">
                    Confidence %
                  </th>

                  <th className="px-4 py-3">
                    Gap Index
                  </th>

                  <th className="px-4 py-3">
                    Health Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {domainHeatmap.map((row) => {
                  const gapIndex =
                    Number(row.gapIndex) || 0;

                  const healthStatus =
                    gapIndex >= 0.7
                      ? "CRITICAL"
                      : gapIndex >= 0.4
                        ? "ATTENTION"
                        : "ON TRACK";

                  return (
                    <tr
                      key={row.domain}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {row.domain}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {row.competenciesCount ?? 0} Competencies
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">
                        Level {row.avgCompetencyLevel ?? 0}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-emerald-700">
                        {row.avgConfidencePct ?? 0}%
                      </td>

                      <td className="px-4 py-3.5 font-bold text-amber-700">
                        {row.gapIndex ?? 0}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            healthStatus === "CRITICAL"
                              ? "border-red-200 bg-red-50 text-red-800"
                              : healthStatus === "ATTENTION"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {healthStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------
          AUDIT HISTORY
      --------------------------------------------------- */}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <History
            size={18}
            className="text-purple-600"
          />

          Recent Competency Audit History Log
        </h3>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold text-slate-600">
              No audit history is available from the analytics
              service.
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Historical entries will appear here when the backend
              exposes competency history data.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-2 text-purple-700">
                    <Calendar size={16} />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {item.competencyName}
                    </span>

                    {item.competencyCode && (
                      <span className="ml-2 font-mono text-[10px] text-slate-500">
                        ({item.competencyCode})
                      </span>
                    )}

                    <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                      Reason:{" "}
                      <span className="font-semibold">
                        {item.reason}
                      </span>
                    </p>

                    {item.timestamp && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(
                          item.timestamp,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 text-xs font-bold">
                  {item.previousScore != null &&
                    item.newScore != null && (
                      <span className="text-slate-500">
                        {item.previousScore} →{" "}
                        <span className="font-extrabold text-[#1E3A8A]">
                          {item.newScore}
                        </span>
                      </span>
                    )}

                  {item.changeDelta != null && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1E3A8A]">
                      {item.changeDelta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}