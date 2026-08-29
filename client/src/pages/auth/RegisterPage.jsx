import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import KshamataLogo from '../../components/KshamataLogo';
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

const ONBOARDING_STEPS = [
  'Sync verified profile & course certifications from iGOT Karmayogi.',
  'Auto-generate your baseline competency matrix and skill gaps.',
  'Explore personalized iGOT & NSSTA recommended training pathways.',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [karmayogiInput, setKarmayogiInput] = useState('');
  const [isFetchingKarmayogi, setIsFetchingKarmayogi] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

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
      toast.error('Please enter or select a valid iGOT Karmayogi ID.');
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
      toast.error('Unable to fetch live iGOT record. Please try again or enter details manually.');
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
    <Container className="flex flex-col min-h-screen items-center justify-center py-6 px-4">
      {/* ── Top Back Button ── */}
      <div className="w-full max-w-7xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-white hover:border-slate-300 transition-all"
        >
          <ArrowLeft size={16} className="text-[#1E3A8A]" /> Back to Home
        </Link>
      </div>

      <div
        className="grid w-full max-w-7xl overflow-hidden rounded-[2.5rem] border border-(--app-color-border)/40 backdrop-blur-md lg:grid-cols-[0.88fr_1.12fr]"
        style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
      >
        {/* ── Left branding panel (hidden on mobile, visible on lg screens) ── */}
        <section
          className="hidden lg:flex relative flex-col items-center justify-center overflow-hidden p-8 text-center text-white lg:p-14"
          style={{ background: 'var(--app-gradient-auth-login)' }}
        >
          <div className="noise-overlay pointer-events-none opacity-20" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex flex-col items-center gap-6">
              <KshamataLogo size="xl" className="bg-white/95 p-4 rounded-2xl shadow-xl backdrop-blur" />
              <div className="h-[3px] w-16 rounded-full bg-[#2563EB]" />
            </div>
            <div className="mt-6">
              <p className="mx-auto max-w-md text-sm font-semibold leading-relaxed text-white">
                MoSPI Capacity Building & Competency Intelligence Platform (DIID & NSSTA).
              </p>
            </div>

            <div className="mt-8 space-y-4 px-4 text-left max-w-md">
              {ONBOARDING_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-xs font-black">
                    {i + 1}
                  </div>
                  <p className="text-xs font-semibold text-white/95 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
            <p>© 2026 Kshamata (MoSPI DIID & NSSTA)</p>
            <p>Official Statistics Portal</p>
          </div>
        </section>

        {/* ── Right form panel (full width on mobile) ── */}
        <section
          className="auth-form-slide flex flex-col justify-center p-6 sm:p-8 lg:p-10 w-full"
          style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
        >
          <div className="mx-auto w-full max-w-xl">
            <div className="lg:hidden flex justify-center mb-6">
              <KshamataLogo size="md" className="bg-white p-3 rounded-xl shadow-md border border-slate-200" />
            </div>

            <div className="mb-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold mb-2">
                <ShieldCheck size={13} className="text-[#1E3A8A]" /> Official Civil Servant Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--app-color-text)">
                Register Official Account
              </h2>
              <p className="mt-1 text-xs text-(--app-color-text-muted)">
                Sync with iGOT Karmayogi for automated competency mapping or enter service details manually.
              </p>
            </div>

            {/* ── iGOT Karmayogi Profile Sync Box (Enterprise Style) ── */}
            <div className="mb-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E3A8A] text-white shadow-xs font-bold text-[11px] tracking-tight">
                    iGOT
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      iGOT Karmayogi Profile Sync
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Import verified training history and baseline competency records.
                    </p>
                  </div>
                </div>

                {syncedProfile && (
                  <button
                    type="button"
                    onClick={handleClearSync}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                  >
                    <X size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Karmayogi ID / Gov Email Input */}
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={karmayogiInput}
                    onChange={(e) => setKarmayogiInput(e.target.value)}
                    placeholder="Enter Karmayogi ID or Gov Email (e.g. ISS-2021-0842 or official@mospi.gov.in)"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#1E3A8A] focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchKarmayogi()}
                  disabled={isFetchingKarmayogi}
                  className="h-10 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isFetchingKarmayogi ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Search size={13} />
                  )}
                  <span>Sync Profile</span>
                </button>
              </div>

              {/* Verified Profile Preview Card */}
              {syncedProfile && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{syncedProfile.name}</span>
                          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {syncedProfile.karmayogiId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {syncedProfile.designation} • {syncedProfile.department}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCourseDetails(!showCourseDetails)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] hover:text-[#172554] cursor-pointer"
                    >
                      <span>{syncedProfile.completedCourses?.length || 0} Certifications</span>
                      {showCourseDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {showCourseDetails && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Verified Course Certifications & Mapped Evidence:
                      </p>
                      <div className="space-y-1.5">
                        {syncedProfile.completedCourses?.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70"
                          >
                            <div className="flex items-start gap-1.5">
                              <Award size={13} className="text-[#1E3A8A] mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-[11px] text-slate-900 leading-tight">
                                  {c.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {c.organisation} • Ref: {c.certificateId}
                                </div>
                              </div>
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Main Registration Form ── */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="h-10.5 rounded-xl text-sm"
                />
                <Input
                  label="Official Work Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="official@mospi.gov.in"
                  className="h-10.5 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  className="h-10.5 rounded-xl text-sm"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  className="h-10.5 rounded-xl text-sm"
                />
              </div>

              {/* Cadre & Designation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Statistical Cadre</label>
                  <select
                    name="cadre"
                    value={formData.cadre}
                    onChange={handleChange}
                    className="w-full h-10.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="ISS (Indian Statistical Service)">ISS (Indian Statistical Service)</option>
                    <option value="SSS (Subordinate Statistical Service)">SSS (Subordinate Statistical Service)</option>
                    <option value="FOD Field Operations Cadre">FOD Field Operations Cadre</option>
                    <option value="NSSTA Training Cadre">NSSTA Training Cadre</option>
                    <option value="MoSPI General Statistical Cadre">MoSPI General Statistical Cadre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full h-10.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="Senior Statistical Officer (SSO)">Senior Statistical Officer (SSO)</option>
                    <option value="Junior Statistical Officer (JSO)">Junior Statistical Officer (JSO)</option>
                    <option value="Assistant Director">Assistant Director</option>
                    <option value="Deputy Director">Deputy Director</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
              </div>

              {/* Division / Department & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Division / Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-10.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="Data Informatics & Innovation Division (DIID)">DIID (Data Informatics & Innovation)</option>
                    <option value="National Accounts Division (NAD)">NAD (National Accounts Division)</option>
                    <option value="Price Statistics Division (PSD)">PSD (Price Statistics / CPI / WPI)</option>
                    <option value="Survey Design & Research Division (SDRD)">SDRD (Survey Design & Sampling)</option>
                    <option value="Field Operations Division (FOD)">FOD (Field Operations Division)</option>
                    <option value="Economic Statistics Division (ESD)">ESD (Economic Statistics Division)</option>
                  </select>
                </div>

                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="45"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="h-10.5 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="h-11 w-full rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.005] active:scale-[0.99] bg-[#1E3A8A] text-white hover:bg-[#172554] cursor-pointer flex items-center justify-center gap-2"
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

              <p className="mt-4 text-center text-xs text-(--app-color-text-muted)">
                Already have an account?{' '}
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
