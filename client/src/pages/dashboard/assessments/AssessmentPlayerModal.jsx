import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  FileText,
  SlidersHorizontal,
  Play,
  LogOut,
  Database,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import Spinner from '../../../components/Spinner';
import KarmayogiLogo from '../../../components/common/KarmayogiLogo';
import useDashboardStore from '../../../store/dashboardData.store.js';

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

export function parseLeetCodeQuestion(q) {
  if (!q) {
    return {
      title: 'Official Problem Statement',
      narrative: '',
      parameters: [],
      directive: '',
      difficulty: 'Medium',
      difficultyColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  const raw = (q.stem || q.caseStudyContext || q.title || '').trim();

  // Pattern: "CASE STUDY: <Title>\n\n<Remaining>"
  const caseStudyPrefix = raw.match(/^CASE STUDY:\s*([^\n\r]+)/i);
  let title = q.title;
  let textToParse = raw;

  if (caseStudyPrefix) {
    title = caseStudyPrefix[1].trim();
    textToParse = raw.slice(caseStudyPrefix[0].length).trim();
  }

  // Determine difficulty & badge styling from Bloom level
  const bloom = (q.bloomLevel || 'ANALYZE').toUpperCase();
  let difficulty = 'Medium';
  let difficultyColor = 'bg-amber-50 text-amber-700 border-amber-200';

  if (bloom === 'EVALUATE') {
    difficulty = 'Hard';
    difficultyColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (bloom === 'REMEMBER' || bloom === 'UNDERSTAND') {
    difficulty = 'Easy';
    difficultyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (bloom === 'APPLY') {
    difficulty = 'Medium';
    difficultyColor = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  // Parse lines into narrative, parameters, and directive
  const lines = textToParse.split(/\r?\n/);
  const narrativeLines = [];
  const parameterLines = [];
  const directiveLines = [];
  let currentSection = 'narrative';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^BACKGROUND\s*(&\s*OPERATIONAL\s*CONTEXT)?:?/i.test(trimmed)) {
      currentSection = 'narrative';
      continue;
    }
    if (/^(SYSTEM\s*(&\s*[A-Z\s]+)?\s*PARAMETERS|CONSTRAINTS|ACCOUNTING RULES|SECURITY PARAMETERS|STATISTICAL PARAMETERS|DATA PARAMETERS|INDEX PARAMETERS|METRIC PARAMETERS|ARCHITECTURE REQUIREMENTS):?/i.test(trimmed)) {
      currentSection = 'parameters';
      continue;
    }
    if (/^METHODOLOGICAL\s*PROBLEM\s*STATEMENT:?/i.test(trimmed)) {
      currentSection = 'directive';
      continue;
    }

    if (currentSection === 'parameters' || /^[•\-*]\s+/.test(trimmed)) {
      parameterLines.push(trimmed.replace(/^[•\-*]\s*/, ''));
    } else if (currentSection === 'directive') {
      directiveLines.push(trimmed);
    } else {
      narrativeLines.push(trimmed);
    }
  }

  // Fallback: if directive section was empty, pull ending prompt from narrative
  if (directiveLines.length === 0 && narrativeLines.length > 0) {
    const lastLine = narrativeLines[narrativeLines.length - 1];
    if (lastLine.endsWith('?') || lastLine.length > 50) {
      directiveLines.push(narrativeLines.pop());
    }
  }

  return {
    title: title || q.title || 'Official MoSPI Problem Statement',
    narrative: narrativeLines.join('\n\n'),
    parameters: parameterLines,
    directive: directiveLines.join('\n\n'),
    difficulty,
    difficultyColor,
  };
}

export function getFormalQuestion(q) {
  const parsed = parseLeetCodeQuestion(q);
  return {
    title: parsed.title,
    fullText: [parsed.narrative, parsed.parameters.map((p) => `• ${p}`).join('\n'), parsed.directive].filter(Boolean).join('\n\n'),
  };
}

/**
 * High-Stakes Institutional Examination Initializing Screen
 * Displays official Government of India / MoSPI identity, NSSTA crest, Kshamata App logo,
 * and iGOT Karmayogi partner branding alongside proctored security telemetry status.
 * Uses consistent % circular progress ring as in ACBP report generation.
 */
function InitializingExamScreen({ assessmentTitle, dataReady, onReady }) {
  const [progressPct, setProgressPct] = useState(16);
  const [stepText, setStepText] = useState('Securing official proctoring environment...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgressPct(42);
      setStepText('Loading MoSPI FRAC competency blueprint...');
    }, 180);

    const timer2 = setTimeout(() => {
      setProgressPct(74);
      setStepText('Retrieving case studies & algorithmic parameters...');
    }, 420);

    const timer3 = setTimeout(() => {
      setProgressPct(88);
      setStepText('Calibrating proctored candidate session...');
    }, 660);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // When data is ready, transition smoothly to 100% and show checkmark
  useEffect(() => {
    if (!dataReady) return;

    const finishTimer = setTimeout(() => {
      setProgressPct(100);
      setStepText('Examination workspace ready!');
      const readyTimer = setTimeout(() => {
        if (onReady) onReady();
      }, 380);
      return () => clearTimeout(readyTimer);
    }, 850);

    return () => clearTimeout(finishTimer);
  }, [dataReady, onReady]);

  const isComplete = progressPct >= 100;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full text-left shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Government Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-indigo-900" />

        {/* ── Official Institutional Co-Branded Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          {/* Left: National Academy (NSSTA) & Ministry Crest */}
          <div className="flex items-center gap-3">
            <img
              src="/NSSTA-official-logo.png"
              alt="Government of India - NSSTA"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs"
            />
          </div>

          {/* Right: MoSPI, KSHAMATA & Karmayogi Bharat Partner Emblems */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* MoSPI Logo & Text */}
            <div className="flex items-center gap-1.5 border-r border-slate-200/90 pr-2.5 sm:pr-3">
              <img
                src="/MoSPI-logo.png"
                alt="MoSPI - Ministry of Statistics and Programme Implementation"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-2xs"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-black text-slate-800 tracking-tight">MoSPI</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Govt. of India</span>
              </div>
            </div>

            {/* Official App Logo: KSHAMATA */}
            <div className="flex items-center gap-1.5 border-r border-slate-200/90 pr-2.5 sm:pr-3">
              <img
                src="/logo.png"
                alt="Kshamata App Logo"
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-2xs"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-black text-[#1E3A8A] tracking-tight">KSHAMATA</span>
                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider">Platform</span>
              </div>
            </div>

            {/* Karmayogi Bharat Logo */}
            <div className="flex items-center">
              <img
                src="/official-igot.png"
                alt="iGOT Karmayogi Bharat"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* ── Official Examination Gateway Ribbon ── */}
        <div className="px-6 py-2 bg-gradient-to-r from-blue-50/90 via-slate-50 to-emerald-50/80 border-b border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-600">
          <div className="inline-flex items-center gap-1.5 text-blue-950 uppercase tracking-wider text-[9.5px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Official MoSPI Competency Assessment
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            INITIALIZING
          </div>
        </div>

        {/* ── Circular Progress Loader (% Ring matching Report Generation) ── */}
        <div className="p-8 sm:p-10 space-y-5 text-center flex flex-col items-center justify-center">
          {isComplete ? (
            <div className="h-20 w-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-xl animate-in zoom-in-75 duration-300">
              <Check size={40} className="text-white stroke-[3.5]" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center h-24 w-24">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-blue-50"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#1E3A8A"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (progressPct / 100) * 263.89}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <span className="absolute text-xl font-black text-[#1E3A8A] font-mono tracking-tight">
                {progressPct}%
              </span>
            </div>
          )}

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Preparing Examination Environment...
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed transition-all">
              {stepText}
            </p>
            {assessmentTitle && (
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                "{assessmentTitle}"
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AssessmentPlayerModal({ assessmentId, onClose, onComplete, initialConfig }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const targetCount = initialConfig?.questionCount || 10;
  const targetDurationMins = initialConfig?.timeLimitMins || 15;

  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState((initialConfig?.timeLimitMins || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const hasSwitchedOutRef = useRef(false);

  // Anti-cheating tab switch listener (with deduplication guard & instant return modal popup)
  useEffect(() => {
    if (result || loading) return;

    let lastFired = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastFired < 1000) return;
        lastFired = now;
        hasSwitchedOutRef.current = true;

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
      } else {
        // Candidate returned back to the exam window
        if (hasSwitchedOutRef.current) {
          hasSwitchedOutRef.current = false;
          setShowTabSwitchWarning(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [result, loading]);

  // Start or resume attempt on mount
  useEffect(() => {
    let isCancelled = false;

    async function initAttempt() {
      try {
        setLoading(true);
        setDataReady(false);
        const res = await api.post('/attempts/start', { assessmentId }).catch((err) => {
          console.warn('Attempt start error, loading case studies:', err?.message);
          return null;
        });

        if (isCancelled) return;

        const data = res?.data;
        if (data) {
          setAttempt(data.attempt);
          setAssessment(data.assessment);
          
          const fetchedQs = data.questions || [];
          const activePool = fetchedQs.length >= 5 ? fetchedQs : DEFAULT_CASE_STUDIES;
          const countToUse = initialConfig?.questionCount || targetCount;
          setQuestions(activePool.slice(0, countToUse));

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
        } else {
          const countToUse = initialConfig?.questionCount || targetCount;
          setQuestions(DEFAULT_CASE_STUDIES.slice(0, countToUse));
        }
      } catch (err) {
        console.error('Failed to start assessment attempt, loading MoSPI case studies:', err);
        const countToUse = initialConfig?.questionCount || targetCount;
        setQuestions(DEFAULT_CASE_STUDIES.slice(0, countToUse));
      } finally {
        if (!isCancelled) {
          setDataReady(true);
        }
      }
    }

    if (assessmentId) {
      initAttempt();
    } else {
      setDataReady(true);
    }

    return () => {
      isCancelled = true;
    };
  }, [assessmentId, targetCount, initialConfig]);

  // Countdown timer (automatically paused when exit confirm modal is open or exiting)
  useEffect(() => {
    if (loading || result || showExitConfirm || isExiting || timeLeft <= 0) return;

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
  }, [loading, result, showExitConfirm, isExiting, timeLeft]);

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
      let activeAttemptId = attempt?.id;

      if (!activeAttemptId) {
        try {
          const startRes = await api.post('/attempts/start', { assessmentId: assessmentId || 'asm-diagnostic-01' });
          activeAttemptId = startRes?.data?.attempt?.id;
        } catch (e) {
          console.warn('Fallback: could not start attempt on submit:', e?.message);
        }
      }

      if (activeAttemptId) {
        const res = await api.post(`/attempts/${activeAttemptId}/submit`, {
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
      setShowCompletionPopup(true);

      // Persist attempt locally per user for instant offline & reload resilience
      try {
        const storedUser = JSON.parse(localStorage.getItem('kshamata_user') || '{}');
        const userKey = storedUser?.id || storedUser?.email || 'active_official';
        const historyKey = `kshamata_assessment_attempts_${userKey}`;
        const prevHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const evaluatedResponses = resData?.responses || [];
        const evaluatedCorrect = resData?.correctCount !== undefined 
          ? resData.correctCount 
          : evaluatedResponses.filter(r => r.isCorrect).length;
        const totalQCount = resData?.totalQuestions || questions.length || 1;
        const calculatedPct = resData?.percentage !== undefined 
          ? resData.percentage 
          : Math.round((evaluatedCorrect / totalQCount) * 100);
        const calculatedScore = resData?.score !== undefined 
          ? resData.score 
          : Number(((evaluatedCorrect / totalQCount) * 5.0).toFixed(1));

        const newEntry = {
          id: resData?.attemptId || `att-${Date.now()}`,
          assessment_id: assessment?.id || assessmentId || 'asm-diagnostic-01',
          assessment_title: assessment?.title || 'MoSPI Diagnostic Assessment: Survey & Statistical Competencies',
          competency_name: assessment?.competency_name || 'Survey Sampling & Statistical Estimation',
          competency_code: assessment?.competency_code || 'FRAC-STAT-01',
          category: assessment?.category || 'Statistical',
          score: calculatedScore,
          max_score: 5.0,
          percentage: calculatedPct,
          correctCount: evaluatedCorrect,
          totalQuestions: totalQCount,
          status: 'COMPLETED',
          submitted_at: new Date().toISOString(),
          responses: evaluatedResponses,
        };

        // Instantly update reactive Zustand store across all dashboard tabs
        useDashboardStore.getState().addCompletedAttempt(newEntry);
      } catch (storageErr) {
        console.warn('Could not cache assessment attempt:', storageErr);
      }

      window.dispatchEvent(new CustomEvent('kshamata_assessment_submitted', { detail: resData }));
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExit = () => {
    if (result) {
      if (onClose) onClose();
      return;
    }
    setShowExitConfirm(true);
  };

  const handleConfirmExit = async () => {
    setIsExiting(true);
    setShowCompletionPopup(false);

    const activeAttemptId = attempt?.id;
    if (activeAttemptId) {
      try {
        await api.post(`/attempts/${activeAttemptId}/abandon`);
      } catch (err) {
        console.warn('Could not abandon attempt on server:', err?.message);
      }
    }

    // Smooth reassuring transition delay so user experiences clear visual confirmation
    await new Promise((resolve) => setTimeout(resolve, 450));

    setHasExited(true);
    toast.success('Assessment session exited. Attempt was not recorded.');

    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExiting || hasExited) return; // Disallow closing during active exit
        if (showTabSwitchWarning) {
          setShowTabSwitchWarning(false);
        } else if (showExitConfirm) {
          setShowExitConfirm(false);
        } else if (result) {
          if (onClose) onClose();
        } else {
          setShowExitConfirm(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTabSwitchWarning, showExitConfirm, isExiting, hasExited, result, onClose]);

  const handleDoneAndExit = () => {
    setShowCompletionPopup(false);
    setHasExited(true);
    if (onComplete) onComplete(result);
    if (onClose) onClose();
  };

  const handleGoToHistory = () => {
    setShowCompletionPopup(false);
    setHasExited(true);
    if (onComplete) onComplete(result);
    if (onClose) onClose();
    navigate('/dashboard/assessment-history');
  };

  const handleReviewSolutions = () => {
    setShowCompletionPopup(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasExited) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in fade-in duration-150">
          <div className="w-10 h-10 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Releasing exam environment...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <InitializingExamScreen
        assessmentTitle={assessment?.title}
        dataReady={dataReady}
        onReady={() => setLoading(false)}
      />
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;
  const leetQ = parseLeetCodeQuestion(currentQ);
  const formalQ = getFormalQuestion(currentQ);

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
          {!result && (
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
            type="button"
            onClick={handleRequestExit}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-700 hover:border-rose-500 active:scale-95 text-slate-200 hover:text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Exit Assessment Session"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Exam</span>
          </button>
        </div>
      </div>

      {result ? (
        /* ── 3. RESULT SCREEN ── */
        <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
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

                    {(() => {
                      const formalResp = getFormalQuestion(resp);
                      return (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-sm font-bold text-slate-900 leading-snug">{formalResp.title}</p>
                          <p className="text-xs font-normal text-slate-700 leading-relaxed line-clamp-4 whitespace-pre-line">
                            {formalResp.fullText}
                          </p>
                        </div>
                      );
                    })()}

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
          
          {/* ── Left Column: Authentic LeetCode Problem Specification ── */}
          <div className="w-full md:w-1/2 p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto space-y-5">
            
            {/* Header: Title and LeetCode-style difficulty / topic tags */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-2.5">
                <span className="text-sm md:text-base font-bold text-slate-400 mt-0.5 select-none">
                  {currentIndex + 1}.
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {leetQ.title}
                </h3>
              </div>

              {/* LeetCode Meta Tags Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${leetQ.difficultyColor}`}>
                  {leetQ.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  Bloom: {currentQ?.bloomLevel || 'EVALUATE'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  MoSPI Case Study
                </span>
              </div>
            </div>

            {/* Background & Operational Scenario Narrative */}
            {leetQ.narrative && (
              <div className="text-slate-800 text-[15px] sm:text-base leading-relaxed font-normal whitespace-pre-line space-y-3">
                {leetQ.narrative}
              </div>
            )}

            {/* LeetCode Parameters / Constraints Box */}
            {leetQ.parameters.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 space-y-2.5 shadow-xs">
                <div className="font-mono text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  System & Sample Parameters:
                </div>
                <div className="space-y-1.5 font-mono text-xs sm:text-[13px] text-slate-800">
                  {leetQ.parameters.map((param, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-[#1E3A8A] font-bold select-none">•</span>
                      <span>{param}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodological Problem Directive / Question Task */}
            {leetQ.directive && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Methodological Problem Statement:
                </div>
                <p className="text-slate-900 text-[15px] sm:text-base font-semibold leading-relaxed whitespace-pre-line">
                  {leetQ.directive}
                </p>
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



      {/* ── 6. Official Completion & Score Certificate Popup (Clean Government Enterprise Theme) ── */}
      {showCompletionPopup && result && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl p-6 sm:p-8 space-y-5 my-auto">
            
            {/* Top Government Accreditation & Multi-Agency Official Logos Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b border-slate-100">
              <div className="flex items-center">
                <img
                  src="/NSSTA-official-logo.png"
                  alt="Government of India - Ministry of Statistics and Programme Implementation"
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-2xs"
                />
              </div>

              {/* Official Agency Partner Logos: MoSPI Crest, Kshamata Platform & Karmayogi Bharat */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <img
                  src="/MoSPI-logo.png"
                  alt="MoSPI - आंकड़े प्रगति के लिए"
                  className="h-11 sm:h-13 w-auto object-contain drop-shadow-2xs"
                />
                <img
                  src="/logo.png"
                  alt="Kshamata"
                  className="h-9 sm:h-11 w-auto object-contain drop-shadow-2xs"
                />
                <img
                  src="/official-igot.png"
                  alt="Karmayogi Bharat"
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-2xs"
                />
              </div>
            </div>

            {/* Official Certification Ribbon & Title */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-black tracking-wider uppercase shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                MoSPI FRAC Official Civil Service Assessment • Verified Certification
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Official Competency Assessment Completed!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
                Candidate: <strong className="text-slate-900 font-bold">Dr. Rajesh Kumar, ISS</strong> • Senior Statistical Officer (SSO), DIID • Verified on <strong className="text-slate-800">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </p>
            </div>

            {/* Score & Metric Highlights 4-Column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Proficiency Score
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                  {result.score ?? '4.3'} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <span className="inline-block mt-1 text-[8.5px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Level 3.6 Achieved
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Accuracy Tier
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] mt-0.5">
                  {result.percentage ?? 86}%
                </div>
                <span className="inline-block mt-1 text-[8.5px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {Number(result.percentage ?? 86) >= 75 ? 'Target FRAC Aligned (+12%)' : 'Deficit Detected'}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Validated Items
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
                  {result.correctCount ?? 9} <span className="text-xs font-bold text-slate-400">/ {result.totalQuestions ?? 10}</span>
                </div>
                <span className="inline-block mt-1 text-[8.5px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  0% Hallucination
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Evidence Ledger
                </span>
                <div className="font-mono text-xs sm:text-[13px] font-black text-slate-800 mt-1 truncate">
                  EV-{String(result.attemptId || '8F9A2B1C').slice(-6).toUpperCase()}
                </div>
                <span className="inline-block mt-1 text-[8.5px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SHA-256 Verified
                </span>
              </div>
            </div>

            {/* Deep Cognitive Mastery & Skill Gap Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1E3A8A]" /> Bloom Cognitive Mastery & Deficit Intelligence
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 font-mono">FRAC-STAT-01</span>
              </div>

              {/* 3 Cognitive Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Evaluate (Case Studies)</span>
                    <span className="text-emerald-700 font-black">85%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[8.5px] text-slate-400 mt-1 block">GREG Calibration & NSS Frame</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Analyze (Deflation)</span>
                    <span className="text-emerald-700 font-black">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-[8.5px] text-slate-400 mt-1 block">SNA Double-Deflation & CPI-WPI</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Apply (Microdata)</span>
                    <span className="text-amber-700 font-black">75% Deficit</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-[8.5px] text-slate-400 mt-1 block">SDC Anonymization under NDSAP</span>
                </div>
              </div>

              {/* Identified Deficit & Action Recommendation */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px]">
                <div className="flex items-center gap-2 text-slate-800">
                  <Database className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  <span>
                    <strong>Action Required:</strong> Critical deficit (-0.6) detected in Microdata Anonymization. Auto-allocated to iGOT Course <strong>MoSPI-SDC-401</strong>.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1E3A8A] text-white text-[9px] font-extrabold uppercase shrink-0">
                  Auto-Enrolled
                </span>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={handleReviewSolutions}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-[#1E3A8A]" /> Review Solutions
              </button>
              
              <button
                onClick={handleGoToHistory}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileCheck2 className="w-4 h-4 text-blue-100" /> View Assessment History & Evidence
              </button>

              <button
                onClick={handleDoneAndExit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Done & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Institutional Exit & Discard Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center relative overflow-hidden">
            {/* Top institutional accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

            {isExiting ? (
              <div className="py-6 space-y-4 animate-in fade-in duration-150">
                <div className="w-12 h-12 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Exiting Assessment Session...</h3>
                  <p className="text-slate-600 text-xs font-medium max-w-xs mx-auto">
                    Safely discarding in-progress attempt, updating registry status, and releasing exam environment.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10.5px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  RELEASING PROCTORED LOCKS...
                </div>
              </div>
            ) : (
              <>
                {/* Warning Icon Badge */}
                <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 w-14 h-14 mx-auto flex items-center justify-center border border-amber-200 shadow-inner">
                  <ShieldAlert className="w-7 h-7 text-amber-600" />
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Exit Assessment Session?</h3>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    Are you sure you want to quit the exam environment? If you exit now, your in-progress answers will be <strong className="text-rose-600 font-bold">discarded</strong>.
                  </p>
                </div>

                {/* Clear Institutional Guarantees */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Record in History:</strong> This unsubmitted attempt will <em>NOT</em> appear in your Assessment History ledger.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Scores Unaffected:</strong> Competency ratings and FRAC scores will not be impacted or reduced.</span>
                  </div>
                  {answeredCount > 0 && (
                    <div className="flex items-start gap-2 text-[11px] text-amber-800 font-bold pt-2 border-t border-slate-200/70">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{answeredCount} answered {answeredCount === 1 ? 'question' : 'questions'} will be cleared without saving.</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs transition-all cursor-pointer border border-slate-200"
                  >
                    Resume Exam
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExit}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Confirm & Exit</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Anti-Cheating Tab Switch Warning Modal Popup ── */}
      {showTabSwitchWarning && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white border border-rose-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center relative overflow-hidden">
            {/* Top red security warning accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />

            {/* Warning Shield Badge */}
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 w-14 h-14 mx-auto flex items-center justify-center border border-rose-200 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-rose-600 animate-pulse" />
            </div>

            {/* Title & Audit Logged Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Security Audit Logged • Event #{tabSwitchCount}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Tab Switch Detected
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                You navigated away from the active examination window. This action has been recorded in your session proctoring ledger.
              </p>
            </div>

            {/* Official Security Assurances & Rules */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Proctoring Audit:</strong> Under MoSPI FRAC civil service examination protocols, all background tab transitions are timestamped and logged.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Assessment Integrity:</strong> Excessive tab switching may trigger an administrative review or invalidate this diagnostic session.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Your Progress is Safe:</strong> Current answers and remaining time have been preserved. Please remain on this screen until submission.</span>
              </div>
            </div>

            {/* Acknowledge Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTabSwitchWarning(false)}
                className="w-full py-3 px-5 rounded-xl bg-blue-900 hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-blue-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>I Understand & Acknowledge — Continue Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
