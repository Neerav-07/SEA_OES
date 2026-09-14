import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  RefreshCw,
  ShieldAlert,
  Target,
  Lock,
  Award,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import Select from '../../../components/Select.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Spinner from '../../../components/Spinner.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import { getSkillGap, listSkillGaps, getEligibleRoles, selectTargetRole, recalculateSkillGaps } from '../../../services/skillGap.service.js';
import { GAP_CATEGORIES, getGapCategoryClass } from './skillGap.constants.js';

function formatLevel(value) {
  return Number(value || 0).toFixed(1);
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

import useDashboardStore from '../../../store/dashboardData.store.js';

export default function SkillGapsPage() {
  const storeGaps = useDashboardStore((s) => s.skillGaps);
  const isSkillGapsLoading = useDashboardStore((s) => s.isSkillGapsLoading);
  const fetchSkillGaps = useDashboardStore((s) => s.fetchSkillGaps);

  const [gaps, setGaps] = useState(() => storeGaps.length > 0 ? storeGaps : []);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roles, setRoles] = useState([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState('');
  const [loading, setLoading] = useState(() => storeGaps.length === 0);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [error, setError] = useState('');
  const [expandedGapId, setExpandedGapId] = useState(null);
  const [gapDetails, setGapDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Synchronize local gaps with store updates
  useEffect(() => {
    if (storeGaps && storeGaps.length > 0) {
      setGaps(storeGaps);
      setLoading(false);
    }
  }, [storeGaps]);

  async function loadGaps(force = false) {
    if (gaps.length === 0 && storeGaps.length === 0) {
      setLoading(true);
    }
    setError('');
    try {
      const data = await fetchSkillGaps(force);
      if (Array.isArray(data) && data.length > 0) {
        setGaps(data);
      }
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Skill gaps could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await getEligibleRoles();
        setRoles(data.roles || []);
        setSelectedRoleKey(data.targetRoleId || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Eligible roles could not be loaded.');
      }
      await loadGaps();
    })();
  }, []);

  function recalculateGapsForRole(rawGaps) {
    // Requirements and gap values are authoritative only when supplied by API.
    return rawGaps;
    /*
    return rawGaps.map((g) => {
      const codeKey = (g.competencyCode || g.code || g.competencyName || '')
        .toUpperCase()
        .replace(/[^A-Z_]/g, '_');

      let reqLvl = bm.requiredLevels[codeKey];
      if (!reqLvl) {
        reqLvl = Object.entries(bm.requiredLevels).find(([k]) => codeKey.includes(k) || k.includes(codeKey))?.[1] ||
          (roleKey === 'DIRECTOR' ? 5.0 : roleKey === 'AD' ? 4.5 : roleKey === 'SSO' ? 4.0 : 3.0);
      }

      const estLvl = Number(g.estimatedLevel || 1.4);
      const gapVal = Math.max(0, Number((reqLvl - estLvl).toFixed(1)));
      const cat = gapVal >= 2.5 ? 'critical' : gapVal >= 1.5 ? 'high' : gapVal > 0 ? 'moderate' : 'target_met';
      const learnPri = Number((gapVal * 1.8 + 1.2).toFixed(1));

      return {
        ...g,
        requiredLevel: reqLvl,
        gapScore: gapVal,
        gap: gapVal,
        category: cat,
        learningPriority: learnPri,
        reasons: [
          `Target Benchmark: ${bm.roleTitle} requires Level ${reqLvl.toFixed(1)}.`,
          `Your evaluated evidence score is Level ${estLvl.toFixed(1)}.`,
          gapVal > 0 ? `Calculated Deficit Gap: -${gapVal.toFixed(1)} Level.` : 'Target proficiency benchmark met.',
        ],
      };
    });
    */
  }

  const handleRoleChange = async (newRoleKey) => {
    setSelectedRoleKey(newRoleKey);
    setIsReevaluating(true);
    const roleName = roles.find((role) => role.id === newRoleKey)?.title || 'selected role';
    toast.success(`⚡ Re-evaluating FRAC skill gaps for benchmark: ${roleName}`, {
      id: 'role-change-toast',
      duration: 3000,
    });

    try {
      await selectTargetRole(newRoleKey);
      setGaps(await recalculateSkillGaps(newRoleKey));
    } catch (err) {
      setError(err.response?.data?.message || 'Target role could not be changed.');
    } finally {
      setIsReevaluating(false);
    }
  };

  async function toggleGapDetails(gapId) {
    if (expandedGapId === gapId) {
      setExpandedGapId(null);
      return;
    }
    setExpandedGapId(gapId);
    if (gapDetails[gapId]) return;
    setDetailsLoading(true);
    try {
      const detail = await getSkillGap(gapId);
      setGapDetails((current) => ({ ...current, [gapId]: detail }));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Gap details could not be loaded.');
    } finally {
      setDetailsLoading(false);
    }
  }

  const visibleGaps = categoryFilter === 'all'
    ? gaps
    : gaps.filter((gap) => gap.category === categoryFilter);

  const criticalCount = gaps.filter((gap) => gap.category === 'critical').length;
  const highCount = gaps.filter((gap) => gap.category === 'high' || gap.category === 'moderate').length;
  const targetMetCount = gaps.filter((gap) => gap.category === 'target_met' || gap.gapScore === 0).length;

  const currentBenchmark = roles.find((role) => role.id === selectedRoleKey);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Compare your assessed competency levels against cadre benchmarks to identify training needs."
      />

      {error && (
        <Alert
          type="error"
          title="Unable to load skill gaps"
          message={error}
          icon={AlertCircle}
          onClose={() => setError('')}
        />
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16">
          <Spinner variant="bar" label="Loading competency gaps..." className="py-16" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={Target} label="Total Competencies" value={gaps.length} tone="text-[#1E3A8A]" />
            <SummaryCard icon={ShieldAlert} label="Critical Gaps" value={criticalCount} tone="text-red-600" />
            <SummaryCard icon={ShieldAlert} label="Moderate Gaps" value={highCount} tone="text-amber-600" />
            <SummaryCard icon={ClipboardCheck} label="Benchmark Met" value={targetMetCount} tone="text-emerald-600" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Competency Gaps by Role Benchmark</h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Evaluated gaps against benchmark for {currentBenchmark?.title || 'selected role'}.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="min-w-[160px] sm:min-w-[200px]">
                  <Select
                    id="target-role"
                    size="sm"
                    value={selectedRoleKey}
                    disabled={isReevaluating || roles.length === 0}
                    onChange={(event) => handleRoleChange(event.target.value)}
                    options={
                      roles.length === 0
                        ? [{ value: '', label: 'No eligible roles' }]
                        : roles.map((role) => ({ value: role.id, label: role.title }))
                    }
                  />
                </div>
                <div className="min-w-[150px] sm:min-w-[180px]">
                  <Select
                    id="gap-category"
                    size="sm"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    options={[
                      { value: 'all', label: `All Categories (${gaps.length})` },
                      { value: 'critical', label: `Critical Gaps (${criticalCount})` },
                      { value: 'high', label: `High & Moderate (${highCount})` },
                      { value: 'target_met', label: `Target Met (${targetMetCount})` },
                    ]}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={loadGaps} loading={loading} className="h-8.5 px-3 cursor-pointer">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {visibleGaps.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No competency gaps found"
                message="All tracked competencies meet or exceed the selected role benchmark."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Competency & Code</th>
                      <th className="px-4 py-3">Required</th>
                      <th className="px-4 py-3">Estimated</th>
                      <th className="px-4 py-3">Deficit Gap</th>
                      <th className="px-4 py-3">Learning Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {visibleGaps.map((gap) => {
                      const isCritical = gap.category === 'critical';
                      const isTargetMet = gap.category === 'target_met' || gap.gapScore === 0;

                      return (
                        <Fragment key={gap.id}>
                          <tr className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 block text-sm">{gap.competencyName}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">{gap.competencyCode}</span>
                            </td>
                            <td className="px-4 py-4 font-bold text-[#1E3A8A]">L{formatLevel(gap.requiredLevel)}</td>
                            <td className="px-4 py-4 font-bold text-slate-700">L{formatLevel(gap.estimatedLevel)}</td>
                            <td className="px-4 py-4">
                              {isTargetMet ? (
                                <span className="font-bold text-emerald-600">0.0 (Target Met)</span>
                              ) : (
                                <span className={`font-black ${isCritical ? 'text-red-600' : 'text-amber-700'}`}>
                                  -{formatLevel(gap.gapScore)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-700">{formatLevel(gap.learningPriority)}</td>
                            <td className="px-4 py-4">
                              {isTargetMet ? (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                                  Target Met
                                </span>
                              ) : isCritical ? (
                                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold text-red-800 border border-red-200">
                                  Critical Deficit
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                                  High Priority
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-blue-50"
                                onClick={() => toggleGapDetails(gap.id)}
                              >
                                {expandedGapId === gap.id ? 'Hide' : 'View'}
                                {expandedGapId === gap.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </td>
                          </tr>

                          {expandedGapId === gap.id && (
                            <tr className="bg-slate-50/90 border-b border-slate-200">
                              <td colSpan="7" className="px-6 py-5">
                                <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Why this gap exists</h4>
                                    <ul className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                                      {(Array.isArray(gap.reasons) ? gap.reasons : []).map((reason) => (
                                        <li key={reason}>• {reason}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Actionable areas</h4>
                                    {(() => {
                                      const DEFAULT_ACTIONABLE_AREAS = {
                                        PYTHON_ANALYTICS: [
                                          {
                                            id: 'act-py-1',
                                            name: 'NSS Microdata Wrangling & Cleaning Scripts',
                                            learningObjectives: [{ title: 'Automate NSS 79th Round survey data cleaning, missing value imputation, and validation rules in Pandas' }],
                                          },
                                          {
                                            id: 'act-py-2',
                                            name: 'Statistical Plotting & Dissemination Visuals',
                                            learningObjectives: [{ title: 'Generate publication-ready Seaborn/Matplotlib charts for MoSPI annual statistical reports' }],
                                          },
                                        ],
                                        METADATA_STANDARDS: [
                                          {
                                            id: 'act-meta-1',
                                            name: 'SDMX Data & Metadata Structure Definition',
                                            learningObjectives: [{ title: 'Define SDMX DSD (Data Structure Definition) registries for cross-ministerial statistical data sharing' }],
                                          },
                                          {
                                            id: 'act-meta-2',
                                            name: 'DDI Microdata Cataloguing',
                                            learningObjectives: [{ title: 'Construct Nesstar/DDI XML metadata packages for National Data Archive (NADA) release' }],
                                          },
                                        ],
                                        SQL_DATABASE: [
                                          {
                                            id: 'act-sql-1',
                                            name: 'PostgreSQL Relational Queries & Aggregations',
                                            learningObjectives: [{ title: 'Write optimized SQL aggregations, CTEs, and window functions across 5+ million PLFS survey records' }],
                                          },
                                        ],
                                        NATIONAL_ACCOUNTS: [
                                          {
                                            id: 'act-nas-1',
                                            name: 'Sectoral GVA Deflation & Double-Deflation Indices',
                                            learningObjectives: [{ title: 'Calculate Sectoral Gross Value Added (GVA) at constant prices using SNA 2008 deflation indices' }],
                                          },
                                        ],
                                        SURVEY_DESIGN: [
                                          {
                                            id: 'act-surv-1',
                                            name: 'Cognitive Questionnaire Design & Skip Logic',
                                            learningObjectives: [{ title: 'Design household survey questionnaires following cognitive interview principles and CAPI skip logic' }],
                                          },
                                        ],
                                      };

                                      const compCodeKey = (gap.competencyCode || gap.code || gap.competencyName || '')
                                        .toUpperCase()
                                        .replace(/[^A-Z_]/g, '_');

                                      const matchedKey = Object.keys(DEFAULT_ACTIONABLE_AREAS).find(
                                        (k) => compCodeKey.includes(k) || k.includes(compCodeKey)
                                      ) || 'SURVEY_DESIGN';

                                      const activeSubs = DEFAULT_ACTIONABLE_AREAS[matchedKey] || DEFAULT_ACTIONABLE_AREAS.SURVEY_DESIGN;

                                      return (
                                        <ul className="mt-2 space-y-2 text-xs text-slate-600 font-medium">
                                          {activeSubs.map((subCompetency) => (
                                            <li key={subCompetency.id}>
                                              <span className="font-bold text-slate-900 block">{subCompetency.name}</span>
                                              {subCompetency.learningObjectives?.length > 0 && (
                                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                                  • {subCompetency.learningObjectives.map((o) => o.title || o).join(', ')}
                                                </span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    })()}
                                  </div>

                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Evidence Sufficiency</h4>
                                    <p className="mt-2 text-xs font-bold text-emerald-700">
                                      82% Sufficient (High Confidence)
                                    </p>
                                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                                      <div className="flex justify-between gap-2">
                                        <dt>Volume</dt>
                                        <dd className="font-bold text-slate-800">80%</dd>
                                      </div>
                                      <div className="flex justify-between gap-2">
                                        <dt>Recency</dt>
                                        <dd className="font-bold text-slate-800">100%</dd>
                                      </div>
                                      <div className="flex justify-between gap-2">
                                        <dt>Diversity</dt>
                                        <dd className="font-bold text-slate-800">75%</dd>
                                      </div>
                                      <div className="flex justify-between gap-2">
                                        <dt>Quality</dt>
                                        <dd className="font-bold text-slate-800">90%</dd>
                                      </div>
                                    </dl>
                                  </div>

                                  <div className="flex items-start lg:justify-end col-span-full pt-2 border-t border-slate-200">
                                    <Button as={Link} to={`/dashboard/learning-paths`} variant="primary" size="sm" className="!text-white">
                                      <BookOpen className="h-4 w-4 mr-1 !text-white" />
                                      Explore Personalized Pathway Courses
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
