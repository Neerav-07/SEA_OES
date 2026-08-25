import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Maximize2,
  FileCheck2,
  Layers,
  Sparkles,
  FileText,
  Database,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

// 10 Comprehensive MoSPI Case Study Scenarios (Official Industry Standard)
const DEFAULT_CASE_STUDIES = [
  {
    id: 'CS_01',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    division: 'Field Operations Division (FOD)',
    documentRef: 'MoSPI/NSS/79R/AUDIT-01',
    stem: 'CASE STUDY 1: NSS 79th Round Domestic Tourism Survey Audit & Weight Calibration',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
During the data validation audit of the 79th Round National Sample Survey (NSS) covering domestic tourism expenditure across rural/urban sectors, the Field Operations Division (FOD) reported a 14.2% unit non-response in rural sub-strata of Region IX. Preliminary exploratory data analysis reveals that the non-response is concentrated among high-income agricultural households possessing mechanized farming assets.

EXAMINATION PROBLEM:
As the Senior Statistical Officer supervising data quality assurance, which weighting adjustment and calibration procedure must be applied to prevent downward bias in national tourism expenditure estimates without inflating variance beyond acceptable design limits?`,
    options: [
      { text: 'Execute GREG (Generalized Regression Estimator) calibration using land holding size and tractor ownership as auxiliary benchmark variables to adjust sample multiplier weights.', isCorrect: true },
      { text: 'Apply simple mean imputation within the primary sampling unit (PSU) without modifying final multiplier weights.', isCorrect: false },
      { text: 'Drop the non-responding households and re-scale sample weights uniformly across all urban and rural strata.', isCorrect: false },
      { text: 'Substitute missing rural records with mean responses from neighboring district urban clusters.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'GREG calibration leverages known administrative benchmarks (land holdings) to re-calibrate sampling weights, neutralizing non-response bias while bounding variance under NSSO auditing standards.',
  },
  {
    id: 'CS_02',
    bloomLevel: 'ANALYZE',
    questionType: 'CASE_STUDY',
    division: 'National Accounts Division (NAD)',
    documentRef: 'MoSPI/NAD/CPI-REV/2026',
    stem: 'CASE STUDY 2: Consumer Price Index (CPI) Base-Year Revision & SNA 2008 Double-Deflation',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
The National Accounts Division (NAD) is revising the base year of the Consumer Price Index (Rural/Urban). During Gross Value Added (GVA) estimation for the Unorganized Retail Trade sector, price deflators computed from the new CPI series indicate an anomalous 8.5% divergence when compared against the Wholesale Price Index (WPI) manufacturing deflator.

EXAMINATION PROBLEM:
Evaluating the methodological impact under SNA 2008 guidelines, how should the statistical analyst resolve this deflation discrepancy to ensure real GVA reflects physical economic activity accurately?`,
    options: [
      { text: 'Construct a double-deflation index separating trade margins from physical output using sector-specific CPI service sub-indices.', isCorrect: true },
      { text: 'Replace the entire CPI rural series with the aggregate WPI headline index for single-deflation of nominal GVA.', isCorrect: false },
      { text: 'Apply unweighted geometric mean of WPI and CPI across all retail service commodity groups.', isCorrect: false },
      { text: 'Adjust nominal turnover by the implicit GDP deflator from the previous quinquennial census.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Double-deflation using sector-specific CPI trade sub-indices isolates real gross value added from price volatility under SNA 2008 guidelines.',
  },
  {
    id: 'CS_03',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    division: 'Data Informatics & Innovation Division (DIID)',
    documentRef: 'MoSPI/DIID/PLFS-ETL/V2',
    stem: 'CASE STUDY 3: Python & R Microdata Cleaning Pipeline for 5 Million PLFS Records',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
A data informatics team at MoSPI DIID is building an automated ETL pipeline in Python (Pandas/Statsmodels) to ingest 5 million raw Computer-Assisted Personal Interview (CAPI) records from the Periodic Labour Force Survey (PLFS). The dataset exhibits structural outliers in weekly hours worked (values exceeding 168 hours) and inconsistent occupation codes (NCO-2015).

EXAMINATION PROBLEM:
Which programmatic validation rule enforces data integrity while preserving valid extreme values required for labor force participation modeling?`,
    options: [
      { text: 'Implement winsorization at 99th percentile combined with regex verification against NCO-2015 official master lookup dictionaries.', isCorrect: true },
      { text: 'Filter out all records where weekly hours worked exceed 40 hours.', isCorrect: false },
      { text: 'Replace all invalid occupation codes with the modal code "9999".', isCorrect: false },
      { text: 'Convert numeric wage fields to categorical strings prior to running statistical aggregations.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Winsorization bounds extreme physical impossibilities (>168 hrs) while preserving high valid workloads, and regex dictionary lookup validates official NCO codes.',
  },
  {
    id: 'CS_04',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    division: 'Data Governance & Dissemination Unit',
    documentRef: 'MoSPI/NDSAP/SDC-GOV/2026',
    stem: 'CASE STUDY 4: Microdata Anonymization & Statistical Disclosure Control (SDC)',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
Prior to releasing the public-use microdata file (PUMF) for the Annual Survey of Unincorporated Sector Enterprises (ASUSE), the Data Governance Committee requires strict compliance with NDSAP privacy directives. A risk audit reveals that certain enterprise units in niche 4-digit NIC codes can be re-identified using district location and turnover capital.

EXAMINATION PROBLEM:
What SDC technique balances disclosure protection with analytical utility for economic researchers?`,
    options: [
      { text: 'Apply k-anonymity (k>=5) combined with microaggregation on turnover variables and top-coding on extreme revenue categories.', isCorrect: true },
      { text: 'Suppress all district-level geographic identifiers across the entire dataset.', isCorrect: false },
      { text: 'Add Gaussian random noise (+/- 50%) to all numerical variables regardless of re-identification risk.', isCorrect: false },
      { text: 'Publish only national summary tables and delete the microdata repository.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'k-anonymity (k>=5) with microaggregation protects quasi-identifiers (district + capital) without destroying correlation structures required for econometric research.',
  },
  {
    id: 'CS_05',
    bloomLevel: 'ANALYZE',
    questionType: 'CASE_STUDY',
    division: 'Survey Design & Research Division (SDRD)',
    documentRef: 'MoSPI/SDRD/SAMPLING-DEFF',
    stem: 'CASE STUDY 5: Multi-Stage Stratified PPS Sampling Variance Estimation & DEFF Adjustment',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
In a two-stage stratified sampling design for rural household surveys, Primary Sampling Units (PSUs) are selected with Probability Proportional to Size (PPSWR), and Ultimate Sampling Units (USUs) are selected via systematic sampling. The calculated design effect (DEFF) is 2.85, indicating substantial intra-cluster correlation.

EXAMINATION PROBLEM:
To achieve a target margin of error of +/- 2.5% at 95% confidence, how must the sampling design be adjusted?`,
    options: [
      { text: 'Increase the number of selected PSUs while decreasing the number of USUs sampled per PSU to reduce intra-cluster variance contribution.', isCorrect: true },
      { text: 'Double the number of USUs sampled within each existing PSU without increasing the PSU sample count.', isCorrect: false },
      { text: 'Switch from PPS sampling to simple random sampling without stratification.', isCorrect: false },
      { text: 'Reduce the confidence level from 95% to 80% to force DEFF down to 1.0.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'High DEFF (2.85) indicates cluster homogeneity. Increasing the number of PSUs (clusters) while sampling fewer households per PSU decreases variance efficiently under fixed budget constraints.',
  },
  {
    id: 'CS_06',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    division: 'Economic Statistics Division (ESD)',
    documentRef: 'MoSPI/ESD/ASI-CAPITAL-2026',
    stem: 'CASE STUDY 6: Annual Survey of Industries (ASI) Fixed Capital Imputation',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
During the Annual Survey of Industries (ASI) processing, 4.8% of registered manufacturing units in the 3-digit NIC sector omitted schedule block C (Fixed Assets & Depreciation). Cross-validation with GSTIN portal data shows reported turnover figures remain valid.

EXAMINATION PROBLEM:
How should the Statistical Officer impute net fixed capital to prevent under-estimation of Gross Fixed Capital Formation (GFCF)?`,
    options: [
      { text: 'Apply capital-to-turnover ratio imputation derived from homogeneous 4-digit NIC peer size classes in the same state.', isCorrect: true },
      { text: 'Assign zero fixed capital to all non-reporting factories.', isCorrect: false },
      { text: 'Impute capital using unweighted national mean across all manufacturing sectors.', isCorrect: false },
      { text: 'Delete non-reporting factory records from the master sample frame.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Peer-class capital-to-turnover ratio imputation maintains sectoral capital intensity structures aligned with ASI methodology.',
  },
  {
    id: 'CS_07',
    bloomLevel: 'ANALYZE',
    questionType: 'CASE_STUDY',
    division: 'Labour Statistics Unit (LSU)',
    documentRef: 'MoSPI/LSU/PLFS-WPR-AUDIT',
    stem: 'CASE STUDY 7: PLFS Activity Status Classification & Worker Population Ratio (WPR)',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
In the Periodic Labour Force Survey (PLFS), an individual worked 3 days in agriculture (subsistence), 2 days in MGNREGA road construction, and looked for work for 2 days during the 7-day reference period (Current Weekly Status - CWS).

EXAMINATION PROBLEM:
How should the official classify the individual primary activity status under PLFS CWS accounting rules?`,
    options: [
      { text: 'Classify as Employed (Code 11/31) based on the major time-criterion (5 days total work in reference week).', isCorrect: true },
      { text: 'Classify as Unemployed (Code 81) due to seeking work for 2 days.', isCorrect: false },
      { text: 'Classify as Out of Labour Force (Code 91) due to subsistence farming component.', isCorrect: false },
      { text: 'Split individual weight across 3 separate labor force status categories.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'CWS applies major time-criterion (5 working days out of 7), placing the respondent firmly in the Employed labor force status.',
  },
  {
    id: 'CS_08',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    division: 'Economic Statistics Division (ESD)',
    documentRef: 'MoSPI/ESD/IIP-WEIGHTS-2026',
    stem: 'CASE STUDY 8: Index of Industrial Production (IIP) Weight Revision & Item Basket Shift',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
The Economic Statistics Division is updating the IIP item basket to capture emerging digital manufacturing sectors (semiconductors, solar PV modules). The current basket over-weights legacy coal mining products relative to current GVA contributions.

EXAMINATION PROBLEM:
Which Laspeyres weighting modification ensures continuity while reflecting structural shifts in industrial output?`,
    options: [
      { text: 'Chain-linked Laspeyres index formulation with annual weight updating for fast-growing high-tech product groups.', isCorrect: true },
      { text: 'Fixed-weight Paasche index updated once every 15 years.', isCorrect: false },
      { text: 'Unweighted arithmetic average of physical output production ratios.', isCorrect: false },
      { text: 'Complete removal of mining and energy sectors from industrial production tracking.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Chain-linked Laspeyres indexing incorporates new high-growth item groups seamlessly without creating structural trend breaks in IIP time-series.',
  },
  {
    id: 'CS_09',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    division: 'Sustainable Development Goals Unit (SDGU)',
    documentRef: 'MoSPI/SDG/NIF-METRICS-2026',
    stem: 'CASE STUDY 9: National Indicator Framework (NIF) for SDG Monitoring & Data Disaggregation',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
Under SDG Goal 8 (Decent Work & Economic Growth), MoSPI reports NIF indicator 8.5.2 (Unemployment Rate by gender and disability). A state-level statistical audit reveals missing disability disaggregation in 3 Union Territories due to low sample representation in PLFS sub-samples.

EXAMINATION PROBLEM:
Which statistical aggregation strategy produces valid state-level SDG reports without publishing unreliable small-area estimates?`,
    options: [
      { text: 'Apply Small Area Estimation (SAE) modeling pooling administrative disability registries with PLFS survey estimates.', isCorrect: true },
      { text: 'Publish unweighted survey sample averages despite high coefficients of variation (>35%).', isCorrect: false },
      { text: 'Suppress all SDG Goal 8 reporting for the entire country.', isCorrect: false },
      { text: 'Replace missing survey estimates with regional population projections.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Small Area Estimation (SAE) combines survey data with administrative benchmarks to yield reliable disaggregated SDG indicators for small sub-populations.',
  },
  {
    id: 'CS_10',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    division: 'Data Informatics & Innovation Division (DIID)',
    documentRef: 'MoSPI/DIID/GIGW-PORTAL-AUDIT',
    stem: 'CASE STUDY 10: Official Microdata Dissemination Portal & GIGW Compliance',
    caseStudyContext: `OFFICIAL AUDIT SCENARIO:
MoSPI’s official microdata dissemination portal is being upgraded to meet Guidelines for Indian Government Websites (GIGW 3.0) and FAIR (Findable, Accessible, Interoperable, Reusable) data principles.

EXAMINATION PROBLEM:
Which API architecture ensures seamless machine-to-machine interoperability for national statistical data sharing?`,
    options: [
      { text: 'Restful REST/JSON & SDMX API endpoints with OpenAPI 3.0 schemas and automated data dictionary metadata tagging.', isCorrect: true },
      { text: 'FTP download folder containing raw unindexed CSV files only.', isCorrect: false },
      { text: 'Proprietary binary database files requiring specialized offline software.', isCorrect: false },
      { text: 'HTML table web pages without programmatic API access.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'SDMX & RESTful APIs with OpenAPI schemas satisfy GIGW 3.0 and FAIR principles for machine-readable official statistical data sharing.',
  },
];

export default function AssessmentPlayerModal({ assessmentId, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes for 10 case studies
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Anti-cheating tab switch listener
  useEffect(() => {
    if (result || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.error(`⚠️ Anti-Cheating Protocol: Tab/Window switch detected! (Violation count: ${next})`, {
            duration: 5000,
          });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [result, loading]);

  // Start or resume attempt on mount
  useEffect(() => {
    async function initAttempt() {
      try {
        setLoading(true);
        const res = await api.post('/attempts/start', { assessmentId });
        const data = res.data;
        
        setAttempt(data.attempt);
        setAssessment(data.assessment);
        
        // Ensure 10 rich case studies (Industry Standard)
        const fetchedQs = data.questions || [];
        setQuestions(fetchedQs.length >= 10 ? fetchedQs : DEFAULT_CASE_STUDIES);

        // Restore responses if resuming
        if (data.attempt?.responses) {
          const restored = {};
          data.attempt.responses.forEach(r => {
            if (r.questionId && r.selectedOption !== undefined) {
              restored[r.questionId] = r.selectedOption;
            }
          });
          setResponses(restored);
          if (data.attempt.current_question_index) {
            setCurrentIndex(data.attempt.current_question_index);
          }
        }
      } catch (err) {
        console.error('Failed to start assessment attempt, loading 10 MoSPI case studies:', err);
        setQuestions(DEFAULT_CASE_STUDIES);
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) initAttempt();
  }, [assessmentId]);

  // Countdown timer
  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAttempt(); // auto submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, result, timeLeft]);

  // Save progress on response change
  const handleSelectOption = async (questionId, optionIndex) => {
    if (result) return;
    const updated = { ...responses, [questionId]: optionIndex };
    setResponses(updated);

    if (attempt?.id) {
      try {
        const formattedResponses = Object.entries(updated).map(([qId, sOpt]) => ({
          questionId: qId,
          selectedOption: sOpt,
        }));
        await api.post(`/attempts/${attempt.id}/save-progress`, {
          currentQuestionIndex: currentIndex,
          responses: formattedResponses,
        });
      } catch (err) {
        console.warn('Failed to auto-save progress:', err);
      }
    }
  };

  const handleToggleReveal = (questionId) => {
    setRevealedAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitAttempt = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const formattedResponses = Object.entries(responses).map(([qId, sOpt]) => ({
        questionId: qId,
        selectedOption: sOpt,
      }));

      let resData = null;
      if (attempt?.id) {
        const res = await api.post(`/attempts/${attempt.id}/submit`, {
          responses: formattedResponses,
        });
        resData = res.data;
      } else {
        // Fallback local scoring if offline mode
        let correctCount = 0;
        const resArray = questions.map((q) => {
          const selected = responses[q.id];
          const isCorrect = selected === (q.correctAnswer ?? 0);
          if (isCorrect) correctCount++;
          return { ...q, selectedOption: selected, isCorrect };
        });

        resData = {
          score: Number(((correctCount / questions.length) * 5.0).toFixed(1)),
          percentage: Math.round((correctCount / questions.length) * 100),
          correctCount,
          totalQuestions: questions.length,
          responses: resArray,
        };
      }

      setResult(resData);
      if (onComplete) onComplete(resData);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-blue-900 mx-auto"></div>
          <h3 className="text-xl font-black text-slate-900">Initializing Exam Environment...</h3>
          <p className="text-slate-600 font-medium text-xs">
            Loading 10 official MoSPI case-study scenarios, setting anti-cheating triggers, and calibrating timer.
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col text-slate-900 overflow-hidden font-sans select-none">
      
      {/* ── 1. Top Enterprise Examination Header Bar ── */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                MoSPI FRAC Official Exam
              </span>
              <span className="text-slate-400 text-xs font-mono">
                ID: {assessment?.id ? String(assessment.id).slice(0, 8) : 'DIID-2026-EXAM'}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight mt-0.5">
              {assessment?.title || 'Senior Statistical Officer Competency Diagnostic Exam (10 Case Studies)'}
            </h2>
          </div>
        </div>

        {/* Right Action & Timer Bar */}
        <div className="flex items-center gap-4">
          {!result && (
            <>
              {/* Anti-cheating Warning Counter */}
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Tab Switches: {tabSwitchCount}</span>
                </div>
              )}

              {/* Live Timer */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-sm font-black shadow-inner">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </>
          )}

          <button
            onClick={() => {
              if (!result && answeredCount > 0) {
                setShowExitConfirm(true);
              } else {
                onClose();
              }
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600/30 border border-white/20 text-slate-300 hover:text-white transition-colors"
            title="Exit Examination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── 2. Main Examination Body ── */}
      {result ? (
        /* ── RESULT SCREEN ── */
        <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-700 mb-4 ring-2 ring-emerald-200">
                <Award className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Official Assessment Completed!</h3>
              <p className="text-slate-600 text-xs md:text-sm font-semibold mt-1">
                Evidence automatically registered in MoSPI Evidence Engine & Competency Level Estimates updated.
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Final Score</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{result.score} / 5.0</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Accuracy</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">{result.percentage}%</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Correct Items</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{result.correctCount} / {result.totalQuestions}</div>
                </div>
              </div>
            </div>

            {/* Detailed Case-Study Rationale Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-900" /> Case-Study Breakdown & Statistical Rationale (10 Items)
              </h4>

              <div className="space-y-4">
                {(result.responses || []).map((resp, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border text-xs font-semibold ${
                      resp.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                        : 'bg-rose-50/70 border-rose-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                        Item {idx + 1} of 10
                      </span>
                      <span className={`px-2.5 py-0.5 rounded font-black ${
                        resp.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {resp.isCorrect ? 'Correct (+5.0)' : 'Incorrect (0.0)'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-relaxed mb-3">{resp.stem}</p>

                    {resp.explanation && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                        <strong className="text-blue-900 block mb-1 font-bold">Methodological Rationale:</strong>
                        {resp.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-blue-900 hover:bg-slate-900 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
              >
                Return to Competency Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── DEDICATED FULL-SCREEN QUESTION PLAYER SCREEN ── */
        <div className="flex-1 bg-slate-50 flex flex-col md:flex-row overflow-hidden">
          
          {/* ── Left Column: Clean Filled MoSPI Official Examination Case-Study Dossier ── */}
          <div className="w-full md:w-1/2 p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto space-y-6">
            
            {/* Dossier Header Badge */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-blue-400 text-[11px]">
                  <Building2 className="w-3.5 h-3.5" /> Ministry of Statistics & Programme Implementation
                </span>
                <span className="font-mono text-[10px] text-slate-400">{currentQ?.documentRef || 'MoSPI/FRAC/2026'}</span>
              </div>
              <h4 className="text-sm font-black text-white tracking-tight">
                {currentQ?.division || 'Survey Design & Statistical Research Division'}
              </h4>
            </div>

            {/* Case Study Meta Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-wider">
                Bloom Level: {currentQ?.bloomLevel || 'EVALUATE'}
              </span>
              <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-purple-50 text-purple-900 border border-purple-200 uppercase tracking-wider">
                Type: {currentQ?.questionType || 'CASE_STUDY'}
              </span>
              <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                Item {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Formatted Case Study Context & Problem Statement */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-black text-slate-900 leading-snug">
                {currentQ?.stem || 'Statistical Methodology Case Study'}
              </h3>

              {currentQ?.caseStudyContext && (
                <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed space-y-3 whitespace-pre-line shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2">
                    <span className="text-blue-900 font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-900" /> Official Case Study Dossier
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Strictly Confidential Exam Document</span>
                  </div>
                  {currentQ.caseStudyContext}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: 10 Question Navigation Grid & Options Area ── */}
          <div className="w-full md:w-1/2 flex flex-col justify-between bg-slate-50/70 p-6 md:p-8 overflow-y-auto">
            <div className="space-y-6">
              
              {/* 10 Question Navigation Grid (Q1 to Q10) */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>10-Item Official Exam Grid</span>
                  <span className="text-blue-900 font-black">Answered: {answeredCount} / {questions.length}</span>
                </div>
                
                {/* 10 Clickable Grid Pills */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {questions.map((q, qIdx) => {
                    const isAns = responses[q.id] !== undefined;
                    const isCurr = qIdx === currentIndex;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentIndex(qIdx)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          isCurr
                            ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                            : isAns
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        Q{qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Multi-Sentence Distractor Options */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Select the Most Methodologically Accurate Option:
                </div>
                {(currentQ?.options || []).map((opt, optIdx) => {
                  const isSelected = responses[currentQ.id] === optIdx;
                  const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || `Option ${optIdx + 1}`);

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 group shadow-xs ${
                        isSelected
                          ? 'bg-blue-50 border-blue-900 text-blue-950 font-bold ring-2 ring-blue-600/20'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-xs md:text-sm font-semibold leading-snug">{optText}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Toggle */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-600">
                  <input
                    type="checkbox"
                    checked={instantFeedback}
                    onChange={(e) => setInstantFeedback(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                  />
                  <span>Enable Instant Methodological Feedback</span>
                </label>

                {instantFeedback && (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs font-medium text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-700" /> Instant Feedback
                      </span>
                      <button
                        onClick={() => handleToggleReveal(currentQ.id)}
                        className="text-xs text-blue-900 font-bold hover:underline"
                      >
                        {revealedAnswers[currentQ.id] ? 'Hide Rationale' : 'Reveal Rationale'}
                      </button>
                    </div>
                    {revealedAnswers[currentQ.id] && (
                      <p className="text-slate-900 leading-relaxed pt-1 font-semibold">
                        {currentQ.explanation || 'No rationale available for this item.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Examination Action Bar */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-2 text-xs font-extrabold transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Case
              </button>

              <div className="flex items-center gap-3">
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitAttempt}
                    disabled={submitting}
                    className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-white transition-colors shadow-md text-xs flex items-center gap-2"
                  >
                    {submitting ? 'Submitting Exam...' : 'Submit Final Assessment'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-slate-900 text-white font-extrabold text-xs flex items-center gap-2 transition-colors shadow-xs"
                  >
                    Next Case <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="p-4 rounded-full bg-amber-50 text-amber-700 w-16 h-16 mx-auto flex items-center justify-center border border-amber-200">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Exit Assessment Session?</h3>
              <p className="text-slate-600 text-xs font-medium mt-2 leading-relaxed">
                You have answered <strong>{answeredCount} of {questions.length}</strong> case studies. Quitting now will auto-submit your attempt and record your partial score in your official MoSPI governance profile.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Resume Exam
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  handleSubmitAttempt();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                Submit & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
