import { makeSampleExams, sampleQuestions } from './sampleExams.js';

const KEY = 'oes-exam-workspace-v1';

const initial = { questions: [], exams: [], attempts: [] };

export function readExamData() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    const data = value && Array.isArray(value.questions) && Array.isArray(value.exams) && Array.isArray(value.attempts) ? value : initial;
    if (data.sampleVersion === 1) return data;
    const seeded = {
      ...data,
      questions: [...data.questions, ...sampleQuestions.filter((item) => !data.questions.some((existing) => existing.id === item.id))],
      exams: [...data.exams, ...makeSampleExams().filter((item) => !data.exams.some((existing) => existing.id === item.id))],
      sampleVersion: 1,
    };
    localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return { ...initial, questions: sampleQuestions, exams: makeSampleExams(), sampleVersion: 1 };
  }
}

export function writeExamData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('oes-data-change'));
}

export function newId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function gradeAttempt(attempt) {
  const items = attempt.questions.map((question) => {
    const selected = [...(attempt.answers[question.id] || [])].sort();
    const correct = [...question.options.filter((option) => option.correct).map((option) => option.id)].sort();
    return { questionId: question.id, earned: JSON.stringify(selected) === JSON.stringify(correct) ? Number(question.points) : 0, possible: Number(question.points) };
  });
  return { items, earned: items.reduce((sum, item) => sum + item.earned, 0), possible: items.reduce((sum, item) => sum + item.possible, 0) };
}

export function statusForExam(exam, now = Date.now()) {
  if (exam.status !== 'PUBLISHED') return 'Draft';
  if (now < new Date(exam.startAt).getTime()) return 'Upcoming';
  if (now > new Date(exam.endAt).getTime()) return 'Closed';
  return 'Available';
}
