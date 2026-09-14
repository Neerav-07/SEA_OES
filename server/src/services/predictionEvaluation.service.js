export function summarizePredictionEvaluation(comparison) {
  if (!comparison?.comparison?.length) return null;

  const baseline = comparison.comparison.find(
    (item) => item.algorithm === "PERSISTENCE_BASELINE",
  );
  const selected = comparison.comparison.find(
    (item) => item.algorithm === comparison.selected_algorithm,
  );
  if (!baseline || !selected) return null;

  return {
    selectedAlgorithm: comparison.selected_algorithm,
    evaluation: comparison.evaluation,
    selectedMae: selected.mae,
    baselineMae: baseline.mae,
    improvementOverBaseline: Number(
      ((baseline.mae - selected.mae) / Math.max(baseline.mae, 0.0001)).toFixed(
        4,
      ),
    ),
  };
}
