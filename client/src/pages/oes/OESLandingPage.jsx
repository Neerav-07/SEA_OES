import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Clock3, ShieldCheck } from 'lucide-react';

export default function OESLandingPage() {
  return <div className="oes-page min-h-screen">
    <header className="oes-topbar"><Link to="/" className="oes-brand"><span className="oes-mark">O</span><span>Online Examination System<small>Academic assessment portal</small></span></Link><Link className="oes-btn oes-btn-outline" to="/login">Sign in <ArrowRight size={16}/></Link></header>
    <main className="oes-hero">
      <div className="oes-eyebrow">SYSTEM RELEASE 1.0 · WEB EXAMINATIONS</div>
      <h1>Examinations, from question bank to results.</h1>
      <p>A focused workspace for students to take assigned exams, examiners to prepare objective assessments, and administrators to oversee activity.</p>
      <div className="oes-hero-actions"><Link className="oes-btn" to="/login">Go to sign in <ArrowRight size={17}/></Link><a className="oes-btn oes-btn-outline" href="#workflow">Explore the workflow</a></div>
      <div id="workflow" className="oes-feature-grid">
        <article><ClipboardList/><h2>Prepare</h2><p>Build a reusable bank of single choice and multi select questions, then configure exam availability and audience.</p></article>
        <article><Clock3/><h2>Attempt</h2><p>Students see assigned exams, navigate questions, save answers, and submit within a visible time limit.</p></article>
        <article><ShieldCheck/><h2>Review</h2><p>Review exact match scores, attempt history, and examination activity from one place.</p></article>
      </div>
    </main>
    <footer className="oes-footer">Online Examination System · Academic Year 2026–27</footer>
  </div>;
}
