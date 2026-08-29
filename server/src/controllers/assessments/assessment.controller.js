import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { assessments, questions, competencies } from '../../db/schema/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Realistic questions repository based on competency + bloom level + difficulty
const QUESTION_POOL = {
  STAT_ANALYSIS: {
    REMEMBER: [
      {
        stem: 'What is the definition of Type I error in survey hypothesis testing?',
        options: [
          { text: 'Rejecting the null hypothesis when it is true', isCorrect: true },
          { text: 'Failing to reject the null hypothesis when it is false', isCorrect: false },
          { text: 'Selecting a biased sample frame', isCorrect: false },
          { text: 'An error caused by non-response rate exceeding 50%', isCorrect: false }
        ],
        explanation: 'Type I error, also known as a false positive, occurs when the null hypothesis is rejected despite being true.',
        intentHash: 'stat_analysis_type_1_err'
      }
    ],
    UNDERSTAND: [
      {
        stem: 'Why is the Central Limit Theorem critical for inferential statistics in large-scale sample surveys?',
        options: [
          { text: 'It guarantees that sample distributions are perfectly normal regardless of size', isCorrect: false },
          { text: 'It ensures that the distribution of sample means approaches normality as sample size increases, allowing parameter inference', isCorrect: true },
          { text: 'It eliminates the need for stratified random sampling', isCorrect: false },
          { text: 'It computes the exact population parameters without confidence intervals', isCorrect: false }
        ],
        explanation: 'The Central Limit Theorem establishes that sample means will form a normal distribution around the true parameter as sample size grows.',
        intentHash: 'stat_analysis_clt_normality'
      }
    ],
    APPLY: [
      {
        stem: 'Given a household income survey with a sample variance of 400 and sample size of 100, calculate the standard error of the mean.',
        options: [
          { text: '2.0', isCorrect: true },
          { text: '4.0', isCorrect: false },
          { text: '20.0', isCorrect: false },
          { text: '0.2', isCorrect: false }
        ],
        explanation: 'Standard Error (SE) = standard deviation / sqrt(n) = sqrt(variance) / sqrt(n) = 20 / 10 = 2.0.',
        intentHash: 'stat_analysis_se_calc'
      }
    ],
    ANALYZE: [
      {
        stem: 'A regression analysis of household consumer expenditure on rural farm size yields an R-squared of 0.88 but exhibits high collinearity. What does this suggest about the reliability of individual regression coefficients?',
        options: [
          { text: 'Coefficients are highly stable and can be used for policy targets directly', isCorrect: false },
          { text: 'Collinearity increases standard errors of coefficients, making individual variables appear statistically insignificant despite high predictive power', isCorrect: true },
          { text: 'The R-squared is falsely inflated and should be rejected', isCorrect: false },
          { text: 'The sample size was insufficient to construct estimators', isCorrect: false }
        ],
        explanation: 'Multicollinearity increases the variance/standard error of regression coefficients, making it hard to assess the individual significance of explanatory variables.',
        intentHash: 'stat_analysis_regression_collinearity'
      }
    ]
  },
  SAMPLING_DESIGN: {
    REMEMBER: [
      {
        stem: 'What is the principal factor determining the Design Effect (Deff) in cluster sampling designs?',
        options: [
          { text: 'Intra-class correlation coefficient and average cluster size', isCorrect: true },
          { text: 'Total population variance and sample size', isCorrect: false },
          { text: 'The ratio of response rates between urban and rural strata', isCorrect: false },
          { text: 'The number of primary sampling units in the master frame', isCorrect: false }
        ],
        explanation: 'Deff = 1 + (m - 1) * rho, where m is average cluster size and rho is the intra-class correlation coefficient.',
        intentHash: 'sampling_deff_formula'
      }
    ],
    UNDERSTAND: [
      {
        stem: 'Under what frame conditions is Stratified Random Sampling preferred over Simple Random Sampling?',
        options: [
          { text: 'When the population frame is homogeneous and has zero non-response', isCorrect: false },
          { text: 'When sub-populations vary widely and stratification can isolate homogeneous subgroups to reduce sampling variance', isCorrect: true },
          { text: 'When primary clusters are geographic and no list frame exists', isCorrect: false },
          { text: 'When convenience selection is authorized for rapid assessment', isCorrect: false }
        ],
        explanation: 'Stratification reduces overall sampling variance by ensuring distinct sub-populations (strata) are represented in the sample proportionally or optimally.',
        intentHash: 'sampling_strata_homogeneity'
      }
    ],
    APPLY: [
      {
        stem: 'In a multi-stage stratified survey, a stratum has 5,000 households. If you select 10 primary clusters with probability proportional to size, and then systematically sample 10 households per cluster, what is the selection probability for a household in a cluster of size 200?',
        options: [
          { text: '0.01', isCorrect: true },
          { text: '0.05', isCorrect: false },
          { text: '0.002', isCorrect: false },
          { text: '0.1', isCorrect: false }
        ],
        explanation: 'PPS sampling details the probability calculations based on primary cluster sizes relative to cumulative totals.',
        intentHash: 'sampling_pps_probability'
      }
    ],
    ANALYZE: [
      {
        stem: 'A survey pilot shows a high non-response rate (40%) in the high-income stratum. How does this non-response affect the bias and weight recalibration of the final consumer expenditure indices?',
        options: [
          { text: 'No impact since weights are computed at the state level', isCorrect: false },
          { text: 'It introduces systematic under-estimation bias, requiring non-response weight adjustment factors within the affected stratum', isCorrect: true },
          { text: 'It increases variance but does not introduce biased estimators', isCorrect: false },
          { text: 'It requires immediate switch to convenience sampling', isCorrect: false }
        ],
        explanation: 'Stratum-specific high non-response leads to non-response bias. Adjusting sampling weights by multiplying by the reciprocal of the response rate in that stratum helps correct this.',
        intentHash: 'sampling_non_response_bias'
      }
    ]
  },
  NATIONAL_ACCOUNTS: {
    REMEMBER: [
      {
        stem: 'Which standard framework governs the official computation of Gross Domestic Product in India since the 2011-12 revision?',
        options: [
          { text: 'System of National Accounts (SNA 1993)', isCorrect: false },
          { text: 'System of National Accounts (SNA 2008)', isCorrect: true },
          { text: 'IMF Balance of Payments Manual 5', isCorrect: false },
          { text: 'UN Principles and Recommendations for Census', isCorrect: false }
        ],
        explanation: 'India adapted System of National Accounts (SNA 2008) guidelines for GDP computation since the base year revision to 2011-12.',
        intentHash: 'nat_accounts_sna_2008'
      }
    ],
    UNDERSTAND: [
      {
        stem: 'What is the distinction between GDP at basic prices and GDP at market prices?',
        options: [
          { text: 'Market prices include net product taxes, whereas basic prices exclude product taxes but include net production taxes/subsidies', isCorrect: true },
          { text: 'Market prices exclude all taxes and subsidies', isCorrect: false },
          { text: 'Basic prices are calculated using retail inflation indices directly', isCorrect: false },
          { text: 'There is no distinction in India\'s national account tables', isCorrect: false }
        ],
        explanation: 'Basic Price = Factor Cost + Production Taxes - Production Subsidies. Market Price = Basic Price + Product Taxes - Product Subsidies.',
        intentHash: 'nat_accounts_prices_dist'
      }
    ],
    APPLY: [
      {
        stem: 'Given a sectoral nominal GVA of ₹15,000 Crore in 2025 and a sectoral GVA deflator of 120 (base 100), calculate the real GVA at constant prices.',
        options: [
          { text: '₹12,500 Crore', isCorrect: true },
          { text: '₹18,000 Crore', isCorrect: false },
          { text: '₹14,880 Crore', isCorrect: false },
          { text: '₹10,000 Crore', isCorrect: false }
        ],
        explanation: 'Real GVA = Nominal GVA * 100 / GVA Deflator = 15000 * 100 / 120 = 12500 Crore.',
        intentHash: 'nat_accounts_real_gva_calc'
      }
    ],
    ANALYZE: [
      {
        stem: 'If the service sector GVA is deflated using a wholesale price index instead of a specific service price index, how is the real growth rate of the sector likely impacted during a period of divergence between manufacturing and service costs?',
        options: [
          { text: 'It remains unaffected since deflators are unified globally', isCorrect: false },
          { text: 'It introduces measurement bias, potentially understating or overstating real service growth depending on relative price trends', isCorrect: true },
          { text: 'It makes nominal and real values identical', isCorrect: false },
          { text: 'It resolves double-deflation volatility automatically', isCorrect: false }
        ],
        explanation: 'Using non-sectoral price indices like WPI to deflate services distorts real growth rates because cost trajectories of goods vs services often diverge.',
        intentHash: 'nat_accounts_deflator_divergence'
      }
    ]
  },
  PYTHON_R_STATS: {
    REMEMBER: [
      {
        stem: 'Which pandas function is optimized to read raw positional text layout files (fixed-width files) generated by NSS survey data dumps?',
        options: [
          { text: 'read_csv', isCorrect: false },
          { text: 'read_fwf', isCorrect: true },
          { text: 'read_json', isCorrect: false },
          { text: 'read_table', isCorrect: false }
        ],
        explanation: 'NSS survey raw data is often distributed as fixed-width text files, which are efficiently parsed in pandas using `read_fwf`.',
        intentHash: 'python_r_pandas_fwf'
      }
    ],
    UNDERSTAND: [
      {
        stem: 'How does vectorization in R or pandas differ from looping structures when processing millions of survey records?',
        options: [
          { text: 'Loops compile faster than vectorized calculations', isCorrect: false },
          { text: 'Vectorization delegates loops to optimized C/Fortran code, drastically reducing execution time and overhead', isCorrect: true },
          { text: 'Vectorization uses more RAM because it duplicates variables', isCorrect: false },
          { text: 'Loops are safer for data formatting validation', isCorrect: false }
        ],
        explanation: 'Vectorized operations in numpy/pandas process data blocks using low-level optimized C arrays, avoiding Python interpreter loop overhead.',
        intentHash: 'python_r_vectorization'
      }
    ],
    APPLY: [
      {
        stem: 'You have a pandas DataFrame `df` containing NSS household records. Write the expression to replace all missing value representations (-9) with NaN in the "household_expenditure" column.',
        options: [
          { text: 'df["household_expenditure"].replace(-9, np.nan, inplace=True)', isCorrect: true },
          { text: 'df.fillna(-9, np.nan)', isCorrect: false },
          { text: 'df.loc[df == -9] = 0', isCorrect: false },
          { text: 'df["household_expenditure"] = -9', isCorrect: false }
        ],
        explanation: '`replace()` is the standard pandas function to substitute explicit missing-value codes like -9 with `numpy.nan`.',
        intentHash: 'python_r_replace_missing'
      }
    ],
    ANALYZE: [
      {
        stem: 'When running a multiple regression model in statsmodels, a diagnostic summary shows a Condition Number of 4.5e4. What does this indicate about the explanatory variable matrix?',
        options: [
          { text: 'The residuals are normally distributed', isCorrect: false },
          { text: 'There is severe multicollinearity, suggesting the numerical inversion of the covariance matrix is unstable', isCorrect: true },
          { text: 'The model has perfect statistical significance', isCorrect: false },
          { text: 'Prerequisites for linear regression are perfectly satisfied', isCorrect: false }
        ],
        explanation: 'A condition number greater than 30 indicates strong multicollinearity. Values in the thousands signify severe numerical instability.',
        intentHash: 'python_r_condition_number'
      }
    ]
  }
};

