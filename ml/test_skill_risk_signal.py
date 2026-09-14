import unittest
from datetime import datetime, timedelta

from pipelines.skill_risk_signal import build_skill_risk_signals


class SkillRiskSignalTests(unittest.TestCase):
    def setUp(self):
        start = datetime(2025, 1, 1)
        self.history = [
            {
                "observed_at": (start + timedelta(days=30 * index)).isoformat(),
                "new_score": 2 + index * 0.05,
            }
            for index in range(12)
        ]
        self.gap = {
            "competency": "Statistical Analysis",
            "category": "Statistical",
            "total_gaps": 2,
            "average_severity": 3,
            "required_level": 5,
        }

    def test_sparse_history_does_not_emit_risk(self):
        result = build_skill_risk_signals([self.gap], {self.gap["competency"]: []})
        self.assertEqual(result["status"], "INSUFFICIENT_HISTORY")
        self.assertNotIn("predictedDeficitRisk", result["signals"][0])

    def test_sufficient_history_compares_three_algorithms(self):
        result = build_skill_risk_signals(
            [self.gap], {self.gap["competency"]: self.history}
        )
        comparison = result["modelComparisons"][self.gap["competency"]]
        self.assertEqual(result["status"], "READY")
        self.assertEqual(len(comparison["comparison"]), 3)
        self.assertIn(comparison["selected_algorithm"], {
            "PERSISTENCE_BASELINE",
            "LINEAR_TREND",
            "RANDOM_FOREST",
        })


if __name__ == "__main__":
    unittest.main()