import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth({ user: response.data.user, accessToken: response.data.accessToken });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sign in failed. Check your credentials and try again.');
    } finally { setBusy(false); }
  };
  return <div className="oes-page oes-login-page"><header className="oes-topbar"><Link to="/" className="oes-brand"><span className="oes-mark">O</span><span>Online Examination System<small>Academic assessment portal</small></span></Link></header><main className="oes-login-card"><Link to="/" className="oes-back"><ArrowLeft size={16}/> Back to home</Link><div className="oes-login-icon"><LockKeyhole size={25}/></div><span className="oes-eyebrow">SECURE ACCESS</span><h1>Sign in to your workspace</h1><p>Use your assigned account credentials to access examinations and results.</p><form onSubmit={submit} className="oes-form"><label>Email address<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"/></label><button className="oes-btn oes-login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16}/></button></form><p className="oes-login-note">Accounts are provided by your administrator. Contact them if you need access.</p></main></div>;
}
