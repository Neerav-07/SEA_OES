import PageHeader from '../../../components/PageHeader.jsx';

export default function LearningPathsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="iGOT Karmayogi & NSSTA Learning Pathways"
        subtitle="Personalized training recommendations mapped directly to official competency gaps."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-base font-bold text-(--app-color-text)">Recommended iGOT Courses</h3>
        <p className="text-sm text-slate-500">Integrated with iGOT Karmayogi APIs and NSSTA TPAC recommended programmes.</p>
      </div>
    </div>
  );
}
