import PageHeader from '../../../components/PageHeader.jsx';

export default function SkillGapsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gap Intelligence"
        subtitle="Auditable evidence-driven skill gap identification with confidence metrics and provenance tracing."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-base font-bold text-(--app-color-text)">Skill Gap Summary</h3>
        <p className="text-sm text-slate-500">Gaps calculated by evaluating evidence against designated official role requirements.</p>
      </div>
    </div>
  );
}
