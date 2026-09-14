import { questionAiEvaluations } from '../db/schema/index.js';

const VERSION = 'grounding-evaluator-v1';
export function evaluateQuestionCandidate(candidate, evidence = []) {
  const source = evidence.map((item) => String(item.content || '').toLowerCase()).join('\n');
  const answer = String(candidate.correctAnswer || '').trim();
  const options = candidate.options || [];
  const selected = options.filter((option) => option.correct === true || option.isCorrect === true || option.is_correct === true);
  const answerOption = options.find((option) => option.id === answer || option.text === answer);
  const citationSupported = Array.isArray(candidate.evidenceReferences) && candidate.evidenceReferences.length > 0 && candidate.evidenceReferences.every((id) => evidence.some((item) => item.sourceChunkId === id));
  const answerSupported = Boolean(answerOption) && (source.includes(String(answerOption.text || '').toLowerCase()) || citationSupported);
  const ambiguous = selected.length !== 1 || !answerOption || (selected.length === 1 && selected[0].id !== answerOption.id);
  const issues = [];
  if (!citationSupported) issues.push('Citations do not resolve to retrieved source chunks.');
  if (!answerSupported) issues.push('Correct answer is not traceable to source evidence.');
  if (ambiguous) issues.push('Question has no single unambiguous correct answer.');
  return { passed: issues.length === 0, answerSupported, claimsSupported: citationSupported, citationSupported, ambiguous, issues, evaluatorVersion: VERSION };
}

export async function persistAiEvaluation(db, questionVersionId, evidence, result) {
  const [row] = await db.insert(questionAiEvaluations).values({
    questionVersionId, provider: 'deterministic-grounding', model: null, promptVersion: VERSION,
    sourceIds: evidence.map((item) => item.sourceChunkId), result, failures: result.issues, status: result.passed ? 'PASSED' : 'FAILED',
  }).returning();
  return row;
}
