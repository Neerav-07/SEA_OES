import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestionCandidate } from './aiEvaluation.service.js';

const evidence = [{ sourceChunkId: 'chunk-1', content: 'Sampling strata must be verified.' }];
test('accepts a grounded single-answer candidate', () => {
  const result = evaluateQuestionCandidate({ correctAnswer: 'A', evidenceReferences: ['chunk-1'], options: [{ id: 'A', text: 'Sampling strata must be verified.', correct: true }, { id: 'B', text: 'Other', correct: false }] }, evidence);
  assert.equal(result.passed, true);
});
test('rejects ambiguous or uncited candidate', () => {
  const result = evaluateQuestionCandidate({ correctAnswer: 'A', evidenceReferences: [], options: [{ id: 'A', text: 'x', correct: true }, { id: 'B', text: 'y', correct: true }] }, evidence);
  assert.equal(result.passed, false);
  assert.equal(result.ambiguous, true);
});
