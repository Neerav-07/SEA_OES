import PageHeader from '../../../components/PageHeader.jsx';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce & Capacity Analytics"
        subtitle="Organization-wide competency insights, training effectiveness metrics, and predictive workforce analytics."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-base font-bold text-(--app-color-text)">MoSPI & Departmental Analytics</h3>
        <p className="text-sm text-slate-500">Monitor competency distribution, identify emerging skill deficits, and evaluate capacity building progress.</p>
      </div>
    </div>
  );
}