const DEFAULT_POOL = [
  {
    stem: 'Which parameter determines the baseline evaluation frequency of official competency indicators?',
    options: [
      { text: 'Organizational Capacity Guidelines (v2)', isCorrect: true },
      { text: 'Average length of service tenure', isCorrect: false },
      { text: 'Random selection by administrative staff', isCorrect: false },
      { text: 'Number of open training slots', isCorrect: false }
    ],
    explanation: 'Official frameworks dictate regular intervals based on capacity needs.',
    intentHash: 'default_eval_freq'
  }
];

/**
 * Get all assessments
 */
export const getAssessments = asyncHandler(async (req, res) => {
  const list = await db.select().from(assessments).orderBy(desc(assessments.createdAt));
  const allComps = await db.select().from(competencies);
  const allQuestions = await db.select().from(questions);

  const result = list.map(item => {
    const comp = allComps.find(c => c.id === item.competencyId);
    const itemQuestions = allQuestions.filter(q => q.assessmentId === item.id);
    const blueprintObj = typeof item.blueprint === 'object' && item.blueprint !== null ? item.blueprint : {};
    
    return {
      ...item,
      competencyName: comp ? comp.name : (item.sourceMaterialName ? `Evidence Grounded: ${item.sourceMaterialName}` : 'General Competencies'),
      competencyCode: comp ? comp.code : (item.sourceMaterialName ? 'RAG_GROUNDED' : 'GEN_COMP'),
      questionsCount: itemQuestions.length || item.totalQuestions || 0,
      questions: itemQuestions,
      status: blueprintObj.status || (item.sourceMaterialName ? 'PUBLISHED' : 'DRAFT'),
      sourceMaterialName: item.sourceMaterialName || blueprintObj.sourceName || null,
    };
  });

  return sendSuccess(res, result, 'Assessments retrieved successfully');
});

