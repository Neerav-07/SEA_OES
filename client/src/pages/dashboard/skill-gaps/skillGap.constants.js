export const GAP_CATEGORIES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NO_GAP: "no gap",
  INSUFFICIENT_EVIDENCE: "insufficient evidence",
};

export function getGapCategoryClass(category) {
  switch (category) {
    case GAP_CATEGORIES.CRITICAL:
      return "bg-red-50 text-red-700";
    case GAP_CATEGORIES.HIGH:
      return "bg-orange-50 text-orange-700";
    case GAP_CATEGORIES.MEDIUM:
      return "bg-amber-50 text-amber-700";
    case GAP_CATEGORIES.INSUFFICIENT_EVIDENCE:
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-emerald-50 text-emerald-700";
  }
}
