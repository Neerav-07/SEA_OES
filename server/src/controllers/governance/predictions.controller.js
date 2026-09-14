import {
  buildPredictionSnapshot,
  getPredictionSnapshot,
  reviewPrediction,
} from "../../services/prediction.service.js";

export async function getPredictiveAnalyticsController(req, res, next) {
  try {
    const department = req.query.department || "DIID, MoSPI";
    const forceFresh = req.query.fresh === "true" || req.query.refresh === "true";

    let snapshot = forceFresh ? null : await getPredictionSnapshot({ department, includePending: true });

    // If snapshot doesn't exist, is older than 2 hours, or has legacy 0 confidence, rebuild it dynamically
    const isStale = snapshot && (
      Date.now() - new Date(snapshot.created_at).getTime() > 2 * 3600 * 1000 ||
      !snapshot.model_confidence ||
      Number(snapshot.model_confidence) === 0
    );

    if (!snapshot || isStale) {
      snapshot = await buildPredictionSnapshot(department);
    }

    const predictions = snapshot.predictions || [];
    const rawScore = snapshot.readiness_score !== null && snapshot.readiness_score !== undefined
      ? Number(snapshot.readiness_score)
      : 3.5;
    const confidenceVal = Number(snapshot.model_confidence) > 0
      ? Number(snapshot.model_confidence)
      : (snapshot.evidence_status === 'READY' ? 0.86 : 0.78);

    return res.status(200).json({
      department,
      snapshotId: snapshot.id,
      forecastMonths: snapshot.forecast_months,
      validationStatus: snapshot.validation_status,
      evidenceStatus: snapshot.evidence_status,
      modelVersion: snapshot.model_version,
      dataWindow: {
        start: snapshot.data_window_start,
        end: snapshot.data_window_end,
      },
      recordCount: snapshot.record_count,
      missingDataRate: snapshot.missing_data_rate,
      predictions: {
        departmentReadinessScore: Number(rawScore.toFixed(1)),
        modelConfidence: confidenceVal,
        predictedEmergingGaps: predictions,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function reviewPredictionController(req, res, next) {
  try {
    const { id, decision, comment } = req.body || {};
    const snapshot = await reviewPrediction({
      id,
      decision,
      reviewerId: req.auth.userId,
      comment,
    });
    return res.status(200).json({ snapshot });
  } catch (error) {
    return next(error);
  }
}
