import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import KshamataLogo from '../../components/KshamataLogo';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import { validateLoginForm } from '../../utils/validators.js';

const initialForm = { email: '', password: '' };

const FEATURE_BULLETS = [
  'Role Competency Profiling',
  'Evidence-Based Skill Gaps',
  'iGOT & NSSTA Integration',
  'Intelligent MCQ Generator',
];

export default function LoginPage() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation before firing API call or transition loader
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTransitioning(true, true);
    
    try {
      const res = await api.post('/auth/login', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Logged in successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Login failed.';
      toast.error(msg);
      setTransitioning(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex min-h-screen items-center justify-center py-4 lg:py-6">
      {!isSubmitting && (
        <div
          className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-(--app-color-border)/40 backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr]"
          style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
        >
          {/* ── Left branding panel ── */}
          <section
            className="relative flex flex-col items-center justify-center overflow-hidden p-8 text-center text-white lg:p-12"
            style={{ background: 'var(--app-gradient-auth-login)' }}
          >
            <div className="noise-overlay pointer-events-none opacity-20" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-6">
                <KshamataLogo size="xl" className="bg-white/95 p-4 rounded-2xl shadow-xl backdrop-blur" />
                <div className="h-[3px] w-16 rounded-full bg-[#2563EB]" />
              </div>
              <div className="mt-6">
                <p className="mx-auto max-w-sm text-sm font-semibold leading-relaxed text-white">
                  Personalized iGOT Karmayogi & NSSTA learning pathways for India's Official Statistical System (MoSPI DIID).
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 px-2 text-left">
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
            <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
              <p>© 2026 Kshamata (MoSPI DIID & NSSTA)</p>
              <p>PS 26101 Portal</p>
            </div>
          </section>

          {/* ── Right form panel ── */}
          <section
            className="auth-form-slide flex flex-col justify-center p-8 lg:p-12"
            style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
          >
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-(--app-color-text)">Welcome back</h2>
                <p className="mt-1 text-sm text-(--app-color-text-muted)">Sign in to your competency dashboard</p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Official Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="official@gov.in"
                  className="h-11 rounded-xl"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-(--app-color-text)">Password</label>
                    <a href="#" className="text-xs font-medium text-(--app-color-primary) hover:underline">Forgot password?</a>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="pt-1">
                  <Button type="submit" className="h-11 w-full rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" loading={isSubmitting} disabled={isSubmitting}>
                    Sign In
                  </Button>
                </div>
                <p className="mt-8 text-center text-xs text-(--app-color-text-muted)">
                  Don't have an official account?{' '}
                  <Link to="/register" className="font-black text-(--app-color-primary) hover:text-(--app-color-primary-hover)">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
