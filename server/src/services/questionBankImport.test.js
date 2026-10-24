import assert from 'node:assert/strict';
import test from 'node:test';
import { parseQuestionBankText } from './questionBankImport.js';

test('imports single and multi select questions with wrapped text', () => {
  const result = parseQuestionBankText(`Q1. Which method retrieves
a resource?
A) GET
B) POST
Answer: A

Question 2: Select secure practices.
A. Validate input
B. Use HTTPS
C. Store plain text passwords
Correct Answers: A, B`);
  assert.equal(result.detected, 2);
  assert.equal(result.skipped, 0);
  assert.equal(result.questions[0].prompt, 'Which method retrieves a resource?');
  assert.equal(result.questions[0].type, 'SINGLE');
  assert.deepEqual(result.questions[0].options.map((option) => option.correct), [true, false]);
  assert.equal(result.questions[1].type, 'MULTI');
  assert.deepEqual(result.questions[1].options.map((option) => option.correct), [true, true, false]);
});

test('skips incomplete questions rather than assigning guessed answers', () => {
  const result = parseQuestionBankText(`1. No answer key?
A) Yes
B) No
2. Bad key?
A) Yes
B) No
Answer: C`);
  assert.equal(result.detected, 2);
  assert.equal(result.questions.length, 0);
  assert.equal(result.skipped, 2);
});
