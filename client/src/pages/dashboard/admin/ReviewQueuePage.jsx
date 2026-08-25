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
import Spinner from '../../../components/Spinner.jsx';

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
    <div className="space-y-6 p-2 lg:p-4">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Admin Governance Queue
            </span>
            <span className="text-xs font-semibold text-slate-500">Module 6 Review</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Question Review Queue</h1>
          <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5">
            Adjudicate AI-generated objective questions before publishing to official assessment blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-xs">
            {['PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
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
            onClick={fetchReviewQueue}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

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
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                <span className="text-blue-700 font-bold hover:underline">Click to Review →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-700">Review Item ID: {String(selectedItem.id).slice(0, 8)}</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Review AI Question</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Question Stem:</div>
                <p className="text-slate-900 text-sm font-bold">{selectedItem.stem}</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Options & Correct Answer:</div>
                {Array.isArray(selectedItem.options) && selectedItem.options.map((opt, idx) => {
                  const isCorrect = idx === (typeof selectedItem.correct_answer === 'number' ? selectedItem.correct_answer : 0);
                  const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || `Option ${idx + 1}`);

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
                  <strong className="text-blue-800 block mb-1">Source Rationale:</strong>
                  {selectedItem.rationale}
                </div>
              )}

              {/* Review Comment Input */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Reviewer Remarks (Optional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Approved for MoSPI survey methodology blueprint."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleDecision('REJECTED')}
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Question
              </button>
              <button
                onClick={() => handleDecision('APPROVED')}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
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
