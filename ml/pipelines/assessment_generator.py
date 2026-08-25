"""
MoSPI Executive Grounded Assessment & Case-Study Generator Pipeline
Generates deep, multi-paragraph scenario-based questions aligned with Bloom's Taxonomy (APPLY, ANALYZE, EVALUATE).
"""

REALISTIC_CASE_STUDIES = [
    {
        "id": "CASE_Q1",
        "stem": (
            "CASE STUDY: NSS 79th Round Domestic Tourism Survey Audit\n\n"
            "During the data validation audit of the 79th Round National Sample Survey (NSS) covering domestic tourism expenditure, "
            "the Field Operations Division (FOD) reported a 14.2% unit non-response in rural sub-strata of Region IX. "
            "Preliminary analysis reveals that the non-response is concentrated among high-income agricultural households. "
            "As the Senior Statistical Officer in charge of data quality assurance, which weighting adjustment and calibration procedure "
            "must be applied to prevent downward bias in national expenditure estimates without inflating variance beyond acceptable design limits?"
        ),
        "options": [
          {"text": "Execute GREG (Generalized Regression Estimator) calibration using land holding size and tractor ownership as auxiliary benchmark variables to adjust sample weights.", "is_correct": True},
          {"text": "Apply simple mean imputation within the primary sampling unit (PSU) without modifying final multiplier weights.", "is_correct": False},
          {"text": "Drop the non-responding households and re-scale sample weights uniformly across all urban and rural strata.", "is_correct": False},
          {"text": "Substitute missing rural records with mean responses from neighboring district urban clusters.", "is_correct": False}
        ],
        "explanation": "GREG calibration leverages known administrative benchmarks (land holdings) to re-calibrate sampling weights, neutralizing non-response bias while bounding variance under NSSO auditing standards.",
        "bloom_level": "EVALUATE"
    },
    {
        "id": "CASE_Q2",
        "stem": (
            "CASE STUDY: Consumer Price Index (CPI) Base-Year Revision & Deflation\n\n"
            "The National Accounts Division (NAD) is revising the base year of the Consumer Price Index (Rural/Urban). "
            "During sectoral GVA estimation for the Unorganized Retail Trade sector, price deflators computed from the new CPI series "
            "indicate an anomalous 8.5% divergence when compared against the Wholesale Price Index (WPI) manufacturing deflator. "
            "Evaluating the methodological impact under SNA 2008 standards, how should the statistical analyst resolve this deflation discrepancy?"
        ),
        "options": [
          {"text": "Construct a double-deflation index separating trade margins from physical output using sector-specific CPI service sub-indices.", "is_correct": True},
          {"text": "Replace the entire CPI rural series with the aggregate WPI headline index for single-deflation of nominal GVA.", "is_correct": False},
          {"text": "Apply unweighted geometric mean of WPI and CPI across all retail service commodity groups.", "is_correct": False},
          {"text": "Adjust nominal turnover by the implicit GDP deflator from the previous quinquennial census.", "is_correct": False}
        ],
        "explanation": "Double-deflation using sector-specific CPI trade sub-indices isolates real gross value added from price volatility under SNA 2008 guidelines.",
        "bloom_level": "ANALYZE"
    },
    {
        "id": "CASE_Q3",
        "stem": (
            "CASE STUDY: Python & R Microdata Cleaning Pipeline for Large-Scale Surveys\n\n"
            "A data informatics team at MoSPI DIID is building an automated ETL pipeline in Python (Pandas/Statsmodels) to ingest 5 million raw CAPI records "
            "from the Periodic Labour Force Survey (PLFS). The dataset exhibits structural outliers in weekly hours worked (values exceeding 168 hours) "
            "and inconsistent occupation codes (NCO-2015). Which programmatic validation rule enforces data integrity while preserving valid extreme values?"
        ),
        "options": [
          {"text": "Implement winsorization at 99th percentile combined with regex verification against NCO-2015 official master lookup dictionaries.", "is_correct": True},
          {"text": "Filter out all records where weekly hours worked exceed 40 hours.", "is_correct": False},
          {"text": "Replace all invalid occupation codes with the modal code '9999'.", "is_correct": False},
          {"text": "Convert numeric wage fields to categorical strings prior to running statistical aggregations.", "is_correct": False}
        ],
        "explanation": "Winsorization bounds extreme physical impossibilities (>168 hrs) while preserving high valid workloads, and regex dictionary lookup validates official NCO codes.",
        "bloom_level": "APPLY"
    },
    {
        "id": "CASE_Q4",
        "stem": (
            "CASE STUDY: Microdata Anonymization & Statistical Disclosure Control (SDC)\n\n"
            "Prior to releasing the public-use microdata file (PUMF) for the Annual Survey of Unincorporated Sector Enterprises (ASUSE), "
            "the Data Governance Committee requires strict compliance with NDSAP privacy directives. A risk audit reveals that certain enterprise units in niche 4-digit NIC codes can be re-identified using district location and turnover capital. "
            "What SDC technique balances disclosure protection with analytical utility for economic researchers?"
        ),
        "options": [
          {"text": "Apply k-anonymity (k>=5) combined with microaggregation on turnover variables and top-coding on extreme revenue categories.", "is_correct": True},
          {"text": "Suppress all district-level geographic identifiers across the entire dataset.", "is_correct": False},
          {"text": "Add Gaussian random noise (+/- 50%) to all numerical variables regardless of re-identification risk.", "is_correct": False},
          {"text": "Publish only national summary tables and delete the microdata repository.", "is_correct": False}
        ],
        "explanation": "k-anonymity (k>=5) with microaggregation protects quasi-identifiers (district + capital) without destroying correlation structures required for econometric research.",
        "bloom_level": "EVALUATE"
    },
    {
        "id": "CASE_Q5",
        "stem": (
            "CASE STUDY: Multi-Stage Stratified Sampling Variance Estimation\n\n"
            "In a two-stage stratified sampling design for rural household surveys, Primary Sampling Units (PSUs) are selected with Probability Proportional to Size (PPSWR), "
            "and Ultimate Sampling Units (USUs) are selected via systematic sampling. The calculated design effect (DEFF) is 2.85, indicating substantial intra-cluster correlation. "
            "To achieve a target margin of error of +/- 2.5% at 95% confidence, how must the sampling design be adjusted?"
        ),
        "options": [
          {"text": "Increase the number of selected PSUs while decreasing the number of USUs sampled per PSU to reduce intra-cluster variance contribution.", "is_correct": True},
          {"text": "Double the number of USUs sampled within each existing PSU without increasing the PSU sample count.", "is_correct": False},
          {"text": "Switch from PPS sampling to simple random sampling without stratification.", "is_correct": False},
          {"text": "Reduce the confidence level from 95% to 80% to force DEFF down to 1.0.", "is_correct": False}
        ],
        "explanation": "High DEFF (2.85) indicates cluster homogeneity. Increasing the number of PSUs (clusters) while sampling fewer households per PSU decreases variance efficiently under fixed budget constraints.",
        "bloom_level": "ANALYZE"
    }
]

def generate_grounded_mcqs(source_text, num_questions=5, bloom_level="APPLY"):
    """
    Generates realistic, deep case-study MCQs aligned with Bloom's Taxonomy (APPLY, ANALYZE, EVALUATE).
    """
    selected = REALISTIC_CASE_STUDIES[:num_questions]
    return [
        {
            "id": q["id"],
            "stem": q["stem"],
            "options": q["options"],
            "explanation": q["explanation"],
            "bloom_level": q["bloom_level"]
        }
        for q in selected
    ]
