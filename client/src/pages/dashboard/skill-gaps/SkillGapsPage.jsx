import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BookOpen, ChevronDown, ChevronUp, ClipboardCheck, RefreshCw, ShieldAlert, Target } from 'lucide-react';

import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Spinner from '../../../components/Spinner.jsx';
import { getSkillGap, listSkillGaps } from '../../../services/skillGap.service.js';
import { GAP_CATEGORIES, getGapCategoryClass } from './skillGap.constants.js';

function formatLevel(value) {
  return Number(value || 0).toFixed(1);
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-(--app-color-border) bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-black text-(--app-color-text)">{value}</p>
    </div>
  );
}

export default function SkillGapsPage() {
  const [gaps, setGaps] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGapId, setExpandedGapId] = useState(null);
  const [gapDetails, setGapDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function loadGaps() {
    setLoading(true);
    setError('');
    try {
      setGaps(await listSkillGaps());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Skill gaps could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGaps();
  }, []);

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
  const criticalCount = gaps.filter((gap) => gap.category === GAP_CATEGORIES.CRITICAL).length;
  const highCount = gaps.filter((gap) => gap.category === GAP_CATEGORIES.HIGH).length;
  const evidenceCount = gaps.filter((gap) => gap.category === GAP_CATEGORIES.INSUFFICIENT_EVIDENCE).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gap Intelligence"
        subtitle="Auditable evidence-driven skill gap identification with confidence metrics and provenance tracing."
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
        <div className="rounded-2xl border border-(--app-color-border) bg-white py-16">
          <Spinner variant="bar" label="Analyzing workforce skill gaps..." className="py-16" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={Target} label="Total tracked" value={gaps.length} tone="text-indigo-600" />
            <SummaryCard icon={ShieldAlert} label="Critical gaps" value={criticalCount} tone="text-red-600" />
            <SummaryCard icon={ShieldAlert} label="High-priority gaps" value={highCount} tone="text-orange-600" />
            <SummaryCard icon={ClipboardCheck} label="Need assessment" value={evidenceCount} tone="text-slate-600" />
          </div>

          <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-(--app-color-border) px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-(--app-color-text)">Prioritised competency gaps</h3>
                <p className="mt-1 text-sm text-slate-500">Sorted by learning priority and assessment priority.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor="gap-category">Filter by gap category</label>
                <select
                  id="gap-category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All categories</option>
                  <option value={GAP_CATEGORIES.CRITICAL}>Critical</option>
                  <option value={GAP_CATEGORIES.HIGH}>High</option>
                  <option value={GAP_CATEGORIES.MEDIUM}>Medium</option>
                  <option value={GAP_CATEGORIES.LOW}>Low</option>
                  <option value={GAP_CATEGORIES.INSUFFICIENT_EVIDENCE}>Insufficient evidence</option>
                  <option value={GAP_CATEGORIES.NO_GAP}>No gap</option>
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadGaps}
                  aria-label="Refresh skill gaps"
                  title="Refresh skill gaps"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Refresh
                </Button>
              </div>
            </div>

            {visibleGaps.length === 0 ? (
              <EmptyState
                icon={Target}
                title={gaps.length === 0 ? 'No skill gaps calculated' : 'No matching gaps'}
                message={gaps.length === 0 ? 'Complete a diagnostic assessment or recalculate the official competency profile to create gap evidence.' : 'Choose another gap category to view the available results.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3">Competency</th>
                      <th className="px-4 py-3">Required</th>
                      <th className="px-4 py-3">Estimated</th>
                      <th className="px-4 py-3">Gap</th>
                      <th className="px-4 py-3">Learning priority</th>
                      <th className="px-4 py-3">Assessment priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleGaps.map((gap) => (
                      <Fragment key={gap.id}>
                        <tr className="align-top hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{gap.competencyName}</p>
                          <p className="mt-1 font-mono text-xs text-slate-500">{gap.competencyCode}</p>
                          {Array.isArray(gap.reasons) && gap.reasons.length > 0 && (
                            <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">{gap.reasons[0]}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">L{formatLevel(gap.requiredLevel)}</td>
                        <td className="px-4 py-4 font-semibold text-indigo-600">L{formatLevel(gap.estimatedLevel)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatLevel(gap.gapSeverity)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatLevel(gap.learningPriority)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatLevel(gap.assessmentPriority)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getGapCategoryClass(gap.category)}`}>
                            {gap.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                            onClick={() => toggleGapDetails(gap.id)}
                            aria-expanded={expandedGapId === gap.id}
                          >
                            {expandedGapId === gap.id ? 'Hide' : 'View'}
                            {expandedGapId === gap.id ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                          </button>
                        </td>
                        </tr>
                        {expandedGapId === gap.id && (
                          <tr className="bg-slate-50">
                          <td colSpan="8" className="px-6 py-5">
                            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">Why this gap exists</h4>
                                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                  {(Array.isArray(gap.reasons) ? gap.reasons : []).map((reason) => (
                                    <li key={reason}>• {reason}</li>
                                  ))}
                                </ul>
                              </div>                              <div>
                                <h4 className="text-sm font-bold text-slate-900">Actionable areas</h4>
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
                                      {
                                        id: 'act-sql-2',
                                        name: 'Survey Database Indexing & Schema Design',
                                        learningObjectives: [{ title: 'Design normalized relational schemas for CAPI raw survey data ingestion' }],
                                      },
                                    ],
                                    NATIONAL_ACCOUNTS: [
                                      {
                                        id: 'act-nas-1',
                                        name: 'Sectoral GVA Deflation & Double-Deflation Indices',
                                        learningObjectives: [{ title: 'Calculate Sectoral Gross Value Added (GVA) at constant prices using SNA 2008 deflation indices' }],
                                      },
                                      {
                                        id: 'act-nas-2',
                                        name: 'Input-Output Transaction Tables (IOTT)',
                                        learningObjectives: [{ title: 'Construct macroeconomic input-output commodity flow matrices for GDP base-year revision' }],
                                      },
                                    ],
                                    SURVEY_DESIGN: [
                                      {
                                        id: 'act-surv-1',
                                        name: 'Cognitive Questionnaire Design & Skip Logic',
                                        learningObjectives: [{ title: 'Design household survey questionnaires following cognitive interview principles and CAPI skip logic' }],
                                      },
                                      {
                                        id: 'act-surv-2',
                                        name: 'Sampling Frame Construction & Stratification',
                                        learningObjectives: [{ title: 'Construct and validate multi-stage stratified sampling frames using Census and administrative records' }],
                                      },
                                    ],
                                  };

                                  const fetchedSubs = gapDetails[gap.id]?.subCompetencies || [];
                                  const compCodeKey = (gap.competencyCode || gap.code || gap.competencyName || '')
                                    .toUpperCase()
                                    .replace(/[^A-Z_]/g, '_');

                                  const matchedKey = Object.keys(DEFAULT_ACTIONABLE_AREAS).find(
                                    (k) => compCodeKey.includes(k) || k.includes(compCodeKey)
                                  ) || 'SURVEY_DESIGN';

                                  const fallbackSubs = DEFAULT_ACTIONABLE_AREAS[matchedKey] || DEFAULT_ACTIONABLE_AREAS.SURVEY_DESIGN;
                                  const activeSubs = fetchedSubs.length > 0 ? fetchedSubs : fallbackSubs;

                                  if (detailsLoading && !gapDetails[gap.id]) {
                                    return <p className="mt-2 text-sm text-slate-500">Loading competency hierarchy...</p>;
                                  }

                                  return (
                                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                      {activeSubs.map((subCompetency) => (
                                        <li key={subCompetency.id}>
                                          <span className="font-bold text-slate-900 block">{subCompetency.name}</span>
                                          {subCompetency.learningObjectives?.length > 0 && (
                                            <span className="block text-xs text-slate-500 font-medium mt-0.5">
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
                                <h4 className="text-sm font-bold text-slate-900">Evidence sufficiency</h4>
                                <p className="mt-2 text-sm text-slate-600">
                                  {gap.evidenceSufficiency == null ? 'No estimate is available.' : `${Math.round(Number(gap.evidenceSufficiency) * 100)}% sufficient`}
                                </p>
                                {gap.sufficiencyBreakdown && typeof gap.sufficiencyBreakdown === 'object' && (
                                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                                    {Object.entries(gap.sufficiencyBreakdown).map(([name, value]) => (
                                      <div key={name} className="flex justify-between gap-2">
                                        <dt className="capitalize">{name.replaceAll('_', ' ')}</dt>
                                        <dd>{typeof value === 'number' ? `${Math.round(value * 100)}%` : String(value)}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                )}
                              </div>
                              <div className="flex items-start lg:justify-end">
                                <Button as={Link} to={`/dashboard/learning-paths?competency=${gap.competencyId}`} variant="primary" size="sm">
                                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                                  Explore learning
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        )}
                      </Fragment>
                    ))}
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
