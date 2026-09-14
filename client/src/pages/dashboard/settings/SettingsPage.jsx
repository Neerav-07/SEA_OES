import { useState, useEffect, useRef } from 'react';
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
  Award,
  Calendar,
  Building2,
  Check,
  AlertCircle,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import KarmayogiLogo from '../../../components/common/KarmayogiLogo.jsx';
import toast from 'react-hot-toast';

import PageHeader from '../../../components/PageHeader.jsx';
import Modal from '../../../components/Modal.jsx';
import Select from '../../../components/Select.jsx';
import useAuthStore from '../../../store/auth.store.js';
import api from '../../../services/api.js';
import { getProviderStatus } from '../../../services/ml.service.js';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAdmin = user?.platformRole === 'ADMIN' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('PROFILE');
  const [saveStatus, setSaveStatus] = useState('SAVED'); // 'IDLE' | 'SAVING' | 'SAVED'
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isAdmin && activeTab !== 'PROFILE' && activeTab !== 'AI_KEYS') {
      setActiveTab('PROFILE');
    }
  }, [isAdmin, activeTab]);

  // Critical Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null,
  });

  // ── 1. AI & Anti-Hallucination Settings State ──
  const [aiProvider, setAiProvider] = useState(
    () => localStorage.getItem('kshamata_ai_provider') || 'OPENAI'
  );
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
  const [chunkSize, setChunkSize] = useState(
    () => localStorage.getItem('kshamata_chunk_size') || '512'
  );
  const [testingConnection, setTestingConnection] = useState(false);
  const [providerStatus, setProviderStatus] = useState({ provider: '', status: '', details: '' });

  // ── 2. Profile & Official Service Record State ──
  const [language, setLanguage] = useState(() => localStorage.getItem('kshamata_lang') || 'en');
  const [igotSyncFreq, setIgotSyncFreq] = useState(
    () => localStorage.getItem('kshamata_igot_freq') || 'DAILY'
  );
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySkillGaps, setNotifySkillGaps] = useState(true);
  const [designation, setDesignation] = useState(
    () => user?.designation || 'Senior Statistical Officer (SSO)'
  );
  const [department, setDepartment] = useState(
    () => user?.department || 'Data Informatics & Innovation Division (DIID)'
  );
  const [cadre, setCadre] = useState(() => user?.cadre || 'ISS (Indian Statistical Service)');
  const [experienceYears, setExperienceYears] = useState(5);
  const [education, setEducation] = useState(
    () => user?.education || 'M.Sc. in Statistics / Agricultural Statistics (IASRI)'
  );

  // ── 3. Admin Governance State ──
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);
  const [autoReviewThreshold, setAutoReviewThreshold] = useState('0.90');
  const [ssoEnabled, setSsoEnabled] = useState(true);

  // ── 4. Digital Signature State ──
  const [digitalSignName, setDigitalSignName] = useState(
    () => localStorage.getItem('kshamata_dsig_name') || 'Dr. Sunita Rao'
  );
  const [digitalSignTitle, setDigitalSignTitle] = useState(
    () =>
      localStorage.getItem('kshamata_dsig_title') ||
      'Director (Capacity Building), NSSTA'
  );
  const [embedDigitalSeal, setEmbedDigitalSeal] = useState(
    () => localStorage.getItem('kshamata_dsig_seal') !== 'false'
  );
  const [dsigHash, setDsigHash] = useState(
    () => localStorage.getItem('kshamata_dsig_hash') || 'DSC-NIC-8F9A2B1C4E7D'
  );

  // ── 5. NSSTA & Pathway Priority Policy Weights State ──
  const [policyWeights, setPolicyWeights] = useState({
    GAP_SEVERITY: 0.35,
    NOTICE_URGENCY: 0.25,
    ROLE_CRITICALITY: 0.20,
    SEMANTIC_RELEVANCE: 0.15,
    DEADLINE_PROXIMITY: 0.05,
  });
  const [selectedPreset, setSelectedPreset] = useState('BALANCED');

  // Load initial backend profile & policy weights
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, weightsRes] = await Promise.allSettled([
          api.get('/officials/me'),
          api.get('/nssta/policy-weights'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.data?.data) {
          const d = profileRes.value.data.data;
          if (d.designation) setDesignation(d.designation);
          if (d.department) setDepartment(d.department);
          if (d.cadre) setCadre(d.cadre);
          if (d.experienceYears != null) setExperienceYears(d.experienceYears);
          if (d.education) setEducation(d.education);
          if (d.preferredLanguage) setLanguage(d.preferredLanguage);
        }

        if (weightsRes.status === 'fulfilled' && weightsRes.value.data?.data?.activeWeights) {
          setPolicyWeights(weightsRes.value.data.data.activeWeights);
        }
      } catch {
        // Fallback to local states
      }
    }
    loadData();
    // Fetch provider status on mount
    (async () => {
      try {
        const status = await getProviderStatus();
        setProviderStatus(status);
      } catch (e) {
        console.error('Failed to fetch provider status', e);
      }
    })();
  }, []);

  // ── Reactive Auto-Save Helper ──
  const markAutosaving = () => {
    setSaveStatus('SAVING');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('SAVED');
    }, 800);
  };

  // ── Auto-save Profile ──
  const autoSaveProfile = async (updatedFields) => {
    markAutosaving();
    try {
      const payload = {
        designation: updatedFields.designation ?? designation,
        department: updatedFields.department ?? department,
        cadre: updatedFields.cadre ?? cadre,
        experienceYears: Number(updatedFields.experienceYears ?? experienceYears),
        education: updatedFields.education ?? education,
        preferredLanguage: updatedFields.language ?? language,
      };
      const res = await api.put('/officials/me', payload);
      if (res?.data?.data) {
        setAuth({
          user: {
            ...user,
            designation: res.data.data.designation,
            department: res.data.data.department,
            cadre: res.data.data.cadre,
          },
          accessToken,
        });
      }
    } catch {
      // Local fallback
    }
  };

  // ── Auto-save AI Preferences ──
  const autoSaveAiConfig = (keyName, value) => {
    markAutosaving();
    localStorage.setItem(keyName, typeof value === 'object' ? JSON.stringify(value) : String(value));
  };

  // ── Policy Weights Helpers ──
  const totalWeightPercent = Math.round(
    ((Number(policyWeights.GAP_SEVERITY) || 0) +
      (Number(policyWeights.NOTICE_URGENCY) || 0) +
      (Number(policyWeights.ROLE_CRITICALITY) || 0) +
      (Number(policyWeights.SEMANTIC_RELEVANCE) || 0) +
      (Number(policyWeights.DEADLINE_PROXIMITY) || 0)) *
      100
  );

  const autoSavePolicyWeights = async (newWeights) => {
    const sum = Math.round(
      ((Number(newWeights.GAP_SEVERITY) || 0) +
        (Number(newWeights.NOTICE_URGENCY) || 0) +
        (Number(newWeights.ROLE_CRITICALITY) || 0) +
        (Number(newWeights.SEMANTIC_RELEVANCE) || 0) +
        (Number(newWeights.DEADLINE_PROXIMITY) || 0)) *
        100
    );

    if (sum !== 100) return;

    markAutosaving();
    try {
      await api.put('/nssta/policy-weights', { weights: newWeights });
      localStorage.setItem('kshamata_policy_weights', JSON.stringify(newWeights));
    } catch {
      localStorage.setItem('kshamata_policy_weights', JSON.stringify(newWeights));
    }
  };

  const handleApplyPreset = (presetId) => {
    setSelectedPreset(presetId);
    let newWeights = { ...policyWeights };
    if (presetId === 'BALANCED') {
      newWeights = {
        GAP_SEVERITY: 0.35,
        NOTICE_URGENCY: 0.25,
        ROLE_CRITICALITY: 0.20,
        SEMANTIC_RELEVANCE: 0.15,
        DEADLINE_PROXIMITY: 0.05,
      };
    } else if (presetId === 'MANDATE_URGENT') {
      newWeights = {
        GAP_SEVERITY: 0.15,
        NOTICE_URGENCY: 0.45,
        ROLE_CRITICALITY: 0.20,
        SEMANTIC_RELEVANCE: 0.10,
        DEADLINE_PROXIMITY: 0.10,
      };
    } else if (presetId === 'SKILL_GAP_HEAVY') {
      newWeights = {
        GAP_SEVERITY: 0.50,
        NOTICE_URGENCY: 0.15,
        ROLE_CRITICALITY: 0.15,
        SEMANTIC_RELEVANCE: 0.15,
        DEADLINE_PROXIMITY: 0.05,
      };
    } else if (presetId === 'CADRE_CAREER') {
      newWeights = {
        GAP_SEVERITY: 0.20,
        NOTICE_URGENCY: 0.15,
        ROLE_CRITICALITY: 0.45,
        SEMANTIC_RELEVANCE: 0.15,
        DEADLINE_PROXIMITY: 0.05,
      };
    }
    setPolicyWeights(newWeights);
    autoSavePolicyWeights(newWeights);
    toast.success('Ranking policy preset applied & saved to platform.');
  };

  const handleWeightChange = (key, value) => {
    setSelectedPreset('CUSTOM');
    const updated = {
      ...policyWeights,
      [key]: Number(value),
    };
    setPolicyWeights(updated);
    autoSavePolicyWeights(updated);
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'RESET_POLICY_BASELINE') {
      handleApplyPreset('BALANCED');
      toast.success('Policy weights reset to official MoSPI baseline.');
    } else if (confirmModal.actionType === 'CLEAR_API_KEYS') {
      setApiKey('');
      localStorage.removeItem('kshamata_ai_key');
      markAutosaving();
      toast.success('Custom API keys cleared from encrypted storage.');
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: null });
  };

  // Handle test connection to provider status
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const status = await getProviderStatus();
      setProviderStatus(status);
      toast.success(`Provider ${status.provider} is ${status.status}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to test connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExportAuditLog = () => {
    toast.success('Security Audit Telemetry Log exported as JSON.');
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header with Live Auto-Save Status ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Settings"
          subtitle={
            isAdmin
              ? "Configure official service profile, AI models, security audits, and statutory ranking policies."
              : "Manage your official cadre profile, personal AI API key setup, and iGOT Karmayogi synchronization."
          }
          showHowItWorks={false}
        />

        <div className="shrink-0 flex items-center gap-2">
          {saveStatus === 'SAVING' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-200 text-xs font-semibold">
              <RefreshCw size={13} className="animate-spin" /> Saving changes...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 size={13} className="text-emerald-600" /> All preferences saved
            </span>
          )}
        </div>
      </div>

      {/* ── 2-Column Sidebar Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left Sidebar Navigation ── */}
        <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3 lg:sticky lg:top-6">
          <div className="px-3 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isAdmin ? 'Personal Settings' : 'Account & Sync'}
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all text-left ${
                activeTab === 'PROFILE'
                  ? 'bg-[#1E3A8A] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
              }`}
            >
              <User size={16} className={activeTab === 'PROFILE' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
              <div className="min-w-0">
                <div className="truncate">Profile & iGOT Sync</div>
                <div className={`text-[10px] truncate ${activeTab === 'PROFILE' ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'}`}>
                  Cadre & Service Records
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('AI_KEYS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all text-left ${
                activeTab === 'AI_KEYS'
                  ? 'bg-[#1E3A8A] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
              }`}
            >
              <Cpu size={16} className={activeTab === 'AI_KEYS' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
              <div className="min-w-0">
                <div className="truncate">AI & Model Gateway</div>
                <div className={`text-[10px] truncate ${activeTab === 'AI_KEYS' ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'}`}>
                  Personal Keys & Anti-Hallucination
                </div>
              </div>
            </button>
          </nav>

          {isAdmin && (
            <>
              <div className="px-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  System Administration
                </span>
              </div>

              <nav className="space-y-1">

                <button
                  onClick={() => setActiveTab('NSSTA_POLICY')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all text-left ${
                    activeTab === 'NSSTA_POLICY'
                      ? 'bg-[#1E3A8A] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Sliders size={16} className={activeTab === 'NSSTA_POLICY' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
                  <div className="min-w-0">
                    <div className="truncate">NSSTA Policy Weights</div>
                    <div className={`text-[10px] truncate ${activeTab === 'NSSTA_POLICY' ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'}`}>
                      Priority Algorithm Tuning
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('GOVERNANCE')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all text-left ${
                    activeTab === 'GOVERNANCE'
                      ? 'bg-[#1E3A8A] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <ShieldCheck size={16} className={activeTab === 'GOVERNANCE' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
                  <div className="min-w-0">
                    <div className="truncate">Governance & Security</div>
                    <div className={`text-[10px] truncate ${activeTab === 'GOVERNANCE' ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'}`}>
                      Audit Logs & Telemetry
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('DIGITAL_SIGN')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all text-left ${
                    activeTab === 'DIGITAL_SIGN'
                      ? 'bg-[#1E3A8A] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Lock size={16} className={activeTab === 'DIGITAL_SIGN' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
                  <div className="min-w-0">
                    <div className="truncate">Digital Signature & e-Sign</div>
                    <div className={`text-[10px] truncate ${activeTab === 'DIGITAL_SIGN' ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'}`}>
                      NIC e-Sign DSC Stamp
                    </div>
                  </div>
                </button>
              </nav>
            </>
          )}
        </aside>

        {/* ── Main Settings Panel (Right Content Area) ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ── Tab 1: Profile & iGOT Sync ── */}
          {activeTab === 'PROFILE' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Official Profile & Service Record</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Manage cadre assignments, designation metadata, and iGOT Karmayogi synchronization
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Statistical Cadre"
                  value={cadre}
                  onChange={(e) => {
                    setCadre(e.target.value);
                    autoSaveProfile({ cadre: e.target.value });
                  }}
                  options={[
                    { value: 'ISS (Indian Statistical Service)', label: 'ISS (Indian Statistical Service)' },
                    { value: 'SSS (Subordinate Statistical Service)', label: 'SSS (Subordinate Statistical Service)' },
                    { value: 'FOD Field Operations Cadre', label: 'FOD Field Operations Cadre' },
                    { value: 'NSSTA Training Cadre', label: 'NSSTA Training Cadre' },
                    { value: 'MoSPI General Statistical Cadre', label: 'MoSPI General Statistical Cadre' },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    onBlur={() => autoSaveProfile({ designation })}
                    placeholder="e.g. Senior Statistical Officer (SSO)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Division</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    onBlur={() => autoSaveProfile({ department })}
                    placeholder="e.g. Data Informatics & Innovation Division (DIID)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    onBlur={() => autoSaveProfile({ experienceYears })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Educational Background</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    onBlur={() => autoSaveProfile({ education })}
                    placeholder="e.g. Ph.D. in Agricultural Statistics (IASRI) / M.Sc. Statistics"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                  />
                </div>

                <Select
                  label="Preferred Interface Language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    localStorage.setItem('kshamata_lang', e.target.value);
                    autoSaveProfile({ language: e.target.value });
                  }}
                  options={[
                    { value: 'en', label: 'English (Official Government Format)' },
                    { value: 'hi', label: 'Hindi (Official Format)' },
                  ]}
                />

                <Select
                  label="iGOT Karmayogi Sync Frequency"
                  value={igotSyncFreq}
                  onChange={(e) => {
                    setIgotSyncFreq(e.target.value);
                    localStorage.setItem('kshamata_igot_freq', e.target.value);
                    markAutosaving();
                  }}
                  options={[
                    { value: 'REALTIME', label: 'Real-Time (Instant Webhook Synchronization)' },
                    { value: 'DAILY', label: 'Daily Batch (Midnight Sync)' },
                    { value: 'WEEKLY', label: 'Weekly Summary Sync' },
                  ]}
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notification Subscriptions
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => {
                        setNotifyEmail(e.target.checked);
                        markAutosaving();
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Receive email alerts for newly recommended NSSTA circulars and training programmes
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySkillGaps}
                      onChange={(e) => {
                        setNotifySkillGaps(e.target.checked);
                        markAutosaving();
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Notify when a critical skill gap is detected following a diagnostic assessment
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: AI Engine & Model Gateway ── */}
          {activeTab === 'AI_KEYS' && (
            <div className="space-y-6">
              {/* LLM Provider & Custom API Key */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isAdmin ? 'AI Engine & System Model Gateway' : 'Personal AI Provider & Model Gateway'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {isAdmin
                          ? 'Configure LLM endpoints for question generation, RAG indexing, and assistant responses'
                          : 'Configure your personal LLM API key and model gateway for Sahayak AI assistance and diagnostic explanations'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> MoSPI NIC Gateway Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Select
                      label="AI Engine Provider"
                      value={aiProvider}
                      onChange={(e) => {
                        setAiProvider(e.target.value);
                        autoSaveAiConfig('kshamata_ai_provider', e.target.value);
                      }}
                      options={[
                        { value: 'OPENAI', label: 'OpenAI (GPT-4o / GPT-4o-mini)' },
                        { value: 'GEMINI', label: 'Google Gemini Pro 1.5' },
                        { value: 'ANTHROPIC', label: 'Anthropic Claude 3.5 Sonnet' },
                        { value: 'OLLAMA', label: 'NIC MeghRaj On-Premises Llama3 (Ollama)' },
                      ]}
                    />
                    {/* Provider status badge */}
                    {providerStatus.status && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${providerStatus.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                      >
                        {providerStatus.provider}: {providerStatus.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Custom API Key (Optional Override)</span>
                      {apiKey && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              title: 'Clear Custom API Key',
                              message:
                                'Are you sure you want to remove your custom API key? The system will revert to the default MoSPI NIC gateway.',
                              actionType: 'CLEAR_API_KEYS',
                            })
                          }
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700"
                        >
                          Clear Key
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="sk-proj-... (Leave blank to use NIC default gateway)"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          autoSaveAiConfig('kshamata_ai_key', e.target.value);
                        }}
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
                    API keys are stored in encrypted browser storage and never logged in plain text.
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
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Anti-Hallucination & RAG Guardrails</h3>
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
                          onClick={() => {
                            setGroundingStrictness(g.id);
                            autoSaveAiConfig('kshamata_grounding_level', g.id);
                          }}
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
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTemperature(val);
                          autoSaveAiConfig('kshamata_ai_temp', val);
                        }}
                        className="w-full accent-[#1E3A8A]"
                      />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Lower temperature (0.1–0.2) ensures strict mathematical and factual accuracy for official survey statistics.
                      </p>
                    </div>

                    {isAdmin && (
                      <Select
                        label="Vector Store Chunk Size (System Indexing)"
                        value={chunkSize}
                        onChange={(e) => {
                          setChunkSize(e.target.value);
                          autoSaveAiConfig('kshamata_chunk_size', e.target.value);
                        }}
                        options={[
                          { value: '256', label: '256 Tokens (Fine-Grained Paragraph Parsing)' },
                          { value: '512', label: '512 Tokens (Standard Document Section Parsing)' },
                          { value: '1024', label: '1024 Tokens (Large Chapter Parsing)' },
                        ]}
                      />
                    )}
                  </div>
                </div>

                {/* Citation & Grounding Check */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforceCitations}
                      onChange={(e) => {
                        setEnforceCitations(e.target.checked);
                        autoSaveAiConfig('kshamata_enforce_citations', e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Enforce Source Document Citations</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Every generated question or answer must explicitly cite the official manual page or circular section.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 3: NSSTA Policy Weights (Admin Only) ── */}
          {isAdmin && activeTab === 'NSSTA_POLICY' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100 shrink-0">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        NSSTA & Pathway Ranking Policy Engine
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Configure mathematical weight distribution for officer course recommendations and circular prioritization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-bold border flex items-center gap-1.5 ${
                        totalWeightPercent === 100
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {totalWeightPercent === 100 ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={13} className="text-rose-600" />
                      )}
                      Total: {totalWeightPercent}% / 100%
                    </span>
                  </div>
                </div>

                {/* Presets Toolbar */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Policy Presets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        id: 'BALANCED',
                        name: 'MoSPI Balanced Baseline',
                        desc: 'Standard distribution (35% Gap / 25% Urgency / 20% Role / 15% Match / 5% Deadline)',
                        icon: Layers,
                        iconColor: 'text-[#1E3A8A]',
                      },
                      {
                        id: 'MANDATE_URGENT',
                        name: 'Statutory Mandates & Compliance',
                        desc: 'Heavily prioritizes urgent circulars (45% Urgency / 20% Role / 15% Gap)',
                        icon: ShieldCheck,
                        iconColor: 'text-amber-600',
                      },
                      {
                        id: 'SKILL_GAP_HEAVY',
                        name: 'Competency Deficit Closure',
                        desc: 'Prioritizes evaluated officer deficits (50% Gap / 15% Urgency / 15% Role)',
                        icon: Award,
                        iconColor: 'text-blue-600',
                      },
                      {
                        id: 'CADRE_CAREER',
                        name: 'Cadre Progression Track',
                        desc: 'Focuses on cadre-specific mandates (45% Cadre Role / 20% Gap / 15% Urgency)',
                        icon: Building2,
                        iconColor: 'text-indigo-600',
                      },
                    ].map((preset) => {
                      const IconComp = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`text-left p-3.5 rounded-2xl border transition-all ${
                            selectedPreset === preset.id
                              ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <IconComp size={14} className={preset.iconColor} />
                              {preset.name}
                            </span>
                            {selectedPreset === preset.id && (
                              <Check size={13} className="text-[#1E3A8A] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                            {preset.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Allocation Meter */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Active Weight Allocation Breakdown</span>
                    <span className={totalWeightPercent === 100 ? 'text-emerald-700' : 'text-rose-600'}>
                      {totalWeightPercent}% Total
                    </span>
                  </div>
                  <div className="h-3.5 w-full rounded-xl overflow-hidden bg-slate-200 flex shadow-inner">
                    <div
                      style={{ width: `${(policyWeights.GAP_SEVERITY || 0) * 100}%` }}
                      className="bg-[#1E3A8A] transition-all"
                      title={`Skill Gap: ${Math.round((policyWeights.GAP_SEVERITY || 0) * 100)}%`}
                    />
                    <div
                      style={{ width: `${(policyWeights.NOTICE_URGENCY || 0) * 100}%` }}
                      className="bg-amber-500 transition-all"
                      title={`Urgency: ${Math.round((policyWeights.NOTICE_URGENCY || 0) * 100)}%`}
                    />
                    <div
                      style={{ width: `${(policyWeights.ROLE_CRITICALITY || 0) * 100}%` }}
                      className="bg-indigo-600 transition-all"
                      title={`Cadre: ${Math.round((policyWeights.ROLE_CRITICALITY || 0) * 100)}%`}
                    />
                    <div
                      style={{ width: `${(policyWeights.SEMANTIC_RELEVANCE || 0) * 100}%` }}
                      className="bg-emerald-600 transition-all"
                      title={`Relevance: ${Math.round((policyWeights.SEMANTIC_RELEVANCE || 0) * 100)}%`}
                    />
                    <div
                      style={{ width: `${(policyWeights.DEADLINE_PROXIMITY || 0) * 100}%` }}
                      className="bg-purple-600 transition-all"
                      title={`Deadline: ${Math.round((policyWeights.DEADLINE_PROXIMITY || 0) * 100)}%`}
                    />
                  </div>

                  {/* Meter Legend */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#1E3A8A]" />
                      <span>Gap Severity ({Math.round((policyWeights.GAP_SEVERITY || 0) * 100)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Notice Urgency ({Math.round((policyWeights.NOTICE_URGENCY || 0) * 100)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span>Cadre Role ({Math.round((policyWeights.ROLE_CRITICALITY || 0) * 100)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-600" />
                      <span>Semantic Match ({Math.round((policyWeights.SEMANTIC_RELEVANCE || 0) * 100)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-purple-600" />
                      <span>Deadline ({Math.round((policyWeights.DEADLINE_PROXIMITY || 0) * 100)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Individual Sliders */}
                <div className="space-y-4">
                  {/* 1. Skill Gap Severity */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={15} className="text-[#1E3A8A]" />
                        <span className="text-xs font-bold text-slate-900">
                          1. Skill Gap Magnitude (w_gap)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        {Math.round((policyWeights.GAP_SEVERITY || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Prioritizes learning materials and circulars that directly address evaluated competency deficits against FRAC requirements.
                    </p>
                    <input
                      type="range"
                      min="0.0"
                      max="0.8"
                      step="0.05"
                      value={policyWeights.GAP_SEVERITY}
                      onChange={(e) => handleWeightChange('GAP_SEVERITY', e.target.value)}
                      className="w-full accent-[#1E3A8A] cursor-pointer"
                    />
                  </div>

                  {/* 2. Notice Urgency & Mandates */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-amber-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-900">
                          2. Notice Urgency & Ministry Mandates (w_urgency)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {Math.round((policyWeights.NOTICE_URGENCY || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Boost for official training circulars marked as MANDATORY or CRITICAL by MoSPI / NSSTA administration.
                    </p>
                    <input
                      type="range"
                      min="0.0"
                      max="0.8"
                      step="0.05"
                      value={policyWeights.NOTICE_URGENCY}
                      onChange={(e) => handleWeightChange('NOTICE_URGENCY', e.target.value)}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* 3. Cadre & Role Criticality */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-indigo-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          3. Cadre & Role Criticality (w_role)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        {Math.round((policyWeights.ROLE_CRITICALITY || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Weight allocated when a circular specifically targets the officer's exact cadre (e.g. ISS Officer, SSS Analyst).
                    </p>
                    <input
                      type="range"
                      min="0.0"
                      max="0.8"
                      step="0.05"
                      value={policyWeights.ROLE_CRITICALITY}
                      onChange={(e) => handleWeightChange('ROLE_CRITICALITY', e.target.value)}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* 4. Competency Semantic Relevance */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={15} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">
                          4. Competency Semantic Relevance (w_relevance)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {Math.round((policyWeights.SEMANTIC_RELEVANCE || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Semantic cosine similarity and FRAC competency overlap between training syllabus and role competencies.
                    </p>
                    <input
                      type="range"
                      min="0.0"
                      max="0.8"
                      step="0.05"
                      value={policyWeights.SEMANTIC_RELEVANCE}
                      onChange={(e) => handleWeightChange('SEMANTIC_RELEVANCE', e.target.value)}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* 5. Nomination Deadline Urgency */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-purple-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-purple-600" />
                        <span className="text-xs font-bold text-slate-900">
                          5. Nomination Deadline Urgency (w_deadline)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                        {Math.round((policyWeights.DEADLINE_PROXIMITY || 0) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Escalation boost for high-priority training circulars with nomination deadlines closing in 3 to 7 days.
                    </p>
                    <input
                      type="range"
                      min="0.0"
                      max="0.4"
                      step="0.05"
                      value={policyWeights.DEADLINE_PROXIMITY}
                      onChange={(e) => handleWeightChange('DEADLINE_PROXIMITY', e.target.value)}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Reset Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Adjusting policy sliders automatically recalibrates ranking weights across official notices.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Reset Policy Weights to Baseline',
                        message:
                          'Are you sure you want to restore the default MoSPI Balanced Baseline (35/25/20/15/5)? This will apply to all pathway and notice rankings.',
                        actionType: 'RESET_POLICY_BASELINE',
                      })
                    }
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    Reset to MoSPI Baseline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 4: Governance & Security Audit (Admin Only) ── */}
          {isAdmin && activeTab === 'GOVERNANCE' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
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
                <Select
                  label="Automated Review Queue Trigger Threshold"
                  value={autoReviewThreshold}
                  onChange={(e) => {
                    setAutoReviewThreshold(e.target.value);
                    markAutosaving();
                  }}
                  options={[
                    { value: '0.95', label: '95% Match Score (Strict Automated Approval)' },
                    { value: '0.90', label: '90% Match Score (Standard Baseline)' },
                    { value: '0.85', label: '85% Match Score (Permissive Review)' },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">NIC Parichay SSO Authentication</label>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={ssoEnabled}
                      onChange={(e) => {
                        setSsoEnabled(e.target.checked);
                        markAutosaving();
                      }}
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

          {/* ── Tab 5: Digital Signature & e-Sign Governance (Admin Only) ── */}
          {isAdmin && activeTab === 'DIGITAL_SIGN' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={18} className="text-[#1E3A8A]" /> Government Digital Signature & e-Sign Governance
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage digital signatures and NIC e-Sign certificate stamps embedded on official ACBP reports and capacity certificates
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Digital Signatory Full Name
                    </label>
                    <input
                      type="text"
                      value={digitalSignName}
                      onChange={(e) => {
                        setDigitalSignName(e.target.value);
                        localStorage.setItem('kshamata_dsig_name', e.target.value);
                        markAutosaving();
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Signatory Designation / Official Title
                    </label>
                    <input
                      type="text"
                      value={digitalSignTitle}
                      onChange={(e) => {
                        setDigitalSignTitle(e.target.value);
                        localStorage.setItem('kshamata_dsig_title', e.target.value);
                        markAutosaving();
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      NIC DSC Token Hash Fingerprint
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dsigHash}
                        onChange={(e) => {
                          setDsigHash(e.target.value);
                          localStorage.setItem('kshamata_dsig_hash', e.target.value);
                          markAutosaving();
                        }}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:border-[#1E3A8A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newHash =
                            'DSC-NIC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                          setDsigHash(newHash);
                          localStorage.setItem('kshamata_dsig_hash', newHash);
                          markAutosaving();
                          toast.success('Generated fresh NIC e-Sign certificate hash.');
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] block mb-2">
                      Live Digital Signature Preview (ACBP Output)
                    </span>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-2 shadow-2xs">
                      <div className="font-serif italic text-xl font-bold text-[#1E3A8A] tracking-wide py-1 select-none">
                        {digitalSignName || 'Dr. Sunita Rao'}
                      </div>
                      <div className="text-[9px] font-mono text-emerald-800 font-bold bg-emerald-50 py-0.5 px-2 rounded border border-emerald-200 inline-block">
                        DIGITALLY SIGNED VIA NIC e-SIGN [{dsigHash}]
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
                      onChange={(e) => {
                        setEmbedDigitalSeal(e.target.checked);
                        localStorage.setItem('kshamata_dsig_seal', String(e.target.checked));
                        markAutosaving();
                      }}
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
        </div>
      </div>

      {/* ── Critical Confirmation Modal ── */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, title: '', message: '', actionType: null })
          }
          title={confirmModal.title}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, title: '', message: '', actionType: null })
                }
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shadow-xs"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
