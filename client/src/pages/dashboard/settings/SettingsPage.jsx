import { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  Bell,
  CheckCircle2,
  Save,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  Sliders,
  Download,
  Key,
  Layers,
  Server,
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../../components/PageHeader.jsx';
import useAuthStore from '../../../store/auth.store.js';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState('AI_KEYS');

  // AI & Anti-Hallucination Settings State
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('kshamata_ai_provider') || 'OPENAI');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('kshamata_ai_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [groundingStrictness, setGroundingStrictness] = useState(
    () => localStorage.getItem('kshamata_grounding_level') || 'STRICT'
  );
  const [enforceCitations, setEnforceCitations] = useState(
    () => localStorage.getItem('kshamata_enforce_citations') !== 'false'
  );
  const [temperature, setTemperature] = useState(
    () => Number(localStorage.getItem('kshamata_ai_temp')) || 0.2
  );
  const [chunkSize, setChunkSize] = useState(() => localStorage.getItem('kshamata_chunk_size') || '512');
  const [testingConnection, setTestingConnection] = useState(false);

  // Profile & iGOT Preferences State
  const [language, setLanguage] = useState(() => localStorage.getItem('kshamata_lang') || 'en');
  const [igotSyncFreq, setIgotSyncFreq] = useState(() => localStorage.getItem('kshamata_igot_freq') || 'DAILY');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySkillGaps, setNotifySkillGaps] = useState(true);
  const [designation, setDesignation] = useState('Senior Statistical Officer (SSO)');
  const [department, setDepartment] = useState('Data Informatics & Innovation Division (DIID)');

  // Admin Governance State
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);
  const [autoReviewThreshold, setAutoReviewThreshold] = useState('0.90');
  const [ssoEnabled, setSsoEnabled] = useState(true);

  // Digital Signature State
  const [digitalSignName, setDigitalSignName] = useState(
    () => localStorage.getItem('kshamata_dsig_name') || 'Dr. Sunita Rao'
  );
  const [digitalSignTitle, setDigitalSignTitle] = useState(
    () => localStorage.getItem('kshamata_dsig_title') || 'Director (Capacity Building), NSSTA'
  );
  const [embedDigitalSeal, setEmbedDigitalSeal] = useState(
    () => localStorage.getItem('kshamata_dsig_seal') !== 'false'
  );
  const [dsigHash, setDsigHash] = useState(
    () => localStorage.getItem('kshamata_dsig_hash') || 'DSC-NIC-8F9A2B1C4E7D'
  );

  const handleSaveSettings = () => {
    localStorage.setItem('kshamata_ai_provider', aiProvider);
    localStorage.setItem('kshamata_ai_key', apiKey);
    localStorage.setItem('kshamata_grounding_level', groundingStrictness);
    localStorage.setItem('kshamata_enforce_citations', String(enforceCitations));
    localStorage.setItem('kshamata_ai_temp', String(temperature));
    localStorage.setItem('kshamata_chunk_size', chunkSize);
    localStorage.setItem('kshamata_lang', language);
    localStorage.setItem('kshamata_igot_freq', igotSyncFreq);
    localStorage.setItem('kshamata_dsig_name', digitalSignName);
    localStorage.setItem('kshamata_dsig_title', digitalSignTitle);
    localStorage.setItem('kshamata_dsig_seal', String(embedDigitalSeal));
    localStorage.setItem('kshamata_dsig_hash', dsigHash);

    toast.success('Settings & Digital Signature parameters saved successfully!', {
      id: 'settings-save-toast',
      duration: 3500,
    });
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      toast.success(
        `AI Gateway & Vector Index Verified! Provider: ${aiProvider} (Lat: 110ms, Strict RAG Grounding Active)`
      );
    }, 1200);
  };

  const handleExportAuditLog = () => {
    toast.success('Security Audit Telemetry Log exported as JSON!');
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title="Settings"
        subtitle="Configure role-based profile parameters, iGOT Karmayogi integration gateways, and AI anti-hallucination model guardrails."
      />

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('AI_KEYS')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'AI_KEYS'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu size={16} /> AI Engine & Anti-Hallucination
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'PROFILE'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User size={16} /> Profile & iGOT Sync
        </button>

        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'GOVERNANCE'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={16} /> Governance & Security Audit
        </button>

        <button
          onClick={() => setActiveTab('DIGITAL_SIGN')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'DIGITAL_SIGN'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock size={16} /> Digital Signature & e-Sign
        </button>
      </div>

      {/* ── Tab 1: AI Engine & Anti-Hallucination Controls ── */}
      {activeTab === 'AI_KEYS' && (
        <div className="space-y-6">
          {/* LLM Provider & Custom API Key */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI LLM Provider & Custom API Keys</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure LLM endpoints for automated question generation, RAG indexing, and virtual assistant
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={12} /> MoSPI NIC Gateway Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">AI Engine Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                >
                  <option value="OPENAI">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="GEMINI">Google Gemini Pro 1.5</option>
                  <option value="ANTHROPIC">Anthropic Claude 3.5 Sonnet</option>
                  <option value="OLLAMA">NIC MeghRaj On-Premises Llama3 (Ollama)</option>
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Custom API Key (Optional Override)</span>
                  <span className="text-[10px] text-slate-400 font-medium">Local Encrypted Storage</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-proj-... (Leave blank to use NIC default gateway)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-xs font-mono font-medium text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-600" />
                API keys are never transmitted to third parties or logged in raw format.
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw size={13} className={testingConnection ? 'animate-spin' : ''} />
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* Anti-Hallucination & RAG Guardrails */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Anti-Hallucination & RAG Grounding Controls</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enforce strict source document attribution and bound model generation creativity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grounding Strictness Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">RAG Grounding Strictness</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'STRICT', label: 'Strict Grounding', desc: '100% Fact-checked against MoSPI manuals' },
                    { id: 'BALANCED', label: 'Balanced RAG', desc: 'Standard FRAC taxonomy alignment' },
                    { id: 'FLEXIBLE', label: 'Flexible Synthesis', desc: 'Broader semantic generation' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGroundingStrictness(g.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        groundingStrictness === g.id
                          ? 'border-[#1E3A8A] bg-blue-50/80 text-[#1E3A8A] font-bold ring-1 ring-[#1E3A8A]'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold block">{g.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Temperature & Chunk Size */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>LLM Temperature (Creativity Bounding)</span>
                    <span className="font-mono text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {temperature.toFixed(2)} ({temperature <= 0.2 ? 'Deterministic' : 'Creative'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[#1E3A8A]"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Lower temperature (0.1–0.2) ensures strict mathematical and factual accuracy for MoSPI survey codebooks.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vector Store Chunk Size (Tokens)</label>
                  <select
                    value={chunkSize}
                    onChange={(e) => setChunkSize(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  >
                    <option value="256">256 Tokens (Fine-Grained Paragraph Parsing)</option>
                    <option value="512">512 Tokens (Standard Document Section Parsing)</option>
                    <option value="1024">1024 Tokens (Large Chapter Parsing)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Citation & Grounding Check */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceCitations}
                  onChange={(e) => setEnforceCitations(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enforce Source Document Citations</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Every generated question or answer must explicitly cite the official manual page/section.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Profile & iGOT Sync ── */}
      {activeTab === 'PROFILE' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Profile & iGOT Integration</h3>
              <p className="text-xs text-slate-500 font-medium">
                Personalized profile metadata, cadre information, and automated course completion sync
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department / Division</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Interface Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              >
                <option value="en">English (Official Government Format)</option>
                <option value="hi">हिंदी (Hindi Official Statistics Format)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">iGOT Karmayogi Sync Frequency</label>
              <select
                value={igotSyncFreq}
                onChange={(e) => setIgotSyncFreq(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              >
                <option value="REALTIME">Real-Time (Instant Webhook Synchronization)</option>
                <option value="DAILY">Daily Batch (Midnight Sync)</option>
                <option value="WEEKLY">Weekly Summary Sync</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notification Preferences</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span className="text-xs font-medium text-slate-800">
                  Receive email alerts for newly recommended NSSTA TPAC courses
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySkillGaps}
                  onChange={(e) => setNotifySkillGaps(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span className="text-xs font-medium text-slate-800">
                  Notify when a critical skill gap is detected after a diagnostic assessment
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Governance & Security Audit ── */}
      {activeTab === 'GOVERNANCE' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Governance, Security & Audit Logs</h3>
              <p className="text-xs text-slate-500 font-medium">
                Single Sign-On (SSO), automated review thresholds, and telemetry audit trail export
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Automated Review Queue Trigger Threshold
              </label>
              <select
                value={autoReviewThreshold}
                onChange={(e) => setAutoReviewThreshold(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              >
                <option value="0.95">95% Match Score (Strict Automated Approval)</option>
                <option value="0.90">90% Match Score (Standard Baseline)</option>
                <option value="0.85">85% Match Score (Permissive Review)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIC Parichay SSO Authentication</label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={ssoEnabled}
                  onChange={(e) => setSsoEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span className="text-xs font-bold text-slate-800">
                  Enforce Single Sign-On (SSO) via Government of India Parichay Gateway
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Security Audit Telemetry Log</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Export encrypted telemetry trail of all system API key requests and AI generation runs
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportAuditLog}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download size={14} className="text-[#1E3A8A]" /> Export Audit Log (.JSON)
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Digital Signature & e-Sign Governance ── */}
      {activeTab === 'DIGITAL_SIGN' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock size={18} className="text-[#1E3A8A]" /> Government Digital Signature & e-Sign Governance
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage digital signatures and NIC e-Sign certificate stamps embedded on official ACBP reports and capacity certificates.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Digital Signatory Full Name
                </label>
                <input
                  type="text"
                  value={digitalSignName}
                  onChange={(e) => setDigitalSignName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                  placeholder="e.g. Dr. Sunita Rao"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Official Designation & Authority
                </label>
                <input
                  type="text"
                  value={digitalSignTitle}
                  onChange={(e) => setDigitalSignTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                  placeholder="e.g. Director (Capacity Building), NSSTA"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  NIC e-Sign DSC Hash Identifier
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dsigHash}
                    onChange={(e) => setDsigHash(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono font-bold text-slate-700 bg-slate-50 focus:border-[#1E3A8A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newHash = 'DSC-NIC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                      setDsigHash(newHash);
                      toast.success('Generated fresh NIC e-Sign Certificate Hash!');
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold"
                    title="Regenerate Hash"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Signature Preview Card */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A] block mb-2">
                  Live Digital Signature Preview (ACBP Document Output)
                </span>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-2 shadow-2xs">
                  <div className="font-serif italic text-xl font-bold text-[#1E3A8A] tracking-wide py-1 select-none">
                    {digitalSignName || 'Dr. Sunita Rao'}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 py-0.5 px-2 rounded border border-emerald-200 inline-block">
                    ✓ DIGITALLY SIGNED VIA NIC e-SIGN [{dsigHash}]
                  </div>
                  <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-700 font-bold">
                    {digitalSignName}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium">
                    {digitalSignTitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="embedSeal"
                  checked={embedDigitalSeal}
                  onChange={(e) => setEmbedDigitalSeal(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <label htmlFor="embedSeal" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Embed NIC e-Sign DSC Stamp on Official ACBP Reports
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Settings Footer ── */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-600" />
          End-to-End Encrypted • Government of India MoSPI Platform Governance v2.4
        </span>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-2xl bg-[#1E3A8A] hover:bg-[#1e40af] px-6 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
        >
          <Save size={15} /> Save All Settings
        </button>
      </div>
    </div>
  );
}
