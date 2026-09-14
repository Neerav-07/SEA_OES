const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function generateAssessment({
  sourceText,
  competencyName,
  competencyCategory,
  bloomDistribution,
  existingIntentHashes = [],
}) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/generate-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(12000), // 12-second fast timeout
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
      const error = new Error(
        `ML assessment generation failed (${response.status}): ${errorText}`,
      );
      error.statusCode = response.status;
      error.responseBody = errorText;
      throw error;
    }

    return response.json();
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      const timeoutErr = new Error(
        "ML assessment generation timed out after 12 seconds. The ML inference engine is temporarily busy. Please retry.",
      );
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

// New function to fetch LLM provider status with bounded timeout
export async function getProviderStatus() {
  const response = await fetch(`${ML_SERVICE_URL}/api/ml/provider-status`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(5000), // 5-second timeout
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider status request failed (${response.status}): ${errorText}`);
  }
  return response.json();
}

export async function mapTextToCompetencies({ text, topK = 3 }) {
  const response = await fetch(`${ML_SERVICE_URL}/api/ml/map-competencies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, top_k: topK }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ML competency mapping failed (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}

export async function getCourseRecommendations({ skillGaps = [] }) {
  const response = await fetch(`${ML_SERVICE_URL}/api/ml/recommend-courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill_gaps: skillGaps }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ML course recommendation failed (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}
