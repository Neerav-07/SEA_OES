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
  FileCheck2,
  FileText,
  SlidersHorizontal,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import Spinner from '../../../components/Spinner';

// 10 Very Large, Codeforces-Style Story-Based Official MoSPI Problem Statements
const DEFAULT_CASE_STUDIES = [
  {
    id: 'CS_01',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    title: 'NSS 79th Round Domestic Tourism Expenditure Audit & GREG Calibration',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
During the national data validation audit of the 79th Round National Sample Survey (NSS) covering domestic tourism expenditure across rural and urban sectors, the Field Operations Division (FOD) reported a 14.2% unit non-response in rural sub-strata of Region IX (comprising 42 primary sampling units). Exploratory data analysis conducted by the Data Informatics & Innovation Division (DIID) indicates that the non-response is non-random and heavily concentrated among high-income agricultural households possessing mechanized farming assets and land holdings exceeding 10 hectares.

SYSTEM & SAMPLE PARAMETERS:
• Total Master Frame Sample (N): 450,000 households across 36 States/UTs.
• Stratum IX Rural Sub-sample (n): 4,200 households; Non-response rate (η): 14.2%.
• Auxiliary Benchmark Correlation (r): 0.78 between land holding size and annual domestic travel expenditure.
• Baseline Stratum Design Effect (DEFF): 2.15; Target Margin of Error: ±2.0% at 95% CI.

METHODOLOGICAL PROBLEM STATEMENT:
As the Senior Statistical Officer supervising statistical quality assurance, standard unit non-response adjustments using simple mean substitution inside the Primary Sampling Unit (PSU) will systematically under-estimate national tourism expenditure due to truncating the upper tail of the wealth distribution. Furthermore, unweighted re-scaling of weights across urban and rural strata violates the multi-stage sampling frame variance design. 

Which calibration estimator and auxiliary weighting adjustment procedure must be programmatically executed in the data processing pipeline to neutralize non-response bias without inflating sample variance beyond acceptable NSSO auditing limits?`,
    options: [
      { text: 'Execute Generalized Regression Estimator (GREG) calibration using land holding size and tractor ownership as auxiliary benchmark variables to re-calibrate sample multiplier weights.', isCorrect: true },
      { text: 'Apply simple mean imputation within the primary sampling unit (PSU) without modifying final multiplier weights.', isCorrect: false },
      { text: 'Drop non-responding agricultural households and re-scale sample weights uniformly across all urban and rural strata.', isCorrect: false },
      { text: 'Substitute missing rural records with median responses from neighboring district urban commercial clusters.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'GREG calibration leverages known administrative benchmarks (land holdings) to re-calibrate sampling weights, neutralizing non-response bias while bounding variance under NSSO auditing standards.',
  },
  {
    id: 'CS_02',
    bloomLevel: 'ANALYZE',
    questionType: 'CASE_STUDY',
    title: 'Consumer Price Index (CPI) Base-Year Revision & SNA 2008 Double-Deflation',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
The National Accounts Division (NAD) is currently revising the base year of the Consumer Price Index (Rural/Urban) to align with national accounting frameworks (SNA 2008). During sectoral Gross Value Added (GVA) estimation for the Unorganized Retail Trade and Storage sector, price deflators computed from the newly revised CPI series display an anomalous +8.5% divergence when compared against the Wholesale Price Index (WPI) manufacturing deflator across the same 12-month accounting period.

SYSTEM & SAMPLE PARAMETERS:
• Base Year Baseline: 2024 = 100; Previous Base Year: 2012 = 100.
• Sectoral GVA Share: Unorganized Retail Trade accounts for 11.4% of total service GVA.
• Deflator Divergence (Δ): +8.5% between CPI Service Sub-index and WPI Headline Index.
• Price Index Commodity Basket: 299 items across 1,181 rural markets and 1,114 urban markets.

METHODOLOGICAL PROBLEM STATEMENT:
Applying single-deflation using either headline WPI or unadjusted CPI to nominal gross output artificially distorts real GVA growth rates, creating significant discrepancies between production-side GDP and expenditure-side GDP. 

Evaluating the methodological requirements of SNA 2008 standards, how should the statistical analyst structure the deflation algorithm to isolate real trade margins from intermediate consumption price volatility?`,
    options: [
      { text: 'Construct a double-deflation index separating trade margins from physical output using sector-specific CPI service sub-indices for gross output and WPI intermediate consumption indices.', isCorrect: true },
      { text: 'Replace the entire CPI rural series with the aggregate WPI headline index for single-deflation of nominal GVA.', isCorrect: false },
      { text: 'Apply an unweighted geometric mean of WPI and CPI across all retail service commodity groups.', isCorrect: false },
      { text: 'Adjust nominal turnover by the implicit GDP deflator from the previous quinquennial census.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Double-deflation using sector-specific CPI trade sub-indices isolates real gross value added from price volatility under SNA 2008 guidelines.',
  },
  {
    id: 'CS_03',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    title: 'Python & R Microdata Cleaning Pipeline for 5 Million PLFS CAPI Records',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
A specialized data informatics engineering team at MoSPI DIID is engineering an automated ETL (Extract-Transform-Load) pipeline in Python (Pandas/NumPy/Statsmodels) and R (data.table) to ingest 5.2 million raw CAPI (Computer-Assisted Personal Interview) records from the Periodic Labour Force Survey (PLFS). Initial data profiling of the ingested raw JSON payloads reveals severe data entry anomalies: 0.3% of records report weekly hours worked exceeding 168 hours (physical impossibility), and 1.2% contain malformed National Classification of Occupations (NCO-2015) 4-digit codes.

SYSTEM & SYSTEM PARAMETERS:
• Dataset Volume: 5,240,000 individual level survey records across 128,000 households.
• Anomaly 1: Weekly hours worked > 168 hours (upper bound violation).
• Anomaly 2: 62,880 records with non-standard NCO-2015 occupation codes.
• Memory Constraint: Pipeline must run within 16GB RAM limit on official NSSTA analytical nodes.

METHODOLOGICAL PROBLEM STATEMENT:
Simply dropping all anomalous records would introduce sample attrition bias and destroy multiplier weight sums across smaller Union Territories. Conversely, converting invalid fields to null or dummy modes creates downstream syntax errors in econometric wage regression models.

Which programmatic validation and cleaning rule enforces data integrity while preserving legitimate extreme workload values?`,
    options: [
      { text: 'Implement winsorization at 99th percentile for numerical hours combined with regex lookup verification against NCO-2015 official master dictionary tables.', isCorrect: true },
      { text: 'Filter out and delete all records where weekly hours worked exceed 40 hours.', isCorrect: false },
      { text: 'Replace all invalid occupation codes with the modal code "9999" without dictionary validation.', isCorrect: false },
      { text: 'Convert numeric wage fields to categorical strings prior to running statistical aggregations.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Winsorization bounds extreme physical impossibilities (>168 hrs) while preserving high valid workloads, and regex dictionary lookup validates official NCO codes.',
  },
  {
    id: 'CS_04',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    title: 'Microdata Anonymization & Statistical Disclosure Control (SDC) under NDSAP',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
Prior to releasing the Public-Use Microdata File (PUMF) for the Annual Survey of Unincorporated Sector Enterprises (ASUSE), MoSPI’s Data Governance Committee requires strict compliance with NDSAP (National Data Sharing and Accessibility Policy) privacy directives. A comprehensive re-identification risk audit conducted using sdcMicro revealed that certain specialized enterprise units operating in niche 4-digit NIC codes (e.g. specialized optical instrument repair) can be re-identified by matching district locations, fixed capital, and annual turnover against public GST registries.

SYSTEM & SECURITY PARAMETERS:
• Target Population: 850,000 unincorporated enterprise survey records.
• High-Risk Units: 3,400 enterprises in low-density 4-digit NIC categories.
• Re-identification Risk Threshold: Maximum allowable disclosure risk = 0.05 (5%).
• Key Quasi-Identifiers: District Code, 4-digit NIC Code, Total Assets, Annual Turnover.

METHODOLOGICAL PROBLEM STATEMENT:
Completely suppressing district-level geographic identifiers destroys spatial economic modeling utility for regional planners. Conversely, releasing raw microdata violates statutory data confidentiality under the Collection of Statistics Act.

What Statistical Disclosure Control (SDC) algorithm balances privacy protection with analytical utility for economic researchers?`,
    options: [
      { text: 'Apply k-anonymity (k>=5) combined with microaggregation on continuous turnover variables and top-coding on extreme revenue categories.', isCorrect: true },
      { text: 'Suppress all district-level geographic identifiers across the entire dataset.', isCorrect: false },
      { text: 'Add Gaussian random noise (+/- 50%) to all numerical variables regardless of re-identification risk.', isCorrect: false },
      { text: 'Publish only national summary tables and permanently delete the microdata repository.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'k-anonymity (k>=5) with microaggregation protects quasi-identifiers (district + capital) without destroying correlation structures required for econometric research.',
  },
  {
    id: 'CS_05',
    bloomLevel: 'ANALYZE',
    questionType: 'CASE_STUDY',
    title: 'Multi-Stage Stratified PPS Sampling Variance Estimation & DEFF Adjustment',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
In a two-stage stratified sampling design for rural household socio-economic surveys, Primary Sampling Units (PSUs - Census Villages) are selected with Probability Proportional to Size with Replacement (PPSWR) based on population size, and Ultimate Sampling Units (USUs - Households) are selected via systematic sampling. Post-survey variance estimation reveals that the empirical Design Effect (DEFF) is 2.85, indicating substantial intra-cluster correlation within sampled villages.

SYSTEM & STATISTICAL PARAMETERS:
• First-Stage PSUs (m): 1,200 villages; Second-Stage USUs (n_i): 10 households per village.
• Calculated Design Effect (DEFF): 2.85; Intra-class Correlation (ρ): 0.205.
• Target Precision: Margin of Error = ±2.5% at 95% Confidence Level.
• Operational Constraint: Maximum field budget cap = ₹4.5 Crore.

METHODOLOGICAL PROBLEM STATEMENT:
High DEFF (2.85) indicates that sampling additional households within the same village yields diminishing statistical information due to village-level cluster homogeneity. To reduce the variance of national mean expenditure estimates under a fixed operational field budget, how must the sampling design parameters be re-allocated?`,
    options: [
      { text: 'Increase the number of selected PSUs (villages) while decreasing the number of USUs (households) sampled per PSU to reduce intra-cluster variance contribution.', isCorrect: true },
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
    title: 'Annual Survey of Industries (ASI) Factory Imputation & Gross Capital Formation',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
During the annual data processing of the Annual Survey of Industries (ASI) covering registered manufacturing factories, 4.8% of surveyed factory units in the 3-digit NIC sector (Manufacture of Basic Metals) failed to submit Schedule Block C (Fixed Assets, Depreciation, and Capital Additions). Cross-validation with GSTIN electronic invoice portals confirms that reported gross sales turnover and employee count figures for these units remain completely accurate.

SYSTEM & DATA PARAMETERS:
• Total ASI Factory Frame: 245,000 registered manufacturing units.
• Non-reporting Block C Subset: 11,760 factory records.
• Known Valid Fields: Sales Turnover, Employee Count, 3-digit NIC Code, State Code.
• Target Indicator: Gross Fixed Capital Formation (GFCF) and Net Capital Stock.

METHODOLOGICAL PROBLEM STATEMENT:
Imputing zero fixed capital for non-reporting factories causes severe downward distortion in national Gross Fixed Capital Formation (GFCF) estimates. Conversely, simple mean imputation across all manufacturing sectors ignores capital intensity differences between heavy metallurgy and textile sectors.

How should the Statistical Officer impute net fixed capital to preserve sectoral capital intensity structures?`,
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
    title: 'PLFS Activity Status Accounting & Worker Population Ratio (WPR) Calculation',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
In the Periodic Labour Force Survey (PLFS) CAPI field audit, an enumerator recorded the following activity log for a respondent during the 7-day reference period under Current Weekly Status (CWS) guidelines:
- Days 1 to 3: Worked 4 hours/day in family agricultural plot (subsistence farming).
- Days 4 to 5: Worked 8 hours/day on MGNREGA rural road construction project.
- Days 6 to 7: Did not work, but actively sought wage employment at the local labor mandi.

SYSTEM & ACCOUNTING RULES:
• Reference Period: 7 days preceding survey date (Current Weekly Status - CWS).
• Major Time Criterion Rule: Activity receiving highest total days/hours during 7-day week.
• Labour Force Categories: Employed (11-51), Unemployed (81), Out of Labour Force (91-97).

METHODOLOGICAL PROBLEM STATEMENT:
Under official PLFS CWS accounting guidelines, how should the Senior Statistical Officer classify the primary weekly activity status of this individual to ensure accurate estimation of national Worker Population Ratio (WPR)?`,
    options: [
      { text: 'Classify as Employed (Code 11/31) based on the major time-criterion (5 total days spent in gainful economic activity during reference week).', isCorrect: true },
      { text: 'Classify as Unemployed (Code 81) due to seeking work for 2 days at the labor mandi.', isCorrect: false },
      { text: 'Classify as Out of Labour Force (Code 91) due to subsistence farming component.', isCorrect: false },
      { text: 'Split individual multiplier weight equally across 3 separate labor force status categories.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'CWS applies major time-criterion (5 working days out of 7), placing the respondent firmly in the Employed labor force status.',
  },
  {
    id: 'CS_08',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    title: 'Index of Industrial Production (IIP) Basket Weighting & Structural Revision',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
The Economic Statistics Division (ESD) is executing a base-year structural revision of the Index of Industrial Production (IIP). Production data from the past decade reveals that legacy commodity groups (such as coal mining and heavy textiles) have declined in relative GVA share, while high-technology sectors (semiconductor packaging, solar PV module manufacturing, electric vehicles) have expanded rapidly.

SYSTEM & INDEX PARAMETERS:
• Index Formulation: Laspeyres Fixed-Base Quantity Index.
• Item Basket Size: 407 item groups across Mining, Manufacturing, and Electricity.
• Base Year Weighting: Derived from ASI Gross Value Added (GVA) contributions.

METHODOLOGICAL PROBLEM STATEMENT:
Using a static fixed-weight Laspeyres index over a 10-year horizon creates severe structural weight decay, failing to capture new high-growth industrial sectors. 

Which index weighting modification ensures continuous representation of fast-growing industrial product groups without creating trend breaks in historical IIP series?`,
    options: [
      { text: 'Adopt a chain-linked Laspeyres index formulation with periodic weight updating for fast-growing high-tech product groups.', isCorrect: true },
      { text: 'Replace Laspeyres index with a fixed-weight Paasche index updated once every 15 years.', isCorrect: false },
      { text: 'Use an unweighted arithmetic average of physical output production ratios.', isCorrect: false },
      { text: 'Remove mining and energy sectors entirely from industrial production tracking.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Chain-linked Laspeyres indexing incorporates new high-growth item groups seamlessly without creating structural trend breaks in IIP time-series.',
  },
  {
    id: 'CS_09',
    bloomLevel: 'EVALUATE',
    questionType: 'CASE_STUDY',
    title: 'National Indicator Framework (NIF) for SDG Monitoring & Small Area Estimation',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
Under Sustainable Development Goal 8 (Decent Work & Economic Growth), MoSPI tracks National Indicator Framework (NIF) Metric 8.5.2 (Unemployment Rate disaggregated by sex, age, and disability status). A state-level statistical audit revealed that in 4 small Union Territories, sample sizes in PLFS sub-strata for persons with disabilities are too small to produce direct survey estimates with acceptable coefficients of variation (CV < 20%).

SYSTEM & METRIC PARAMETERS:
• NIF Target Indicator: 8.5.2 (Disability Disaggregated Unemployment Rate).
• Target Geography: 4 Union Territories (Small Area Domains).
• Direct Sample Size (n_small): < 150 respondents per UT; Direct Estimate CV: 42.5% (Unreliable).

METHODOLOGICAL PROBLEM STATEMENT:
Publishing direct survey estimates with CVs exceeding 42% violates MoSPI data dissemination standards. Conversely, suppressing SDG indicator reporting for these 4 UTs leaves national SDG reporting incomplete.

Which statistical modeling technique should be implemented to produce reliable disaggregated SDG indicator estimates for small administrative domains?`,
    options: [
      { text: 'Implement Small Area Estimation (SAE) empirical Bayes modeling, linking PLFS sample data with administrative disability registry benchmarks.', isCorrect: true },
      { text: 'Publish direct unweighted sample averages despite high coefficients of variation.', isCorrect: false },
      { text: 'Suppress all SDG Goal 8 reporting for the entire country.', isCorrect: false },
      { text: 'Replace missing survey estimates with unadjusted regional population projections.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'Small Area Estimation (SAE) combines survey data with administrative benchmarks to yield reliable disaggregated SDG indicators for small sub-populations.',
  },
  {
    id: 'CS_10',
    bloomLevel: 'APPLY',
    questionType: 'CASE_STUDY',
    title: 'Official Microdata Dissemination Portal Architecture & GIGW 3.0 Compliance',
    caseStudyContext: `BACKGROUND & OPERATIONAL CONTEXT:
MoSPI’s official microdata dissemination repository is undergoing a major architecture modernization to satisfy Guidelines for Indian Government Websites (GIGW 3.0) and FAIR (Findable, Accessible, Interoperable, Reusable) open data standards. The platform must serve over 500,000 annual microdata downloads to academic researchers, international agencies (UNSTAT, World Bank), and policy research institutes.

SYSTEM & ARCHITECTURE REQUIREMENTS:
• Standards: GIGW 3.0, NDSAP Open Data Guidelines, FAIR Principles.
• Data Formats: DDI (Data Documentation Initiative) XML/JSON schemas, SDMX microdata metrics.
• Machine Interoperability: Automated RESTful API access for programmatic data fetching.

METHODOLOGICAL PROBLEM STATEMENT:
Which system architecture and API standard ensures seamless machine-to-machine data interoperability while enforcing rate-limiting and user authentication protocols?`,
    options: [
      { text: 'Deploy RESTful JSON & SDMX API endpoints with OpenAPI 3.0 schemas, DDI metadata tags, and OAuth2 authentication controls.', isCorrect: true },
      { text: 'Store raw unindexed CSV files in an unauthenticated FTP download folder.', isCorrect: false },
      { text: 'Use proprietary binary database files requiring specialized offline desktop software.', isCorrect: false },
      { text: 'Publish static HTML table web pages without programmatic API interfaces.', isCorrect: false },
    ],
    correctAnswer: 0,
    explanation: 'SDMX & RESTful APIs with OpenAPI schemas satisfy GIGW 3.0 and FAIR principles for machine-readable official statistical data sharing.',
  },
];

export default function AssessmentPlayerModal({ assessmentId, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [examMode, setExamMode] = useState('STANDARD'); // 'STANDARD' | 'CUSTOM'
  const [targetCount, setTargetCount] = useState(10);
  const [targetDurationMins, setTargetDurationMins] = useState(30);

  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(1800); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Anti-cheating tab switch listener (with deduplication guard)
  useEffect(() => {
    if (result || loading || !isSetupCompleted) return;

    let lastFired = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastFired < 1000) return;
        lastFired = now;

        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.error(`⚠️ Security Warning: Tab switch recorded (Violation #${next})`, {
            id: 'anti-cheating-toast',
            duration: 4000,
            style: {
              background: '#7f1d1d',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid #ef4444',
            },
          });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [result, loading, isSetupCompleted]);

  // Start or resume attempt on mount
  useEffect(() => {
    async function initAttempt() {
      try {
        setLoading(true);
        const res = await api.post('/attempts/start', { assessmentId });
        const data = res.data;
        
        setAttempt(data.attempt);
        setAssessment(data.assessment);
        
        const fetchedQs = data.questions || [];
        const activePool = fetchedQs.length >= 5 ? fetchedQs : DEFAULT_CASE_STUDIES;
        setQuestions(activePool.slice(0, targetCount));

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
        console.error('Failed to start assessment attempt, loading MoSPI case studies:', err);
        setQuestions(DEFAULT_CASE_STUDIES.slice(0, targetCount));
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) initAttempt();
  }, [assessmentId, targetCount]);

  // Update questions pool when setup mode changes
  const handleStartExam = () => {
    const pool = DEFAULT_CASE_STUDIES.slice(0, targetCount);
    setQuestions(pool);
    setTimeLeft(targetDurationMins * 60);
    setIsSetupCompleted(true);
  };

  // Countdown timer
  useEffect(() => {
    if (loading || !isSetupCompleted || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSetupCompleted, result, timeLeft]);

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
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <Spinner
            variant="radial"
            label="Initializing Exam Environment..."
            subtext="Loading official MoSPI case-study scenarios, setting anti-cheating triggers, and calibrating timer."
          />
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col text-slate-900 overflow-hidden font-sans select-none">
      
      {/* ── 1. Top Enterprise Examination Header Bar ── */}
      <div className="px-6 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border-b border-slate-800 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                MoSPI FRAC Official Exam
              </span>
              <span className="text-slate-400 text-xs font-mono">
                ID: {assessment?.id ? String(assessment.id).slice(0, 8) : 'DIID-2026-EXAM'}
              </span>
            </div>
            <h2 className="text-sm md:text-base font-black text-white tracking-tight mt-0.5">
              {assessment?.title || 'Senior Statistical Officer Competency Diagnostic Exam'}
            </h2>
          </div>
        </div>

        {/* Top Header Grid Pills & Timer Bar */}
        <div className="flex items-center gap-4">
          {isSetupCompleted && !result && (
            <>
              {/* Clean Minimal Pill Grid directly in Header */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-inner">
                {questions.map((q, qIdx) => {
                  const isAns = responses[q.id] !== undefined;
                  const isCurr = qIdx === currentIndex;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                        isCurr
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-xs'
                          : isAns
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={`Go to Problem ${qIdx + 1}`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Anti-cheating Counter */}
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Security Audit: {tabSwitchCount}</span>
                </div>
              )}

              {/* Live Timer */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-black shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </>
          )}

          <button
            onClick={() => {
              if (isSetupCompleted && !result && answeredCount > 0) {
                setShowExitConfirm(true);
              } else {
                onClose();
              }
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/30 border border-white/20 text-slate-300 hover:text-white transition-colors"
            title="Exit Examination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── 2. Setup Configuration Screen ── */}
      {!isSetupCompleted ? (
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-900 w-12 h-12 mx-auto flex items-center justify-center border border-blue-200">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Configure Examination Parameters</h3>
              <p className="text-xs text-slate-600 font-medium">
                Select your target examination mode aligned with official MoSPI DIID assessment protocols.
              </p>
            </div>

            {/* Mode Selection Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setExamMode('STANDARD');
                  setTargetCount(10);
                  setTargetDurationMins(30);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  examMode === 'STANDARD'
                    ? 'bg-blue-50 border-blue-900 ring-2 ring-blue-600/20 text-blue-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-black uppercase text-blue-900 mb-1">Standard Official Exam</div>
                <div className="text-sm font-extrabold text-slate-900">10 Case Studies / 30 Mins</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Recommended for Official Competency Registry</div>
              </button>

              <button
                onClick={() => setExamMode('CUSTOM')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  examMode === 'CUSTOM'
                    ? 'bg-blue-50 border-blue-900 ring-2 ring-blue-600/20 text-blue-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-black uppercase text-blue-900 mb-1">Custom Practice Mode</div>
                <div className="text-sm font-extrabold text-slate-900">Flexible Questions & Timer</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Configure practice session limits</div>
              </button>
            </div>

            {/* Custom Mode Controls */}
            {examMode === 'CUSTOM' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Number of Case-Study Problems:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setTargetCount(cnt)}
                        className={`py-2 rounded-xl text-xs font-black transition-all border ${
                          targetCount === cnt
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cnt} Problems
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Examination Duration (Minutes):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setTargetDurationMins(mins)}
                        className={`py-2 rounded-xl text-xs font-black transition-all border ${
                          targetDurationMins === mins
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleStartExam}
              className="w-full py-3.5 rounded-2xl bg-blue-900 hover:bg-slate-900 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-blue-300" /> Start Official Examination
            </button>
          </div>
        </div>
      ) : result ? (
        /* ── 3. RESULT SCREEN ── */
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
                <BookOpen className="w-5 h-5 text-blue-900" /> Detailed Performance Analysis & Rationale
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
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                          Problem {idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 font-extrabold text-[10px]">
                          Bloom: {resp.bloomLevel || 'EVALUATE'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded font-black ${
                        resp.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {resp.isCorrect ? 'Correct (+5.0)' : 'Incorrect (0.0)'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-relaxed mb-3">{resp.title || resp.stem}</p>

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
        /* ── 4. DEDICATED FULL-SCREEN QUESTION PLAYER SCREEN ── */
        <div className="flex-1 bg-slate-50 flex flex-col md:flex-row overflow-hidden">
          
          {/* ── Left Column: Clean Codeforces-Style Problem Specification ── */}
          <div className="w-full md:w-1/2 p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto space-y-6">
            
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">
                Problem Statement {currentIndex + 1} of {questions.length}
              </span>
              <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                {currentQ?.title || currentQ?.stem}
              </h3>
            </div>

            {/* Codeforces-Style Problem Narrative Box */}
            {currentQ?.caseStudyContext && (
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs md:text-sm font-medium text-slate-800 leading-relaxed space-y-4 whitespace-pre-line shadow-xs">
                {currentQ.caseStudyContext}
              </div>
            )}
          </div>

          {/* ── Right Column: Options & Action Area ── */}
          <div className="w-full md:w-1/2 flex flex-col justify-between bg-slate-50/70 p-6 md:p-8 overflow-y-auto">
            <div className="space-y-6">
              
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
                <ChevronLeft className="w-4 h-4" /> Previous Problem
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
                    Next Problem <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="p-4 rounded-full bg-amber-50 text-amber-700 w-16 h-16 mx-auto flex items-center justify-center border border-amber-200">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Exit Assessment Session?</h3>
              <p className="text-slate-600 text-xs font-medium mt-2 leading-relaxed">
                You have answered <strong>{answeredCount} of {questions.length}</strong> problem statements. Quitting now will auto-submit your attempt and record your partial score in your official MoSPI governance profile.
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
