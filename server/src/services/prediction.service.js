import { getDb } from "../db/index.js";
import { sql } from "drizzle-orm";
import { summarizePredictionEvaluation } from "./predictionEvaluation.service.js";

const FORECAST_MONTHS = 6;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

function rows(result) {
  return result.rows || result || [];
}

const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));

export async function buildPredictionSnapshot(department) {
  const db = getDb();
  const deptLower = (department || "").toLowerCase();
  const deptPattern = deptLower.includes("diid")
    ? "%DIID%"
    : deptLower.includes("nsso")
    ? "%NSSO%"
    : deptLower.includes("fod") || deptLower.includes("field operations")
    ? "%FOD%"
    : deptLower.includes("nad") || deptLower.includes("national accounts")
    ? "%NAD%"
    : `%${department}%`;

  const gapResult = await db.execute(sql`
        SELECT c.id AS competency_id, c.name AS competency, c.category,
           COUNT(sg.id)::int AS total_gaps,
           AVG(sg.gap_severity)::real AS avg_severity,
          AVG(sg.required_level - sg.estimated_level)::real AS avg_delta,
          AVG(sg.required_level)::real AS required_level
    FROM skill_gaps sg
    JOIN officials o ON o.id = sg.official_id
    JOIN competencies c ON c.id = sg.competency_id
    WHERE o.department ILIKE ${deptPattern}
    GROUP BY c.id, c.name, c.category
    ORDER BY avg_severity DESC, total_gaps DESC
    LIMIT 10
  `);

  const historyResult = await db.execute(sql`
    SELECT ch.competency_id, c.name AS competency, ch.new_score,
           ch.created_at
    FROM competency_history ch
    JOIN competencies c ON c.id = ch.competency_id
    JOIN officials o ON o.id = ch.official_id
    WHERE o.department ILIKE ${deptPattern}
      AND ch.created_at >= NOW() - INTERVAL '12 months'
    ORDER BY ch.created_at ASC
  `);
  const historyRows = rows(historyResult);
  const history = new Map();
  for (const item of historyRows) {
    const entries = history.get(item.competency) || [];
    entries.push({
      observed_at: item.created_at,
      new_score: Number(item.new_score),
    });
    history.set(item.competency, entries);
  }

  const gapRows = rows(gapResult);
  let modelPredictions = [];
  let modelType = "Evidence-gated signal";
  let trainingSamples = 0;
  let modelResult = {
    status: "INSUFFICIENT_HISTORY",
    modelVersion: "skill-risk-v1",
    modelConfidence: null,
    modelComparisons: {},
  };
  try {
    const modelResponse = await fetch(
      `${ML_SERVICE_URL}/api/ml/predict-trends`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          forecast_months: FORECAST_MONTHS,
          skill_gaps: gapRows.map((gap) => ({
            competency: gap.competency,
            total_gaps: Number(gap.total_gaps || 0),
            average_severity: Number(gap.avg_severity || 0),
            required_level: Number(gap.required_level || 5),
          })),
          history: historyRows.map((item) => ({
            competency: item.competency,
            observed_at: item.created_at,
            new_score: Number(item.new_score),
          })),
        }),
      },
    );
    if (modelResponse.ok) {
      modelResult = await modelResponse.json();
      modelPredictions = modelResult.predictedEmergingGaps || [];
      modelType = modelResult.modelVersion || "skill-risk-v1";
      trainingSamples = Number(modelResult.trainingSamples || 0);
    }
  } catch (error) {
    console.warn(
      "ML trend model unavailable; using analytical fallback:",
      error.message,
    );
  }

  const predictedEmergingGaps = gapRows.map((gap) => {
    const modelPrediction = modelPredictions.find(
      (item) => item.competency === gap.competency,
    );

    return {
      competency: gap.competency,
      category: gap.category,
      totalGaps: Number(gap.total_gaps || 0),
      averageSeverity: Number(Number(gap.avg_severity || 0).toFixed(2)),
      predictedDeficitRisk: modelPrediction?.predictedDeficitRisk ?? null,
      trend: modelPrediction?.trend || "INSUFFICIENT_HISTORY",
      trajectoryDelta: modelPrediction?.trajectoryDelta ?? null,
      coverage: modelPrediction?.coverage ?? null,
      recordCount: modelPrediction?.recordCount || 0,
      evidenceSufficiency:
        modelPrediction?.evidenceSufficiency || "INSUFFICIENT_HISTORY",
      selectedAlgorithm: modelPrediction?.selectedAlgorithm || null,
      evaluation: summarizePredictionEvaluation(
        modelResult.modelComparisons?.[gap.competency],
      ),
      recommendedCapacityBuilding: `Prioritise ${gap.competency} learning pathways and validate completion evidence before reassessment.`,
    };
  });

  const totalGaps = predictedEmergingGaps.reduce(
    (sum, item) => sum + item.totalGaps,
    0,
  );
  const weightedSeverity = predictedEmergingGaps.reduce(
    (sum, item) => sum + item.averageSeverity * item.totalGaps,
    0,
  );
  const readinessScore = totalGaps > 0
    ? Number(clamp(5 - weightedSeverity / totalGaps, 1, 5).toFixed(1))
    : 3.5;
  const dates = historyRows
    .map((item) => new Date(item.created_at).getTime())
    .filter(Number.isFinite);
  const missingDataRate = gapRows.length
    ? Number(
        (
          gapRows.filter((gap) => !history.has(gap.competency)).length /
          gapRows.length
        ).toFixed(4),
      )
    : 1;

  const calculatedConfidence =
    modelResult.modelConfidence != null
      ? Number(modelResult.modelConfidence)
      : (modelResult.status === "READY" ? 0.86 : 0.75);

  const [snapshot] = rows(
    await db.execute(sql`
    INSERT INTO prediction_snapshots
      (department, forecast_months, predictions, readiness_score, model_confidence, validation_status, model_type, training_samples, data_source, data_window_start, data_window_end, record_count, missing_data_rate, model_version, evidence_status)
    VALUES
      (${department}, ${FORECAST_MONTHS}, ${JSON.stringify(predictedEmergingGaps)}::jsonb, ${readinessScore}, ${calculatedConfidence}, 'APPROVED', ${modelType}, ${trainingSamples}, 'official skill gaps and competency history', ${dates.length ? new Date(Math.min(...dates)) : null}, ${dates.length ? new Date(Math.max(...dates)) : null}, ${historyRows.length}, ${missingDataRate}, ${modelResult.modelVersion || "skill-risk-v1"}, ${modelResult.status || "READY"})
    RETURNING *
  `),
  );

  return snapshot;
}

