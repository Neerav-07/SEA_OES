import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../../services/api';

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, [statusFilter]);

  async function fetchReviewQueue() {
    try {
      setLoading(true);
      const res = await api.get(`/review/queue?status=${statusFilter}`);
      setQueue(res.data.queue || []);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(decision) {
    if (!selectedItem || processing) return;

    try {
      setProcessing(true);
      await api.post(`/review/queue/${selectedItem.id}/decision`, {
        decision,
        comment,
      });

      setSelectedItem(null);
      setComment('');
      fetchReviewQueue();
    } catch (err) {
      console.error('Decision submission failed:', err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Governance Queue
            </span>
            <span className="text-xs font-mono text-slate-400">Module 6 Review</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Question Review Queue</h1>
          <p className="text-slate-400 text-sm">
            Adjudicate AI-generated objective questions before publishing to official assessment blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReviewQueue}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading review queue items...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No items in {statusFilter} queue</h3>
          <p className="text-slate-400 text-sm mt-1">
            All AI-generated questions have been reviewed or no questions match this status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedItem?.id === item.id
                  ? 'bg-slate-800/80 border-emerald-500 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.bloom_level || 'APPLY'}
                  </span>
                  {item.competency_name && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 truncate max-w-[180px]">
                      {item.competency_name}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {item.status}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                {item.stem || 'Generated Question Item'}
              </h4>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                <span className="text-emerald-400 font-medium hover:underline">Click to Review →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">Review Item ID: {String(selectedItem.id).slice(0, 8)}</span>
                <h3 className="text-lg font-bold text-white mt-1">Review AI Question</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1 font-semibold">Question Stem:</div>
                <p className="text-white text-sm font-medium">{selectedItem.stem}</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-semibold">Options & Correct Answer:</div>
                {Array.isArray(selectedItem.options) && selectedItem.options.map((opt, idx) => {
                  const isCorrect = idx === (typeof selectedItem.correct_answer === 'number' ? selectedItem.correct_answer : 0);
                  const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || `Option ${idx + 1}`);

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {optText}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>

              {selectedItem.rationale && (
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-emerald-400 block mb-1">Source Rationale:</strong>
                  {selectedItem.rationale}
                </div>
              )}

              {/* Review Comment Input */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Reviewer Remarks (Optional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Approved for MoSPI survey methodology blueprint."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleDecision('REJECTED')}
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Question
              </button>
              <button
                onClick={() => handleDecision('APPROVED')}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
