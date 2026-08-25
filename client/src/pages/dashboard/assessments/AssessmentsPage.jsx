import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, FileText, Plus, RefreshCw, Save, ShieldCheck, XCircle } from 'lucide-react';

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
} from '../../../services/assessmentBlueprint.api.js';
import { assembleAssessment, generateQuestion, getAssessment, reviewQuestion, reviseQuestion, validateAssessment, validateQuestion } from '../../../services/source.api.js';

const COGNITIVE_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'];
const QUESTION_TYPES = ['MCQ', 'SCENARIO'];
const EVIDENCE_TYPES = [
  'Knowledge Evidence (MCQ / Quiz)',
  'Application Evidence (Scenario / Case Study)',
  'Performance Evidence (Virtual Lab / Exercise)',
  'External Certificate / Accredited Training',
  'iGOT / NSSTA Course Module Completion',
];

const emptyForm = () => ({
  title: '',
  status: 'DRAFT',
  competencyId: '',
  targetProficiency: '',
  questionCount: '10',
  cognitiveDistribution: { REMEMBER: 0, UNDERSTAND: 0, APPLY: 10, ANALYZE: 0, EVALUATE: 0 },
  supportedQuestionTypes: ['MCQ'],
  claims: [],
  learningObjectives: [],
  sourceRestrictions: { documentIds: [], documentVersionIds: [] },
  evidenceRequirements: { evidenceTypes: [], requireGrounding: false },
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
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [questionAction, setQuestionAction] = useState(false);
  const [assemblyResult, setAssemblyResult] = useState(null);
  const [assembling, setAssembling] = useState(false);
  const lookupRequestRef = useRef(0);

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
    Promise.all([listAssessmentBlueprints(), listBlueprintCompetencies()])
      .then(([blueprintResponse, competencyResponse]) => {
        if (!active) return;
        if (!Array.isArray(blueprintResponse?.items) || !Array.isArray(competencyResponse?.items)) {
          throw new Error('Blueprint lookup returned an invalid response.');
        }
        setBlueprints(blueprintResponse.items);
        setCompetencies(competencyResponse.items);
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
      setErrors([{ code: 'CLIENT_FORM_INCOMPLETE', field: 'form', message: 'Complete the required blueprint fields before saving.' }]);
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
      setSuccessMessage('Blueprint draft saved.');
    } catch (error) {
      setErrors(apiErrors(error));
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedBlueprintId) {
      setErrors([{ code: 'BLUEPRINT_NOT_PERSISTED', field: 'blueprint', message: 'Save the blueprint before validating it.' }]);
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
    } catch (error) {
      setErrors(apiErrors(error));
    } finally {
      setValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBlueprintId) {
      setErrors([{ code: 'BLUEPRINT_NOT_PERSISTED', field: 'blueprint', message: 'Save the blueprint before generating a question.' }]);
      return;
    }
    setGenerating(true);
    setErrors([]);
    setGenerationResult(null);
    try {
      const result = await generateQuestion({
        blueprintId: selectedBlueprintId,
        claimId: form.claims[0]?.claimId,
        learningObjectiveId: form.learningObjectives[0]?.learningObjectiveId,
        questionType: form.supportedQuestionTypes[0] || 'MCQ',
      });
      setGenerationResult(result);
    } catch (error) {
      setErrors(apiErrors(error));
    } finally {
      setGenerating(false);
    }
  };

  const handleQuestionValidation = async () => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true); setErrors([]);
    try { setGenerationResult({ ...generationResult, validation: await validateQuestion(generationResult.question.id) }); }
    catch (error) { setErrors(apiErrors(error)); }
    finally { setQuestionAction(false); }
  };

  const handleReview = async (action) => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true); setErrors([]);
    try { const result = await reviewQuestion(generationResult.question.id, { action }); setGenerationResult({ ...generationResult, question: result.question, questionVersion: result.version }); }
    catch (error) { setErrors(apiErrors(error)); }
    finally { setQuestionAction(false); }
  };

  const handleRevision = async () => {
    if (!generationResult?.question?.id) return;
    setQuestionAction(true); setErrors([]);
    try { const result = await reviseQuestion(generationResult.question.id, { rationale: 'Revised during review.' }); setGenerationResult({ ...generationResult, questionVersion: result.version, revision: result }); }
    catch (error) { setErrors(apiErrors(error)); }
    finally { setQuestionAction(false); }
  };

  const handleAssembly = async () => {
    if (!selectedBlueprintId) return;
    setAssembling(true); setErrors([]);
    try { const result = await assembleAssessment(selectedBlueprintId); setAssemblyResult(result); }
    catch (error) { setErrors(apiErrors(error)); }
    finally { setAssembling(false); }
  };

  const handleAssemblyValidation = async () => {
    if (!assemblyResult?.assessment?.id) return;
    setAssembling(true); setErrors([]);
    try { const result = await validateAssessment(assemblyResult.assessment.id); setAssemblyResult({ ...assemblyResult, validation: result, persisted: await getAssessment(assemblyResult.assessment.id) }); }
    catch (error) { setErrors(apiErrors(error)); }
    finally { setAssembling(false); }
  };

  if (loading) return <Spinner variant="bar" label="Loading assessment blueprint workspace..." className="py-20" />;

  const claimIds = mappingIds(form.claims, 'claimId');
  const objectiveIds = mappingIds(form.learningObjectives, 'learningObjectiveId');
  const isEditable = !selectedBlueprintId || form.status === 'DRAFT';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Blueprint Studio"
        subtitle="Configure competency-aligned assessments from persisted taxonomy data."
      />

      {pageError && <Alert type="error" title="Could not load data" message={pageError} />}
      {successMessage && <Alert type="success" title="Saved" message={successMessage} />}
      {errors.length > 0 && (
        <Alert type="error" title="Action requires attention" message="The server rejected this request or the form is incomplete.">
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error, index) => <li key={`${error.code}-${index}`}>{error.field ? `${error.field}: ` : ''}{error.message} <span className="font-mono text-xs">({error.code})</span></li>)}
          </ul>
        </Alert>
      )}

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
        <Button variant="secondary" onClick={handleNew} disabled={loadingBlueprint}>
          <Plus className="h-4 w-4" /> New blueprint
        </Button>
      </div>

      {loadingBlueprint ? <Spinner label="Loading blueprint..." /> : (
        <form onSubmit={handleSave} className="space-y-6">
          <Card title="Blueprint details" subtitle="Set the competency target and size of the assessment.">
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Title" required value={form.title} onChange={(event) => updateForm('title', event.target.value)} error={errorForField(errors, 'title')} disabled={!isEditable} placeholder="e.g. Survey Sampling Diagnostic" />
              <Select label="Competency" required value={form.competencyId} onChange={handleCompetencyChange} options={competencies.map((competency) => ({ value: competency.id, label: `${competency.code} · ${competency.name}` }))} placeholder="Select a competency" error={errorForField(errors, 'competencyId')} disabled={!isEditable || loadingLookups} />
              <Input label="Target proficiency" required type="number" min="0.01" step="0.1" value={form.targetProficiency} onChange={(event) => updateForm('targetProficiency', event.target.value)} error={errorForField(errors, 'targetProficiency')} disabled={!isEditable} />
              <Input label="Question count" required type="number" min="1" step="1" value={form.questionCount} onChange={(event) => updateForm('questionCount', event.target.value)} error={errorForField(errors, 'questionCount')} disabled={!isEditable} />
            </div>
            {competencies.length === 0 && <EmptyState icon={ClipboardList} title="No competencies available" message="The authenticated account has no persisted competency records to configure." />}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Competency claims" subtitle="Select the claims this blueprint should assess and allocate questions.">
              {loadingLookups ? <Spinner label="Loading claims..." /> : claims.length === 0 ? <EmptyState icon={FileText} title={form.competencyId ? 'No active claims' : 'Select a competency first'} message={form.competencyId ? 'This competency has no active claims available for selection.' : 'Claims will appear after a competency is selected.'} /> : (
                <div className="space-y-3">
                  {claims.map((claim, index) => {
                    const mapping = form.claims.find((item) => item.claimId === claim.id);
                    return <div key={claim.id} className="rounded-lg border border-(--app-color-border) p-3">
                      <div className="flex items-start justify-between gap-3">
                        <Checkbox id={`claim-${claim.id}`} checked={claimIds.has(claim.id)} onChange={(event) => toggleMapping('claims', 'claimId', claim.id, event.target.checked)} label={`${claim.code} · ${claim.statement}`} disabled={!isEditable} />
                        {mapping && <Input aria-label={`Questions for claim ${claim.code}`} type="number" min="0" step="1" value={mapping.questionCount} onChange={(event) => updateMappingCount('claims', 'claimId', claim.id, event.target.value)} className="w-24" disabled={!isEditable} />}
                      </div>
                      <p className="mt-2 pl-8 text-xs text-(--app-color-text-muted)">Claim {index + 1} · {claim.status}</p>
                    </div>;
                  })}
                </div>
              )}
            </Card>

            <Card title="Learning objectives" subtitle="Select the objectives this blueprint should cover and allocate questions.">
              {loadingLookups ? <Spinner label="Loading learning objectives..." /> : learningObjectives.length === 0 ? <EmptyState icon={FileText} title={form.competencyId ? 'No active learning objectives' : 'Select a competency first'} message={form.competencyId ? 'This competency has no active learning objectives available.' : 'Learning objectives will appear after a competency is selected.'} /> : (
                <div className="space-y-3">
                  {learningObjectives.map((objective, index) => {
                    const mapping = form.learningObjectives.find((item) => item.learningObjectiveId === objective.id);
                    return <div key={objective.id} className="rounded-lg border border-(--app-color-border) p-3">
                      <div className="flex items-start justify-between gap-3">
                        <Checkbox id={`objective-${objective.id}`} checked={objectiveIds.has(objective.id)} onChange={(event) => toggleMapping('learningObjectives', 'learningObjectiveId', objective.id, event.target.checked)} label={`${objective.code} · ${objective.title}`} disabled={!isEditable} />
                        {mapping && <Input aria-label={`Questions for objective ${objective.code}`} type="number" min="0" step="1" value={mapping.questionCount} onChange={(event) => updateMappingCount('learningObjectives', 'learningObjectiveId', objective.id, event.target.value)} className="w-24" disabled={!isEditable} />}
                      </div>
                      <p className="mt-2 pl-8 text-xs text-(--app-color-text-muted)">{objective.description || 'No description provided.'} · {objective.status}</p>
                    </div>;
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Cognitive distribution" subtitle="Allocations must total the configured question count.">
              <div className="grid gap-4 sm:grid-cols-2">
                {COGNITIVE_LEVELS.map((level) => <Input key={level} label={level} type="number" min="0" step="1" value={form.cognitiveDistribution[level] ?? 0} onChange={(event) => updateForm('cognitiveDistribution', { ...form.cognitiveDistribution, [level]: event.target.value === '' ? '' : Number(event.target.value) })} disabled={!isEditable} />)}
              </div>
            </Card>

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

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={saving} disabled={!isEditable}><Save className="h-4 w-4" /> Save draft</Button>
            <Button type="button" variant="secondary" onClick={handleValidate} loading={validating} disabled={!selectedBlueprintId}><ShieldCheck className="h-4 w-4" /> Validate persisted blueprint</Button>
            <Button type="button" variant="secondary" onClick={handleGenerate} loading={generating} disabled={!selectedBlueprintId}><FileText className="h-4 w-4" /> Generate grounded question</Button>
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

      {generationResult && <Card title="Generated question" subtitle="Question output and source evidence returned by the grounded generation pipeline.">
        {generationResult.status === 'INSUFFICIENT_EVIDENCE' ? <Alert type="warning" title="Insufficient evidence" message={generationResult.message} /> : <div className="space-y-4"><p className="text-base font-semibold">{generationResult.question?.stem || generationResult.questionVersion?.stem}</p><div className="space-y-2">{(generationResult.question?.options || []).map((option) => <p key={option.id || option.text} className="rounded border border-(--app-color-border) p-2 text-sm">{option.id || ''} {option.text}</p>)}</div><p className="text-xs text-(--app-color-text-muted)">Provenance: {generationResult.provenance?.map((item) => item.sourceChunkId).join(', ') || 'none'}</p><p className="text-xs font-semibold">Validation: {generationResult.validation?.status || generationResult.questionVersion?.validationStatus || 'PENDING'} · Review: {generationResult.question?.reviewStatus || generationResult.questionVersion?.reviewStatus || 'DRAFT'}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={handleQuestionValidation} loading={questionAction}>Validate question</Button><Button type="button" variant="success" onClick={() => handleReview('APPROVE')} loading={questionAction}>Approve</Button><Button type="button" variant="danger" onClick={() => handleReview('REJECT')} loading={questionAction}>Reject</Button><Button type="button" variant="secondary" onClick={handleRevision} loading={questionAction}>Request revision</Button></div>{generationResult.validation?.errors?.length > 0 && <Alert type="error" title="Validation errors" message={generationResult.validation.errors.map((item) => item.message).join(' ')}/>}</div>}
      </Card>}

      {assemblyResult && <Card title="Assembled assessment" subtitle="Blueprint-driven selection of approved, validated current question versions."><div className="space-y-3"><p className="text-sm font-semibold">Assessment {assemblyResult.assessment?.id} · {assemblyResult.items?.length || assemblyResult.persisted?.items?.length || 0} questions</p>{(assemblyResult.items || assemblyResult.persisted?.items || []).map((item, index) => <div key={item.item?.id || item.item?.questionId || index} className="rounded border border-(--app-color-border) p-3 text-sm"><span className="font-semibold">{item.item?.position || index + 1}.</span> {item.version?.stem || item.question?.stem}</div>)}<Button type="button" variant="secondary" onClick={handleAssemblyValidation} loading={assembling}>Validate assembled assessment</Button>{assemblyResult.validation && <Alert type={assemblyResult.validation.valid ? 'success' : 'error'} title={assemblyResult.validation.valid ? 'Assembly valid' : 'Assembly invalid'} message={assemblyResult.validation.errors?.map((item) => item.message).join(' ') || 'Blueprint requirements are satisfied.'} />}</div></Card>}

      {blueprints.length === 0 && <Card><EmptyState icon={RefreshCw} title="No saved blueprints" message="Create a blueprint draft from the live competency catalog above." /></Card>}
    </div>
  );
}