export async function getPredictionSnapshot({
  department,
  includePending = false,
}) {
  const db = getDb();
  const statusClause = includePending
    ? sql``
    : sql`AND validation_status = 'APPROVED'`;
  const result = await db.execute(sql`
    SELECT * FROM prediction_snapshots
    WHERE department = ${department} ${statusClause}
    ORDER BY created_at DESC
    LIMIT 1
  `);
  return rows(result)[0] || null;
}

export async function reviewPrediction({ id, decision, reviewerId, comment }) {
  const db = getDb();
  const status =
    decision === "APPROVE"
      ? "APPROVED"
      : decision === "REJECT"
        ? "REJECTED"
        : null;
  if (!status) {
    const error = new Error("Decision must be APPROVE or REJECT.");
    error.statusCode = 400;
    throw error;
  }
  if (typeof comment !== "string" || !comment.trim()) {
    const error = new Error("A non-empty review comment is required.");
    error.statusCode = 400;
    throw error;
  }
  const result = await db.execute(sql`
    UPDATE prediction_snapshots
    SET validation_status = ${status}, reviewed_by = ${reviewerId}, reviewed_at = NOW(),
        review_comment = ${comment.trim()}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `);
  const snapshot = rows(result)[0];
  if (!snapshot) {
    const error = new Error("Prediction snapshot not found.");
    error.statusCode = 404;
    throw error;
  }
  return snapshot;
}
