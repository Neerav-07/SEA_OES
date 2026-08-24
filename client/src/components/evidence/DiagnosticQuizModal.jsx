import { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import Button from '../Button';

const MOCK_QUESTIONS = [
  {
    id: 'q1',
    competencyId: 'c-01',
    competencyName: 'Survey Design & Sampling Methods',
    question: 'Which probability sampling method is most appropriate when the target population frame exhibits clear geographic clusters with high intra-cluster variance?',
    options: [
      'Simple Random Sampling without replacement',
      'Stratified Multi-Stage Cluster Sampling',
      'Purposive Convenience Sampling',
      'Systematic Sampling without stratification',
    ],
    correctIndex: 1,
  },
  {
    id: 'q2',
    competencyId: 'c-02',
    competencyName: 'National Accounts Statistics',
    question: 'In Gross Value Added (GVA) estimation at basic prices, how are net production taxes treated relative to GVA at factor cost?',
    options: [
      'GVA at basic prices = GVA at factor cost + Production Taxes - Production Subsidies',
      'GVA at basic prices = GVA at factor cost - Product Taxes + Product Subsidies',
      'GVA at basic prices = GDP + Net Imports',
      'GVA at basic prices = Consumption of Fixed Capital only',
    ],
    correctIndex: 0,
  },
  {
    id: 'q3',
    competencyId: 'c-03',
    competencyName: 'Python & R Data Analytics',
    question: 'When performing automated data cleaning on large NSS household survey files in pandas, which method is memory-optimal for handling missing categorical values?',
    options: [
      'df.dropna(how="all") across all numerical columns',
      'Converting object columns to category dtype before fillna()',
      'Iterating row by row using for loop',
      'Duplicating dataframes in memory',
    ],
    correctIndex: 1,
  },
];

export default function DiagnosticQuizModal({ isOpen, onClose, onSubmitted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = MOCK_QUESTIONS[currentIndex];

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let correctCount = 0;
    const answerResults = MOCK_QUESTIONS.map((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        competencyId: q.competencyId,
        isCorrect,
      };
    });

    try {
      if (onSubmitted) {
        await onSubmitted(answerResults, correctCount, MOCK_QUESTIONS.length);
      }
      setIsFinished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden relative border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1E3A8A]">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Diagnostic Assessment</h3>
              <p className="text-xs text-slate-500 font-medium">MoSPI DIID Baseline Competency Diagnostic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {!isFinished ? (
          <div className="py-6 space-y-6">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Question {currentIndex + 1} of {MOCK_QUESTIONS.length}</span>
                <span className="text-[#1E3A8A]">{currentQ.competencyName}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#1E3A8A] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 leading-snug">{currentQ.question}</h4>

              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-blue-50/70 ring-2 ring-blue-600/20 text-[#1E3A8A] font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 font-medium'
                      }`}
                    >
                      <span className="text-xs leading-relaxed">{opt}</span>
                      {isSelected && <CheckCircle2 size={18} className="text-[#1E3A8A] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
              >
                Previous
              </button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={selectedAnswers[currentQ.id] === undefined || isSubmitting}
                loading={isSubmitting}
                className="!text-white"
              >
                {currentIndex === MOCK_QUESTIONS.length - 1 ? 'Submit Diagnostic' : 'Next Question'} <ArrowRight size={16} className="!text-white" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50">
              <ShieldCheck size={36} />
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-900">Diagnostic Complete!</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Your answers have been processed and fused into your official capability registry.
              </p>
            </div>
            <Button variant="primary" onClick={onClose} className="!text-white mx-auto">
              Return to Competency Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
