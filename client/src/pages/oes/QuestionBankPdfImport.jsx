import { useState } from 'react';
import { FileUp, LoaderCircle, X } from 'lucide-react';
import api from '../../services/api.js';
import { newId, readExamData, writeExamData } from './examStore.js';

export default function QuestionBankPdfImport({ onClose }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Imported PDF');
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chooseFile = (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setPreview(null);
    setSelected([]);
    setError('');
    if (next) setCategory(next.name.replace(/\.pdf$/i, '').trim() || 'Imported PDF');
  };

  const extract = async () => {
    if (!file || !/\.pdf$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      setError('Choose a PDF file up to 10 MB.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/question-bank/import-pdf', file, {
        headers: { 'Content-Type': 'application/pdf' },
      });
      const result = response.data;
      setPreview(result);
      setSelected(result.questions.map((_, index) => index));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not read this PDF. Please try another file.');
    } finally {
      setLoading(false);
    }
  };

  const importSelected = () => {
    const questions = selected.map((index) => preview.questions[index]).map((question) => ({
      ...question,
      id: newId(),
      category: category.trim() || 'Imported PDF',
      options: question.options.map((option) => ({ ...option, id: newId() })),
    }));
    const data = readExamData();
    writeExamData({ ...data, questions: [...data.questions, ...questions] });
    onClose(questions.length);
  };

  return <div className="oes-modal-backdrop">
    <div className="oes-modal" role="dialog" aria-modal="true" aria-label="Import question bank PDF">
      <div className="oes-section-heading"><h2>Import questions from PDF</h2><button type="button" className="oes-icon-button" onClick={() => onClose(0)} aria-label="Close import"><X size={18}/></button></div>
      <p className="oes-import-guidance">Use a text-based PDF with numbered questions, lettered choices, and an explicit answer line. Scanned image PDFs need text recognition first.</p>
      <div className="oes-import-example"><strong>Supported format</strong><code>Q1. Which method retrieves a resource?<br/>A) GET<br/>B) DELETE<br/>C) PATCH<br/>Answer: A</code><span>For multiple correct answers, write <b>Answer: A, C</b>.</span></div>
      <div className="oes-form">
        <label>Question bank PDF<input type="file" accept=".pdf,application/pdf" onChange={chooseFile}/></label>
        <label>Category for imported questions<input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80}/></label>
        <button type="button" className="oes-btn" onClick={extract} disabled={!file || loading}>{loading ? <LoaderCircle size={17} className="oes-spin"/> : <FileUp size={17}/>} {loading ? 'Reading PDF…' : 'Preview questions'}</button>
      </div>
      {error && <p className="oes-error" role="alert">{error}</p>}
      {preview && <div className="oes-import-preview">
        <p className="oes-import-summary">Found {preview.questions.length} ready question{preview.questions.length === 1 ? '' : 's'}. {preview.skipped} question{preview.skipped === 1 ? '' : 's'} skipped because the format or answer key was incomplete.</p>
        {preview.questions.map((question, index) => <label key={index} className="oes-import-question"><input type="checkbox" checked={selected.includes(index)} onChange={() => setSelected((values) => values.includes(index) ? values.filter((value) => value !== index) : [...values, index])}/><span><strong>{question.prompt}</strong><small>{question.type === 'SINGLE' ? 'Single choice' : 'Multi select'} · Correct: {question.options.filter((option) => option.correct).map((option) => option.text).join(', ')}</small></span></label>)}
        <div className="oes-actions"><button type="button" className="oes-btn oes-btn-outline" onClick={() => onClose(0)}>Cancel</button><button type="button" className="oes-btn" disabled={!selected.length} onClick={importSelected}>Add {selected.length} to question bank</button></div>
      </div>}
    </div>
  </div>;
}
