import PageHeader from '../../../components/PageHeader.jsx';

const SAMPLE_COMPETENCIES = [
  { id: 'C01', domain: 'Statistical Competencies', name: 'Survey Design & Sampling Methods', level: 'L3.8', req: 'L4.0', status: 'Near Requirement' },
  { id: 'C02', domain: 'Statistical Competencies', name: 'National Accounts Statistics', level: 'L2.4', req: 'L4.0', status: 'Skill Gap' },
  { id: 'C03', domain: 'Technical Competencies', name: 'Python & R Data Analysis', level: 'L3.2', req: 'L3.0', status: 'Competency Achieved' },
  { id: 'C04', domain: 'Digital Governance', name: 'Data Privacy & Cyber Security', level: 'L4.1', req: 'L3.0', status: 'Competency Achieved' },
];

export default function CompetenciesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Competency Profiles"
        subtitle="Role-based competency taxonomy across Statistical, Technical, Digital Governance, and Managerial domains."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-(--app-color-text)">Assessed Official Competencies</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Competency Name</th>
                <th className="py-3 px-4">Current Level</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SAMPLE_COMPETENCIES.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                  <td className="py-3 px-4 text-slate-500">{c.domain}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 font-bold text-[#4F46E5]">{c.level}</td>
                  <td className="py-3 px-4 text-slate-600">{c.req}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-[#4F46E5]">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
