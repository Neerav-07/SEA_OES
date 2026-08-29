import { useEffect, useState, useRef } from 'react';
import {
  Database,
  FileText,
  Upload,
  Video,
  FileSpreadsheet,
  Globe,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  FileUp,
  Trash2,
  Search,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  FileCheck2,
  Code,
  File,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import Input from '../../../components/Input.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Select from '../../../components/Select.jsx';
import Spinner from '../../../components/Spinner.jsx';
import {
  createSource,
  getSource,
  ingestSource,
  listSources,
  deleteSource,
  listChunks,
  generateAssessmentFromSource,
} from '../../../services/source.api.js';
import AssessmentPlayerModal from '../assessments/AssessmentPlayerModal.jsx';

const SOURCE_TYPES = [
  { value: 'PDF', label: '📄 PDF / Official Government Manual' },
  { value: 'VIDEO_TRANSCRIPT', label: '🎥 Video Lecture / Audio Transcript' },
  { value: 'IGOT_MODULE', label: '🌐 iGOT Karmayogi / Web Module' },
  { value: 'DATASET_SCHEMA', label: '📊 Dataset Schema / SQL Dictionary' },
  { value: 'TEXT', label: '📝 Plain Text Document' },
];

/**
 * Extracts readable plain text from uploaded files (TXT, CSV, JSON, MD, SQL, and PDF streams)
 */
async function extractFileContent(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Plain text formats
  if (['txt', 'csv', 'tsv', 'json', 'md', 'sql', 'html', 'xml', 'log'].includes(extension)) {
    return await file.text();
  }

  // PDF text extraction
  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const raw = new TextDecoder('utf-8').decode(uint8);

      // Extract text inside PDF stream operators: BT ... ET
      const matches = [];
      const streamRegex = /BT[\s\S]*?ET/g;
      let match;
      while ((match = streamRegex.exec(raw)) !== null) {
        const block = match[0];
        const tjRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          const extracted = (tjMatch[1] || tjMatch[2] || '').replace(/\\([()\\])/g, '$1');
          if (extracted.trim() && extracted.length > 2) {
            matches.push(extracted.trim());
          }
        }
      }

      if (matches.length > 0) {
        return matches.join(' ');
      }

      // Fallback: extract continuous ASCII/text segments
      const readable = raw.match(/[A-Za-z0-9,.:;'"\-\s]{6,}/g);
      if (readable && readable.length > 0) {
        const filtered = readable
          .map((s) => s.trim())
          .filter((s) => !s.includes('endobj') && !s.includes('stream') && !s.includes('xref') && s.length > 8);
        if (filtered.length > 0) {
          return filtered.join('\n');
        }
      }
    } catch (err) {
      console.warn('PDF stream extraction fallback:', err.message);
    }
  }

  // Default fallback to text read
  try {
    return await file.text();
  } catch {
    return '';
  }
}

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceChunksList, setSourceChunksList] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chunkSearch, setChunkSearch] = useState('');

  // Mode: 'FILE_UPLOAD' | 'MANUAL_TEXT'
  const [uploadMode, setUploadMode] = useState('FILE_UPLOAD');

  // Selected file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Form inputs
  const [form, setForm] = useState({
    name: '',
    externalId: `MOSPI-DOC-2026-0${Math.floor(Math.random() * 90 + 10)}`,
    documentType: 'PDF',
  });

  // Direct append content for selected source
  const [appendContent, setAppendContent] = useState('');

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);
  const [generatedAssessmentInfo, setGeneratedAssessmentInfo] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateAssessmentForSource = async () => {
    if (!selectedSource?.id) return;
    setGeneratingAssessment(true);
    setError('');
    try {
      const res = await generateAssessmentFromSource(selectedSource.id, { count: 5 });
      setGeneratedAssessmentInfo(res);
      toast.success(`Generated official assessment with ${res.questionsCount} questions from ${selectedSource.name}!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGeneratingAssessment(false);
    }
  };

  // Load registered sources
  const refresh = async (selectId = null) => {
    try {
      const result = await listSources();
      const apiItems = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
      setSources(apiItems);

      if (selectId) {
        const found = apiItems.find((s) => s.id === selectId);
        if (found) setSelectedSource(found);
      } else if (apiItems.length > 0 && !selectedSource) {
        setSelectedSource(apiItems[0]);
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // Fetch chunks whenever selectedSource changes
  useEffect(() => {
    if (!selectedSource?.id) {
      setSourceChunksList([]);
      return;
    }

    let active = true;
    setLoadingChunks(true);

    getSource(selectedSource.id)
      .then(async (data) => {
        const versions = data?.versions || [];
        if (versions.length > 0) {
          const latestVersion = versions[0];
          try {
            const chunksData = await listChunks(selectedSource.id, latestVersion.id);
            const chunks = Array.isArray(chunksData) ? chunksData : chunksData?.items || [];
            if (active) setSourceChunksList(chunks);
          } catch {
            if (active) setSourceChunksList([]);
          }
        } else {
          if (active) setSourceChunksList([]);
        }
      })
      .catch(() => {
        if (active) setSourceChunksList([]);
      })
      .finally(() => {
        if (active) setLoadingChunks(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSource?.id]);

  // Handle File Selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsReadingFile(true);
    setError('');

    // Auto-derive clean title
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
    const cleanTitle = baseName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Auto-derive category
    const ext = file.name.split('.').pop()?.toLowerCase();
    let docType = 'PDF';
    if (['csv', 'tsv', 'json', 'sql'].includes(ext)) docType = 'DATASET_SCHEMA';
    else if (['txt', 'md'].includes(ext)) docType = 'TEXT';
    else if (['vtt', 'srt'].includes(ext)) docType = 'VIDEO_TRANSCRIPT';

    setForm((prev) => ({
      ...prev,
      name: cleanTitle,
      documentType: docType,
    }));

    try {
      const text = await extractFileContent(file);
      setExtractedText(text);
    } catch (err) {
      toast.error('Could not read file text automatically. You can paste content manually.');
    } finally {
      setIsReadingFile(false);
    }
  };

  // Drag & drop handlers
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Unified 1-Click Register & Ingest
  const handleRegisterAndIngest = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a document title.');
      return;
    }

    const contentToIngest = uploadMode === 'FILE_UPLOAD' ? extractedText.trim() : appendContent.trim();

    if (!contentToIngest) {
      toast.error(
        uploadMode === 'FILE_UPLOAD'
          ? 'Please select a document file containing text, or paste content directly.'
          : 'Please enter or paste the text content to ingest.'
      );
      return;
    }

    setWorking(true);
    setError('');

    try {
      // Step 1: Create source document record
      const result = await createSource(form);
      const createdSource = result.source;

      // Step 2: Ingest content & generate vector chunks
      await ingestSource(createdSource.id, {
        content: contentToIngest,
        maxChunkLength: 1000,
      });

      toast.success(
        `Document '${createdSource.name}' registered and vector chunks successfully generated!`,
        { duration: 4000 }
      );

      // Reset upload state
      setSelectedFile(null);
      setExtractedText('');
      setAppendContent('');
      setShowTextPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setForm({
        name: '',
        externalId: `MOSPI-DOC-2026-0${Math.floor(Math.random() * 90 + 10)}`,
        documentType: 'PDF',
      });

      // Refresh sources and auto-select new source
      await refresh(createdSource.id);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(`Ingestion failed: ${msg}`);
    } finally {
      setWorking(false);
    }
  };

  // Append Additional Content to currently selected source
  const handleAppendToExisting = async (e) => {
    e.preventDefault();
    if (!selectedSource?.id || !appendContent.trim()) return;

    setWorking(true);
    setError('');

    try {
      await ingestSource(selectedSource.id, {
        content: appendContent.trim(),
        maxChunkLength: 1000,
      });

      toast.success('Additional content ingested and appended as new vector chunks!');
      setAppendContent('');
      await refresh(selectedSource.id);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(`Append failed: ${msg}`);
    } finally {
      setWorking(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (sourceId, sourceName) => {
    if (!window.confirm(`Are you sure you want to delete '${sourceName}' and all its vector chunks?`)) {
      return;
    }

    try {
      await deleteSource(sourceId);
      toast.success(`Source '${sourceName}' removed from Knowledge Base.`);
      if (selectedSource?.id === sourceId) {
        setSelectedSource(null);
      }
      await refresh();
    } catch (err) {
      toast.error(`Delete failed: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Filter sources for search
  const filteredSources = sources.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.externalId || '').toLowerCase().includes(q);
  });

  // Filter chunks for search
  const filteredChunks = sourceChunksList.filter((c) => {
    if (!chunkSearch.trim()) return true;
    const q = chunkSearch.toLowerCase();
    return (c.text || '').toLowerCase().includes(q) || (c.chunkReference || '').toLowerCase().includes(q);
  });

  if (loading) {
    return <Spinner variant="radial" progress={72} label="Loading MoSPI Knowledge Base..." className="py-20" />;
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Official Source Library & Knowledge Repository"
        subtitle="Ingest official MoSPI manuals, survey schedules, and video transcripts to ground AI question generation with zero hallucination."
      />

      {/* ── Visual 3-Step RAG Grounding Workflow Stepper ── */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#1E3A8A]">
            <ShieldCheck size={18} className="text-[#1E3A8A]" />
            Official MoSPI Grounding Workflow (Zero-Hallucination Pipeline)
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-xs">
            ISO / NQAF Data Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E3A8A]">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Upload Official Document
            </div>
            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
              Upload survey manuals (PDF), code dictionaries (CSV/JSON), or lecture transcripts (TXT/MD).
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E3A8A]">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Vector Ingestion & Checksum
            </div>
            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
              Text is hashed with SHA-256 and split into 1,000-character vector embeddings with traceable chunk IDs.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E3A8A]">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Grounded AI Generation
            </div>
            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
              Assessment generation and diagnostic tests quote exact paragraph evidence, preventing hallucinated questions.
            </p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" title="Action Failed" message={error} />}

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        {/* ── Left Column: Ingested Knowledge Sources List ── */}
        <div className="space-y-4">
          <Card
            title="Ingested Sources"
            subtitle={`${sources.length} registered official documents`}
          >
            {/* Search Sources Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered manuals..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            {filteredSources.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No matching sources"
                message="Upload a manual or data dictionary to start."
              />
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredSources.map((src) => {
                  const isSelected = selectedSource?.id === src.id;
                  const chunkCount = src.chunksCount || 0;

                  return (
                    <div
                      key={src.id}
                      onClick={() => setSelectedSource(src)}
                      className={`group relative rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-blue-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-blue-200 shadow-xs">
                          {src.documentType}
                        </span>
                        <span className="text-[9.5px] font-mono font-bold text-slate-500">
                          {src.externalId || 'MOSPI-DOC'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {src.name}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#1E3A8A]" />
                          {chunkCount} {chunkCount === 1 ? 'Chunk' : 'Chunks'}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              chunkCount > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {chunkCount > 0 ? '✓ INGESTED' : 'PENDING'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSource(src.id, src.name);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-white"
                            title="Delete source from knowledge base"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right Column: Upload & Ingest Dropzone + Detailed Chunks Inspector ── */}
        <div className="space-y-6">
          {/* 1. Upload & Ingestion Card */}
          <Card
            title="Upload & Ingest New Official Document"
            subtitle="Add official manuals, guidelines, video transcripts, or schemas for RAG AI grounding"
          >
            <form onSubmit={handleRegisterAndIngest} className="space-y-5">
              {/* Upload Mode Selector (File vs Text) */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMode('FILE_UPLOAD')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                    uploadMode === 'FILE_UPLOAD'
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5 inline mr-1.5" />
                  Upload Document File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('MANUAL_TEXT')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                    uploadMode === 'MANUAL_TEXT'
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1.5" />
                  Paste Text / Transcript
                </button>
              </div>

              {/* MODE A: Interactive Drag & Drop File Zone */}
              {uploadMode === 'FILE_UPLOAD' && (
                <div className="space-y-3">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-blue-200 hover:border-[#1E3A8A] bg-blue-50/30 hover:bg-blue-50/70 rounded-3xl p-8 text-center transition-all cursor-pointer space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.csv,.tsv,.json,.md,.sql"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-blue-100/80 border border-blue-200 text-[#1E3A8A] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <FileUp className="w-7 h-7 text-[#1E3A8A]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedFile ? (
                          <span className="text-[#1E3A8A] font-extrabold">{selectedFile.name}</span>
                        ) : (
                          <>
                            Drag & drop your official file here, or{' '}
                            <span className="text-[#1E3A8A] underline decoration-blue-400">browse files</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11.5px] text-slate-500 font-medium mt-1">
                        Supported formats: PDF manuals, CSV/JSON dictionaries, Markdown notes, TXT transcripts
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {['.PDF', '.TXT', '.CSV', '.JSON', '.MD', '.SQL'].map((ext) => (
                        <span
                          key={ext}
                          className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 shadow-xs"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Selected File Stats Badge */}
                  {selectedFile && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>File Extracted & Ready for Vector Ingestion</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setExtractedText('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-700 pt-1">
                        <div>
                          Size: <strong>{Math.round(selectedFile.size / 1024)} KB</strong>
                        </div>
                        <div>
                          Characters: <strong>{extractedText.length.toLocaleString()}</strong>
                        </div>
                        <div>
                          Est. Chunks:{' '}
                          <strong className="text-[#1E3A8A]">
                            ~{Math.max(1, Math.ceil(extractedText.length / 1000))}
                          </strong>
                        </div>
                      </div>

                      {/* Text Preview Toggle */}
                      {extractedText && (
                        <div className="pt-2 border-t border-emerald-200/80">
                          <button
                            type="button"
                            onClick={() => setShowTextPreview(!showTextPreview)}
                            className="text-[11px] font-bold text-[#1E3A8A] flex items-center gap-1 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {showTextPreview ? 'Hide Text Preview' : 'Show Extracted Text Preview'}
                          </button>

                          {showTextPreview && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                              {extractedText.slice(0, 2000)}
                              {extractedText.length > 2000 && '... [truncated preview]'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: Direct Manual Text Paste */}
              {uploadMode === 'MANUAL_TEXT' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Paste Lecture Transcript or Document Text Content *
                  </label>
                  <textarea
                    rows={6}
                    value={appendContent}
                    onChange={(e) => setAppendContent(e.target.value)}
                    placeholder="Paste official manual sections, video transcript text, or survey guidelines here for vector chunking..."
                    className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1E3A8A] leading-relaxed shadow-inner"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                    <span>
                      Character Count: <strong>{appendContent.length.toLocaleString()}</strong>
                    </span>
                    <span>
                      Est. Vector Chunks:{' '}
                      <strong className="text-[#1E3A8A]">
                        ~{Math.max(0, Math.ceil(appendContent.length / 1000))}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Document Metadata Form */}
              <div className="grid gap-4 md:grid-cols-3 pt-2">
                <div className="md:col-span-2">
                  <Input
                    label="Official Document Title *"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. NSS 80th Round Household Survey Manual 2026"
                  />
                </div>

                <Select
                  label="Document Category"
                  value={form.documentType}
                  onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                  options={SOURCE_TYPES}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    label="MoSPI Control Code / External ID"
                    value={form.externalId}
                    onChange={(e) => setForm({ ...form, externalId: e.target.value })}
                    placeholder="e.g. MOSPI-DOC-2026-005"
                  />
                  <p className="text-[10.5px] text-slate-400 font-medium mt-1">
                    Official tracking identifier used in AI citation footnotes.
                  </p>
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    loading={working}
                    className="w-full justify-center !text-white !bg-[#1E3A8A] hover:!bg-blue-900 py-3 rounded-xl shadow-md font-black"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Register & Ingest into Knowledge Base
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* 2. Selected Source Detail & Vector Chunks Explorer */}
          {selectedSource && (
            <Card
              title={selectedSource.name}
              subtitle={`Control Code: ${selectedSource.externalId || 'MOSPI-DOC'} • Type: ${selectedSource.documentType}`}
            >
              {/* Document Header Stats */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Vector Knowledge Status:</span>
                    <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {sourceChunksList.length || selectedSource.chunksCount || 0} Traceable Vector Chunks
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-500">
                    Format: 1,000 Char Embeddings (SHA-256 Hashed)
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedSource.summary ||
                    'Official MoSPI evidence source registered for AI grounding. When diagnostic assessments or blueprints are generated, questions cite these exact vector chunks.'}
                </p>

                {/* ⚡ Direct Question Generation Action for this specific file */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="text-[11.5px] text-slate-600 font-medium">
                    Target question generation exclusively to <strong className="text-slate-800">{selectedSource.name}</strong>:
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAssessmentForSource}
                    disabled={generatingAssessment || (sourceChunksList.length === 0 && !selectedSource.chunksCount)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {generatingAssessment
                        ? 'Generating Grounded Questions...'
                        : '⚡ Generate Assessment from this Document'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Banner when assessment has been generated from this document */}
              {generatedAssessmentInfo && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Assessment Ready: {generatedAssessmentInfo.title}
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Generated {generatedAssessmentInfo.questionsCount} questions derived 100% from this document's vector chunks.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveExamId(generatedAssessmentInfo.assessmentId)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-200" />
                      Take / Launch Exam Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneratedAssessmentInfo(null)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Vector Chunks Explorer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <FileSearch className="w-4 h-4 text-[#1E3A8A]" />
                    Inspect Traceable Vector Chunks ({filteredChunks.length})
                  </div>

                  {sourceChunksList.length > 0 && (
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={chunkSearch}
                        onChange={(e) => setChunkSearch(e.target.value)}
                        placeholder="Search chunk text..."
                        className="w-full pl-8 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  )}
                </div>

                {loadingChunks ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    Loading vector chunks for this source...
                  </div>
                ) : filteredChunks.length > 0 ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {filteredChunks.map((chunk, cIdx) => (
                      <div
                        key={chunk.id || cIdx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {chunk.chunkReference || `CHUNK-${String(cIdx + 1).padStart(4, '0')}`}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {chunk.text?.length || 0} chars • Range: [{chunk.textStart ?? 0} -{' '}
                            {chunk.textEnd ?? chunk.text?.length ?? 0}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-medium">
                    No vector chunks ingested for this source yet. You can append content below to generate chunks.
                  </div>
                )}
              </div>

              {/* Append Additional Content Form */}
              <form onSubmit={handleAppendToExisting} className="space-y-3 pt-6 border-t border-slate-200 mt-6">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Append Additional Text / Chapter to this Manual
                  <textarea
                    rows={3}
                    value={appendContent}
                    onChange={(e) => setAppendContent(e.target.value)}
                    placeholder="Paste additional sections, appendices, or amendments to append as new vector chunks..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none leading-relaxed"
                  />
                </label>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles size={14} className="text-[#1E3A8A]" />
                    Automatically hashed & added to this document's version history
                  </span>
                  <Button
                    type="submit"
                    loading={working}
                    disabled={!appendContent.trim()}
                    className="!text-white !bg-[#1E3A8A] hover:!bg-blue-900"
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    Append Vector Chunks
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>

      {activeExamId && (
        <AssessmentPlayerModal
          assessmentId={activeExamId}
          onClose={() => setActiveExamId(null)}
        />
      )}
    </div>
  );
}
