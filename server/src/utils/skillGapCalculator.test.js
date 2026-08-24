import assert from "node:assert/strict";
import test from "node:test";
import { calculateSkillGap, calculateSkillGaps } from "./skillGapCalculator.js";

test("classifies a competency that meets its requirement as no gap", () => {
  const result = calculateSkillGap({
    requirement: { requiredLevel: 3, priority: 3, urgency: 3 },
    estimate: { proficiencyLevel: 3, evidenceSufficiency: 0.9 },
  });

  assert.equal(result.category, "no gap");
  assert.equal(result.gapSeverity, 0);
  assert.equal(result.learningPriority, 0);
});

test("creates a supported critical gap with an explanation", () => {
  const result = calculateSkillGap({
    requirement: {
      requiredLevel: 4,
      priority: 5,
      urgency: 4,
      mandatory: true,
    },
    estimate: { proficiencyLevel: 2, evidenceSufficiency: 0.8 },
  });

  assert.equal(result.category, "critical");
  assert.equal(result.gapSeverity, 2);
  assert.ok(result.learningPriority > 0);
  assert.ok(result.reasons.some((reason) => reason.includes("mandatory")));
});

test("prioritises assessment when evidence is insufficient", () => {
  const result = calculateSkillGap({
    requirement: { requiredLevel: 4, priority: 5, urgency: 4 },
    estimate: { proficiencyLevel: 2, evidenceSufficiency: 0.2 },
  });

  assert.equal(result.category, "insufficient evidence");
  assert.ok(result.assessmentPriority > result.learningPriority);
  assert.ok(result.reasons.some((reason) => reason.includes("insufficient")));
});

test("calculates every requirement and uses an empty estimate safely", () => {
  const results = calculateSkillGaps({
    requirements: [
      { id: "r1", competencyId: "c1", requiredLevel: 2 },
      { id: "r2", competencyId: "c2", requiredLevel: 4 },
    ],
    estimates: [
      {
        id: "e1",
        competencyId: "c1",
        proficiencyLevel: 2,
        evidenceSufficiency: 1,
      },
    ],
  });

  assert.equal(results.length, 2);
  assert.equal(results[0].category, "no gap");
  assert.equal(results[1].category, "insufficient evidence");
  assert.equal(results[1].estimatedLevel, 0);
});
