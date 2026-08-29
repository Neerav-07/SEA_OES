import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  XCircle,
  Search,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Checkbox from '../../../components/Checkbox.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import Input from '../../../components/Input.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Select from '../../../components/Select.jsx';
import Spinner from '../../../components/Spinner.jsx';
import {
  createAssessmentBlueprint,
  getAssessmentBlueprint,
  listAssessmentBlueprints,
  listBlueprintClaims,
  listBlueprintCompetencies,
  listBlueprintLearningObjectives,
  updateAssessmentBlueprint,
  validateAssessmentBlueprint,
  listOfficialAssessments,
  getOfficialAssessment,
} from '../../../services/assessmentBlueprint.api.js';
import { assembleAssessment, generateQuestion, getAssessment, reviewQuestion, reviseQuestion, validateAssessment, validateQuestion } from '../../../services/source.api.js';
import AssessmentPlayerModal from './AssessmentPlayerModal.jsx';

const COGNITIVE_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'];
const QUESTION_TYPES = ['MCQ', 'SCENARIO'];
const EVIDENCE_TYPES = [
  'Knowledge Evidence (MCQ / Quiz)',
  'Application Evidence (Scenario / Case Study)',
  'Performance Evidence (Virtual Lab / Exercise)',
  'External Certificate / Accredited Training',
  'iGOT / NSSTA Course Module Completion',
];

export function autoBalanceCognitive(count) {
  const total = Math.max(1, Number(count) || 5);
  const rem = Math.max(0, Math.floor(total * 0.1));
  const und = Math.max(0, Math.floor(total * 0.2));
  const app = Math.max(1, Math.floor(total * 0.4));
  const ana = Math.max(0, Math.floor(total * 0.2));
  const eva = total - (rem + und + app + ana);
  return {
    REMEMBER: rem,
    UNDERSTAND: und,
    APPLY: app,
    ANALYZE: ana,
    EVALUATE: Math.max(0, eva),
  };
}

const emptyForm = () => ({
  title: '',
  status: 'DRAFT',
  competencyId: '',
  targetProficiency: '3.5',
  questionCount: '5',
  cognitiveDistribution: { REMEMBER: 1, UNDERSTAND: 1, APPLY: 2, ANALYZE: 1, EVALUATE: 0 },
  supportedQuestionTypes: ['MCQ', 'SCENARIO'],
  claims: [],
  learningObjectives: [],
  sourceRestrictions: { documentIds: [], documentVersionIds: [] },
  evidenceRequirements: { evidenceTypes: ['Knowledge Evidence (MCQ / Quiz)', 'Application Evidence (Scenario / Case Study)'], requireGrounding: true },
});

function apiErrors(error) {
  const response = error?.response?.data;
  if (Array.isArray(response?.errors) && response.errors.length > 0) return response.errors;
  return [{ code: 'API_ERROR', field: '', message: response?.message || error?.message || 'The request could not be completed.' }];
}

function mappingIds(mappings, key) {
  return new Set((mappings || []).map((mapping) => mapping[key]));
}

function blueprintToForm(result) {
  const blueprint = result?.blueprint || {};
  return {
    title: blueprint.title || '',
    status: blueprint.status || 'DRAFT',
    competencyId: blueprint.competencyId || '',
    targetProficiency: blueprint.targetProficiency ?? '',
    questionCount: blueprint.questionCount ?? '',
    cognitiveDistribution: blueprint.cognitiveDistribution || {},
    supportedQuestionTypes: Array.isArray(blueprint.supportedQuestionTypes) ? blueprint.supportedQuestionTypes : [],
    claims: (Array.isArray(result.claims) ? result.claims : []).map((mapping) => ({ claimId: mapping.claimId, questionCount: mapping.questionCount })),
    learningObjectives: (Array.isArray(result.learningObjectives) ? result.learningObjectives : []).map((mapping) => ({
      learningObjectiveId: mapping.learningObjectiveId,
      questionCount: mapping.questionCount,
    })),
    sourceRestrictions: {
      documentIds: Array.isArray(blueprint.sourceRestrictions?.documentIds) ? blueprint.sourceRestrictions.documentIds : [],
      documentVersionIds: Array.isArray(blueprint.sourceRestrictions?.documentVersionIds) ? blueprint.sourceRestrictions.documentVersionIds : [],
    },
    evidenceRequirements: {
      evidenceTypes: Array.isArray(blueprint.evidenceRequirements?.evidenceTypes) ? blueprint.evidenceRequirements.evidenceTypes : [],
      requireGrounding: blueprint.evidenceRequirements?.requireGrounding || false,
    },
  };
}

function toPayload(form) {
  return {
    ...form,
    targetProficiency: Number(form.targetProficiency),
    questionCount: Number(form.questionCount),
    cognitiveDistribution: Object.fromEntries(
      COGNITIVE_LEVELS.map((level) => [level, Number(form.cognitiveDistribution[level] || 0)]),
    ),
  };
}

