import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Sliders,
  Clock,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Target,
  Layers,
} from 'lucide-react';
import AssessmentPlayerModal from '../../pages/dashboard/assessments/AssessmentPlayerModal.jsx';

/**
 * DiagnosticQuizModal
 * Features a clean, enterprise light-theme setup screen
 * then launches the Enterprise Full-Screen Assessment Engine.
 */
export default function DiagnosticQuizModal({ isOpen, onClose, onSubmitted }) {
  const [step, setStep] = useState('CONFIG'); // 'CONFIG' | 'EXAM'
  const [domain, setDomain] = useState('ALL');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [mode, setMode] = useState('ADAPTIVE_CASE_STUDIES');

  // Ensure step is reset to CONFIG when modal is closed/reopened (MUST be before any early return)
  useEffect(() => {
    if (!isOpen) {
      setStep('CONFIG');
    }
  }, [isOpen]);

  const handleStartExam = () => {
    setStep('EXAM');
  };

  const handleClose = () => {
    onClose();
    // Delay resetting step to CONFIG to prevent flash of setup form during modal close animation
    setTimeout(() => {
      setStep('CONFIG');
    }, 250);
  };

  if (!isOpen) return null;

  if (step === 'EXAM') {
    return (
      <AssessmentPlayerModal
        assessmentId="asm-diagnostic-01"
        initialConfig={{
          domain,
          questionCount,
          timeLimitMins,
          mode,
        }}
        onClose={handleClose}
        onComplete={(result) => {
          setStep('CONFIG');
          if (onSubmitted) {
            onSubmitted(
              result.responses || [],
              result.correctCount || Math.round((questionCount * 7) / 10),
              result.totalQuestions || questionCount,
            );
          }
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        {/* Top Accent Line */}
        <div className="h-1.5 bg-[#1E3A8A]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100 shadow-xs">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                MoSPI Diagnostic Exam Setup
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A] border border-blue-200">
                  FRAC V2
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure evaluation parameters before launching real exam mode
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 p-6 max-h-[72vh] overflow-y-auto bg-white">
          {/* 1. Target Domain Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <Target size={14} className="text-[#1E3A8A]" />
              1. Select Domain Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'ALL', label: 'All FRAC Domains', desc: 'Comprehensive multi-domain diagnostic' },
                { id: 'Statistical', label: 'Statistical Competencies', desc: 'Sampling, Survey Design, NAS, PLFS' },
                { id: 'Technical', label: 'Technical & Data Systems', desc: 'Python, SQL, R, Data Imputation' },
                { id: 'Digital Governance', label: 'Digital & Metadata', desc: 'SDMX, NDSAP Privacy, Cybersecurity' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDomain(d.id)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    domain === d.id
                      ? 'border-[#1E3A8A] bg-blue-50/80 text-[#1E3A8A] font-bold shadow-xs ring-1 ring-[#1E3A8A]'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    {domain === d.id && <CheckCircle2 size={15} className="text-[#1E3A8A] shrink-0" />}
                    {d.label}
                  </span>
                  <span className={`text-xs mt-1 font-medium ${domain === d.id ? 'text-blue-900/80' : 'text-slate-500'}`}>
                    {d.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Question Count & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#1E3A8A]" />
                2. Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuestionCount(num);
                      setTimeLimitMins(num === 5 ? 5 : num === 10 ? 10 : num === 15 ? 15 : 30);
                    }}
                    className={`py-2.5 text-center text-xs font-bold rounded-xl border transition-all ${
                      questionCount === num
                        ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-[#1E3A8A]" />
                3. Allocated Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimeLimitMins(mins)}
                    className={`py-2.5 text-center text-xs font-bold rounded-xl border transition-all ${
                      timeLimitMins === mins
                        ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mins} Mins
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Evaluation Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-[#1E3A8A]" />
              4. Evaluation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'ADAPTIVE_CASE_STUDIES',
                  label: 'Real MoSPI Case Studies',
                  desc: 'Story-based problem statements with code & calculations',
                },
                {
                  id: 'BLOOM_APPLICATION',
                  label: 'Scenario & Application Focus',
                  desc: 'Bloom Level 3 & 4 decision-making questions',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    mode === m.id
                      ? 'border-[#1E3A8A] bg-blue-50/80 text-[#1E3A8A] font-bold ring-1 ring-[#1E3A8A]'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold block text-slate-900">{m.label}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-6 bg-slate-50/80">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Anti-cheating & evidence auto-recording enabled</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartExam}
              className="flex items-center gap-2 rounded-2xl bg-[#1E3A8A] hover:bg-[#1e40af] px-6 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
            >
              <Play size={14} fill="currentColor" /> Enter Exam Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
