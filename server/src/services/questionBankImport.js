const QUESTION_START = /^\s*(?:(?:Q(?:uestion)?\s*\.?\s*)?\d+)\s*[.):\-]\s*(.+)$/i;
const OPTION_START = /^\s*(?:\(([A-H])\)|([A-H])[.):\-])\s*(.+)$/i;
const ANSWER_LINE = /^\s*(?:correct\s+)?(?:answer|option)s?\s*[:\-]\s*(.+)$/i;

export function parseQuestionBankText(text) {
  const blocks = [];
  let current = null;

  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^\s*--\s*\d+\s+of\s+\d+\s*--/i.test(line)) continue;

    const start = line.match(QUESTION_START);
    if (start) {
      if (current) blocks.push(current);
      current = { prompt: start[1].trim(), options: [], answer: '', section: 'prompt' };
      continue;
    }
    if (!current) continue;

    const answer = line.match(ANSWER_LINE);
    if (answer) {
      current.answer = answer[1].trim();
      current.section = 'answer';
      continue;
    }
    const choice = line.match(OPTION_START);
    if (choice && current.section !== 'answer') {
      current.options.push({ label: (choice[1] || choice[2]).toUpperCase(), text: choice[3].trim() });
      current.section = 'option';
      continue;
    }
    if (current.section === 'prompt') current.prompt += ` ${line}`;
    if (current.section === 'option' && current.options.length) {
      current.options[current.options.length - 1].text += ` ${line}`;
    }
  }
  if (current) blocks.push(current);

  const questions = [];
  for (const block of blocks) {
    const correct = [...new Set((block.answer.match(/\b[A-H]\b/gi) || []).map((value) => value.toUpperCase()))];
    const labels = new Set(block.options.map((option) => option.label));
    if (!block.prompt || block.options.length < 2 || !correct.length || correct.some((label) => !labels.has(label))) continue;
    questions.push({
      prompt: block.prompt,
      type: correct.length > 1 ? 'MULTI' : 'SINGLE',
      points: 1,
      options: block.options.map((option) => ({ text: option.text, correct: correct.includes(option.label) })),
    });
  }
  return { questions, detected: blocks.length, skipped: blocks.length - questions.length };
}
