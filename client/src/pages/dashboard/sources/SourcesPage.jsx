import { useEffect, useState, useRef, useMemo } from 'react';
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
  FileCheck,
  Target,
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
  X,
  Bookmark,
  BookOpen,
  Copy,
  Edit3,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  cleanupDuplicateSources,
  listChunks,
  generateAssessmentFromSource,
  publishAssessment,
} from '../../../services/source.api.js';

const SOURCE_TYPES = [
  { value: 'PDF', label: 'PDF / Official Government Manual' },
  { value: 'VIDEO_TRANSCRIPT', label: 'Video Lecture / Audio Transcript' },
  { value: 'IGOT_MODULE', label: 'iGOT Karmayogi / Web Module' },
  { value: 'DATASET_SCHEMA', label: 'Dataset Schema / SQL Dictionary' },
  { value: 'TEXT', label: 'Plain Text Document' },
];

const CADRE_OPTIONS = [
  { value: 'All MoSPI Cadres', label: 'All MoSPI Cadres (Universal Foundation)' },
  { value: 'Senior Statistical Officer (SSO)', label: 'Senior Statistical Officer (SSO)' },
  { value: 'Junior Statistical Officer (JSO)', label: 'Junior Statistical Officer (JSO)' },
  { value: 'Data Informatics & Innovation Division (DIID)', label: 'Data Informatics & DIID Specialist' },
  { value: 'Field Operations Cadre (NSS / Survey Operations)', label: 'Field Operations & Survey Investigators' },
];

