import PageHeader from '../../../components/PageHeader.jsx';

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligent Assessment Engine"
        subtitle="Automated MCQ and quiz generator grounded in uploaded official learning materials and documents."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-base font-bold text-(--app-color-text)">Assessment Generation Studio</h3>
        <p className="text-sm text-slate-500">Generate grounded MCQs, Bloom's Taxonomy-aligned scenarios, and diagnostic quizzes.</p>
      </div>
    </div>
  );
}
