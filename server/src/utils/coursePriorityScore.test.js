import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCoursePriorityScore,
  calculateDeadlineScore,
  calculateRoleCriticality,
  FORMULA_VERSION,
} from './coursePriorityScore.js';

test('coursePriorityScore: returns deterministic score and formula version', () => {
  const result = computeCoursePriorityScore({
    gapSeverity: 2.5,
    urgencyLevel: 'HIGH',
    officerCadre: 'ISS Officer',
    targetAudience: ['ISS Officer', 'Statistical Officer'],
    nominationDeadline: '2026-09-15',
    semanticRelevance: 0.9,
    isMandatory: true,
    currentDate: '2026-09-10',
  });

  assert.ok(result.score > 0.8, 'High gap + mandatory + direct cadre match should produce high priority score');
  assert.equal(result.formulaVersion, FORMULA_VERSION);
  assert.equal(result.priorityLevel, 'CRITICAL');
  assert.equal(result.factors.roleCriticality, 1.0);
});

test('calculateDeadlineScore: assigns higher score for near deadlines', () => {
  const scoreToday = calculateDeadlineScore('2026-09-10', '2026-09-10');
  const scoreIn3Days = calculateDeadlineScore('2026-09-13', '2026-09-10');
  const scoreIn60Days = calculateDeadlineScore('2026-11-10', '2026-09-10');

  assert.equal(scoreToday, 1.0);
  assert.equal(scoreIn3Days, 0.95);
  assert.ok(scoreIn3Days > scoreIn60Days);
});

test('calculateRoleCriticality: gives 1.0 for direct match and lower for unmatched', () => {
  const match = calculateRoleCriticality('SSS Analyst', ['SSS Analyst', 'ISS Officer']);
  const noMatch = calculateRoleCriticality('Finance Officer', ['ISS Officer', 'Data Scientist']);

  assert.equal(match, 1.0);
  assert.equal(noMatch, 0.4);
});