function identifiersFromText(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function errorForField(errors, field) {
  return errors.find((error) => error.field === field)?.message || '';
}

export default function AssessmentsPage() {
  const [blueprints, setBlueprints] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [learningObjectives, setLearningObjectives] = useState([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PUBLISHED_ASSESSMENTS'); // 'PUBLISHED_ASSESSMENTS' | 'BLUEPRINT_STUDIO'
  const [officialAssessments, setOfficialAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [expandedAssessmentId, setExpandedAssessmentId] = useState(null);
  const [previewExamId, setPreviewExamId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState('');
  const [questionAction, setQuestionAction] = useState(false);
  const [assemblyResult, setAssemblyResult] = useState(null);
  const [assembling, setAssembling] = useState(false);
  const lookupRequestRef = useRef(0);

  const refreshOfficialAssessments = async () => {
    try {
      setLoadingAssessments(true);
      const list = await listOfficialAssessments();
      setOfficialAssessments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load official assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const loadLookupData = async (competencyId) => {
    const requestId = lookupRequestRef.current + 1;
    lookupRequestRef.current = requestId;
    if (!competencyId) {
      setClaims([]);
      setLearningObjectives([]);
      return;
    }
    setLoadingLookups(true);
    try {
      const [claimResponse, objectiveResponse] = await Promise.all([
        listBlueprintClaims(competencyId),
        listBlueprintLearningObjectives(competencyId),
      ]);
      if (!Array.isArray(claimResponse?.items) || !Array.isArray(objectiveResponse?.items)) {
        throw new Error('Lookup data returned an invalid response.');
      }
      if (requestId !== lookupRequestRef.current) return;
      setClaims(claimResponse.items);
      setLearningObjectives(objectiveResponse.items);
    } catch (error) {
      if (requestId !== lookupRequestRef.current) return;
      setClaims([]);
      setLearningObjectives([]);
      setPageError(apiErrors(error)[0].message);
    } finally {
      if (requestId === lookupRequestRef.current) setLoadingLookups(false);
    }
  };

  const loadBlueprint = async (id) => {
    setLoadingBlueprint(true);
    setPageError('');
    setErrors([]);
    setValidationResult(null);
    try {
      const result = await getAssessmentBlueprint(id);
      if (!result?.blueprint || !Array.isArray(result.claims) || !Array.isArray(result.learningObjectives)) throw new Error('Blueprint response returned an invalid shape.');
      const nextForm = blueprintToForm(result);
      setSelectedBlueprintId(id);
      setForm(nextForm);
      await loadLookupData(nextForm.competencyId);
    } catch (error) {
      setPageError(apiErrors(error)[0].message);
    } finally {
      setLoadingBlueprint(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      listAssessmentBlueprints(),
      listBlueprintCompetencies(),
      listOfficialAssessments(),
    ])
      .then(([blueprintResponse, competencyResponse, officialList]) => {
        if (!active) return;
        if (Array.isArray(blueprintResponse?.items)) {
          setBlueprints(blueprintResponse.items);
        }
        if (Array.isArray(competencyResponse?.items)) {
          setCompetencies(competencyResponse.items);
        }
        if (Array.isArray(officialList)) {
          setOfficialAssessments(officialList);
        }
      })
      .catch((error) => {
        if (active) setPageError(apiErrors(error)[0].message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors([]);
    setValidationResult(null);
    setSuccessMessage('');
  };

  const handleNew = () => {
    setSelectedBlueprintId('');
    setForm(emptyForm());
    setClaims([]);
    setLearningObjectives([]);
    setErrors([]);
    setValidationResult(null);
    setPageError('');
    setSuccessMessage('');
    toast.success('Started a new blueprint draft. Fill in details below.');
    setTimeout(() => {
      const el = document.getElementById('blueprint-title-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleCompetencyChange = async (event) => {
    const competencyId = event.target.value;
    updateForm('competencyId', competencyId);
    setForm((current) => ({ ...current, competencyId, claims: [], learningObjectives: [] }));
    setClaims([]);
    setLearningObjectives([]);
    setPageError('');
    await loadLookupData(competencyId);
  };

  const toggleMapping = (field, identifierField, identifier, checked) => {
    setForm((current) => ({
      ...current,
      [field]: checked
        ? [...current[field], { [identifierField]: identifier, questionCount: 1 }]
        : current[field].filter((mapping) => mapping[identifierField] !== identifier),
    }));
    setErrors([]);
    setValidationResult(null);
  };

  const updateMappingCount = (field, identifierField, identifier, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((mapping) => (
        mapping[identifierField] === identifier ? { ...mapping, questionCount: value === '' ? '' : Number(value) } : mapping
      )),
    }));
    setErrors([]);
  };

  const toggleListValue = (field, value) => {
    const values = form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value];
    updateForm(field, values);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setErrors([]);
    setPageError('');
    setSuccessMessage('');

    if (!form.title.trim() || !form.competencyId || !form.targetProficiency || Number(form.questionCount) <= 0) {
      const err = [{ code: 'CLIENT_FORM_INCOMPLETE', field: 'form', message: 'Complete the required blueprint fields (Title, Competency, Target Proficiency, and Question Count) before saving.' }];
      setErrors(err);
      toast.error('Please complete all required blueprint fields.');
      return;
    }

    const qCount = Number(form.questionCount);
    const cogSum = COGNITIVE_LEVELS.reduce((acc, lvl) => acc + (Number(form.cognitiveDistribution?.[lvl]) || 0), 0);
    if (cogSum !== qCount) {
      const err = [{
        code: 'COGNITIVE_ALLOCATION_MISMATCH',
        field: 'cognitiveDistribution',
        message: `Cognitive allocation sum (${cogSum}) must equal question count (${qCount}). Click "⚡ Auto-Balance" on the Cognitive Distribution card.`,
      }];
      setErrors(err);
      toast.error(`Cognitive allocation sum (${cogSum}) must equal Question Count (${qCount}).`);
      const el = document.getElementById('cognitive-distribution-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    try {
      const result = selectedBlueprintId
        ? await updateAssessmentBlueprint(selectedBlueprintId, toPayload(form))
        : await createAssessmentBlueprint(toPayload(form));
      const id = result?.blueprint?.id;
      if (!id) throw new Error('The server did not return a persisted blueprint.');
      setSelectedBlueprintId(id);
      const refreshed = await getAssessmentBlueprint(id);
      setForm(blueprintToForm(refreshed));
      await loadLookupData(refreshed.blueprint.competencyId);
      const listResponse = await listAssessmentBlueprints();
      setBlueprints(Array.isArray(listResponse?.items) ? listResponse.items : []);
      setSuccessMessage('Blueprint draft saved successfully.');
      toast.success('Blueprint draft saved successfully!');
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Failed to save blueprint draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedBlueprintId) {
      const err = [{ code: 'BLUEPRINT_NOT_PERSISTED', field: 'blueprint', message: 'Save the blueprint draft before validating it.' }];
      setErrors(err);
      toast.error('Save the blueprint draft before validating.');
      return;
    }
    setValidating(true);
    setPageError('');
    try {
      const result = await validateAssessmentBlueprint(selectedBlueprintId);
      if (typeof result?.valid !== 'boolean' || !Array.isArray(result?.errors) || !Array.isArray(result?.warnings)) {
        throw new Error('Validation response returned an invalid shape.');
      }
      setValidationResult(result);
      if (result.valid) {
        toast.success('Validation Passed: Blueprint is 100% compliant!');
      } else {
        toast.error('Validation found issues: Please check highlighted warnings.');
      }
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Validation failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBlueprintId) {
      const err = [{ code: 'BLUEPRINT_NOT_PERSISTED', field: 'blueprint', message: 'Save the blueprint before generating a question.' }];
      setErrors(err);
      toast.error('Save the blueprint before generating questions.');
      return;
    }
    setGenerating(true);
    setGenProgress(18);
    setGenStep('Parsing Competency Claims & Bloom Taxonomy requirements...');
    setErrors([]);
    setGenerationResult(null);

    const t1 = setTimeout(() => {
      setGenProgress(46);
      setGenStep('Retrieving Grounded MoSPI Reference Manuals & Chunks...');
    }, 450);

    const t2 = setTimeout(() => {
      setGenProgress(76);
      setGenStep('AI Synthesis: Formulating scenario, distractor choices & rationale...');
    }, 1100);

    const t3 = setTimeout(() => {
      setGenProgress(92);
      setGenStep('Deduplication verification & provenance citation alignment...');
    }, 1800);

    try {
      const result = await generateQuestion({
        blueprintId: selectedBlueprintId,
        claimId: form.claims[0]?.claimId,
        learningObjectiveId: form.learningObjectives[0]?.learningObjectiveId,
        questionType: form.supportedQuestionTypes[0] || 'MCQ',
      });
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setGenProgress(100);
      setGenStep('Question successfully generated and grounded in source evidence!');
      setGenerationResult(result);
      toast.success('AI Question successfully generated from grounded material!');
      setTimeout(() => {
        document.getElementById('generated-question-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Question generation failed.');
    } finally {
      setTimeout(() => {
        setGenerating(false);
      }, 400);
    }
  };

  const handleQuestionValidation = async () => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true);
    setErrors([]);
    try {
      const validation = await validateQuestion(generationResult.question.id);
      setGenerationResult((prev) => ({
        ...prev,
        validation,
        question: { ...prev.question, validationStatus: validation.valid ? 'PASSED' : 'FAILED', reviewStatus: validation.status },
        questionVersion: { ...prev.questionVersion, validationStatus: validation.valid ? 'PASSED' : 'FAILED', reviewStatus: validation.status },
      }));
      if (validation.valid) {
        toast.success(`Question Validated (Score: ${validation.score}%) — Status: ${validation.status}`);
      } else {
        toast.error(`Validation found issues: ${validation.errors?.[0]?.message || 'Check validation errors below.'}`);
      }
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Question validation failed.');
    } finally {
      setQuestionAction(false);
    }
  };

  const handleReview = async (action) => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true);
    setErrors([]);
    try {
      const result = await reviewQuestion(generationResult.question.id, { action });
      setGenerationResult((prev) => ({
        ...prev,
        question: { ...prev.question, ...result.question },
        questionVersion: { ...prev.questionVersion, ...result.version },
      }));
      if (action === 'APPROVE') {
        toast.success('Question Approved! Added to blueprint question bank.');
      } else if (action === 'REJECT') {
        toast.success('Question marked as REJECTED.');
      } else {
        toast.success('Question marked for revision.');
      }
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || `Failed to ${action.toLowerCase()} question.`);
    } finally {
      setQuestionAction(false);
    }
  };

  const handleRevision = async () => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true);
    setErrors([]);
    try {
      const result = await reviseQuestion(generationResult.question.id, { rationale: 'Revised during review.' });
      setGenerationResult((prev) => ({
        ...prev,
        questionVersion: result.version,
        revision: result,
      }));
      toast.success(`Created Question Version v${result.version?.version || 2} for revision.`);
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Failed to request revision.');
    } finally {
      setQuestionAction(false);
    }
  };

  const handleAssembly = async () => {
    if (!selectedBlueprintId) return;
    setAssembling(true);
    setErrors([]);
    try {
      const result = await assembleAssessment(selectedBlueprintId);
      setAssemblyResult(result);
      toast.success('Assessment successfully assembled from approved blueprint questions!');
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Assessment assembly failed. Ensure sufficient approved questions exist.');
    } finally {
      setAssembling(false);
    }
  };

  const handleAssemblyValidation = async () => {
    if (!assemblyResult?.assessment?.id) return;
    setAssembling(true);
    setErrors([]);
    try {
      const result = await validateAssessment(assemblyResult.assessment.id);
      setAssemblyResult((prev) => ({ ...prev, validation: result, persisted: prev.persisted }));
      if (result.valid) {
        toast.success('Assembled Assessment is 100% compliant and ready for testing!');
      } else {
        toast.error('Assessment assembly validation found compliance errors.');
      }
    } catch (error) {
      const errs = apiErrors(error);
      setErrors(errs);
      toast.error(errs[0]?.message || 'Assembly validation failed.');
    } finally {
      setAssembling(false);
    }
  };

  const filteredOfficialAssessments = officialAssessments.filter((item) => {
    if (!assessmentSearch.trim()) return true;
    const q = assessmentSearch.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.sourceMaterialName || '').toLowerCase().includes(q) ||
      (item.competencyName || '').toLowerCase().includes(q)
    );
  });

  const totalQuestionsSum = officialAssessments.reduce((acc, curr) => acc + (curr.questionsCount || 0), 0);

  if (loading) return <Spinner variant="bar" label="Loading assessment studio..." className="py-20" />;

  const claimIds = mappingIds(form.claims, 'claimId');
  const objectiveIds = mappingIds(form.learningObjectives, 'learningObjectiveId');
  const isEditable = !selectedBlueprintId || form.status === 'DRAFT';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Studio & Knowledge Bank"
        subtitle="Inspect published AI-grounded assessments, examine question provenance, or design competency blueprints."
      />

      {/* ── Mode Navigation Tabs ── */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('PUBLISHED_ASSESSMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PUBLISHED_ASSESSMENTS'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Published Assessments & Document Exams</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-[#1E3A8A] font-extrabold border border-blue-200">
              {officialAssessments.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BLUEPRINT_STUDIO')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'BLUEPRINT_STUDIO'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Blueprint Studio & Assembly</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-extrabold">
              {blueprints.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/sources')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-blue-100 font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all border border-blue-900/60"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Generate from Document in Source Library</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>

      {pageError && <Alert type="error" title="Could not load data" message={pageError} />}
      {successMessage && <Alert type="success" title="Saved" message={successMessage} />}
      {errors.length > 0 && (
        <Alert type="error" title="Action requires attention" message="The server rejected this request or the form is incomplete.">
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error, index) => <li key={`${error.code}-${index}`}>{error.field ? `${error.field}: ` : ''}{error.message} <span className="font-mono text-xs">({error.code})</span></li>)}
          </ul>
        </Alert>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: PUBLISHED ASSESSMENTS & INGESTED EXAMS
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'PUBLISHED_ASSESSMENTS' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Official Assessments</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{officialAssessments.length}</div>
              <p className="text-[11px] text-slate-500 font-medium">Ready for candidate evaluation & competency audits</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Grounded Questions</span>
                <Layers className="w-4 h-4 text-[#1E3A8A]" />
              </div>
              <div className="text-2xl font-black text-[#1E3A8A]">{totalQuestionsSum}</div>
              <p className="text-[11px] text-slate-500 font-medium">Case studies citing official manual vector chunks</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Provenance Standard</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">100% Traceable</div>
              <p className="text-[11px] text-emerald-700 font-bold">Zero-hallucination MoSPI RAG pipeline</p>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={assessmentSearch}
                onChange={(e) => setAssessmentSearch(e.target.value)}
                placeholder="Search assessments or source manuals..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={refreshOfficialAssessments}
                disabled={loadingAssessments}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAssessments ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Assessments List */}
          {filteredOfficialAssessments.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookOpen}
                title="No official assessments found"
                message="Generate an assessment from any ingested manual in the Source Library, or assemble a blueprint below."
              />
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/sources')}
                  className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Go to Source Library & Ingest Document</span>
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOfficialAssessments.map((item) => {
                const isExpanded = expandedAssessmentId === item.id;
                const questionsList = item.questions || [];

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Assessment Card Header */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              item.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {item.status || 'PUBLISHED'}
                          </span>

                          {item.sourceMaterialName && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200 truncate max-w-xs">
                              Source: {item.sourceMaterialName}
                            </span>
                          )}

                          <span className="text-[10.5px] font-mono text-slate-400">
                            ID: {item.id?.slice(0, 8)}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-0.5">
                          <span className="flex items-center gap-1 font-bold text-slate-700">
                            <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            {item.questionsCount} Questions
                          </span>
                          <span>•</span>
                          <span>Domain: <strong className="text-slate-700">{item.competencyName || 'General Statistical'}</strong></span>
                          {item.createdAt && (
                            <>
                              <span>•</span>
                              <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedAssessmentId(isExpanded ? null : item.id)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isExpanded ? 'Hide Questions' : `Inspect Questions (${item.questionsCount})`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewExamId(item.id)}
                          className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-200" />
                          <span>Preview Exam</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Questions Inspector */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-200 bg-slate-50/20 space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 font-extrabold text-slate-700">
                          <span>Grounding Verification & Questions Breakdown</span>
                          <span className="text-[#1E3A8A]">{questionsList.length} Questions Stored</span>
                        </div>

                        {questionsList.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3 text-center">
                            Questions dynamically served by the assessment engine. Click "Preview Exam" to verify live questions.
                          </p>
                        ) : (
                          questionsList.map((q, qIdx) => (
                            <div
                              key={q.id || qIdx}
                              className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900">Question {qIdx + 1}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                                  Bloom: {q.bloomLevel || 'APPLY'}
                                </span>
                              </div>

                              <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {q.stem}
                              </p>

                              {/* Options */}
                              <div className="space-y-1.5 pt-1">
                                {(q.options || []).map((opt, oIdx) => {
                                  const optText = typeof opt === 'object' ? opt.text : String(opt);
                                  const isCorrect = typeof opt === 'object' ? Boolean(opt.is_correct || opt.isCorrect) : oIdx === 0;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <span>{optText}</span>
                                      </div>
                                      {isCorrect && (
                                        <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1 uppercase">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation & Chunk Citation */}
                              {q.explanation && (
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                                  <strong className="text-slate-800">Grounding Evidence: </strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: BLUEPRINT STUDIO & ASSEMBLY
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'BLUEPRINT_STUDIO' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col gap-3 rounded-xl border border-(--app-color-border) bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <Select
              label="Existing blueprint"
              value={selectedBlueprintId}
              onChange={(event) => event.target.value ? loadBlueprint(event.target.value) : handleNew()}
              options={blueprints.map((blueprint) => ({ value: blueprint.id, label: `${blueprint.title} · ${blueprint.status}` }))}
              placeholder={blueprints.length ? 'Select a saved blueprint' : 'No saved blueprints'}
              disabled={loadingBlueprint}
              className="sm:min-w-[24rem]"
            />
            <Button variant="primary" type="button" onClick={handleNew} disabled={loadingBlueprint} className="whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold text-xs bg-[#1E3A8A] text-white hover:bg-[#172554] cursor-pointer shadow-sm">
              <Plus className="h-4 w-4" /> New blueprint
            </Button>
          </div>

      {loadingBlueprint ? <Spinner label="Loading blueprint..." /> : (
        <form onSubmit={handleSave} className="space-y-6">
          <Card title="Blueprint details" subtitle="Set the competency target and size of the assessment.">
            <div className="grid gap-5 md:grid-cols-2">
              <Input id="blueprint-title-input" label="Title" required value={form.title} onChange={(event) => updateForm('title', event.target.value)} error={errorForField(errors, 'title')} disabled={!isEditable} placeholder="e.g. Survey Sampling Diagnostic" />
              <Select label="Competency" required value={form.competencyId} onChange={handleCompetencyChange} options={competencies.map((competency) => ({ value: competency.id, label: `${competency.code} · ${competency.name}` }))} placeholder="Select a competency" error={errorForField(errors, 'competencyId')} disabled={!isEditable || loadingLookups} />
              <Input label="Target proficiency" required type="number" min="0.01" step="0.1" value={form.targetProficiency} onChange={(event) => updateForm('targetProficiency', event.target.value)} error={errorForField(errors, 'targetProficiency')} disabled={!isEditable} />
              <Input label="Question count" required type="number" min="1" step="1" value={form.questionCount} onChange={(event) => updateForm('questionCount', event.target.value)} error={errorForField(errors, 'questionCount')} disabled={!isEditable} />
            </div>
            {competencies.length === 0 && <EmptyState icon={ClipboardList} title="No competencies available" message="The authenticated account has no persisted competency records to configure." />}
          </Card>

          {/* ── Learning Objectives Section (Full Width First) ── */}
          <Card title="Learning objectives" subtitle="Select the taxonomy learning objectives this blueprint should cover and allocate questions across full width.">
            {loadingLookups ? <Spinner label="Loading learning objectives..." /> : learningObjectives.length === 0 ? <EmptyState icon={FileText} title={form.competencyId ? 'No active learning objectives' : 'Select a competency first'} message={form.competencyId ? 'This competency has no active learning objectives available.' : 'Learning objectives will appear after a competency is selected.'} /> : (
              <div className="space-y-3">
                {learningObjectives.map((objective, index) => {
                  const mapping = form.learningObjectives.find((item) => item.learningObjectiveId === objective.id);
                  return <div key={objective.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-blue-50/40 hover:border-blue-200 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Checkbox id={`objective-${objective.id}`} checked={objectiveIds.has(objective.id)} onChange={(event) => toggleMapping('learningObjectives', 'learningObjectiveId', objective.id, event.target.checked)} label={`${objective.code} · ${objective.title}`} disabled={!isEditable} />
                        <p className="mt-1.5 pl-7 text-xs text-slate-500 font-medium">{objective.description || 'No description provided.'} · Status: <span className="font-bold text-slate-700">{objective.status}</span></p>
                      </div>
                      {mapping && <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Allocated Qs:</span>
                        <Input aria-label={`Questions for objective ${objective.code}`} type="number" min="0" step="1" value={mapping.questionCount} onChange={(event) => updateMappingCount('learningObjectives', 'learningObjectiveId', objective.id, event.target.value)} className="w-20 font-bold" disabled={!isEditable} />
                      </div>}
                    </div>
                  </div>;
                })}
              </div>
            )}
          </Card>

          {/* ── Competency Claims Section (Full Width Stacked Underneath) ── */}
          <Card title="Competency claims" subtitle="Select specific evidence claims this blueprint should assess and allocate questions.">
            {loadingLookups ? <Spinner label="Loading claims..." /> : claims.length === 0 ? <EmptyState icon={FileText} title={form.competencyId ? 'No active claims' : 'Select a competency first'} message={form.competencyId ? 'This competency has no active claims available for selection.' : 'Claims will appear after a competency is selected.'} /> : (
              <div className="space-y-3">
                {claims.map((claim, index) => {
                  const mapping = form.claims.find((item) => item.claimId === claim.id);
                  return <div key={claim.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-blue-50/40 hover:border-blue-200 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Checkbox id={`claim-${claim.id}`} checked={claimIds.has(claim.id)} onChange={(event) => toggleMapping('claims', 'claimId', claim.id, event.target.checked)} label={`${claim.code} · ${claim.statement}`} disabled={!isEditable} />
                        <p className="mt-1.5 pl-7 text-xs text-slate-500 font-medium">Claim {index + 1} · Status: <span className="font-bold text-slate-700">{claim.status}</span></p>
                      </div>
                      {mapping && <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Allocated Qs:</span>
                        <Input aria-label={`Questions for claim ${claim.code}`} type="number" min="0" step="1" value={mapping.questionCount} onChange={(event) => updateMappingCount('claims', 'claimId', claim.id, event.target.value)} className="w-20 font-bold" disabled={!isEditable} />
                      </div>}
                    </div>
                  </div>;
                })}
              </div>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <div id="cognitive-distribution-card">
              <Card
                title="Cognitive distribution"
                subtitle={
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">Allocations must total {form.questionCount || 0} questions.</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        COGNITIVE_LEVELS.reduce((acc, lvl) => acc + (Number(form.cognitiveDistribution?.[lvl]) || 0), 0) === Number(form.questionCount)
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Allocated: {COGNITIVE_LEVELS.reduce((acc, lvl) => acc + (Number(form.cognitiveDistribution?.[lvl]) || 0), 0)} / {form.questionCount || 0} Qs
                      </span>
                      <button
                        type="button"
                        onClick={() => updateForm('cognitiveDistribution', autoBalanceCognitive(form.questionCount))}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        title="Auto-balance Bloom taxonomy distribution according to question count"
                      >
                        <Sliders className="h-3 w-3" /> Auto-Balance
                      </button>
                    </div>
                  </div>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {COGNITIVE_LEVELS.map((level) => (
                    <Input
                      key={level}
                      label={level}
                      type="number"
                      min="0"
                      step="1"
                      value={form.cognitiveDistribution[level] ?? 0}
                      onChange={(event) =>
                        updateForm('cognitiveDistribution', {
                          ...form.cognitiveDistribution,
                          [level]: event.target.value === '' ? '' : Number(event.target.value),
                        })
                      }
                      disabled={!isEditable}
                    />
                  ))}
                </div>
              </Card>
            </div>

            <Card title="Question types" subtitle="Use only question types supported by the assessment domain.">
              <div className="space-y-3">
                {QUESTION_TYPES.map((type) => <Checkbox key={type} id={`type-${type}`} label={type} checked={form.supportedQuestionTypes.includes(type)} onChange={() => toggleListValue('supportedQuestionTypes', type)} disabled={!isEditable} />)}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Evidence requirements" subtitle="Optional configuration accepted by the current Blueprint API.">
              <div className="space-y-3">
                {EVIDENCE_TYPES.map((type) => <Checkbox key={type} id={`evidence-${type}`} label={type} checked={form.evidenceRequirements.evidenceTypes.includes(type)} onChange={() => setForm((current) => ({ ...current, evidenceRequirements: { ...current.evidenceRequirements, evidenceTypes: current.evidenceRequirements.evidenceTypes.includes(type) ? current.evidenceRequirements.evidenceTypes.filter((item) => item !== type) : [...current.evidenceRequirements.evidenceTypes, type] } }))} disabled={!isEditable} />)}
                <Checkbox id="require-grounding" label="Require source grounding" checked={form.evidenceRequirements.requireGrounding} onChange={(event) => setForm((current) => ({ ...current, evidenceRequirements: { ...current.evidenceRequirements, requireGrounding: event.target.checked } }))} disabled={!isEditable} />
              </div>
            </Card>

            <Card title="Source restrictions" subtitle="Enter persisted document or version IDs. PDF management is outside this workspace.">
              <div className="space-y-4">
                <Input label="Document IDs" value={form.sourceRestrictions.documentIds.join(', ')} onChange={(event) => setForm((current) => ({ ...current, sourceRestrictions: { ...current.sourceRestrictions, documentIds: identifiersFromText(event.target.value) } }))} disabled={!isEditable} placeholder="UUID, UUID" />
                <Input label="Document version IDs" value={form.sourceRestrictions.documentVersionIds.join(', ')} onChange={(event) => setForm((current) => ({ ...current, sourceRestrictions: { ...current.sourceRestrictions, documentVersionIds: identifiersFromText(event.target.value) } }))} disabled={!isEditable} placeholder="UUID, UUID" />
              </div>
            </Card>
          </div>

          {generating && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm my-2 transition-all duration-300 animate-in fade-in">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse" />
                  <span className="text-sm font-bold text-slate-900">Generating Grounded Assessment Question</span>
                </div>
                <span className="text-xs font-bold font-mono text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {genProgress}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden my-2.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${genProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="truncate text-slate-700">
                  {genStep}
                </span>
                <span className="text-slate-400 font-mono shrink-0 ml-2">MoSPI Engine</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={saving} disabled={!isEditable}><Save className="h-4 w-4" /> Save draft</Button>
            <Button type="button" variant="secondary" onClick={handleValidate} loading={validating} disabled={!selectedBlueprintId}><ShieldCheck className="h-4 w-4" /> Validate persisted blueprint</Button>
            <Button type="button" variant="secondary" onClick={handleGenerate} loading={generating} disabled={!selectedBlueprintId}>
              <FileText className="h-4 w-4" /> {generating ? `Generating (${genProgress}%)...` : 'Generate grounded question'}
            </Button>
            <Button type="button" variant="success" onClick={handleAssembly} loading={assembling} disabled={!selectedBlueprintId}><ClipboardList className="h-4 w-4" /> Assemble assessment</Button>
          </div>
        </form>
      )}

      {validationResult && <Card title="Validation result" subtitle="Diagnostics returned by the persisted Blueprint validation service.">
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold ${validationResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {validationResult.valid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {validationResult.valid ? 'VALID' : 'INVALID'}
        </div>
        {validationResult.errors.length > 0 && <div className="space-y-2"><h4 className="text-sm font-bold text-(--app-color-text)">Errors</h4>{validationResult.errors.map((error, index) => <p key={`${error.code}-${index}`} className="text-sm text-red-700"><span className="font-mono text-xs">{error.code}</span> · {error.field || 'blueprint'} · {error.message}</p>)}</div>}
        {validationResult.warnings.length > 0 && <div className="mt-4 space-y-2"><h4 className="text-sm font-bold text-(--app-color-text)">Warnings</h4>{validationResult.warnings.map((warning, index) => <p key={index} className="text-sm text-amber-700">{warning.message || warning}</p>)}</div>}
      </Card>}

      {generationResult && (
        <div id="generated-question-card" className="scroll-mt-6">
          <Card title="Generated Question Output" subtitle="AI question output synthesized and grounded in official MoSPI reference evidence.">
            {generationResult.status === 'INSUFFICIENT_EVIDENCE' ? (
              <Alert type="warning" title="Insufficient evidence" message={generationResult.message} />
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                      {generationResult.question?.bloomLevel || generationResult.questionVersion?.bloomLevel || 'APPLY'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                      {generationResult.question?.questionType || generationResult.questionVersion?.questionType || 'MCQ'}
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-900 leading-relaxed">
                    {generationResult.question?.stem || generationResult.questionVersion?.stem}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Answer Options</span>
                  <div className="grid gap-2">
                    {(generationResult.question?.options || generationResult.questionVersion?.options || []).map((option, idx) => {
                      const optText = typeof option === 'object' ? option.text : option;
                      const optId = typeof option === 'object' ? option.id : ['A', 'B', 'C', 'D'][idx];
                      const isCorrect = String(optId).toUpperCase() === String(generationResult.question?.correctAnswer || generationResult.questionVersion?.correctAnswer || '').toUpperCase();

                      return (
                        <div
                          key={optId || idx}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-950'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {optId}
                          </span>
                          <span className="flex-1 mt-0.5">{optText}</span>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="h-3 w-3" /> Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rationale / Explanation */}
                {(generationResult.question?.explanation || generationResult.question?.rationale || generationResult.questionVersion?.rationale) && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-950">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5 mb-1">
                      <BookOpen className="h-3.5 w-3.5 text-blue-700" /> Official Rationale & Explanation:
                    </span>
                    <p className="leading-normal">{generationResult.question?.explanation || generationResult.question?.rationale || generationResult.questionVersion?.rationale}</p>
                  </div>
                )}

                {/* Provenance & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
                  <span>
                    <strong>Source Provenance:</strong> {generationResult.provenance?.length ? `${generationResult.provenance.length} MoSPI source chunk(s) cited` : 'Standard Framework Ref'}
                  </span>
                  <span>
                    <strong>Validation:</strong> {generationResult.validation?.status || generationResult.questionVersion?.validationStatus || 'PENDING'} · <strong>Review:</strong> {generationResult.question?.reviewStatus || generationResult.questionVersion?.reviewStatus || 'DRAFT'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="button" variant="secondary" onClick={handleQuestionValidation} loading={questionAction}>
                    <ShieldCheck className="h-4 w-4" /> Validate question
                  </Button>
                  <Button type="button" variant="success" onClick={() => handleReview('APPROVE')} loading={questionAction}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleReview('REJECT')} loading={questionAction}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleRevision} loading={questionAction}>
                    <RefreshCw className="h-4 w-4" /> Request revision
                  </Button>
                </div>

                {generationResult.validation?.errors?.length > 0 && (
                  <Alert type="error" title="Validation errors" message={generationResult.validation.errors.map((item) => item.message).join(' ')} />
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {assemblyResult && <Card title="Assembled assessment" subtitle="Blueprint-driven selection of approved, validated current question versions."><div className="space-y-3"><p className="text-sm font-semibold">Assessment {assemblyResult.assessment?.id} · {assemblyResult.items?.length || assemblyResult.persisted?.items?.length || 0} questions</p>{(assemblyResult.items || assemblyResult.persisted?.items || []).map((item, index) => <div key={item.item?.id || item.item?.questionId || index} className="rounded border border-(--app-color-border) p-3 text-sm"><span className="font-semibold">{item.item?.position || index + 1}.</span> {item.version?.stem || item.question?.stem}</div>)}<Button type="button" variant="secondary" onClick={handleAssemblyValidation} loading={assembling}>Validate assembled assessment</Button>{assemblyResult.validation && <Alert type={assemblyResult.validation.valid ? 'success' : 'error'} title={assemblyResult.validation.valid ? 'Assembly valid' : 'Assembly invalid'} message={assemblyResult.validation.errors?.map((item) => item.message).join(' ') || 'Blueprint requirements are satisfied.'} />}</div></Card>}

      {blueprints.length === 0 && <Card><EmptyState icon={RefreshCw} title="No saved blueprints" message="Create a blueprint draft from the live competency catalog above." /></Card>}
        </div>
      )}

      {/* ── Test Preview Modal for Published Assessments ── */}
      {previewExamId && (
        <AssessmentPlayerModal
          assessmentId={previewExamId}
          onClose={() => setPreviewExamId(null)}
          onComplete={() => {
            setPreviewExamId(null);
            refreshOfficialAssessments();
          }}
        />
      )}
    </div>
  );
}
