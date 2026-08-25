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
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-white mb-2">Preparing Assessment...</h3>
          <p className="text-slate-400 text-sm">Loading grounded questions and initializing timer.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Assessment
              </span>
              <span className="text-slate-400 text-xs font-mono">
                ID: {assessment?.id ? String(assessment.id).slice(0, 8) : 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {assessment?.title || 'Competency Diagnostic Assessment'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {!result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono text-sm font-semibold">
                <Clock className="w-4 h-4 animate-pulse" />
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {result ? (
          /* RESULT SCREEN */
          <div className="p-6 md:p-8 overflow-y-auto space-y-6">
            <div className="text-center bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/50 rounded-2xl p-8">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 ring-1 ring-emerald-500/30">
                <Award className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Assessment Submitted!</h3>
              <p className="text-slate-400 text-sm mt-1">Evidence automatically recorded and competency estimates updated.</p>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-6">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Score</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{result.score} / 5.0</div>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Accuracy</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">{result.percentage}%</div>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Correct</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{result.correctCount} / {result.totalQuestions}</div>
                </div>
              </div>
            </div>

            {/* Question Breakdown with Explanations */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" /> Question Breakdown & Rationale
              </h4>
              {(result.responses || []).map((resp, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border ${
                    resp.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Q{idx + 1}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      resp.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {resp.isCorrect ? 'Correct (+5.0)' : 'Incorrect (0.0)'}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm mt-2">{resp.stem}</p>

                  {resp.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-emerald-400 block mb-1">Explanation & Rationale:</strong>
                      {resp.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 transition-colors flex items-center gap-2 text-sm"
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* QUESTION PLAYER SCREEN */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Question <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
                <span className="text-white font-bold">{questions.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantFeedback}
                    onChange={(e) => setInstantFeedback(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Instant Feedback Mode</span>
                </label>
                <div className="text-slate-300">
                  Answered: <strong className="text-emerald-400">{answeredCount}</strong> / {questions.length}
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
              {currentQ ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {currentQ.bloomLevel || 'APPLY'}
                      </span>
                      {currentQ.questionType && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {currentQ.questionType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
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
                              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/5'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                              isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm font-medium">{optText}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Feedback / Rationale Drawer */}
                  {instantFeedback && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" /> Instant Feedback
                        </span>
                        <button
                          onClick={() => handleToggleReveal(currentQ.id)}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          {revealedAnswers[currentQ.id] ? 'Hide Answer' : 'Reveal Answer'}
                        </button>
                      </div>
                      {revealedAnswers[currentQ.id] && (
                        <p className="text-slate-300 leading-relaxed pt-1">
                          {currentQ.explanation || 'No rationale available for this item.'}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">No question selected.</div>
              )}
            </div>

            {/* Bottom Navigation & Submit Bar */}
            <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-2 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitAttempt}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 text-sm flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center gap-2 transition-colors"
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
