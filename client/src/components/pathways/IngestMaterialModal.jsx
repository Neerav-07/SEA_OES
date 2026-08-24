import { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../Button';

export default function IngestMaterialModal({ isOpen, onClose, onIngested }) {
  const [formData, setFormData] = useState({
    title: '',
    provider: 'iGOT Karmayogi',
    materialCode: '',
    durationHours: 6,
    rawTextContent: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onIngested) {
        const res = await onIngested(formData);
        setIngestSuccess(res || { confidenceScore: 0.92 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 lg:p-8 shadow-2xl relative border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ingest Learning Material</h3>
              <p className="text-xs text-slate-500 font-medium">Automatic Semantic Competency Mapping Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {!ingestSuccess ? (
          <form onSubmit={handleSubmit} className="py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course / Document Title</label>
              <input
                type="text"
                required
                placeholder="e.g. NSS Household Survey Design & Sampling Manual 2026"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Provider Source</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                >
                  <option value="iGOT Karmayogi">iGOT Karmayogi</option>
                  <option value="NSSTA Academy">NSSTA Academy</option>
                  <option value="NITI Aayog NDAP">NITI Aayog NDAP</option>
                  <option value="MoSPI Internal Manual">MoSPI Internal Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IGOT-STAT-402"
                  value={formData.materialCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, materialCode: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.durationHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, durationHours: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Training Content Summary / Chapter Text</label>
              <textarea
                rows="3"
                placeholder="Paste raw training material text or chapter outline for NLP mapping..."
                value={formData.rawTextContent}
                onChange={(e) => setFormData((prev) => ({ ...prev, rawTextContent: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <Button variant="primary" type="submit" loading={isSubmitting} className="!text-white">
                <Sparkles size={14} className="mr-1.5 !text-white" /> Ingest & Map Competencies
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Semantic Mapping Complete!</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Material successfully ingested with <span className="font-bold text-indigo-700">92% Match Confidence</span> to Statistical Analysis objectives.
              </p>
            </div>
            <Button variant="primary" onClick={onClose} className="!text-white mx-auto">
              Return to Pathways
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
