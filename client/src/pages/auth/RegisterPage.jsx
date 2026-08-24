/**
 * RegisterPage
 *
 * TODO items:
 *  - Replace ALL text marked TODO
 *  - The "name" field maps to users.name in DB — rename label to match your entity
 *    (e.g. "Organization Name", "Team Name", "Full Name")
 *  - Update onboarding steps to describe your real flow
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import KshamataLogo from '../../components/KshamataLogo';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

const ONBOARDING_STEPS = [
  'Set up official profile, department, and designation.',
  'Complete initial competency diagnostic assessment.',
  'Receive personalized iGOT & NSSTA recommended training pathways.',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setTransitioning(true, true);
    try {
      const res = await api.post('/auth/register', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Account created successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Registration failed.';
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
                <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-slate-200/90">
                  Register to establish your statistical competency baseline and personalized learning path (MoSPI DIID & NSSTA).
                </p>
              </div>
              <div className="mt-8 space-y-4 px-4 text-left">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/25 text-blue-300 text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-xs font-medium text-slate-100">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300/40">
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
              <form className="space-y-3" onSubmit={handleSubmit}>
                <Input label="Official Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Dr. Rajesh Kumar" className="h-10 rounded-xl text-sm" />
                <Input label="Official Work Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="rajesh.kumar@gov.in" className="h-10 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-10 rounded-xl text-sm" />
                  <Input label="Confirm" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className="h-10 rounded-xl text-sm" />
                </div>
                <div className="pt-1">
                  {/* TODO: Replace button label */}
                  <Button type="submit" className="h-10 w-full rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" loading={isSubmitting} disabled={isSubmitting}>
                    Create Account
                  </Button>
                </div>
                <p className="mt-6 text-center text-[11px] text-(--app-color-text-muted)">
                  Already have an account?{' '}
                  <Link to="/login" className="font-black text-(--app-color-primary) hover:text-(--app-color-primary-hover)">Sign in</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