const EVALUATION_DEPTHS = [
  { value: 'BALANCED', label: 'Balanced Competency Check (Application & Analysis)' },
  { value: 'CASE_STUDY', label: 'Practical Case Scenarios (Field & Real-world Challenges)' },
  { value: 'REGULATORY_COMPLIANCE', label: 'Statutory & Quality Compliance (NQAF & MoSPI Standards)' },
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

  // Proactive duplicate detection modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Direct append content for selected source
  const [appendContent, setAppendContent] = useState('');

  // Deep Assessment Generation Configuration
  const [assessmentConfig, setAssessmentConfig] = useState({
    count: 5,
    targetCadre: 'All MoSPI Cadres',
    evaluationDepth: 'BALANCED',
  });
  const [selectedClauseIds, setSelectedClauseIds] = useState([]);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [generatedAssessmentInfo, setGeneratedAssessmentInfo] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [error, setError] = useState('');

  // Real-time duplicate check for the current form name
  const existingSourceMatch = useMemo(() => {
    if (!form.name || !form.name.trim()) return null;
    const clean = form.name.toLowerCase().trim();
    return sources.find((s) => s.name.toLowerCase().trim() === clean);
  }, [form.name, sources]);

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
      setSelectedClauseIds([]);
      return;
    }

    let active = true;
    setLoadingChunks(true);
    setSelectedClauseIds([]);

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

      // Check if duplicate item exists in repository and alert user
      const matched = sources.find(
        (s) => s.name.toLowerCase().trim() === cleanTitle.toLowerCase().trim()
      );
      if (matched) {
        setShowDuplicateModal(true);
      }
    } catch {
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

  // Reset upload form
  const resetUploadState = () => {
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
  };

  // Unified Ingestion Execution
  const executeIngest = async ({ updateExisting = false, overrideName = null } = {}) => {
    const docName = (overrideName || form.name).trim();
    const contentToIngest = uploadMode === 'FILE_UPLOAD' ? extractedText.trim() : appendContent.trim();

    setWorking(true);
    setError('');

    try {
      if (updateExisting && existingSourceMatch) {
        const ingestRes = await ingestSource(existingSourceMatch.id, {
          content: contentToIngest,
          maxChunkLength: 1000,
          overwrite: true,
        });

        toast.success(
          ingestRes.alreadyIngested
            ? `Official manual '${existingSourceMatch.name}' is already verified and active!`
            : `Official document '${existingSourceMatch.name}' updated & re-indexed with latest syllabus clauses!`,
          { duration: 4000 }
        );

        resetUploadState();
        setShowDuplicateModal(false);
        await refresh(existingSourceMatch.id);
        return;
      }

      // Step 1: Create source document record
      const result = await createSource({
        ...form,
        name: docName,
        updateExisting: false,
      });
      const createdSource = result.source || result;

      // Step 2: Ingest content & generate syllabus clauses
      await ingestSource(createdSource.id, {
        content: contentToIngest,
        maxChunkLength: 1000,
      });

      toast.success(
        `Official document '${createdSource.name}' registered & verified in knowledge repository!`,
        { duration: 4000 }
      );

      resetUploadState();
      setShowDuplicateModal(false);
      await refresh(createdSource.id);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(`Ingestion failed: ${msg}`);
    } finally {
      setWorking(false);
    }
  };

  // Form submit handler with Proactive Duplicate Modal Check
  const handleRegisterAndIngest = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter an official document title.');
      return;
    }

    const contentToIngest = uploadMode === 'FILE_UPLOAD' ? extractedText.trim() : appendContent.trim();

    if (!contentToIngest) {
      toast.error(
        uploadMode === 'FILE_UPLOAD'
          ? 'Please select a document file containing text, or paste content directly.'
          : 'Please enter or paste the text content to index.'
      );
      return;
    }

    // Intercept if document with identical title exists in repository
    if (existingSourceMatch) {
      setShowDuplicateModal(true);
      return;
    }

    await executeIngest({ updateExisting: false });
  };

  // Modal Action 1: Update Existing Document
  const handleUpdateExisting = async () => {
    await executeIngest({ updateExisting: true });
  };

  // Modal Action 2: Save as New Revision
  const handleSaveAsRevision = async () => {
    const baseName = form.name.replace(/\s*\(Rev.*?\)$/i, '').trim();
    const count = sources.filter((s) => s.name.toLowerCase().startsWith(baseName.toLowerCase())).length;
    const revisionName = `${baseName} (Rev ${count + 1})`;
    setForm((prev) => ({ ...prev, name: revisionName }));
    await executeIngest({ updateExisting: false, overrideName: revisionName });
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

      toast.success('Additional section verified and appended to this document syllabus!');
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

  // Deep Administrative Question Generation
  const handleGenerateAssessmentForSource = async () => {
    if (!selectedSource?.id) return;
    setGeneratingAssessment(true);
    setError('');
    setIsPublished(false);
    try {
      const res = await generateAssessmentFromSource(selectedSource.id, {
        count: assessmentConfig.count,
        targetCadre: assessmentConfig.targetCadre,
        evaluationDepth: assessmentConfig.evaluationDepth,
        selectedChunkIds: selectedClauseIds.length > 0 ? selectedClauseIds : undefined,
      });
      setGeneratedAssessmentInfo(res);
      setShowVerifyModal(true);
      toast.success(
        `Generated grounded assessment with ${res.questionsCount} questions tailored for ${assessmentConfig.targetCadre}!`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGeneratingAssessment(false);
    }
  };

  // Publish Generated Assessment
  const handlePublishAssessment = async () => {
    if (!generatedAssessmentInfo?.assessmentId) return;
    setIsPublishing(true);
    try {
      await publishAssessment(generatedAssessmentInfo.assessmentId);
      setIsPublished(true);
      toast.success(
        `Assessment '${generatedAssessmentInfo.title}' officially published! Available for cadre evaluation.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (sourceId, sourceName) => {
    if (!window.confirm(`Are you sure you want to remove '${sourceName}' and all its syllabus clauses from the repository?`)) {
      return;
    }

    try {
      await deleteSource(sourceId);
      toast.success(`Source '${sourceName}' removed from repository.`);
      if (selectedSource?.id === sourceId) {
        setSelectedSource(null);
      }
      await refresh();
    } catch (err) {
      toast.error(`Delete failed: ${err?.response?.data?.message || err.message}`);
    }
  };


  // Copy clause citation to clipboard
  const handleCopyCitation = (clause) => {
    const text = `[MoSPI Evidence Citation - ${selectedSource?.name || 'Manual'}]\nClause: ${clause.sectionReference || clause.chunkReference}\n"${clause.text}"`;
    navigator.clipboard.writeText(text);
    toast.success('Statutory evidence citation copied to clipboard!');
  };

  // Toggle Clause selection for targeted assessment
  const toggleClauseSelection = (chunkId) => {
    setSelectedClauseIds((prev) =>
      prev.includes(chunkId) ? prev.filter((id) => id !== chunkId) : [...prev, chunkId]
    );
  };

  // Edit question text inline in verification modal
  const handleUpdateQuestionStem = (idx, newStem) => {
    setGeneratedAssessmentInfo((prev) => {
      const qs = [...prev.questions];
      qs[idx] = { ...qs[idx], stem: newStem };
      return { ...prev, questions: qs };
    });
  };

  const handleUpdateOption = (qIdx, oIdx, newText) => {
    setGeneratedAssessmentInfo((prev) => {
      const qs = [...prev.questions];
      const q = { ...qs[qIdx] };
      const opts = [...q.options];
      opts[oIndex] = { ...opts[oIdx], text: newText };
      q.options = opts;
      qs[qIdx] = q;
      return { ...prev, questions: qs };
    });
  };

  // Filter sources for search
  const filteredSources = sources.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.externalId || '').toLowerCase().includes(q);
  });

  const totalIndexedChunks = sources.reduce((acc, s) => acc + (s.chunksCount || 0), 0);

  // Filter chunks for search
  const filteredChunks = sourceChunksList.filter((c) => {
    if (!chunkSearch.trim()) return true;
    const q = chunkSearch.toLowerCase();
    return (
      (c.text || '').toLowerCase().includes(q) ||
      (c.sectionReference || '').toLowerCase().includes(q) ||
      (c.chunkReference || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <Spinner variant="bar" label="Loading Official Knowledge Base..." description="Synchronizing official manuals and training curricula..." className="py-20" />;
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Official Source Library & Knowledge Repository"
        subtitle="Ingest official MoSPI survey manuals, statistical guidelines, and training curricula to ground AI question generation with zero hallucination."
      />

      {error && <Alert type="error" title="Action Failed" message={error} />}

      <div className="grid gap-6 xl:grid-cols-[23rem_1fr] items-stretch">
        {/* ── Left Column: Ingested Knowledge Sources List (Full Height) ── */}
        <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Column Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Official Repository</h3>
                <p className="text-[11px] text-slate-500 font-medium">{sources.length} registered official documents</p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                Knowledge Base
              </span>
            </div>

            {/* Search Sources Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, circular no., or subject..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Sources List - Fills entire vertical height of right column */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2.5 min-h-[440px]">
            {filteredSources.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No matching sources"
                message="Upload an official manual or data dictionary to start."
              />
            ) : (
              filteredSources.map((src) => {
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
                        <BookOpen className="w-3 h-3 text-[#1E3A8A]" />
                        {chunkCount} {chunkCount === 1 ? 'Clause' : 'Clauses'}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            chunkCount > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {chunkCount > 0 ? '✓ ACTIVE' : 'PENDING'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSource(src.id, src.name);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-white cursor-pointer"
                          title="Delete source from knowledge repository"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Left Column Bottom Audit Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/90 shrink-0 text-slate-600 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Repository Status
              </span>
              <span className="text-[10.5px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Fully Synchronized
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1.5 border-t border-slate-200/80">
              <div>
                Total Clauses: <strong className="text-slate-900">{totalIndexedChunks.toLocaleString()}</strong>
              </div>
              <div className="text-right">
                Statutory Level: <strong className="text-slate-900">MoSPI Verified</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Upload Dropzone + Detailed Clauses Inspector & Assessment Generator ── */}
        <div className="space-y-6">
          {/* 1. Upload & Ingestion Card */}
          <Card
            title="Upload & Index Official Knowledge Document"
            subtitle="Register official MoSPI guidelines, survey protocols, or training modules for AI assessment grounding"
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
                  Paste Text / Circular
                </button>
              </div>

              {/* MODE A: Interactive Drag & Drop File Zone */}
              {uploadMode === 'FILE_UPLOAD' && (
                <div className="space-y-3">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-blue-200 hover:border-[#1E3A8A] bg-blue-50/30 hover:bg-blue-50/70 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3"
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
                        Supported formats: PDF manuals, CSV/JSON data dictionaries, Markdown notes, TXT circulars
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
                          <span>File Extracted & Ready for Syllabus Indexing</span>
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
                          Estimated Clauses:{' '}
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
                    Paste Official Circular or Manual Text Content *
                  </label>
                  <textarea
                    rows={6}
                    value={appendContent}
                    onChange={(e) => setAppendContent(e.target.value)}
                    placeholder="Paste official manual sections, circular text, or survey guidelines here for indexing..."
                    className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1E3A8A] leading-relaxed shadow-inner"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                    <span>
                      Character Count: <strong>{appendContent.length.toLocaleString()}</strong>
                    </span>
                    <span>
                      Est. Clauses:{' '}
                      <strong className="text-[#1E3A8A]">
                        ~{Math.max(0, Math.ceil(appendContent.length / 1000))}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Proactive Duplicate Alert Notice */}
              {existingSourceMatch && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-amber-900">
                        Existing Item Match:
                      </span>{' '}
                      <span className="font-semibold text-slate-800">
                        "{existingSourceMatch.name}"
                      </span>{' '}
                      <span className="text-slate-500 font-normal">
                        ({existingSourceMatch.chunksCount || 0} indexed clauses)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDuplicateModal(true)}
                    className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>View Modal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Document Metadata Form */}
              <div className="grid gap-4 md:grid-cols-3 pt-1">
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
                    label="MoSPI Circular No. / External Control Code"
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
                    {existingSourceMatch && duplicateResolution === 'UPDATE_EXISTING'
                      ? 'Update & Re-Index Source'
                      : 'Register & Index into Repository'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* 2. Selected Source Detail & Deep Assessment Engine */}
          {selectedSource && (
            <Card
              title={selectedSource.name}
              subtitle={`Control Code: ${selectedSource.externalId || 'MOSPI-DOC'} • Type: ${selectedSource.documentType}`}
            >
              {/* Document Header Stats */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Repository Status:</span>
                    <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {sourceChunksList.length || selectedSource.chunksCount || 0} Verified Syllabus Clauses
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500">
                    Statutory MoSPI Curriculum • Evidence Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedSource.summary ||
                    'Official MoSPI evidence source registered for AI grounding. When diagnostic assessments or competency blueprints are generated, questions cite these exact syllabus clauses.'}
                </p>

                {/* Deep Assessment Generation Control Suite */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E3A8A]">
                      <FileCheck className="w-4 h-4 text-[#1E3A8A]" />
                      <span>Statutory Assessment Generator (Admin Configuration)</span>
                    </div>
                    {selectedClauseIds.length > 0 && (
                      <span className="text-[11px] font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {selectedClauseIds.length} clause(s) selected
                      </span>
                    )}
                  </div>

                  {/* Configuration Controls Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <Select
                      label="Target Cadre / Role"
                      size="sm"
                      value={assessmentConfig.targetCadre}
                      onChange={(e) => setAssessmentConfig({ ...assessmentConfig, targetCadre: e.target.value })}
                      options={CADRE_OPTIONS}
                    />

                    <Select
                      label="Number of Questions"
                      size="sm"
                      value={assessmentConfig.count}
                      onChange={(e) => setAssessmentConfig({ ...assessmentConfig, count: Number(e.target.value) })}
                      options={[
                        { value: 3, label: '3 Questions (Quick Knowledge Pulse)' },
                        { value: 5, label: '5 Questions (Standard Diagnostic)' },
                        { value: 10, label: '10 Questions (Comprehensive Certification)' },
                      ]}
                    />

                    <Select
                      label="Cognitive Depth"
                      size="sm"
                      value={assessmentConfig.evaluationDepth}
                      onChange={(e) => setAssessmentConfig({ ...assessmentConfig, evaluationDepth: e.target.value })}
                      options={EVALUATION_DEPTHS}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Scope:{' '}
                      <strong className="text-slate-800">
                        {selectedClauseIds.length > 0
                          ? `Targeting ${selectedClauseIds.length} Selected Clauses`
                          : `Entire Document (${sourceChunksList.length} Clauses)`}
                      </strong>
                    </p>

                    <button
                      type="button"
                      onClick={handleGenerateAssessmentForSource}
                      disabled={generatingAssessment || (sourceChunksList.length === 0 && !selectedSource.chunksCount)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 hover:from-blue-900 hover:to-slate-900 active:scale-95 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 border border-blue-900/60 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      <span>
                        {generatingAssessment
                          ? 'Generating Grounded Questions...'
                          : 'Generate Evidence-Grounded Assessment'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner when assessment has been generated from this document */}
              {generatedAssessmentInfo && (
                <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-blue-900/40 text-white mb-5 shadow-lg overflow-hidden animate-in fade-in">
                  {/* Top Bar: Title & Status */}
                  <div className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 bg-black/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            Assessment Ready
                          </span>
                          <span className="text-xs font-black text-white truncate">
                            {generatedAssessmentInfo.title?.replace(/^Assessment:\s*/i, '')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {generatedAssessmentInfo.questionsCount} questions generated & derived 100% from official verified clauses.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedAssessmentInfo(null);
                        setIsPublished(false);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors self-start md:self-center cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Bar: Action Buttons */}
                  <div className="px-5 py-3 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Target Cadre: <strong className="text-white">{assessmentConfig.targetCadre}</strong></span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowVerifyModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-blue-100 border border-blue-800/60 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Inspect & Verify Questions ({generatedAssessmentInfo.questionsCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePublishAssessment}
                        disabled={isPublishing || isPublished}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer border ${
                          isPublished
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 hover:from-blue-900 hover:to-slate-900 active:scale-95 text-white border-blue-400/30 shadow-md'
                        } disabled:opacity-70`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>
                          {isPublishing
                            ? 'Publishing...'
                            : isPublished
                            ? 'Published & Active'
                            : 'Publish Assignment'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/assessments')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer border border-slate-700 transition-all"
                      >
                        <span>Assessments Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Reference Clauses & Syllabus Sections */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <BookOpen className="w-4 h-4 text-[#1E3A8A]" />
                    Official Reference Clauses & Syllabus Sections ({filteredChunks.length})
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedClauseIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedClauseIds([])}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        Clear Selection ({selectedClauseIds.length})
                      </button>
                    )}

                    {sourceChunksList.length > 0 && (
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={chunkSearch}
                          onChange={(e) => setChunkSearch(e.target.value)}
                          placeholder="Search clauses, policy rules, or text..."
                          className="w-full pl-8 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {loadingChunks ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    Loading verified syllabus sections for this document...
                  </div>
                ) : filteredChunks.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredChunks.map((chunk, cIdx) => {
                      const isSelected = selectedClauseIds.includes(chunk.id);
                      const clauseTitle =
                        chunk.sectionReference || chunk.metadata?.clauseTitle || `Clause ${cIdx + 1}.0`;
                      const wordCount = chunk.metadata?.wordCount || chunk.text?.trim().split(/\s+/).length || 0;

                      return (
                        <div
                          key={chunk.id || cIdx}
                          className={`p-4 rounded-2xl border transition-all shadow-2xs space-y-2 text-left ${
                            isSelected
                              ? 'border-[#1E3A8A] bg-blue-50/40'
                              : 'border-slate-200 bg-white hover:border-blue-200'
                          }`}
                        >
                          {/* Clause Header */}
                          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleClauseSelection(chunk.id)}
                                className="text-slate-400 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                                title={isSelected ? 'Deselect clause' : 'Select clause for assessment'}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#1E3A8A]" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>

                              <span className="font-extrabold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                                CLAUSE {cIdx + 1}.0
                              </span>

                              <h5 className="font-bold text-slate-900 text-xs truncate max-w-md">
                                {clauseTitle}
                              </h5>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                              <span>~{wordCount} words</span>
                              <span>•</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {chunk.chunkReference?.slice(0, 16)}...
                              </span>
                            </div>
                          </div>

                          {/* Clause Body Text */}
                          <p className="text-xs text-slate-700 font-normal leading-relaxed whitespace-pre-wrap pl-6">
                            {chunk.text}
                          </p>

                          {/* Clause Action Footer */}
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 pl-6">
                            <button
                              type="button"
                              onClick={() => toggleClauseSelection(chunk.id)}
                              className={`font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                                isSelected ? 'text-[#1E3A8A]' : 'text-slate-500 hover:text-[#1E3A8A]'
                              }`}
                            >
                              <Target className="w-3 h-3" />
                              <span>{isSelected ? '✓ Selected for Assessment' : 'Target this Clause'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyCitation(chunk)}
                              className="text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                              title="Copy citation"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Citation</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-medium">
                    No verified clauses found for this source yet. You can append content below to index new clauses.
                  </div>
                )}
              </div>

              {/* Append Additional Content Form */}
              <form onSubmit={handleAppendToExisting} className="space-y-3 pt-6 border-t border-slate-200 mt-6">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Append Additional Section / Circular to this Manual
                  <textarea
                    rows={3}
                    value={appendContent}
                    onChange={(e) => setAppendContent(e.target.value)}
                    placeholder="Paste additional chapters, circular amendments, or appendices to index as verified clauses..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none leading-relaxed"
                  />
                </label>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck size={14} className="text-[#1E3A8A]" />
                    Automatically cross-referenced and appended to this document's official syllabus
                  </span>
                  <Button
                    type="submit"
                    loading={working}
                    disabled={!appendContent.trim()}
                    className="!text-white !bg-[#1E3A8A] hover:!bg-blue-900"
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    Append Verified Clause
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* ── Generated Questions Verification & Oversight Modal ── */}
      {showVerifyModal && generatedAssessmentInfo && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl lg:max-w-5xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header (Dark Blue Black Enterprise Theme) */}
            <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                    Statutory Evidence Verification
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Target: {generatedAssessmentInfo.targetCadre || assessmentConfig.targetCadre}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1">
                  {generatedAssessmentInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable list of questions */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-center justify-between">
                <span>
                  Source Document: <strong className="text-slate-900">{generatedAssessmentInfo.sourceName}</strong>
                </span>
                <span className="font-bold text-[#1E3A8A]">
                  {generatedAssessmentInfo.questions?.length || generatedAssessmentInfo.questionsCount} Questions Verified & Grounded
                </span>
              </div>

              {(generatedAssessmentInfo.questions || []).map((q, idx) => {
                const isEditing = editingQuestionIdx === idx;

                return (
                  <div key={q.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900">
                        Problem Statement {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          Bloom: {q.bloomLevel || q.bloom_level || 'APPLY'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionIdx(isEditing ? null : idx)}
                          className="text-[11px] font-bold text-slate-500 hover:text-[#1E3A8A] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stem - editable or static */}
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={q.stem}
                        onChange={(e) => handleUpdateQuestionStem(idx, e.target.value)}
                        className="w-full text-xs font-medium text-slate-900 p-2.5 rounded-xl border border-blue-300 focus:outline-none focus:border-[#1E3A8A] leading-relaxed shadow-inner"
                      />
                    ) : (
                      <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {q.stem}
                      </p>
                    )}

                    {/* Options */}
                    <div className="space-y-1.5 pt-1">
                      {(q.options || []).map((opt, oIdx) => {
                        const optText = typeof opt === 'object' ? opt.text : String(opt);
                        const isCorrect = typeof opt === 'object' ? Boolean(opt.is_correct || opt.isCorrect) : oIdx === 0;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={optText}
                                  onChange={(e) => handleUpdateOption(idx, oIdx, e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900"
                                />
                              ) : (
                                <span>{optText}</span>
                              )}
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1 shrink-0 ml-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation / Grounding Citation */}
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Statutory Grounding Citation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer (Dark Blue Black Enterprise Theme) */}
            <div className="px-6 py-4 border-t border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    navigate('/dashboard/assessments');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-blue-300 hover:text-blue-100 border border-blue-900/60 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assessments Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    navigate('/dashboard/review-queue');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Review Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePublishAssessment}
                  disabled={isPublishing || isPublished}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                    isPublished
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 hover:from-blue-900 hover:to-slate-900 active:scale-95 text-white border-blue-400/30 shadow-md'
                  } disabled:opacity-70`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isPublishing
                      ? 'Publishing...'
                      : isPublished
                      ? 'Published & Active'
                      : 'Publish Assignment'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Duplicate Item Warning & Resolution Modal ── */}
      {showDuplicateModal && existingSourceMatch && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                      Duplicate Item Detected
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white mt-0.5">
                    Document Already Exists in Repository
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                An official document matching <strong className="text-slate-900">"{existingSourceMatch.name}"</strong> is already registered and indexed in the knowledge repository. Uploading duplicate copies leads to conflicting evidence citations.
              </p>

              {/* Document Comparison Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1.5 border-r border-slate-200 pr-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Existing In Repository
                  </span>
                  <p className="font-bold text-slate-900 line-clamp-2">{existingSourceMatch.name}</p>
                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div>Ref: {existingSourceMatch.externalId || 'MOSPI-DOC'}</div>
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {existingSourceMatch.chunksCount || 0} verified clauses
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pl-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A] block">
                    Incoming Upload
                  </span>
                  <p className="font-bold text-slate-900 line-clamp-2">{form.name}</p>
                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div>Type: {form.documentType}</div>
                    <div className="text-[#1E3A8A] font-bold">
                      ~{Math.max(1, Math.ceil(((uploadMode === 'FILE_UPLOAD' ? extractedText : appendContent).length || 1000) / 1000))} estimated clauses
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Advice */}
              <div className="text-[11.5px] text-slate-600 space-y-1 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                <strong className="text-amber-900 font-bold block">Choose how to resolve:</strong>
                <p>
                  <strong>Update & Re-Index:</strong> Overwrites existing clauses with the updated content while keeping references intact.
                </p>
                <p>
                  <strong>Save as Revision:</strong> Registers a separate version named <em>"{form.name.replace(/\s*\(Rev.*?\)$/i, '')} (Rev {(sources.filter((s) => s.name.toLowerCase().startsWith(form.name.replace(/\s*\(Rev.*?\)$/i, '').toLowerCase())).length) + 1})"</em>.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel Upload
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={working}
                  onClick={handleSaveAsRevision}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  Save as Revision Edition
                </button>

                <button
                  type="button"
                  disabled={working}
                  onClick={handleUpdateExisting}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 hover:from-blue-900 hover:to-slate-900 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-60 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${working ? 'animate-spin' : ''}`} />
                  <span>{working ? 'Updating...' : 'Update & Re-Index Existing'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

