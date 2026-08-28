const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function generateAssessment({
  sourceText,
  competencyName,
  competencyCategory,
  bloomDistribution,
  existingIntentHashes = [],
}) {
  const response = await fetch(`${ML_SERVICE_URL}/api/ml/generate-assessment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_text: sourceText,
      competency_name: competencyName,
      competency_category: competencyCategory,
      bloom_distribution: bloomDistribution,
      existing_intent_hashes: existingIntentHashes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `ML assessment generation failed (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}
