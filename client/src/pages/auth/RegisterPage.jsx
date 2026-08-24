import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import KshamataLogo from '../../components/KshamataLogo';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import { validateRegisterForm } from '../../utils/validators.js';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

const ONBOARDING_STEPS = [
  'Set up official profile, department, and designation.',
  'Complete initial competency diagnostic assessment.',
  'Receive personalized iGOT & NSSTA recommended training pathways.',
];

export default function RegisterPage() {
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
      const res = await api.post('/auth/register', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Account created successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex flex-col min-h-screen items-center justify-center py-6">
      {/* ── Top Back Button ── */}
      <div className="w-full max-w-6xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-white hover:border-slate-300 transition-all"
        >
          <ArrowLeft size={16} className="text-[#1E3A8A]" /> Back to Home
        </Link>
      </div>

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
                  Register to establish your statistical competency baseline and personalized learning path (MoSPI DIID & NSSTA).
                </p>
              </div>
              <div className="mt-8 space-y-4 px-4 text-left">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-xs font-semibold text-white">{step}</p>
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
            className="auth-form-slide flex flex-col justify-center p-8 lg:p-10"
            style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
          >
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-(--app-color-text)">Register Official Account</h2>
                <p className="mt-0.5 text-xs text-(--app-color-text-muted)">Enter your details for competency tracking</p>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Official Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="h-10 rounded-xl text-sm"
                />
                <Input
                  label="Official Work Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="official@gov.in"
                  className="h-10 rounded-xl text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    className="h-10 rounded-xl text-sm"
                  />
                  <Input
                    label="Confirm"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="pt-1">
                  <Button type="submit" variant="primary" className="h-10 w-full rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] bg-[#1E3A8A] text-white hover:bg-[#172554]" loading={isSubmitting} disabled={isSubmitting}>
                    Create Account
                  </Button>
                </div>
                <p className="mt-6 text-center text-[11px] text-(--app-color-text-muted)">
                  Already have an account?{' '}
                  <Link to="/login" className="font-black text-[#1E3A8A] hover:underline">Sign in</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
    </Container>
  );
}
