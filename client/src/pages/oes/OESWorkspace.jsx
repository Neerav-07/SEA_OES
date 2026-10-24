import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileUp, Plus, Save, Search, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/auth.store.js';
import { gradeAttempt, newId, readExamData, statusForExam, writeExamData } from './examStore.js';
import QuestionBankPdfImport from './QuestionBankPdfImport.jsx';

function useExamData() {
  const [data, setData] = useState(readExamData);
  useEffect(() => {
    const refresh = () => setData(readExamData());
    window.addEventListener('oes-data-change', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('oes-data-change', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  return [data, writeExamData];
}

function PageTitle({ eyebrow, title, children }) {
  return <div className="oes-page-title"><div><span className="oes-eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;
}

function Empty({ title, text, action }) {
  return <div className="oes-empty"><ClipboardIcon/><h2>{title}</h2><p>{text}</p>{action}</div>;
}
function ClipboardIcon() { return <span className="oes-empty-icon">◎</span>; }

function Stat({ label, value }) { return <div className="oes-stat"><span>{label}</span><strong>{value}</strong></div>; }

export function OESOverview() {
  const [data] = useExamData();
  const user = useAuthStore((s) => s.user);
  const examiner = user?.platformRole === 'ADMIN';
  const email = user?.email?.toLowerCase();
  const exams = examiner ? data.exams : data.exams.filter((exam) => exam.status === 'PUBLISHED' && exam.students.includes(email));
  const attempts = examiner ? data.attempts : data.attempts.filter((attempt) => attempt.studentEmail === email);
  return <>
    <PageTitle eyebrow={examiner ? 'EXAMINER OVERVIEW' : 'STUDENT DASHBOARD'} title={examiner ? 'Examination overview' : `Welcome, ${user?.name?.split(' ')[0] || 'student'}`} />
    <p className="oes-lead">{examiner ? 'Two sample exams are published; open the Web Fundamentals draft to assign students and publish it.' : 'Your assigned sample examinations are ready to take. Completed results will appear here.'}</p>
    <div className="oes-stats"><Stat label={examiner ? 'Questions in bank' : 'Assigned exams'} value={examiner ? data.questions.length : exams.length}/><Stat label={examiner ? 'Examinations' : 'Available now'} value={examiner ? exams.length : exams.filter((exam) => statusForExam(exam) === 'Available').length}/><Stat label={examiner ? 'Student attempts' : 'Completed attempts'} value={attempts.filter((a) => a.status === 'FINALIZED').length}/></div>
    <div className="oes-section-heading"><h2>{examiner ? 'Recent examinations' : 'Assigned examinations'}</h2>{examiner && <Link className="oes-btn" to="/dashboard/exams">Manage exams <ArrowRight size={16}/></Link>}</div>
    {exams.length ? <div className="oes-list">{exams.map((exam) => <ExamRow key={exam.id} exam={exam} attempt={attempts.find((a) => a.examId === exam.id && a.studentEmail === email)} examiner={examiner}/>)}</div> : <Empty title={examiner ? 'No examinations yet' : 'No exams assigned yet'} text={examiner ? 'Create questions, then publish your first examination.' : 'Your examiner will assign an examination to your account when it is ready.'} action={examiner && <Link className="oes-btn" to="/dashboard/questions">Create questions</Link>}/>}
  </>;
}

function ExamRow({ exam, attempt, examiner }) {
  const status = statusForExam(exam);
  const path = examiner ? '/dashboard/exams' : attempt?.status === 'FINALIZED' ? `/dashboard/results/${attempt.id}` : `/dashboard/attempt/${exam.id}`;
  return <Link className="oes-row" to={path}><div><div className="oes-row-heading"><strong>{exam.title}</strong><span className={`oes-pill ${status.toLowerCase()}`}>{status}</span></div><p>{exam.questions.length} questions · {exam.duration} minutes · {new Date(exam.startAt).toLocaleString()} – {new Date(exam.endAt).toLocaleString()}</p></div><span className="oes-row-action">{examiner ? 'Manage' : attempt?.status === 'FINALIZED' ? 'View result' : attempt ? 'Resume' : 'View exam'} <ArrowRight size={16}/></span></Link>;
}

const blankQuestion = () => ({ prompt: '', type: 'SINGLE', category: '', points: 1, options: [{ id: newId(), text: '', correct: true }, { id: newId(), text: '', correct: false }] });

export function OESQuestionBank() {
  const [data, save] = useExamData();
  const [draft, setDraft] = useState(null);
  const [showPdfImport, setShowPdfImport] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const used = useMemo(() => new Set(data.exams.filter((exam) => exam.status === 'PUBLISHED').flatMap((exam) => exam.questions)), [data.exams]);
  const filtered = data.questions.filter((q) => `${q.prompt} ${q.category} ${q.type}`.toLowerCase().includes(query.toLowerCase()));
  const updateOption = (id, patch) => setDraft((current) => ({ ...current, options: current.options.map((o) => o.id === id ? { ...o, ...patch } : o) }));
  const chooseCorrect = (id) => setDraft((current) => ({ ...current, options: current.options.map((o) => ({ ...o, correct: current.type === 'SINGLE' ? o.id === id : o.id === id ? !o.correct : o.correct })) }));
  const submit = (event) => {
    event.preventDefault();
    if (!draft.prompt.trim() || draft.options.length < 2 || draft.options.some((o) => !o.text.trim()) || !draft.options.some((o) => o.correct)) { setError('Add a prompt, at least two filled options, and a correct answer.'); return; }
    if (used.has(draft.id)) { setError('A published exam uses this question. Create a new question to preserve the existing exam.'); return; }
    const question = { ...draft, id: draft.id || newId(), points: Math.max(1, Number(draft.points) || 1) };
    save({ ...data, questions: draft.id ? data.questions.map((q) => q.id === draft.id ? question : q) : [...data.questions, question] });
    setDraft(null); setError('');
  };
  const remove = (id) => { if (used.has(id)) return; if (window.confirm('Delete this question?')) save({ ...data, questions: data.questions.filter((q) => q.id !== id), exams: data.exams.map((exam) => ({ ...exam, questions: exam.questions.filter((q) => q !== id) })) }); };
  return <><PageTitle eyebrow="EXAMINER WORKSPACE" title="Question bank"><div className="oes-actions"><button className="oes-btn oes-btn-outline" onClick={() => setShowPdfImport(true)}><FileUp size={17}/> Import PDF</button><button className="oes-btn" onClick={() => { setDraft(blankQuestion()); setError(''); }}><Plus size={17}/> New question</button></div></PageTitle>
    <p className="oes-lead">Create reusable objective questions. Published exam questions are locked to protect existing attempts.</p>
    {importedCount > 0 && <p className="oes-import-success" role="status">Added {importedCount} question{importedCount === 1 ? '' : 's'} to the bank. They are available in the exam builder.</p>}
    {showPdfImport && <QuestionBankPdfImport onClose={(count) => { setShowPdfImport(false); setImportedCount(count); }}/>}
    <label className="oes-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompt, category, or type"/></label>
    {filtered.length ? <div className="oes-list">{filtered.map((q) => <div className="oes-row" key={q.id}><div><div className="oes-row-heading"><strong>{q.prompt}</strong><span className="oes-pill">{q.type === 'SINGLE' ? 'Single choice' : 'Multi select'}</span></div><p>{q.category || 'Uncategorized'} · {q.points} point{q.points === 1 ? '' : 's'} · {q.options.length} options {used.has(q.id) ? '· In published exam' : ''}</p></div><div className="oes-row-action"><button className="oes-text-button" onClick={() => { setDraft(structuredClone(q)); setError(''); }}>Edit</button><button className="oes-icon-button" aria-label="Delete question" title={used.has(q.id) ? 'Published question cannot be deleted' : 'Delete'} disabled={used.has(q.id)} onClick={() => remove(q.id)}><Trash2 size={16}/></button></div></div>)}</div> : <Empty title="No questions found" text="Add your first question or change the search."/>}
    {draft && <div className="oes-modal-backdrop"><div className="oes-modal" role="dialog" aria-modal="true" aria-label="Question editor"><div className="oes-section-heading"><h2>{draft.id ? 'Edit question' : 'New question'}</h2><button className="oes-text-button" onClick={() => setDraft(null)}>Close</button></div><form onSubmit={submit} className="oes-form"><label>Question prompt<textarea value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} required/></label><div className="oes-form-grid"><label>Question type<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value, options: draft.options.map((o, i) => ({ ...o, correct: i === 0 })) })}><option value="SINGLE">Single choice</option><option value="MULTI">Multi select</option></select></label><label>Category / tag<input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}/></label><label>Points<input type="number" min="1" value={draft.points} onChange={(e) => setDraft({ ...draft, points: e.target.value })}/></label></div><fieldset><legend>Answer options · mark the correct {draft.type === 'SINGLE' ? 'answer' : 'answers'}</legend>{draft.options.map((option, i) => <div className="oes-option-edit" key={option.id}><input type={draft.type === 'SINGLE' ? 'radio' : 'checkbox'} checked={option.correct} onChange={() => chooseCorrect(option.id)} aria-label={`Option ${i + 1} correct`}/><input value={option.text} onChange={(e) => updateOption(option.id, { text: e.target.value })} placeholder={`Option ${i + 1}`}/><button type="button" className="oes-icon-button" disabled={draft.options.length <= 2} onClick={() => setDraft({ ...draft, options: draft.options.filter((o) => o.id !== option.id) })}><Trash2 size={16}/></button></div>)}<button type="button" className="oes-text-button" onClick={() => setDraft({ ...draft, options: [...draft.options, { id: newId(), text: '', correct: false }] })}>+ Add option</button></fieldset>{error && <p className="oes-error" role="alert">{error}</p>}<button className="oes-btn" type="submit"><Save size={16}/> Save question</button></form></div></div>}
  </>;
}

