import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Select from '../../components/Select';
import Container from '../../components/Container';
import KshamataLogo from '../../components/KshamataLogo';
import KarmayogiLogo from '../../components/common/KarmayogiLogo.jsx';
import useServerWarmup from '../../hooks/useServerWarmup';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import { validateRegisterForm } from '../../utils/validators.js';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  platformRole: 'EMPLOYEE',
  cadre: 'ISS (Indian Statistical Service)',
  designation: 'Senior Statistical Officer (SSO)',
  department: 'Data Informatics & Innovation Division (DIID)',
  experienceYears: 5,
  education: 'M.Sc. in Statistics',
  karmayogiId: '',
};

const FEATURE_BULLETS = [
  'Role Competency Profiling',
  'Evidence-Based Skill Gaps',
  'iGOT & NSSTA Integration',
  'Intelligent MCQ Generator',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [karmayogiInput, setKarmayogiInput] = useState('');
  const [isFetchingKarmayogi, setIsFetchingKarmayogi] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isWakingUp } = useServerWarmup();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Fetch or select an iGOT profile
  const handleFetchKarmayogi = async (targetId) => {
    const idToFetch = (targetId || karmayogiInput || '').trim();
    if (!idToFetch) {
      toast.error('Please enter a valid iGOT Karmayogi ID or Gov Email.');
      return;
    }

    setIsFetchingKarmayogi(true);
    try {
      const res = await api.get(`/igot/profile/${encodeURIComponent(idToFetch)}`);
      const profile = res.data?.result?.profile;

      if (!profile) {
        throw new Error('Profile record not found in iGOT repository.');
      }

      setSyncedProfile(profile);
      setKarmayogiInput(profile.karmayogiId);

      // Auto-populate form fields
      setFormData((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        cadre: profile.cadre || prev.cadre,
        designation: profile.designation || prev.designation,
        department: profile.department || prev.department,
        experienceYears: profile.experienceYears || prev.experienceYears,
        education: profile.education || prev.education,
        karmayogiId: profile.karmayogiId,
        password: prev.password || 'Test@123!',
        confirmPassword: prev.confirmPassword || 'Test@123!',
      }));

      toast.success(`Synced iGOT profile for ${profile.name}!`);
    } catch (err) {
      console.warn('iGOT fetch fallback warning:', err);
      toast.error('Unable to fetch live iGOT record. Please enter details manually.');
    } finally {
      setIsFetchingKarmayogi(false);
    }
  };

  const handleClearSync = () => {
    setSyncedProfile(null);
    setKarmayogiInput('');
    setFormData(initialForm);
    toast('Profile sync cleared. Switched to manual registration.', { icon: 'ℹ️' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        karmayogiId: syncedProfile?.karmayogiId || formData.karmayogiId || null,
        syncedCourses: syncedProfile?.completedCourses || [],
      };

      const res = await api.post('/auth/register', payload);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Account created successfully with competency baseline.');
      navigate('/dashboard');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        (error.request
          ? 'Unable to reach authentication server. Please check your network connection.'
          : 'Registration failed. Please try again.');
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex flex-col min-h-screen items-center justify-center py-4 px-4">
      {/* ── Top Back Button ── */}
      <div className="w-full max-w-7xl mb-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-white hover:border-slate-300 transition-all"
        >
          <ArrowLeft size={16} className="text-[#1E3A8A]" /> Back to Home
        </Link>
      </div>

      <div
        className="grid w-full max-w-7xl overflow-hidden rounded-2xl border border-(--app-color-border)/40 backdrop-blur-md lg:grid-cols-[1fr_1fr]"
        style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
      >
        {/* ── Left Branding Panel (Consistent with LoginPage) ── */}
        <section
          className="hidden lg:flex relative flex-col items-center justify-center overflow-hidden p-8 text-center text-white lg:p-12"
          style={{ background: 'var(--app-gradient-auth-login)' }}
        >
          <div className="noise-overlay pointer-events-none opacity-20" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex flex-col items-center gap-4">
              <KshamataLogo size="lg" boxed />
              <div className="h-[3px] w-16 rounded-full bg-[#2563EB]" />
            </div>
            <div className="mt-6">
              <p className="mx-auto max-w-md text-sm font-semibold leading-relaxed text-white">
                Personalized iGOT Karmayogi & NSSTA learning pathways for India's Official Statistical System (MoSPI DIID).
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3.5 px-2 text-left max-w-md">
              {FEATURE_BULLETS.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="whitespace-nowrap text-xs font-bold tracking-wider text-white">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-10 text-[10px] font-semibold text-white/70 tracking-wider">
            <p>© {new Date().getFullYear()} Ministry of Statistics and Programme Implementation</p>
            <p>Government of India</p>
          </div>
        </section>

        {/* ── Right Form Panel (Clean, compact, single-view) ── */}
        <section
          className="auth-form-slide flex flex-col justify-center p-6 sm:p-8 lg:p-10 w-full"
          style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
        >
          <div className="mx-auto w-full max-w-lg">
            <div className="lg:hidden flex justify-center mb-4">
              <KshamataLogo size="md" />
            </div>

            <div className="mb-3 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Register Official Account
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Create your profile or sync automatically with iGOT Karmayogi
              </p>
            </div>

            {/* ── Integrated iGOT Karmayogi Sync Row ── */}
            <div className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl bg-slate-50 border border-slate-200/90 mb-3 shadow-2xs">
              <KarmayogiLogo className="h-9 w-9 shrink-0 ml-0.5" />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={karmayogiInput}
                  onChange={(e) => setKarmayogiInput(e.target.value)}
                  placeholder="Enter iGOT Karmayogi ID or Gov Email (e.g. ISS-2021-0842)"
                  className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#1E3A8A] focus:outline-none transition-all shadow-2xs"
                  disabled={isFetchingKarmayogi}
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchKarmayogi()}
                disabled={isFetchingKarmayogi}
                className="h-8.5 px-3.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isFetchingKarmayogi ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Syncing…</span>
                  </>
                ) : (
                  <>
                    <Search size={12} />
                    <span>Sync iGOT</span>
                  </>
                )}
              </button>
              {syncedProfile && (
                <button
                  type="button"
                  onClick={handleClearSync}
                  className="h-8.5 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  title="Clear synced profile"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Synced Profile Verification Badge */}
            {syncedProfile && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-bold truncate">{syncedProfile.name}</span>
                  <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-semibold">
                    {syncedProfile.karmayogiId}
                  </span>
                  <span className="text-slate-600 text-[11px] truncate hidden sm:inline">
                    {syncedProfile.designation}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                  {syncedProfile.completedCourses?.length || 0} Synced
                </span>
              </div>
            )}

            {/* ── Form Fields: 4 rows x 2 columns ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Official Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className={`w-full h-8.5 rounded-lg border bg-white px-3 text-xs font-medium placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      errors.name ? 'border-red-500 text-red-900' : 'border-slate-200 text-slate-900 focus:border-[#1E3A8A]'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Official Work Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="official@mospi.gov.in"
                    className={`w-full h-8.5 rounded-lg border bg-white px-3 text-xs font-medium placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      errors.email ? 'border-red-500 text-red-900' : 'border-slate-200 text-slate-900 focus:border-[#1E3A8A]'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Cadre & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Statistical Cadre"
                  name="cadre"
                  value={formData.cadre}
                  onChange={handleChange}
                  size="sm"
                  options={[
                    { value: 'ISS (Indian Statistical Service)', label: 'ISS (Indian Statistical Service)' },
                    { value: 'SSS (Subordinate Statistical Service)', label: 'SSS (Subordinate Statistical Service)' },
                    { value: 'FOD Field Operations Cadre', label: 'FOD Field Operations Cadre' },
                    { value: 'NSSTA Training Cadre', label: 'NSSTA Training Cadre' },
                    { value: 'MoSPI General Statistical Cadre', label: 'MoSPI General Statistical Cadre' },
                  ]}
                />

                <Select
                  label="Official Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  size="sm"
                  options={[
                    { value: 'Senior Statistical Officer (SSO)', label: 'Senior Statistical Officer (SSO)' },
                    { value: 'Junior Statistical Officer (JSO)', label: 'Junior Statistical Officer (JSO)' },
                    { value: 'Assistant Director', label: 'Assistant Director' },
                    { value: 'Deputy Director', label: 'Deputy Director' },
                    { value: 'Director', label: 'Director' },
                  ]}
                />
              </div>

              {/* Row 3: Division & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Division / Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  size="sm"
                  options={[
                    { value: 'Data Informatics & Innovation Division (DIID)', label: 'DIID (Data Informatics & Innovation)' },
                    { value: 'National Accounts Division (NAD)', label: 'NAD (National Accounts Division)' },
                    { value: 'Price Statistics Division (PSD)', label: 'PSD (Price Statistics / CPI / WPI)' },
                    { value: 'Survey Design & Research Division (SDRD)', label: 'SDRD (Survey Design & Sampling)' },
                    { value: 'Field Operations Division (FOD)', label: 'FOD (Field Operations Division)' },
                    { value: 'Economic Statistics Division (ESD)', label: 'ESD (Economic Statistics Division)' },
                  ]}
                />

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 4: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full h-8.5 rounded-lg border bg-white px-3 text-xs font-medium placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      errors.password ? 'border-red-500 text-red-900' : 'border-slate-200 text-slate-900 focus:border-[#1E3A8A]'
                    }`}
                  />
                  {errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full h-8.5 rounded-lg border bg-white px-3 text-xs font-medium placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      errors.confirmPassword ? 'border-red-500 text-red-900' : 'border-slate-200 text-slate-900 focus:border-[#1E3A8A]'
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-[10px] text-red-600 mt-0.5">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="h-10.5 w-full rounded-xl text-sm font-bold shadow-md transition-all bg-[#1E3A8A] text-white hover:bg-[#172554] cursor-pointer flex items-center justify-center gap-2"
                  loading={isSubmitting || isWakingUp}
                  disabled={isSubmitting || isWakingUp}
                >
                  {isWakingUp
                    ? 'Starting production servers...'
                    : isSubmitting
                    ? 'Creating official account...'
                    : syncedProfile
                    ? 'Complete Registration with Synced Competencies'
                    : 'Create Official Account'}
                </Button>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-xs text-slate-500 pt-1">
                Already have an official account?{' '}
                <Link to="/login" className="font-bold text-[#1E3A8A] hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </Container>
  );
}
