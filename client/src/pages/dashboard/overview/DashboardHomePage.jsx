import { useState } from 'react';
import useAuthStore from '../../../store/auth.store.js';
import StatCard from '../../../components/StatCard.jsx';
import PageHeader from '../../../components/PageHeader.jsx';

const MOCK_STATS = [
  { label: 'Assessed Competencies', value: '14 / 18', change: '84% Conf', trend: 'up' },
  { label: 'Average Competency Level', value: '3.2 / 5', change: '+0.4 Lvl', trend: 'up' },
  { label: 'Identified Skill Gaps', value: '4 Priority', change: '-2 Closed', trend: 'down' },
  { label: 'iGOT Courses Enrolled', value: '3 Active', change: '2 Completed', trend: 'neutral' },
];

const MOCK_ACTIVITY = [
  { id: 1, label: 'Diagnostic Assessment completed: Survey Sampling & Bias Evaluation', time: '10 mins ago', status: 'done' },
  { id: 2, label: 'iGOT Pathway recommended: National Accounts & Price Statistics (TPAC Approved)', time: '1 hr ago', status: 'active' },
  { id: 3, label: 'Assessment Generated: Python for Statistical Analysis (15 Grounded MCQs)', time: '3 hrs ago', status: 'pending' },
  { id: 4, label: 'Competency Level Updated: Data Quality & Metadata Standards (L2.8 → L3.4)', time: 'Yesterday', status: 'done' },
];

const STATUS_STYLES = {
  active:  'bg-emerald-100 text-emerald-800 font-bold',
  pending: 'bg-amber-100 text-amber-800 font-bold',
  done:    'bg-indigo-100 text-indigo-800 font-bold',
};

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [stats] = useState(MOCK_STATS);
  const [activity] = useState(MOCK_ACTIVITY);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'Official'}`}
        subtitle="Kshamata — AI-Enabled Competency Intelligence & Capacity Overview (MoSPI DIID & NSSTA)."
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} change={s.change} trend={s.trend} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-(--app-color-text)">Recent Competency & Learning Activity</h3>
        <ul className="divide-y divide-(--app-color-border)">
          {activity.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-(--app-color-text)">{item.label}</p>
                <p className="text-xs text-(--app-color-text-muted)">{item.time}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${STATUS_STYLES[item.status] || STATUS_STYLES.done}`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