/**
 * Get single assessment with questions
 */
export const getAssessmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
  
  if (!assessment) {
    return sendError(res, 'Assessment blueprint not found', 404);
  }

  const list = await db.select().from(questions).where(eq(questions.assessmentId, assessment.id));
  const [comp] = assessment.competencyId ? await db.select().from(competencies).where(eq(competencies.id, assessment.competencyId)) : [null];

  return sendSuccess(res, {
    assessment: {
      ...assessment,
      competencyName: comp ? comp.name : 'General Competencies',
      competencyCode: comp ? comp.code : 'GEN_COMP'
    },
    questions: list
  }, 'Assessment details retrieved successfully');
});

/**
 * Create Assessment Blueprint and Generate Questions
 */
export const createAssessment = asyncHandler(async (req, res) => {
  const { title, competencyId, totalQuestions = 5, bloomDistribution = {}, difficultyDistribution = {} } = req.body;

  if (!title) {
    return sendError(res, 'Assessment title is required', 400);
  }

  const [comp] = competencyId ? await db.select().from(competencies).where(eq(competencies.id, competencyId)) : [null];
  const compCode = comp ? comp.code : 'STAT_ANALYSIS';

  // Resolve questions to generate
  const pool = QUESTION_POOL[compCode] || QUESTION_POOL.STAT_ANALYSIS;
  const generatedQuestions = [];

  const bloomLevels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  // Match requested distribution or fallback
  for (let i = 0; i < totalQuestions; i++) {
    const bloomLevel = bloomLevels[i % bloomLevels.length];
    const difficulty = difficulties[i % difficulties.length];
    const sourceCandidates = pool[bloomLevel] || DEFAULT_POOL;
    const template = sourceCandidates[0] || DEFAULT_POOL[0];

    generatedQuestions.push({
      stem: template.stem,
      options: template.options,
      explanation: template.explanation,
      bloomLevel,
      intentHash: template.intentHash + '_' + difficulty.toLowerCase()
    });
  }

  // Insert Assessment
  const [newAssessment] = await db.insert(assessments).values({
    title,
    competencyId: competencyId || null,
    sourceMaterialName: comp ? `${comp.name} Training Material v1` : 'Standard General Core Statistics',
    blueprint: {
      bloomDistribution,
      difficultyDistribution,
      generatedAt: new Date()
    },
    totalQuestions: generatedQuestions.length
  }).returning();

  // Insert Questions
  const insertedQuestions = [];
  for (const q of generatedQuestions) {
    const [inserted] = await db.insert(questions).values({
      assessmentId: newAssessment.id,
      stem: q.stem,
      options: q.options,
      explanation: q.explanation,
      bloomLevel: q.bloomLevel,
      intentHash: q.intentHash
    }).returning();
    insertedQuestions.push(inserted);
  }

  return sendSuccess(res, {
    assessment: {
      ...newAssessment,
      competencyName: comp ? comp.name : 'General Competencies',
      competencyCode: compCode
    },
    questions: insertedQuestions
  }, 'Assessment blueprint and questions created successfully', 201);
});
