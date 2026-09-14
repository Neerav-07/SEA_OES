import api from "./api.js";

export async function getProviderStatus() {
  try {
    const response = await api.get("/ml/provider-status");
    return (
      response?.data || {
        provider: "LOCAL",
        status: "READY",
        details: "ML service status is available.",
      }
    );
  } catch (error) {
    return {
      provider: "LOCAL",
      status: "READY",
      details:
        "ML service status is unavailable; using local default configuration.",
    };
  }
}
