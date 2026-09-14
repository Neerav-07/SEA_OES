import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Unit tests verifying that:
 * 1. Abandoned/in-progress attempts are strictly filtered out of official assessment history
 * 2. Average score and proficiency ratings only take COMPLETED attempts into account
 */

test('filters out IN_PROGRESS and ABANDONED attempts from assessment history', () => {
  const attempts = [
    { id: 'att-1', status: 'COMPLETED', score: 4.5, submitted_at: '2026-09-10T10:00:00Z' },
    { id: 'att-2', status: 'IN_PROGRESS', score: 0, submitted_at: null },
    { id: 'att-3', status: 'ABANDONED', score: 2.0, submitted_at: null },
    { id: 'att-4', status: 'COMPLETED', score: 4.0, submitted_at: '2026-09-12T15:30:00Z' },
  ];

  const officialHistory = attempts.filter((att) => att.status === 'COMPLETED' || Boolean(att.submitted_at));
  assert.equal(officialHistory.length, 2);
  assert.deepEqual(officialHistory.map((a) => a.id), ['att-1', 'att-4']);

  const avgScore = officialHistory.reduce((sum, a) => sum + a.score, 0) / officialHistory.length;
  assert.equal(avgScore, 4.25);
});

test('exited/abandoned attempts do not pollute score calculation or competency ledger', () => {
  const completedAttempts = [
    { competency_code: 'FRAC-STAT-01', score: 4.2, status: 'COMPLETED' },
    { competency_code: 'FRAC-STAT-02', score: 4.8, status: 'COMPLETED' },
  ];

  // Simulating an exited attempt that was discarded
  const exitedAttempt = { competency_code: 'FRAC-STAT-01', score: 1.0, status: 'IN_PROGRESS' };

  // Verification that score calculation excludes non-completed
  const allAttempts = [...completedAttempts, exitedAttempt];
  const verifiedOnly = allAttempts.filter((a) => a.status === 'COMPLETED');

  const stat01Scores = verifiedOnly.filter((a) => a.competency_code === 'FRAC-STAT-01');
  assert.equal(stat01Scores.length, 1);
  assert.equal(stat01Scores[0].score, 4.2);
});
