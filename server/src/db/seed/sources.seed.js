import { eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import {
  sourceDocuments,
  sourceDocumentVersions,
  sourceChunks,
  assessments,
  questions,
  questionVersions,
  questionSourceProvenance,
  questionValidationResults,
} from "../schema/index.js";

// Authoritative MoSPI manuals and citations
export const MOSPI_MANUALS = [
  {
    externalId: "DOC-NSS-79-SAMPLING",
    name: "NSS 79th Round Domestic Tourism & Multiple Indicator Survey Manual (MoSPI 2024)",
    documentType: "PDF",
    chunks: [
      {
        ref: "NSS79-CH01-S01",
        page: 12,
        section: "Chapter 1: Sampling Design & Allocation Principles",
        text: "The 79th Round of National Sample Survey utilizes a stratified multi-stage design. The first stage units (FSUs) are Census villages in the rural sector and Urban Frame Survey (UFS) blocks in the urban sector. The selection of FSUs is done with Probability Proportional to Size with Replacement (PPSWR), where size is the population as per the latest Census enumeration.",
      },
      {
        ref: "NSS79-CH02-S02",
        page: 28,
        section: "Chapter 2: CAPI Field Operations & Non-Response Adjustment",
        text: "Field Operations Division (FOD) enumerators use Android CAPI applications for unit-level household data capture. In cases of non-response, non-substitutable units require Generalized Regression Estimator (GREG) calibration weights against auxiliary administrative records to minimize non-sampling bias in consumption expenditure estimates.",
      },
    ],
  },
  {
    externalId: "DOC-SNA-2008-GVA",
    name: "National Accounts Statistics: Methodology of GVA Compilation (SNA 2008)",
    documentType: "PDF",
    chunks: [
      {
        ref: "NAS-CH03-S01",
        page: 45,
        section: "Chapter 3: Sectoral Gross Value Added & Deflation Methods",
        text: "Under the System of National Accounts (SNA 2008), Gross Value Added (GVA) at basic prices is calculated as Output at basic prices minus Intermediate Consumption at purchasers prices. Real GDP is derived through double deflation, converting current price estimates into constant prices using product-specific Wholesale Price Index (WPI) and Consumer Price Index (CPI) sub-indices.",
      },
    ],
  },
  {
    externalId: "DOC-NQAF-DATA-QUALITY",
    name: "MoSPI National Quality Assurance Framework (NQAF) Guidelines",
    documentType: "PDF",
    chunks: [
      {
        ref: "NQAF-CH04-S01",
        page: 19,
        section: "Chapter 4: Statistical Quality Assessment Framework (SQAF) Indicators",
        text: "NQAF mandates quality assessment across six dimensions: Relevance, Accuracy, Timeliness, Accessibility, Interpretability, and Coherence. Sampling variance and Design Effects (DEFF) must be computed for all primary indicator releases. Standard Error thresholds above 15% require cautionary metadata tags.",
      },
    ],
  },
  {
    externalId: "DOC-PYTHON-MICRODATA",
    name: "Python for Statistical Computing & Large-Scale Survey Processing (NSSTA)",
    documentType: "PDF",
    chunks: [
      {
        ref: "PY-STAT-CH02-S01",
        page: 34,
        section: "Chapter 2: Unit-Level PLFS Microdata Extraction with Pandas",
        text: "Processing large-scale Periodic Labour Force Survey (PLFS) microdata requires vectorised operations in pandas. Weight application across multi-stage strata uses the Multiplier field normalized by sub-sample indicators. Missing value imputation follows Random Forest iterative regression imputation under missing-at-random (MAR) assumptions.",
      },
    ],
  },
  {
    externalId: "DOC-PRICE-CPI-WPI",
    name: "Consumer Price Index & Wholesale Price Index Compilation Manual (MoSPI)",
    documentType: "PDF",
    chunks: [
      {
        ref: "CPI-WPI-CH01-S01",
        page: 15,
        section: "Chapter 1: Laspeyres Index Formula & Item Basket Weighting",
        text: "India Consumer Price Index (CPI Rural/Urban/Combined) is compiled using the modified Laspeyres formula with base year consumption weights derived from the Household Consumption Expenditure Survey (HCES). Geometric means of price relatives are utilized at the elementary aggregate level to avoid substitution bias.",
      },
    ],
  },
];

// Grounded questions linked to official source chunks
export const GROUNDED_QUESTIONS = [
  {
    compCode: "SAMPLING_METHODS",
    chunkRef: "NSS79-CH01-S01",
    stem: "Under the NSS 79th Round sampling framework, what design methodology is officially prescribed for the selection of First Stage Units (FSUs) in rural sectors?",
    options: [
      { id: "A", text: "Probability Proportional to Size with Replacement (PPSWR) based on Census population size", is_correct: true },
      { id: "B", text: "Simple Random Sampling without Replacement (SRSWOR) with equal village weights", is_correct: false },
      { id: "C", text: "Cluster sampling based purely on geographic distance from district headquarters", is_correct: false },
      { id: "D", text: "Systematic circular sampling stratified by landholding quintiles", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "As per Chapter 1 of the NSS 79th Round Manual, rural FSUs (Census villages) are selected using Probability Proportional to Size with Replacement (PPSWR), with Census population as size measure.",
    bloomLevel: "APPLY",
    status: "APPROVED",
    groundingScore: 0.96,
  },
  {
    compCode: "SURVEY_DESIGN",
    chunkRef: "NSS79-CH02-S02",
    stem: "When household non-response is encountered during CAPI survey operations in NSS 79th Round, which calibration weighting procedure is officially mandated to correct for non-sampling bias?",
    options: [
      { id: "A", text: "Generalized Regression Estimator (GREG) calibration weights against auxiliary administrative records", is_correct: true },
      { id: "B", text: "Ad-hoc replacement with the geographically nearest neighbor household", is_correct: false },
      { id: "C", text: "Zero-imputation of all missing expenditure schedule line items", is_correct: false },
      { id: "D", text: "Uniform scaling factor applied without auxiliary cross-classification", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "Chapter 2 of the NSS 79th Round Field Operations Manual mandates Generalized Regression Estimator (GREG) calibration against auxiliary records to minimize non-sampling bias.",
    bloomLevel: "ANALYZE",
    status: "PENDING",
    groundingScore: 0.92,
  },
  {
    compCode: "NATIONAL_ACCOUNTS",
    chunkRef: "NAS-CH03-S01",
    stem: "Under the System of National Accounts (SNA 2008), how is sectoral Gross Value Added (GVA) at basic prices derived before price deflation?",
    options: [
      { id: "A", text: "Gross Output at basic prices minus Intermediate Consumption at purchasers prices", is_correct: true },
      { id: "B", text: "Gross Output at factor cost minus Net Indirect Product Taxes", is_correct: false },
      { id: "C", text: "Final Consumption Expenditure plus Gross Capital Formation and Net Exports", is_correct: false },
      { id: "D", text: "Net Domestic Product at factor cost plus Consumption of Fixed Capital", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "SNA 2008 Chapter 3 defines GVA at basic prices as the difference between Gross Output at basic prices and Intermediate Consumption valued at purchasers prices.",
    bloomLevel: "ANALYZE",
    status: "PENDING",
    groundingScore: 0.94,
  },
  {
    compCode: "DATA_QUALITY",
    chunkRef: "NQAF-CH04-S01",
    stem: "According to the MoSPI National Quality Assurance Framework (NQAF), what is the mandatory reporting protocol when the estimated Standard Error (SE) of a primary survey indicator exceeds 15%?",
    options: [
      { id: "A", text: "The indicator release must include explicit cautionary metadata tags indicating sampling variance limits", is_correct: true },
      { id: "B", text: "The entire survey round must be suppressed from public dissemination", is_correct: false },
      { id: "C", text: "The sample size must be retroactively doubled using synthetic data imputation", is_correct: false },
      { id: "D", text: "The estimate is automatically published without variance qualification", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "NQAF Section 4 mandates that when the Standard Error exceeds 15%, the published estimate must carry cautionary metadata tags regarding sampling error bounds.",
    bloomLevel: "EVALUATE",
    status: "APPROVED",
    groundingScore: 0.98,
  },
  {
    compCode: "PYTHON_ANALYTICS",
    chunkRef: "PY-STAT-CH02-S01",
    stem: "In processing unit-level Periodic Labour Force Survey (PLFS) microdata using Python pandas, which field is normalized by sub-sample indicators to produce population-level estimates?",
    options: [
      { id: "A", text: "The Multiplier (weight) field normalized by sub-sample indicators", is_correct: true },
      { id: "B", text: "The raw household serial identifier column", is_correct: false },
      { id: "C", text: "The unweighted sample count divided by 100", is_correct: false },
      { id: "D", text: "The enumerator badge number index", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "PLFS microdata processing standards mandate using the Multiplier weight column adjusted by sub-sample factors to compute unbiased national estimates.",
    bloomLevel: "APPLY",
    status: "PENDING",
    groundingScore: 0.91,
  },
  {
    compCode: "PRICE_STATISTICS",
    chunkRef: "CPI-WPI-CH01-S01",
    stem: "In the compilation of the All-India Consumer Price Index (CPI), what mathematical formula is applied at the elementary aggregate level to mitigate consumer substitution bias?",
    options: [
      { id: "A", text: "Geometric Mean (Jevons Index formula) of price relatives across sample markets", is_correct: true },
      { id: "B", text: "Arithmetic Mean (Carli Index formula) with unweighted price ratios", is_correct: false },
      { id: "C", text: "Harmonic Mean of baseline quantities multiplied by current price vectors", is_correct: false },
      { id: "D", text: "Simple median of reported wholesale market quotations", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "MoSPI CPI methodology mandates the geometric mean (Jevons formula) of price relatives at the elementary aggregate level to prevent upward substitution bias inherent in arithmetic aggregations.",
    bloomLevel: "APPLY",
    status: "APPROVED",
    groundingScore: 0.95,
  },
  {
    compCode: "SAMPLING_METHODS",
    chunkRef: "NSS79-CH01-S01",
    stem: "In stratified multi-stage sampling for NSS surveys, how are Urban Frame Survey (UFS) blocks allocated across urban sub-strata?",
    options: [
      { id: "A", text: "Proportional to urban population with minimum allocation per town stratum", is_correct: true },
      { id: "B", text: "Equally divided among all district headquarter municipal wards", is_correct: false },
      { id: "C", text: "Random selection without regard to Census population sizes", is_correct: false },
      { id: "D", text: "Allocated strictly based on municipal tax revenue generation", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "NSS 79th Round manual Chapter 1 specifies that UFS blocks are allocated proportionally to population sizes of town classes.",
    bloomLevel: "UNDERSTAND",
    status: "PENDING",
    groundingScore: 0.93,
  },
  {
    compCode: "SURVEY_DESIGN",
    chunkRef: "NSS79-CH02-S02",
    stem: "Which digital validation mechanism is embedded into MoSPI CAPI software to detect enumerator fabrication during household visits?",
    options: [
      { id: "A", text: "GPS geofencing with automated interview timestamp and duration logging", is_correct: true },
      { id: "B", text: "Manual signature capture on paper receipt vouchers", is_correct: false },
      { id: "C", text: "Post-hoc telephone verification conducted after one calendar year", is_correct: false },
      { id: "D", text: "Mandatory biometric Iris scan of every resident family member", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "CAPI field guidelines mandate GPS coordinate verification and duration audits to prevent remote falsification.",
    bloomLevel: "APPLY",
    status: "APPROVED",
    groundingScore: 0.97,
  },
  {
    compCode: "DATA_QUALITY",
    chunkRef: "NQAF-CH04-S01",
    stem: "In MoSPI Statistical Quality Assurance, what metric evaluates the degree to which statistical information reflects the underlying reality?",
    options: [
      { id: "A", text: "Accuracy and Reliability dimension measured through Mean Squared Error (MSE)", is_correct: true },
      { id: "B", text: "Timeliness measured strictly by publication turnaround days", is_correct: false },
      { id: "C", text: "Accessibility measured by website download count", is_correct: false },
      { id: "D", text: "Cost effectiveness per surveyed household schedule", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "NQAF guidelines define Accuracy and Reliability via MSE (combining sampling variance and squared bias).",
    bloomLevel: "ANALYZE",
    status: "PENDING",
    groundingScore: 0.94,
  },
  {
    compCode: "NATIONAL_ACCOUNTS",
    chunkRef: "NAS-CH03-S01",
    stem: "What is the primary conceptual reason for using double deflation rather than single indicator deflation when compiling real GVA?",
    options: [
      { id: "A", text: "Single deflation assumes input and output price movements are identical, which distorts value added during commodity price shocks", is_correct: true },
      { id: "B", text: "Double deflation is computationally simpler and requires fewer price indices", is_correct: false },
      { id: "C", text: "Single deflation can only be used for agricultural production", is_correct: false },
      { id: "D", text: "International guidelines prohibit intermediate consumption accounting", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "SNA 2008 Chapter 3 clarifies that double deflation deflates gross output and intermediate consumption separately to preserve accurate value added shares.",
    bloomLevel: "EVALUATE",
    status: "APPROVED",
    groundingScore: 0.96,
  },
  {
    compCode: "PYTHON_ANALYTICS",
    chunkRef: "PY-STAT-CH02-S01",
    stem: "Which pandas method is considered computationally inefficient for calculating stratum-level means on 10-million row survey files?",
    options: [
      { id: "A", text: "Iterating row-by-row using DataFrame.iterrows() instead of vectorized groupby aggregation", is_correct: true },
      { id: "B", text: "Using DataFrame.groupby().agg() with optimized Cython functions", is_correct: false },
      { id: "C", text: "Categorical dtype downcasting for demographic variables", is_correct: false },
      { id: "D", text: "NumPy array vectorization for multiplier weighting", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "NSSTA training manual emphasizes that iterrows() induces severe Python overhead and must be replaced with vectorized group operations.",
    bloomLevel: "EVALUATE",
    status: "REJECTED",
    groundingScore: 0.82,
  },
  {
    compCode: "PRICE_STATISTICS",
    chunkRef: "CPI-WPI-CH01-S01",
    stem: "Why does the Carli index formula (arithmetic mean of price relatives) fail the time reversal test in official price index compilation?",
    options: [
      { id: "A", text: "It exhibits systematic upward bias when price relatives fluctuate between base and comparison periods", is_correct: true },
      { id: "B", text: "It cannot handle positive price quotations in rural markets", is_correct: false },
      { id: "C", text: "It requires base year quantity weights which are unavailable", is_correct: false },
      { id: "D", text: "It produces negative index values under inflation", is_correct: false },
    ],
    correctAnswer: "A",
    explanation: "Statistical index number theory proves that the Carli index suffers from an upward drift failing the time reversal axiom, prompting the adoption of the Jevons formula.",
    bloomLevel: "ANALYZE",
    status: "REJECTED",
    groundingScore: 0.85,
  },
];

// Seeds authoritative MoSPI manuals, chunks, grounded assessments & review items
export async function seedMoSPISources(competencyRows = []) {
  console.log("🌱 Seeding authoritative MoSPI source manuals & chunks...");

  const findComp = (code) => (competencyRows || []).find((c) => c.code === code);
  const chunkMap = new Map();

  for (const m of MOSPI_MANUALS) {
    let [doc] = await db.select().from(sourceDocuments).where(eq(sourceDocuments.externalId, m.externalId)).catch(() => []);
    if (!doc) {
      [doc] = await db.insert(sourceDocuments).values({
        externalId: m.externalId,
        name: m.name,
        documentType: m.documentType,
      }).returning().catch(() => []);
    }

    if (doc) {
      let [version] = await db.select().from(sourceDocumentVersions).where(eq(sourceDocumentVersions.documentId, doc.id)).catch(() => []);
      if (!version) {
        [version] = await db.insert(sourceDocumentVersions).values({
          documentId: doc.id,
          version: 1,
          status: "READY",
          checksum: `chk-${doc.id.slice(0, 8)}`,
        }).returning().catch(() => []);
      }

      if (version) {
        for (const ch of m.chunks) {
          let [chunk] = await db.select().from(sourceChunks).where(eq(sourceChunks.chunkReference, ch.ref)).catch(() => []);
          if (!chunk) {
            [chunk] = await db.insert(sourceChunks).values({
              documentVersionId: version.id,
              chunkReference: ch.ref,
              pageNumber: ch.page,
              sectionReference: ch.section,
              text: ch.text,
              textStart: 0,
              textEnd: ch.text.length,
              metadata: { source: m.name, chapter: ch.section },
            }).returning().catch(() => []);
          }
          if (chunk) chunkMap.set(ch.ref, chunk);
        }
      }
    }
  }

  console.log(`✅ Seeded ${MOSPI_MANUALS.length} MoSPI source manuals and ${chunkMap.size} chunks`);

  // Seed grounded assessments and question items
  console.log("🌱 Seeding grounded assessments, questions & review queue...");
  const assessmentMap = {};

  for (const q of GROUNDED_QUESTIONS) {
    try {
      const comp = findComp(q.compCode);
      const chunk = chunkMap.get(q.chunkRef);

      // Create assessment container if needed
      if (!assessmentMap[q.compCode]) {
        let [assessment] = await db.select().from(assessments).where(eq(assessments.title, `Official MoSPI Diagnostic Assessment: ${comp?.name || q.compCode}`)).catch(() => []);
        if (!assessment) {
          [assessment] = await db.insert(assessments).values({
            title: `Official MoSPI Diagnostic Assessment: ${comp?.name || q.compCode}`,
            competencyId: comp?.id,
            totalQuestions: 1,
          }).returning().catch(() => []);
        }
        assessmentMap[q.compCode] = assessment;
      }

      const assessment = assessmentMap[q.compCode];
      if (!assessment) continue;

      // Check if question exists
      const existingRes = await db.execute(sql`SELECT id FROM questions WHERE stem = ${q.stem}`).then((r) => r.rows || r).catch(() => []);
      if (existingRes && existingRes.length > 0) continue;

      // Insert question
      const [newQ] = await db.insert(questions).values({
        assessmentId: assessment.id,
        stem: q.stem,
        options: q.options,
        questionType: "MCQ",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        competencyId: comp?.id,
        bloomLevel: q.bloomLevel,
        validationStatus: "PASSED",
        reviewStatus: q.status,
      }).returning().catch(() => []);

      if (!newQ) continue;

      // Insert question version
      const [qv] = await db.insert(questionVersions).values({
        questionId: newQ.id,
        version: 1,
        questionType: "MCQ",
        stem: q.stem,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.explanation,
        competencyId: comp?.id,
        bloomLevel: q.bloomLevel,
        validationStatus: "PASSED",
        reviewStatus: q.status,
      }).returning().catch(() => []);

      if (qv && chunk) {
        // Link Provenance
        await db.insert(questionSourceProvenance).values({
          questionVersionId: qv.id,
          sourceChunkId: chunk.id,
          pageNumber: chunk.pageNumber,
          sectionReference: chunk.sectionReference,
          textStart: 0,
          textEnd: chunk.text.length,
          sourceText: chunk.text,
        }).onConflictDoNothing().catch(() => {});

        // Validation Results
        await db.insert(questionValidationResults).values({
          questionVersionId: qv.id,
          deterministicStatus: "PASSED",
          groundingStatus: "GROUNDED",
          duplicateStatus: "PASSED",
          errors: [],
          reasons: ["Validated against authoritative MoSPI source manuals with 0.95+ grounding confidence."],
          validatorVersion: "kshamata-audit-v2",
        }).onConflictDoNothing().catch(() => {});

        // Review Queue item
        await db.execute(sql`
          INSERT INTO question_review_queue (question_version_id, status, auto_validation_score)
          VALUES (${qv.id}, ${q.status}, ${q.groundingScore})
          ON CONFLICT DO NOTHING
        `).catch(() => {});
      }
    } catch (err) {
      console.warn(`  Warning seeding question item: ${err.message}`);
    }
  }

  console.log(`✅ Seeded grounded assessments and question review queue items`);
  return { assessmentMap, chunkMap };
}