const blankExam = () => ({ title: '', duration: 30, startAt: '', endAt: '', questions: [], students: [], randomQuestions: false, randomOptions: false, status: 'DRAFT' });

export function OESExams() {
  const [data, save] = useExamData();
  const [draft, setDraft] = useState(null);
  const [studentText, setStudentText] = useState('');
  const [error, setError] = useState('');
  const edit = (exam) => { setDraft(structuredClone(exam)); setStudentText(exam.students.join(', ')); setError(''); };
  const submit = (event, publish = false) => {
    event.preventDefault();
    const students = [...new Set(studentText.split(/[\s,;]+/).map((v) => v.trim().toLowerCase()).filter(Boolean))];
    if (!draft.title.trim() || !draft.startAt || !draft.endAt || new Date(draft.endAt) <= new Date(draft.startAt) || Number(draft.duration) < 1) { setError('Enter a title, valid availability window, and duration.'); return; }
    if (publish && (!draft.questions.length || !students.length)) { setError('Select at least one question and assign a student email before publishing.'); return; }
    const exam = { ...draft, id: draft.id || newId(), students, duration: Number(draft.duration), status: publish ? 'PUBLISHED' : 'DRAFT' };
    save({ ...data, exams: draft.id ? data.exams.map((e) => e.id === draft.id ? exam : e) : [...data.exams, exam] });
    setDraft(null); setError('');
  };
  return <><PageTitle eyebrow="EXAMINER WORKSPACE" title="Examinations"><button className="oes-btn" onClick={() => edit(blankExam())}><Plus size={17}/> Create exam</button></PageTitle><p className="oes-lead">Configure the examination, select questions, assign students, and publish when ready.</p>
    {data.exams.length ? <div className="oes-list">{data.exams.map((exam) => <div key={exam.id} className="oes-row"><div><div className="oes-row-heading"><strong>{exam.title}</strong><span className={`oes-pill ${statusForExam(exam).toLowerCase()}`}>{statusForExam(exam)}</span></div><p>{exam.questions.length} questions · {exam.students.length} students · {exam.duration} minutes</p></div><div className="oes-row-action"><button className="oes-text-button" onClick={() => edit(exam)}>{exam.status === 'DRAFT' ? 'Edit draft' : 'View details'}</button>{exam.status === 'DRAFT' && <button className="oes-icon-button" title="Delete draft" onClick={() => { if (window.confirm('Delete this draft exam?')) save({ ...data, exams: data.exams.filter((e) => e.id !== exam.id) }); }}><Trash2 size={16}/></button>}</div></div>)}</div> : <Empty title="No examinations yet" text="Create a question first, then build an examination." action={<Link className="oes-btn" to="/dashboard/questions">Open question bank</Link>}/>}
    {draft && <div className="oes-modal-backdrop"><div className="oes-modal" role="dialog" aria-modal="true" aria-label="Exam editor"><div className="oes-section-heading"><h2>{draft.status === 'PUBLISHED' ? 'Published examination' : draft.id ? 'Edit draft' : 'Create examination'}</h2><button className="oes-text-button" onClick={() => setDraft(null)}>Close</button></div>{draft.status === 'PUBLISHED' ? <div className="oes-form"><p>Published examinations are locked to preserve existing attempts.</p><dl className="oes-details"><dt>Availability</dt><dd>{new Date(draft.startAt).toLocaleString()} – {new Date(draft.endAt).toLocaleString()}</dd><dt>Students</dt><dd>{draft.students.join(', ')}</dd><dt>Questions</dt><dd>{draft.questions.length}</dd></dl></div> : <form className="oes-form" onSubmit={submit}><label>Exam title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required/></label><div className="oes-form-grid"><label>Duration (minutes)<input type="number" min="1" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })}/></label><label>Opens at<input type="datetime-local" value={draft.startAt} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })}/></label><label>Closes at<input type="datetime-local" value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })}/></label></div><fieldset><legend>Select questions</legend>{data.questions.length ? data.questions.map((q) => <label className="oes-check-row" key={q.id}><input type="checkbox" checked={draft.questions.includes(q.id)} onChange={() => setDraft({ ...draft, questions: draft.questions.includes(q.id) ? draft.questions.filter((id) => id !== q.id) : [...draft.questions, q.id] })}/><span>{q.prompt}</span><small>{q.type === 'SINGLE' ? 'Single' : 'Multi'}</small></label>) : <p>No questions available. Create questions in the question bank first.</p>}</fieldset><label>Assigned student emails <span className="oes-hint">Separate addresses with commas or spaces</span><textarea value={studentText} onChange={(e) => setStudentText(e.target.value)} placeholder="student@example.com"/></label><div className="oes-form-grid"><label className="oes-check-row"><input type="checkbox" checked={draft.randomQuestions} onChange={(e) => setDraft({ ...draft, randomQuestions: e.target.checked })}/>Randomize question order</label><label className="oes-check-row"><input type="checkbox" checked={draft.randomOptions} onChange={(e) => setDraft({ ...draft, randomOptions: e.target.checked })}/>Randomize option order</label></div>{error && <p className="oes-error" role="alert">{error}</p>}<div className="oes-actions"><button type="submit" className="oes-btn oes-btn-outline"><Save size={16}/> Save draft</button><button type="button" className="oes-btn" onClick={(e) => submit(e, true)}><CheckCircle2 size={16}/> Publish exam</button></div></form>}</div></div>}
  </>;
}

