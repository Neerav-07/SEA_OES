/**
 * Domain Constants for MoSPI DIID & NSSTA Kshamata Competency Platform
 */

export const COMPETENCY_LEVELS = {
  1: {
    level: 1,
    title: 'Level 1 — Awareness',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    color: '#64748B',
    desc: 'Can recognize basic statistical/technical concepts and terminology.',
  },
  2: {
    level: 2,
    title: 'Level 2 — Basic',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    color: '#2563EB',
    desc: 'Can perform simple, guided statistical procedures under supervision.',
  },
  3: {
    level: 3,
    title: 'Level 3 — Working',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    color: '#4F46E5',
    desc: 'Can independently execute routine statistical analyses and survey tasks.',
  },
  4: {
    level: 4,
    title: 'Level 4 — Advanced',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    color: '#7C3AED',
    desc: 'Can handle complex statistical modeling, survey design, and apply judgement.',
  },
  5: {
    level: 5,
    title: 'Level 5 — Expert',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: '#16A34A',
    desc: 'Can lead, evaluate, design policy frameworks, or mentor official statisticians.',
  },
};

export const EVIDENCE_TYPES = {
  KNOWLEDGE: { label: 'Knowledge Evidence (MCQ / Diagnostic)', weight: 0.4, color: 'text-blue-600 bg-blue-50' },
  APPLICATION: { label: 'Application Evidence (Scenario Assessment)', weight: 0.35, color: 'text-purple-600 bg-purple-50' },
  PERFORMANCE: { label: 'Performance Evidence (Practical Simulation)', weight: 0.25, color: 'text-emerald-600 bg-emerald-50' },
  EXTERNAL: { label: 'External Evidence (Certification / Audit)', weight: 0.2, color: 'text-amber-600 bg-amber-50' },
  LEARNING: { label: 'Learning Evidence (Course Completion)', weight: 0.1, color: 'text-slate-600 bg-slate-50' },
};
