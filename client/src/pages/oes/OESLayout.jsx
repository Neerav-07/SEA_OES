import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, FileQuestion, GraduationCap, LayoutDashboard, LogOut, BarChart3, CircleHelp } from 'lucide-react';
import useAuthStore from '../../store/auth.store.js';
import api from '../../services/api.js';

export default function OESLayout() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const examiner = user?.platformRole === 'ADMIN';
  const links = examiner ? [
    ['Overview', '/dashboard', LayoutDashboard],
    ['Question bank', '/dashboard/questions', FileQuestion],
    ['Examinations', '/dashboard/exams', ClipboardList],
    ['Results & oversight', '/dashboard/results', BarChart3],
    ['Help', '/dashboard/help', CircleHelp],
  ] : [
    ['My examinations', '/dashboard', GraduationCap],
    ['My results', '/dashboard/results', BarChart3],
    ['Help', '/dashboard/help', CircleHelp],
  ];
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* local sign-out still proceeds */ }
    clearAuth(); navigate('/login');
  };
  return <div className="oes-shell">
    <aside className="oes-sidebar">
      <Link to="/dashboard" className="oes-brand"><span className="oes-mark">O</span><span>Examination System<small>{examiner ? 'Examiner workspace' : 'Student workspace'}</small></span></Link>
      <nav aria-label="Main navigation">{links.map(([label, path, Icon]) => <NavLink end={path === '/dashboard'} key={path} to={path} className={({isActive}) => `oes-nav ${isActive ? 'active' : ''}`}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="oes-sidebar-bottom"><div className="oes-identity"><strong>{user?.name || 'User'}</strong><span>{examiner ? 'Examiner / Administrator' : 'Student'}</span></div><button type="button" onClick={logout} className="oes-nav"><LogOut size={18}/>Sign out</button></div>
    </aside>
    <div className="oes-main"><div className="oes-mobile-header"><Link to="/dashboard" className="oes-brand"><span className="oes-mark">O</span>Examination System</Link></div><main><div className="oes-prototype-note">Exam workspace preview: questions, assignments, attempts, and results are stored in this browser. Use the same browser profile when testing examiner and student views.</div><Outlet/></main></div>
  </div>;
}
