import { useEffect, useState } from 'react';

import Alert from '../../../components/Alert.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Spinner from '../../../components/Spinner.jsx';
import { listBlueprintCompetencies } from '../../../services/assessmentBlueprint.api.js';

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listBlueprintCompetencies()
      .then((response) => {
        if (!active) return;
        if (!Array.isArray(response?.items)) throw new Error('Competency lookup returned an invalid response.');
        setCompetencies(response.items);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError.message || 'Could not load competencies.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Spinner label="Loading competency catalog..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Competency Profiles"
        subtitle="Role-based competency taxonomy across Statistical, Technical, Digital Governance, and Managerial domains."
      />
      {error && <Alert type="error" title="Could not load competencies" message={error} />}
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-(--app-color-text)">Official Competency Catalog</h3>
        {competencies.length === 0 ? <EmptyState title="No competencies available" message="No competency records are currently available for this account." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Competency Name</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competencies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.code}</td>
                  <td className="py-3 px-4 text-slate-500">{c.category}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600">{c.description || 'No description provided.'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
