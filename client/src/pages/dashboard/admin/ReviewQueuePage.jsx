import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Cpu,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../../services/api';
import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import Modal from '../../../components/Modal.jsx';
import Spinner from '../../../components/Spinner.jsx';
import HowItWorksButton from '../../../components/common/HowItWorksButton.jsx';

import useAdminStore from '../../../store/adminData.store.js';

function FormattedQuestionStem({ stem }) {
  if (!stem) return null;

  const isCaseStudy =
    stem.includes('CASE STUDY:') ||
    stem.includes('BACKGROUND & OPERATIONAL CONTEXT:') ||
    stem.includes('METHODOLOGICAL PROBLEM STATEMENT:');

  if (!isCaseStudy) {
    return (
      <p className="text-slate-900 text-sm font-semibold whitespace-pre-line leading-relaxed">
        {stem}
      </p>
    );
  }

  // Extract case study title if present
  let title = '';
  let rest = stem;
  const csMatch = rest.match(/CASE STUDY:\s*([^\n]+)/i);
  if (csMatch) {
    title = csMatch[1].trim();
    rest = rest.replace(/CASE STUDY:\s*[^\n]+/i, '').trim();
  }

  // Normalize delimiters for sections
  const normalized = rest
    .replace(/\s*(BACKGROUND & OPERATIONAL CONTEXT:?)\s*/gi, '\n§§SEC:BACKGROUND§§\n')
    .replace(/\s*(SYSTEM & (?:STATISTICAL|SAMPLE) PARAMETERS:?)\s*/gi, '\n§§SEC:PARAMETERS§§\n')
    .replace(/\s*(METHODOLOGICAL PROBLEM STATEMENT:?)\s*/gi, '\n§§SEC:PROBLEM§§\n');

  const rawParts = normalized.split(/§§SEC:([A-Z]+)§§/).map((s) => s.trim()).filter(Boolean);

  const sections = [];
  for (let i = 0; i < rawParts.length; i += 2) {
    if (i + 1 < rawParts.length) {
      sections.push({ type: rawParts[i], content: rawParts[i + 1] });
    } else {
      sections.push({ type: 'GENERAL', content: rawParts[i] });
    }
  }

  return (
    <div className="space-y-3.5 text-xs">
      {title && (
        <div className="border-b border-blue-100 pb-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded mr-2">
            MoSPI Empirical Case Study
          </span>
          <h3 className="text-sm font-black text-slate-900 mt-1.5 leading-snug">{title}</h3>
        </div>
      )}

      {sections.map((sec, idx) => {
        if (sec.type === 'BACKGROUND') {
          return (
            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Background & Operational Context
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {sec.content}
              </p>
            </div>
          );
        }

        if (sec.type === 'PARAMETERS') {
          const bulletLines = sec.content
            .split(/[•\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);

          return (
            <div key={idx} className="bg-slate-100/80 p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                System & Statistical Parameters
              </span>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {bulletLines.map((line, bIdx) => (
                  <div
                    key={bIdx}
                    className="flex items-start gap-2 bg-white px-2.5 py-1.5 rounded border border-slate-200/70 text-slate-800 text-[11px] font-semibold"
                  >
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === 'PROBLEM') {
          return (
            <div key={idx} className="bg-blue-50/70 p-3.5 rounded-lg border border-blue-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block mb-1">
                Methodological Problem Statement
              </span>
              <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-bold">
                {sec.content}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-800 text-xs whitespace-pre-line leading-relaxed font-medium">
            {sec.content}
          </p>
        );
      })}
    </div>
  );
}

export default function ReviewQueuePage() {
  const queueByStatus = useAdminStore((s) => s.reviewQueueByStatus);
  const isQueueLoading = useAdminStore((s) => s.isReviewQueueLoading);
  const fetchQueueFromStore = useAdminStore((s) => s.fetchReviewQueue);
  const submitReviewDecision = useAdminStore((s) => s.submitReviewDecision);

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const queue = queueByStatus[statusFilter] || [];
  const loading = isQueueLoading && queue.length === 0;

  const fetchReviewQueue = useCallback(async (force = false) => {
    try {
      setError('');
      await fetchQueueFromStore(statusFilter, force);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
      setError(err?.response?.data?.message || 'Review queue could not be loaded.');
    }
  }, [fetchQueueFromStore, statusFilter]);

  useEffect(() => {
    fetchReviewQueue(false);
  }, [fetchReviewQueue]);

  const closeReview = useCallback(() => {
    setSelectedItem(null);
    setComment('');
    setError('');
  }, []);

  async function handleDecision(decision) {
    if (!selectedItem || actionLoading) return;

    try {
      setActionLoading(decision);
      setError('');
      await submitReviewDecision(selectedItem.id, decision, comment);
      setSelectedItem(null);
      setComment('');
    } catch (err) {
      console.error('Decision submission failed:', err);
      setError(err?.response?.data?.message || 'The review decision could not be saved.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6 p-2 lg:p-4">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Question Review Queue</h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium mt-1">
            Adjudicate AI-generated objective questions before publishing to official assessment blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-xs">
            {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchReviewQueue(true)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh Queue"
            aria-label="Refresh review queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <HowItWorksButton tabKey="review-queue" />
        </div>
      </div>

      {error && !selectedItem && <Alert type="error" title="Review queue unavailable" message={error} dismissible={false} />}

      {/* Queue List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Spinner variant="bar" label="Loading review queue items..." className="py-16" />
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-900">No items in {statusFilter} queue</h3>
          <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">
            All AI-generated questions have been reviewed or no questions match this status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {queue.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                selectedItem?.id === item.id
                  ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600/30'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    {item.bloom_level || 'APPLY'}
                  </span>
                  {item.competency_name && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 truncate max-w-[180px]">
                      {item.competency_name}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {item.stem || 'Generated Question Item'}
              </h4>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                <span className={`rounded-full px-2 py-0.5 font-bold ${item.grounding_status === 'GROUNDED' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {item.grounding_status === 'GROUNDED' ? 'Evidence verified' : 'Evidence check pending'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={closeReview}
        title="Review AI question"
        size="3xl"
        footer={selectedItem && (
          <>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading === 'REJECTED'}
              disabled={Boolean(actionLoading) || selectedItem.status === 'REJECTED'}
              onClick={() => handleDecision('REJECTED')}
            >
              <XCircle className="w-4 h-4" /> Reject question
            </Button>
            <Button
              variant="success"
              size="sm"
              loading={actionLoading === 'APPROVED'}
              disabled={Boolean(actionLoading) || selectedItem.status === 'APPROVED'}
              onClick={() => handleDecision('APPROVED')}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve and publish
            </Button>
          </>
        )}
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                ID: {String(selectedItem.id).slice(0, 8)}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black border ${
                selectedItem.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : selectedItem.status === 'REJECTED'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                Review: {selectedItem.status || 'PENDING'}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black border ${
                selectedItem.grounding_status === 'GROUNDED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                Grounding: {selectedItem.grounding_status === 'GROUNDED' ? 'Verified' : 'Pending Check'}
              </span>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-700">
                Dedup: {selectedItem.duplicate_status === 'FAILED' ? 'Duplicate Flagged' : 'Unique (Passed)'}
              </span>
            </div>

            {error && <Alert type="error" title="Decision not saved" message={error} dismissible={false} />}
            {selectedItem.validation_status === 'FAILED' && (
              <Alert type="warning" title="Validation Warning" message="Automated rule checks flagged a potential schema issue. Verify options and answer key before approving." icon={AlertTriangle} dismissible={false} />
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <AuditFact icon={ShieldCheck} label="Grounding" value={`${Math.round(Number(selectedItem.auto_validation_score || 0) * 100)}%`} />
              <AuditFact icon={Cpu} label="Model" value={selectedItem.ai_model || 'gemini-1.5-pro'} />
              <AuditFact icon={Database} label="Policy" value={selectedItem.policy_version || 'MoSPI-NQAF-2024'} />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2.5 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Question Stem</span>
                {selectedItem.bloom_level && (
                  <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Bloom: {selectedItem.bloom_level}
                  </span>
                )}
              </div>
              <FormattedQuestionStem stem={selectedItem.stem} />
            </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Options and correct answer</div>
                {Array.isArray(selectedItem.options) && selectedItem.options.map((opt, idx) => {
                  const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || `Option ${idx + 1}`);
                  const correctAnswer = typeof selectedItem.correct_answer === 'object' ? selectedItem.correct_answer?.id || selectedItem.correct_answer?.value : selectedItem.correct_answer;
                  const isCorrect = Boolean(opt?.correct || opt?.is_correct || opt?.isCorrect) || opt?.id === correctAnswer || optText === correctAnswer || idx === correctAnswer;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between font-semibold ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {optText}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>

              {selectedItem.rationale && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong className="text-blue-800 block mb-1">Generated rationale</strong>
                  {selectedItem.rationale}
                </div>
              )}

              <section aria-labelledby="source-evidence-heading" className="space-y-2">
                <div className="flex items-center justify-between">
                  <div id="source-evidence-heading" className="text-xs text-slate-500 font-bold uppercase tracking-wider">Source Evidence & Lineage</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                    Verified MoSPI Lineage
                  </span>
                </div>
                {selectedItem.provenance?.length ? selectedItem.provenance.map((source, index) => (
                  <div key={`${source.chunkReference}-${index}`} className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-blue-900">
                      <span className="font-extrabold">{source.documentName}</span>
                      <span className="px-1.5 py-0.5 bg-blue-100 rounded text-[10px] font-mono">{source.chunkReference}</span>
                      {source.pageNumber && <span className="text-slate-600">Page {source.pageNumber}</span>}
                      {source.sectionReference && <span className="text-slate-600 font-medium">({source.sectionReference})</span>}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800 bg-white/70 p-2.5 rounded-lg border border-blue-100 font-medium">{source.sourceText}</p>
                  </div>
                )) : <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-900">No persisted source evidence is available.</p>}
              </section>

              {[...(selectedItem.guardrail_violations || []), ...(selectedItem.validation_errors || [])].length > 0 && (
                <section aria-labelledby="validation-findings-heading" className="space-y-2">
                  <div id="validation-findings-heading" className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blocking findings</div>
                  {[...(selectedItem.guardrail_violations || []), ...(selectedItem.validation_errors || [])].map((finding, index) => (
                    <div key={`${finding.code}-${index}`} className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span><strong>{finding.code}</strong>{finding.message ? `: ${finding.message}` : ''}</span>
                    </div>
                  ))}
                </section>
              )}

              {/* Review Comment Input */}
              <div className="space-y-1">
                <label htmlFor="reviewer-remarks" className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Reviewer remarks
                </label>
                <textarea
                  id="reviewer-remarks"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Approved for MoSPI survey methodology blueprint."
                  className="w-full resize-none bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AuditFact({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="truncate font-mono text-xs font-bold text-slate-900" title={value}>{value}</div>
    </div>
  );
}
