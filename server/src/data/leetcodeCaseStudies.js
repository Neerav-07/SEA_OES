export const LEETCODE_CASE_STUDIES = [
  {
    bloomLevel: 'EVALUATE',
    title: 'NSS 79th Round Domestic Tourism Expenditure Audit & GREG Calibration',
    stem: `CASE STUDY: NSS 79th Round Domestic Tourism Expenditure Audit & GREG Calibration

BACKGROUND & OPERATIONAL CONTEXT:
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
      { text: 'Execute Generalized Regression Estimator (GREG) calibration using land holding size and tractor ownership as auxiliary benchmark variables to re-calibrate sample multiplier weights.', is_correct: true },
      { text: 'Apply simple mean imputation within the primary sampling unit (PSU) without modifying final multiplier weights.', is_correct: false },
      { text: 'Drop non-responding agricultural households and re-scale sample weights uniformly across all urban and rural strata.', is_correct: false },
      { text: 'Substitute missing rural records with median responses from neighboring district urban commercial clusters.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'GREG calibration leverages known administrative benchmarks (land holdings) to re-calibrate sampling weights, neutralizing non-response bias while bounding variance under NSSO auditing standards.',
  },
  {
    bloomLevel: 'ANALYZE',
    title: 'Consumer Price Index (CPI) Base-Year Revision & SNA 2008 Double-Deflation',
    stem: `CASE STUDY: Consumer Price Index (CPI) Base-Year Revision & SNA 2008 Double-Deflation

BACKGROUND & OPERATIONAL CONTEXT:
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
      { text: 'Construct a double-deflation index separating trade margins from physical output using sector-specific CPI service sub-indices for gross output and WPI intermediate consumption indices.', is_correct: true },
      { text: 'Replace the entire CPI rural series with the aggregate WPI headline index for single-deflation of nominal GVA.', is_correct: false },
      { text: 'Apply an unweighted geometric mean of WPI and CPI across all retail service commodity groups.', is_correct: false },
      { text: 'Adjust nominal turnover by the implicit GDP deflator from the previous quinquennial census.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'Double-deflation using sector-specific CPI trade sub-indices isolates real gross value added from price volatility under SNA 2008 guidelines.',
  },
  {
    bloomLevel: 'APPLY',
    title: 'Python & R Microdata Cleaning Pipeline for 5 Million PLFS CAPI Records',
    stem: `CASE STUDY: Python & R Microdata Cleaning Pipeline for 5 Million PLFS CAPI Records

BACKGROUND & OPERATIONAL CONTEXT:
A specialized data informatics engineering team at MoSPI DIID is engineering an automated ETL pipeline in Python (Pandas/NumPy/Statsmodels) and R (data.table) to ingest 5.2 million raw CAPI (Computer-Assisted Personal Interview) records from the Periodic Labour Force Survey (PLFS). Initial data profiling of the ingested raw JSON payloads reveals severe data entry anomalies: 0.3% of records report weekly hours worked exceeding 168 hours (physical impossibility), and 1.2% contain malformed National Classification of Occupations (NCO-2015) 4-digit codes.

SYSTEM & TECHNICAL PARAMETERS:
• Dataset Volume: 5,240,000 individual level survey records across 128,000 households.
• Anomaly 1: Weekly hours worked > 168 hours (upper bound violation).
• Anomaly 2: 62,880 records with non-standard NCO-2015 occupation codes.
• Memory Constraint: Pipeline must run within 16GB RAM limit on official NSSTA analytical nodes.

METHODOLOGICAL PROBLEM STATEMENT:
Simply dropping all anomalous records would introduce sample attrition bias and destroy multiplier weight sums across smaller Union Territories. Conversely, converting invalid fields to null or dummy modes creates downstream syntax errors in econometric wage regression models.

Which programmatic validation and cleaning rule enforces data integrity while preserving legitimate extreme workload values?`,
    options: [
      { text: 'Implement winsorization at 99th percentile for numerical hours combined with regex lookup verification against NCO-2015 official master dictionary tables.', is_correct: true },
      { text: 'Filter out and delete all records where weekly hours worked exceed 40 hours.', is_correct: false },
      { text: 'Replace all invalid occupation codes with the modal code "9999" without dictionary validation.', is_correct: false },
      { text: 'Convert numeric wage fields to categorical strings prior to running statistical aggregations.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'Winsorization bounds extreme physical impossibilities (>168 hrs) while preserving high valid workloads, and regex dictionary lookup validates official NCO codes.',
  },
  {
    bloomLevel: 'EVALUATE',
    title: 'Microdata Anonymization & Statistical Disclosure Control (SDC) under NDSAP',
    stem: `CASE STUDY: Microdata Anonymization & Statistical Disclosure Control (SDC) under NDSAP

BACKGROUND & OPERATIONAL CONTEXT:
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
      { text: 'Apply k-anonymity (k>=5) combined with microaggregation on continuous turnover variables and top-coding on extreme revenue categories.', is_correct: true },
      { text: 'Suppress all district-level geographic identifiers across the entire dataset.', is_correct: false },
      { text: 'Add Gaussian random noise (+/- 50%) to all numerical variables regardless of re-identification risk.', is_correct: false },
      { text: 'Publish only national summary tables and permanently delete the microdata repository.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'k-anonymity (k>=5) with microaggregation protects quasi-identifiers (district + capital) without destroying correlation structures required for econometric research.',
  },
  {
    bloomLevel: 'ANALYZE',
    title: 'Multi-Stage Stratified PPS Sampling Variance Estimation & DEFF Adjustment',
    stem: `CASE STUDY: Multi-Stage Stratified PPS Sampling Variance Estimation & DEFF Adjustment

BACKGROUND & OPERATIONAL CONTEXT:
In a two-stage stratified sampling design for rural household socio-economic surveys, Primary Sampling Units (PSUs - Census Villages) are selected with Probability Proportional to Size with Replacement (PPSWR) based on population size, and Ultimate Sampling Units (USUs - Households) are selected via systematic sampling. Post-survey variance estimation reveals that the empirical Design Effect (DEFF) is 2.85, indicating substantial intra-cluster correlation within sampled villages.

SYSTEM & STATISTICAL PARAMETERS:
• First-Stage PSUs (m): 1,200 villages; Second-Stage USUs (n_i): 10 households per village.
• Calculated Design Effect (DEFF): 2.85; Intra-class Correlation (ρ): 0.205.
• Target Precision: Margin of Error = ±2.5% at 95% Confidence Level.
• Operational Constraint: Maximum field budget cap = ₹4.5 Crore.

METHODOLOGICAL PROBLEM STATEMENT:
High DEFF (2.85) indicates that sampling additional households within the same village yields diminishing statistical information due to village-level cluster homogeneity. To reduce the variance of national mean expenditure estimates under a fixed operational field budget, how must the sampling design parameters be re-allocated?`,
    options: [
      { text: 'Increase the number of selected PSUs (villages) while decreasing the number of USUs (households) sampled per PSU to reduce intra-cluster variance contribution.', is_correct: true },
      { text: 'Double the number of USUs sampled within each existing PSU without increasing the PSU sample count.', is_correct: false },
      { text: 'Switch from PPS sampling to simple random sampling without stratification.', is_correct: false },
      { text: 'Reduce the confidence level from 95% to 80% to force DEFF down to 1.0.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'High DEFF (2.85) indicates cluster homogeneity. Increasing the number of PSUs (clusters) while sampling fewer households per PSU decreases variance efficiently under fixed budget constraints.',
  },
  {
    bloomLevel: 'APPLY',
    title: 'Annual Survey of Industries (ASI) Factory Imputation & Gross Capital Formation',
    stem: `CASE STUDY: Annual Survey of Industries (ASI) Factory Imputation & Gross Capital Formation

BACKGROUND & OPERATIONAL CONTEXT:
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
      { text: 'Apply capital-to-turnover ratio imputation derived from homogeneous 4-digit NIC peer size classes in the same state.', is_correct: true },
      { text: 'Assign zero fixed capital to all non-reporting factories.', is_correct: false },
      { text: 'Impute capital using unweighted national mean across all manufacturing sectors.', is_correct: false },
      { text: 'Delete non-reporting factory records from the master sample frame.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'Peer-class capital-to-turnover ratio imputation maintains sectoral capital intensity structures aligned with ASI methodology.',
  },
  {
    bloomLevel: 'ANALYZE',
    title: 'PLFS Activity Status Accounting & Worker Population Ratio (WPR) Calculation',
    stem: `CASE STUDY: PLFS Activity Status Accounting & Worker Population Ratio (WPR) Calculation

BACKGROUND & OPERATIONAL CONTEXT:
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
      { text: 'Classify as Employed (Code 11/31) based on the major time-criterion (5 total days spent in gainful economic activity during reference week).', is_correct: true },
      { text: 'Classify as Unemployed (Code 81) due to seeking work for 2 days at the labor mandi.', is_correct: false },
      { text: 'Classify as Out of Labour Force (Code 91) due to subsistence farming component.', is_correct: false },
      { text: 'Split individual multiplier weight equally across 3 separate labor force status categories.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'CWS applies major time-criterion (5 working days out of 7), placing the respondent firmly in the Employed labor force status.',
  },
  {
    bloomLevel: 'APPLY',
    title: 'Index of Industrial Production (IIP) Basket Weighting & Structural Revision',
    stem: `CASE STUDY: Index of Industrial Production (IIP) Basket Weighting & Structural Revision

BACKGROUND & OPERATIONAL CONTEXT:
The Economic Statistics Division (ESD) is executing a base-year structural revision of the Index of Industrial Production (IIP). Production data from the past decade reveals that legacy commodity groups (such as coal mining and heavy textiles) have declined in relative GVA share, while high-technology sectors (semiconductor packaging, solar PV module manufacturing, electric vehicles) have expanded rapidly.

SYSTEM & INDEX PARAMETERS:
• Index Formulation: Laspeyres Fixed-Base Quantity Index.
• Item Basket Size: 407 item groups across Mining, Manufacturing, and Electricity.
• Base Year Weighting: Derived from ASI Gross Value Added (GVA) contributions.

METHODOLOGICAL PROBLEM STATEMENT:
Using a static fixed-weight Laspeyres index over a 10-year horizon creates severe structural weight decay, failing to capture new high-growth industrial sectors.

Which index weighting modification ensures continuous representation of fast-growing industrial product groups without creating trend breaks in historical IIP series?`,
    options: [
      { text: 'Adopt a chain-linked Laspeyres index formulation with periodic weight updating for fast-growing high-tech product groups.', is_correct: true },
      { text: 'Replace Laspeyres index with a fixed-weight Paasche index updated once every 15 years.', is_correct: false },
      { text: 'Use an unweighted arithmetic average of physical output production ratios.', is_correct: false },
      { text: 'Remove mining and energy sectors entirely from industrial production tracking.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'Chain-linked Laspeyres indexing incorporates new high-growth item groups seamlessly without creating structural trend breaks in IIP time-series.',
  },
  {
    bloomLevel: 'EVALUATE',
    title: 'National Indicator Framework (NIF) for SDG Monitoring & Small Area Estimation',
    stem: `CASE STUDY: National Indicator Framework (NIF) for SDG Monitoring & Small Area Estimation

BACKGROUND & OPERATIONAL CONTEXT:
Under Sustainable Development Goal 8 (Decent Work & Economic Growth), MoSPI tracks National Indicator Framework (NIF) Metric 8.5.2 (Unemployment Rate disaggregated by sex, age, and disability status). A state-level statistical audit revealed that in 4 small Union Territories, sample sizes in PLFS sub-strata for persons with disabilities are too small to produce direct survey estimates with acceptable coefficients of variation (CV < 20%).

SYSTEM & METRIC PARAMETERS:
• NIF Target Indicator: 8.5.2 (Disability Disaggregated Unemployment Rate).
• Target Geography: 4 Union Territories (Small Area Domains).
• Direct Sample Size (n_small): < 150 respondents per UT; Direct Estimate CV: 42.5% (Unreliable).

METHODOLOGICAL PROBLEM STATEMENT:
Publishing direct survey estimates with CVs exceeding 42% violates MoSPI data dissemination standards. Conversely, suppressing SDG indicator reporting for these 4 UTs leaves national SDG reporting incomplete.

Which statistical modeling technique should be implemented to produce reliable disaggregated SDG indicator estimates for small administrative domains?`,
    options: [
      { text: 'Implement Small Area Estimation (SAE) empirical Bayes modeling, linking PLFS sample data with administrative disability registry benchmarks.', is_correct: true },
      { text: 'Publish direct unweighted sample averages despite high coefficients of variation.', is_correct: false },
      { text: 'Suppress all SDG Goal 8 reporting for the entire country.', is_correct: false },
      { text: 'Replace missing survey estimates with unadjusted regional population projections.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'Small Area Estimation (SAE) combines survey data with administrative benchmarks to yield reliable disaggregated SDG indicators for small sub-populations.',
  },
  {
    bloomLevel: 'APPLY',
    title: 'Official Microdata Dissemination Portal Architecture & GIGW 3.0 Compliance',
    stem: `CASE STUDY: Official Microdata Dissemination Portal Architecture & GIGW 3.0 Compliance

BACKGROUND & OPERATIONAL CONTEXT:
MoSPI’s official microdata dissemination repository is undergoing a major architecture modernization to satisfy Guidelines for Indian Government Websites (GIGW 3.0) and FAIR (Findable, Accessible, Interoperable, Reusable) open data standards. The platform must serve over 500,000 annual microdata downloads to academic researchers, international agencies (UNSTAT, World Bank), and policy research institutes.

SYSTEM & ARCHITECTURE REQUIREMENTS:
• Standards: GIGW 3.0, NDSAP Open Data Guidelines, FAIR Principles.
• Data Formats: DDI (Data Documentation Initiative) XML/JSON schemas, SDMX microdata metrics.
• Machine Interoperability: Automated RESTful API access for programmatic data fetching.

METHODOLOGICAL PROBLEM STATEMENT:
Which system architecture and API standard ensures seamless machine-to-machine data interoperability while enforcing rate-limiting and user authentication protocols?`,
    options: [
      { text: 'Deploy RESTful JSON & SDMX API endpoints with OpenAPI 3.0 schemas, DDI metadata tags, and OAuth2 authentication controls.', is_correct: true },
      { text: 'Store raw unindexed CSV files in an unauthenticated FTP download folder.', is_correct: false },
      { text: 'Use proprietary binary database files requiring specialized offline desktop software.', is_correct: false },
      { text: 'Publish static HTML table web pages without programmatic API interfaces.', is_correct: false },
    ],
    correctAnswer: 0,
    explanation: 'SDMX & RESTful APIs with OpenAPI schemas satisfy GIGW 3.0 and FAIR principles for machine-readable official statistical data sharing.',
  }
];
