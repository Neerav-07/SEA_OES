import { useEffect, useState } from 'react';
import { Database, FileText, Upload } from 'lucide-react';

import Alert from '../../../components/Alert.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import EmptyState from '../../../components/EmptyState.jsx';
import Input from '../../../components/Input.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Spinner from '../../../components/Spinner.jsx';
import { createSource, getSource, ingestSource, listSources } from '../../../services/source.api.js';

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', externalId: '', documentType: 'TEXT' });
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = async () => {
    const result = await listSources();
    setSources(Array.isArray(result?.items) ? result.items : []);
  };

  useEffect(() => {
    refresh().catch((requestError) => setError(requestError?.response?.data?.message || requestError.message || 'Could not load sources.')).finally(() => setLoading(false));
  }, []);

  const selectSource = async (sourceId) => {
    setError('');
    try { setSelected(await getSource(sourceId)); } catch (requestError) { setError(requestError?.response?.data?.message || requestError.message || 'Could not load source.'); }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setWorking(true); setError(''); setMessage('');
    try {
      const result = await createSource(form);
      setForm({ name: '', externalId: '', documentType: 'TEXT' });
      await refresh();
      await selectSource(result.source.id);
      setMessage('Source document created.');
    } catch (requestError) { setError(requestError?.response?.data?.message || requestError.message || 'Could not create source.'); }
    finally { setWorking(false); }
  };

  const handleIngest = async (event) => {
    event.preventDefault();
    if (!selected?.source?.id || !content.trim()) return;
    setWorking(true); setError(''); setMessage('');
    try {
      await ingestSource(selected.source.id, { content, maxChunkLength: 1000 });
      setContent('');
      await refresh();
      await selectSource(selected.source.id);
      setMessage('Source version ingested and chunked.');
    } catch (requestError) { setError(requestError?.response?.data?.message || requestError.message || 'Could not ingest source.'); }
    finally { setWorking(false); }
  };

  if (loading) return <Spinner label="Loading source library..." />;

  return <div className="space-y-6">
    <PageHeader title="Source Library" subtitle="Manage source documents, immutable versions, and traceable chunks for later grounding." />
    {error && <Alert type="error" title="Source action failed" message={error} />}
    {message && <Alert type="success" title="Source updated" message={message} />}
    <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
      <Card title="Sources" subtitle="Authenticated source documents">
        {sources.length === 0 ? <EmptyState icon={Database} title="No sources yet" message="Create a source document to begin the evidence pipeline." /> : <div className="space-y-2">{sources.map((source) => <button key={source.id} type="button" onClick={() => selectSource(source.id)} className={`w-full rounded-lg border p-3 text-left ${selected?.source?.id === source.id ? 'border-(--app-color-primary) bg-indigo-50' : 'border-(--app-color-border)'}`}><p className="font-semibold">{source.name}</p><p className="text-xs text-(--app-color-text-muted)">{source.documentType} · {source.externalId || 'No external ID'}</p></button>)}</div>}
      </Card>
      <div className="space-y-6">
        <Card title="Register source" subtitle="Stable source identity and metadata">
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3"><Input label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Input label="External ID" value={form.externalId} onChange={(event) => setForm({ ...form, externalId: event.target.value })} /><Input label="Type" value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value.toUpperCase() })} /><Button type="submit" loading={working}><Database className="h-4 w-4" /> Create source</Button></form>
        </Card>
        {selected && <Card title={selected.source.name} subtitle="Versions and chunk-level evidence">
          <div className="mb-4 space-y-2">{selected.versions.length === 0 ? <EmptyState icon={FileText} title="No versions" message="Ingest source content to create the first immutable version." /> : selected.versions.map((version) => <div key={version.id} className="rounded-lg border border-(--app-color-border) p-3 text-sm"><span className="font-semibold">Version {version.version}</span> · {version.status} · {version.checksum?.slice(0, 12) || 'no checksum'}</div>)}</div>
          <form onSubmit={handleIngest} className="space-y-3"><label className="block text-sm font-medium">Content to ingest<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-(--app-color-border) p-3" placeholder="Paste source text for deterministic chunking..." /></label><Button type="submit" loading={working} disabled={!content.trim()}><Upload className="h-4 w-4" /> Ingest new version</Button></form>
        </Card>}
      </div>
    </div>
  </div>;
}
