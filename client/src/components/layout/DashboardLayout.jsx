/**
 * DashboardLayout
 *
 * Shared shell for all authenticated dashboard pages with collapsible, sleek sidebar.
 */
import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  TrendingDown,
  GraduationCap,
  FileCheck,
  BarChart3,
  Database,
  LogOut,
  ShieldCheck,
  TrendingUp,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

import KshamataLogo from '../KshamataLogo';
import AIVirtualAssistant from '../assistant/AIVirtualAssistant.jsx';

const learnerItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Competency Profiles', path: '/dashboard/competencies', icon: Award },
  { label: 'Skill Gap Analysis', path: '/dashboard/skill-gaps', icon: TrendingDown },
  { label: 'iGOT & NSSTA Pathways', path: '/dashboard/learning-paths', icon: GraduationCap },
  { label: 'Assessment Engine', path: '/dashboard/assessments', icon: FileCheck },
];

const adminItems = [
  { label: 'Question Review Queue', path: '/dashboard/admin/review-queue', icon: ShieldCheck },
  { label: 'Predictive Analytics', path: '/dashboard/admin/predictions', icon: TrendingUp },
  { label: 'ACBP Report Export', path: '/dashboard/admin/acbp-report', icon: FileText },
  { label: 'Source Library', path: '/dashboard/sources', icon: Database },
  { label: 'Workforce Analytics', path: '/dashboard/analytics', icon: BarChart3 },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('kshamata_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('kshamata_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out.');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* ── Sidebar ── */}
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out shadow-sm z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo & Toggle Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 transition-all ${
              isCollapsed ? 'justify-center w-full cursor-pointer' : 'hover:opacity-80'
            }`}
            title="Kshamata Dashboard"
          >
            <KshamataLogo size="md" variant="full" collapsed={isCollapsed} />
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when sidebar is mini */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-slate-100/60">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {/* Section 1: Learner Journey */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Capacity Building Journey
              </div>
            ) : (
              <div className="my-2 border-t border-slate-100" />
            )}
            <div className="space-y-1">
              {learnerItems.map(({ label, path, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    title={isCollapsed ? label : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-blue-50 text-blue-700 shadow-xs font-bold ring-1 ring-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 2: Admin & Governance (Only visible to ADMIN role) */}
          {isAdmin && (
            <div>
              {!isCollapsed ? (
                <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Governance & Admin
                </div>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              <div className="space-y-1">
                {adminItems.map(({ label, path, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      title={isCollapsed ? label : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        active
                          ? 'bg-blue-50 text-blue-700 shadow-xs font-bold ring-1 ring-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                      {!isCollapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User / logout footer */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-black text-white shadow-xs">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{user?.name ?? 'User'}</p>
                  <p className="truncate text-[10px] font-medium text-slate-500">
                    {user?.platformRole || 'EMPLOYEE'} • {user?.department || 'MoSPI'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-black text-white shadow-xs cursor-pointer"
                title={`${user?.name || 'User'} (${user?.platformRole || 'EMPLOYEE'})`}
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>

      {/* ── AI Virtual Assistant Floating Widget ── */}
      <AIVirtualAssistant />
    </div>
  );
}
