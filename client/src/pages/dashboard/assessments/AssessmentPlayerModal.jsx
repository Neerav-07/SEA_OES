import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import api from '../../../services/api';

export default function AssessmentPlayerModal({ assessmentId, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({}); // { questionId: boolean }

  // Start or resume attempt on mount
  useEffect(() => {
    async function initAttempt() {
      try {
        setLoading(true);
        const res = await api.post('/attempts/start', { assessmentId });
        const data = res.data;
        
        setAttempt(data.attempt);
        setAssessment(data.assessment);
        setQuestions(data.questions || []);

        // Restore responses if resuming
        if (data.attempt?.responses) {
          const restored = {};
          data.attempt.responses.forEach(r => {
            if (r.questionId && r.selectedOption !== undefined) {
              restored[r.questionId] = r.selectedOption;
            }
          });
          setResponses(restored);
          if (data.attempt.current_question_index) {
            setCurrentIndex(data.attempt.current_question_index);
          }
        }
      } catch (err) {
        console.error('Failed to start assessment attempt:', err);
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) initAttempt();
  }, [assessmentId]);

  // Countdown timer
  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAttempt(); // auto submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, result, timeLeft]);

  // Save progress on response change
  const handleSelectOption = async (questionId, optionIndex) => {
    if (result) return; // disabled if completed
    const updated = { ...responses, [questionId]: optionIndex };
    setResponses(updated);

    if (attempt?.id) {
      try {
        const formattedResponses = Object.entries(updated).map(([qId, sOpt]) => ({
          questionId: qId,
          selectedOption: sOpt,
        }));
        await api.post(`/attempts/${attempt.id}/save-progress`, {
          currentQuestionIndex: currentIndex,
          responses: formattedResponses,
        });
      } catch (err) {
        console.warn('Failed to auto-save progress:', err);
      }
    }
  };

  const handleToggleReveal = (questionId) => {
    setRevealedAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitAttempt = async () => {
    if (submitting || !attempt?.id) return;
    try {
      setSubmitting(true);
      const formattedResponses = Object.entries(responses).map(([qId, sOpt]) => ({
        questionId: qId,
        selectedOption: sOpt,
      }));

      const res = await api.post(`/attempts/${attempt.id}/submit`, {
        responses: formattedResponses,
      });

      setResult(res.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Preparing Assessment...</h3>
          <p className="text-slate-600 font-medium text-sm">Loading grounded questions and initializing timer.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Official Assessment
              </span>
              <span className="text-slate-500 text-xs font-mono font-semibold">
                ID: {assessment?.id ? String(assessment.id).slice(0, 8) : 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              {assessment?.title || 'Competency Diagnostic Assessment'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {!result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm font-extrabold shadow-xs">
                <Clock className="w-4 h-4 animate-pulse text-amber-600" />
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {result ? (
          /* RESULT SCREEN */
          <div className="p-6 md:p-8 overflow-y-auto space-y-6">
            <div className="text-center bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-xs">
              <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-700 mb-4 ring-1 ring-emerald-300">
                <Award className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Assessment Submitted!</h3>
              <p className="text-slate-600 text-sm font-semibold mt-1">Evidence automatically recorded and competency estimates updated.</p>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{result.score} / 5.0</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accuracy</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">{result.percentage}%</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Correct</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{result.correctCount} / {result.totalQuestions}</div>
                </div>
              </div>
            </div>

            {/* Question Breakdown with Explanations */}
            <div className="space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Question Breakdown & Rationale
              </h4>
              {(result.responses || []).map((resp, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border ${
                    resp.isCorrect
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                      Q{idx + 1}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded ${
                      resp.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {resp.isCorrect ? 'Correct (+5.0)' : 'Incorrect (0.0)'}
                    </span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm mt-2">{resp.stem}</p>

                  {resp.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                      <strong className="text-emerald-700 block mb-1">Explanation & Rationale:</strong>
                      {resp.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition-colors flex items-center gap-2 text-sm shadow-md"
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* QUESTION PLAYER SCREEN */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <div>
                Question <span className="text-slate-900 font-black">{currentIndex + 1}</span> of{' '}
                <span className="text-slate-900 font-black">{questions.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantFeedback}
                    onChange={(e) => setInstantFeedback(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Instant Feedback Mode</span>
                </label>
                <div className="text-slate-700">
                  Answered: <strong className="text-blue-700">{answeredCount}</strong> / {questions.length}
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
              {currentQ ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {currentQ.bloomLevel || 'APPLY'}
                      </span>
                      {currentQ.questionType && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          {currentQ.questionType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 leading-relaxed">
                      {currentQ.stem}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {(currentQ.options || []).map((opt, optIdx) => {
                      const isSelected = responses[currentQ.id] === optIdx;
                      const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || `Option ${optIdx + 1}`);

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-600 text-blue-900 font-bold shadow-xs ring-1 ring-blue-600/20'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm font-semibold">{optText}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Feedback / Rationale Drawer */}
                  {instantFeedback && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-medium text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-700 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" /> Instant Feedback
                        </span>
                        <button
                          onClick={() => handleToggleReveal(currentQ.id)}
                          className="text-xs text-blue-700 font-bold hover:underline"
                        >
                          {revealedAnswers[currentQ.id] ? 'Hide Answer' : 'Reveal Answer'}
                        </button>
                      </div>
                      {revealedAnswers[currentQ.id] && (
                        <p className="text-slate-800 leading-relaxed pt-1">
                          {currentQ.explanation || 'No rationale available for this item.'}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 font-semibold">No question selected.</div>
              )}
            </div>

            {/* Bottom Navigation & Submit Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-2 text-xs font-bold transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitAttempt}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition-colors shadow-md text-xs flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