function seededShuffle(items, seed) {
  const list = [...items];
  let value = [...seed].reduce((total, c) => (total * 31 + c.charCodeAt(0)) >>> 0, 17);
  for (let i = list.length - 1; i > 0; i -= 1) { value = (value * 1664525 + 1013904223) >>> 0; const j = value % (i + 1); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

export function OESAttempt() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [data, save] = useExamData();
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const email = user?.email?.toLowerCase();
  const exam = data.exams.find((item) => item.id === examId);
  const attempt = data.attempts.find((item) => item.examId === examId && item.studentEmail === email);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = attempt ? Math.max(0, Math.ceil((new Date(attempt.deadline).getTime() - now) / 1000)) : 0;
  const finalize = (current) => { if (!current || current.status === 'FINALIZED') return; const updated = { ...current, status: 'FINALIZED', submittedAt: new Date().toISOString(), result: gradeAttempt(current) }; save({ ...readExamData(), attempts: readExamData().attempts.map((item) => item.id === current.id ? updated : item) }); };
  useEffect(() => { if (attempt?.status === 'IN_PROGRESS' && remaining === 0) finalize(attempt); }, [attempt, remaining]);
  if (!exam || exam.status !== 'PUBLISHED' || !exam.students.includes(email)) return <Empty title="Examination unavailable" text="This examination is not assigned to your account." action={<Link className="oes-btn" to="/dashboard">Back to dashboard</Link>}/>;
  if (attempt?.status === 'FINALIZED') return <Empty title="Attempt submitted" text="Your examination has been finalized. View your result and answer history." action={<Link className="oes-btn" to={`/dashboard/results/${attempt.id}`}>View result</Link>}/>;
  const status = statusForExam(exam, now);
  if (!attempt) return <><PageTitle eyebrow="ASSIGNED EXAMINATION" title={exam.title}/><div className="oes-panel oes-instructions"><h2>Before you begin</h2><p>This examination has {exam.questions.length} questions and a {exam.duration}-minute time limit. You may move between questions. Answers are saved in this browser as you select them. Submit before the countdown reaches zero.</p><dl className="oes-details"><dt>Available</dt><dd>{new Date(exam.startAt).toLocaleString()} – {new Date(exam.endAt).toLocaleString()}</dd><dt>Question types</dt><dd>Single choice and multi select</dd><dt>Scoring</dt><dd>Exact match; no partial or negative marks</dd></dl>{status === 'Available' ? <button className="oes-btn" onClick={() => { const id = newId(); let questions = exam.questions.map((qid) => data.questions.find((q) => q.id === qid)).filter(Boolean).map((q) => structuredClone(q)); if (exam.randomQuestions) questions = seededShuffle(questions, id); if (exam.randomOptions) questions = questions.map((q) => ({ ...q, options: seededShuffle(q.options, `${id}:${q.id}`) })); const startedAt = new Date().toISOString(); save({ ...data, attempts: [...data.attempts, { id, examId, examTitle: exam.title, studentEmail: email, studentName: user?.name || email, startedAt, deadline: new Date(Date.now() + exam.duration * 60000).toISOString(), status: 'IN_PROGRESS', questions, answers: {} }] }); }}>Start examination <ArrowRight size={16}/></button> : <p className="oes-notice">This examination is {status.toLowerCase()} and cannot be started now.</p>}</div></>;
  const question = attempt.questions[index];
  if (!question) return <Empty title="No questions available" text="Contact your examiner."/>;
  const selected = attempt.answers[question.id] || [];
  const answer = (optionId) => { const next = question.type === 'SINGLE' ? [optionId] : selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]; const updated = { ...attempt, answers: { ...attempt.answers, [question.id]: next } }; save({ ...data, attempts: data.attempts.map((item) => item.id === attempt.id ? updated : item) }); };
  return <><div className="oes-attempt-top"><div><span className="oes-eyebrow">EXAM IN PROGRESS</span><h1>{exam.title}</h1></div><div className={`oes-timer ${remaining <= 60 ? 'urgent' : ''}`}><Clock3 size={20}/>{Math.floor(remaining / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</div></div>{remaining <= 60 && <p className="oes-warning" role="status">Less than one minute remains. Your saved answers will be submitted when time runs out.</p>}<div className="oes-attempt-layout"><aside className="oes-panel"><h2>Questions</h2><div className="oes-question-nav">{attempt.questions.map((q, i) => <button key={q.id} className={`${i === index ? 'current' : ''} ${attempt.answers[q.id]?.length ? 'answered' : ''}`} onClick={() => setIndex(i)} aria-label={`Question ${i + 1}${attempt.answers[q.id]?.length ? ', answered' : ''}`}>{i + 1}</button>)}</div><p className="oes-hint">{Object.values(attempt.answers).filter((a) => a.length).length} of {attempt.questions.length} answered</p></aside><section className="oes-panel oes-question"><span className="oes-eyebrow">QUESTION {index + 1} OF {attempt.questions.length} · {question.points} POINT{question.points === 1 ? '' : 'S'}</span><h2>{question.prompt}</h2><p className="oes-hint">{question.type === 'SINGLE' ? 'Select one answer.' : 'Select all correct answers.'}</p><div className="oes-answer-list">{question.options.map((option) => <label key={option.id} className={selected.includes(option.id) ? 'selected' : ''}><input type={question.type === 'SINGLE' ? 'radio' : 'checkbox'} name={question.id} checked={selected.includes(option.id)} onChange={() => answer(option.id)}/><span>{option.text}</span></label>)}</div><p className="oes-save-status"><CheckCircle2 size={15}/> Answers saved in this browser</p><div className="oes-actions"><button className="oes-btn oes-btn-outline" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft size={16}/> Previous</button>{index < attempt.questions.length - 1 ? <button className="oes-btn" onClick={() => setIndex(index + 1)}>Next <ArrowRight size={16}/></button> : <button className="oes-btn" onClick={() => { if (window.confirm('Submit this examination? You cannot change answers afterward.')) { finalize(attempt); navigate('/dashboard/results'); } }}>Submit examination</button>}</div></section></div></>;
}

export function OESResults() {
  const { attemptId } = useParams();
  const { pathname } = useLocation();
  const [data] = useExamData();
  const user = useAuthStore((s) => s.user);
  const examiner = user?.platformRole === 'ADMIN';
  const attempts = data.attempts.filter((a) => a.status === 'FINALIZED' && (examiner || a.studentEmail === user?.email?.toLowerCase())).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const selected = attempts.find((a) => a.id === attemptId);
  if (attemptId && !selected) return <Empty title="Result unavailable" text="This result does not belong to your account." action={<Link className="oes-btn" to="/dashboard/results">View results</Link>}/>;
  if (selected) return <><PageTitle eyebrow="EXAMINATION RESULT" title={selected.examTitle}><Link className="oes-btn oes-btn-outline" to="/dashboard/results"><ArrowLeft size={16}/> All results</Link></PageTitle><div className="oes-stats"><Stat label="Score" value={`${selected.result.earned} / ${selected.result.possible}`}/><Stat label="Percentage" value={`${selected.result.possible ? Math.round(selected.result.earned / selected.result.possible * 100) : 0}%`}/><Stat label="Submitted" value={new Date(selected.submittedAt).toLocaleString()}/></div><div className="oes-panel"><h2>Question summary</h2>{selected.questions.map((q, index) => <div className="oes-result-item" key={q.id}><strong>{index + 1}. {q.prompt}</strong><span>{selected.result.items[index]?.earned || 0} / {q.points} points</span><p>Your answer: {q.options.filter((o) => selected.answers[q.id]?.includes(o.id)).map((o) => o.text).join(', ') || 'No answer'}</p></div>)}</div></>;
  return <><PageTitle eyebrow={examiner ? 'EXAMINER OVERSIGHT' : 'STUDENT HISTORY'} title={examiner ? 'Results & activity' : 'My results'}/><p className="oes-lead">{examiner ? 'Review completed attempts and score distribution.' : 'Your completed examinations appear here in chronological order.'}</p>{examiner && <div className="oes-stats"><Stat label="Completed attempts" value={attempts.length}/><Stat label="Average score" value={`${attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (a.result.possible ? a.result.earned / a.result.possible * 100 : 0), 0) / attempts.length) : 0}%`}/><Stat label="Published exams" value={data.exams.filter((e) => e.status === 'PUBLISHED').length}/></div>}{attempts.length ? <div className="oes-list">{attempts.map((a) => <Link to={`${pathname}/${a.id}`} className="oes-row" key={a.id}><div><strong>{a.examTitle}</strong><p>{examiner && `${a.studentName} · `}{new Date(a.submittedAt).toLocaleString()}</p></div><span className="oes-row-action">{a.result.earned} / {a.result.possible} <ArrowRight size={16}/></span></Link>)}</div> : <Empty title="No completed attempts" text="Results will appear after an examination is submitted."/>}</>;
}

export function OESHelp() {
  const examiner = useAuthStore((s) => s.user?.platformRole === 'ADMIN');
  return <><PageTitle eyebrow="USER GUIDE" title={examiner ? 'Examiner quick start' : 'Student quick start'}/><div className="oes-panel oes-help">{examiner ? <><section><h2>1. Prepare the question bank</h2><p>Open Question bank to add single choice or multi select questions. Mark the exact correct answer set and assign points. You can search and edit draft questions.</p></section><section><h2>2. Build and publish an exam</h2><p>Create an examination, set its duration and availability window, select questions, and enter the assigned students’ sign-in email addresses. Save as a draft, then publish. Published content is locked.</p></section><section><h2>3. Review results</h2><p>Open Results & oversight to view submitted attempts and scores. The current preview stores this data in your browser only.</p></section></> : <><section><h2>1. Find your exam</h2><p>Sign in with the email your examiner assigned. Available exams appear on My examinations during their configured window.</p></section><section><h2>2. Complete the attempt</h2><p>Read the instructions, start the timer, choose answers, and move among questions using the numbered list. Answers are saved as you choose them in this browser. Submit before the timer reaches zero.</p></section><section><h2>3. View your result</h2><p>After submission, open My results to review your exact match score and your submitted answers.</p></section></>}</div></>;
}
