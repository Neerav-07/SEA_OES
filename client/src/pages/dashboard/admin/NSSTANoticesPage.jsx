import { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/Button.jsx';
import Modal from '../../../components/Modal.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Select from '../../../components/Select.jsx';
import Spinner from '../../../components/Spinner.jsx';
import api from '../../../services/api.js';
import useAdminStore from '../../../store/adminData.store.js';

export default function NSSTANoticesPage() {
  const notices = useAdminStore((s) => s.notices);
  const syncStatus = useAdminStore((s) => s.syncStatus);
  const isNoticesLoading = useAdminStore((s) => s.isNoticesLoading);
  const isNoticesSyncing = useAdminStore((s) => s.isNoticesSyncing);
  const fetchNotices = useAdminStore((s) => s.fetchNotices);
  const syncNotices = useAdminStore((s) => s.syncNotices);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCadre, setSelectedCadre] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [activeCircularModal, setActiveCircularModal] = useState(null);

  const loading = isNoticesLoading && notices.length === 0;
  const syncing = isNoticesSyncing;

  const cadres = [
    'ALL',
    'ISS Officer',
    'SSS Analyst',
    'Statistical Officer',
    'Assistant Director (Surveys)',
    'Data Scientist',
    'Field Officer',
  ];

  const modes = ['ALL', 'Online', 'Offline', 'Hybrid'];

  useEffect(() => {
    fetchNotices(false);
  }, [fetchNotices]);

  async function handleTriggerSync() {
    try {
      await syncNotices();
      toast.success('Live notice sync complete with official MoSPI portal.');
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Failed to sync notices with MoSPI portal.');
    }
  }

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.omNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.mappedCompetencies || []).some(
        (c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCadre =
      selectedCadre === 'ALL' ||
      (notice.targetAudience || []).some((a) =>
        a.toLowerCase().includes(selectedCadre.toLowerCase())
      );

    const matchesMode =
      selectedMode === 'ALL' ||
      notice.mode?.toLowerCase() === selectedMode.toLowerCase();

    return matchesSearch && matchesCadre && matchesMode;
  });

  function getUrgencyBadge(urgency) {
    if (urgency === 'CRITICAL') {
      return (
        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
          MANDATORY • CRITICAL
        </span>
      );
    }
    if (urgency === 'HIGH') {
      return (
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
          HIGH PRIORITY
        </span>
      );
    }
    return (
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
        STANDARD
      </span>
    );
  }

  function getDaysRemaining(deadline) {
    if (!deadline) return null;
    const diffTime = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Nomination Closed';
    if (days === 0) return 'Closes Today';
    return `${days} Days Left`;
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="NSSTA Circular Intelligence"
        subtitle="Automated ingestion of official MoSPI training circulars with semantic competency extraction."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold cursor-pointer"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from MoSPI'}
          </Button>
        }
      />

      {/* ── Status Overview Strip ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-950 via-[#1E3A8A] to-[#1D4ED8]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/NSSTA-official-logo.png"
              alt="NSSTA Official Logo"
              className="h-12 w-auto object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Official MoSPI / NSSTA Live Feed</h4>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {syncStatus ? (
                  <>
                    Last Sync:{' '}
                    {new Date(syncStatus.completedAt || syncStatus.startedAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    • {syncStatus.noticesFound} circulars indexed
                  </>
                ) : (
                  'Automated crawler with SHA-256 deduplication and fallback resilience.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Indexed</span>
              <span className="text-base font-bold text-slate-900">{notices.length} Circulars</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">High Priority</span>
              <span className="text-base font-bold text-rose-600">
                {notices.filter((n) => n.urgencyLevel === 'CRITICAL' || n.isMandatory).length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search circular by OM number, title, or competency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 min-w-[150px]">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <Select
              size="sm"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              options={modes.map((m) => ({
                value: m,
                label: `Mode: ${m}`,
              }))}
            />
          </div>
        </div>

        {/* Cadre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap mr-1">
            Cadre:
          </span>
          {cadres.map((cadre) => (
            <button
              key={cadre}
              type="button"
              onClick={() => setSelectedCadre(cadre)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCadre === cadre
                  ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cadre}
            </button>
          ))}
        </div>
      </div>

      {/* ── Circulars Grid ── */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white p-8">
          <FileText size={36} className="text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">No Circulars Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or click "Sync from MoSPI".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            const daysRemainingText = getDaysRemaining(notice.nominationDeadline);
            const isClosingSoon =
              daysRemainingText === 'Closes Today' ||
              (daysRemainingText && daysRemainingText.includes('Days Left') && parseInt(daysRemainingText) <= 5);

            return (
              <div
                key={notice.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/NSSTA-official-logo.png"
                        alt="NSSTA"
                        className="h-6 w-auto object-contain shrink-0"
                      />
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                        {notice.omNumber}
                      </span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A] border border-blue-100">
                        {notice.mode || 'Online'} • {notice.durationDays || 3} Days
                      </span>
                    </div>
                    {getUrgencyBadge(notice.urgencyLevel)}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                    {notice.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {notice.description}
                  </p>

                  {/* Target Cadre */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users size={11} /> Target Cadre
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(notice.targetAudience || []).map((cadre, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200"
                        >
                          {cadre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mapped Competencies */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Award size={11} /> Mapped Competencies
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(notice.mappedCompetencies || []).map((comp, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200"
                        >
                          ✓ {comp.name || comp.code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span className={isClosingSoon ? 'text-rose-600 font-bold' : ''}>
                      {daysRemainingText || 'Open'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveCircularModal(notice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-800 shadow-xs transition-colors"
                  >
                    <FileText size={13} />
                    View Official Circular
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Official Government Circular Modal Viewer ── */}
      {activeCircularModal && (
        <Modal
          isOpen={Boolean(activeCircularModal)}
          onClose={() => setActiveCircularModal(null)}
          title={`Office Memorandum — ${activeCircularModal.omNumber}`}
          size="3xl"
        >
          <div className="space-y-4">
            {/* Formal Government Institutional Letterhead with Symmetrical Grid */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 relative overflow-hidden shadow-xs">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

              <div className="grid grid-cols-[80px_1fr_80px] sm:grid-cols-[110px_1fr_110px] items-center gap-2 sm:gap-4">
                {/* Left: NSSTA Official Academy Crest */}
                <div className="flex justify-start items-center">
                  <img
                    src="/NSSTA-official-logo.png"
                    alt="NSSTA - National Statistical Systems Training Academy"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-2xs"
                  />
                </div>

                {/* Center: National Emblem & Bilingual Government Title (Mathematically Centered) */}
                <div className="text-center space-y-1">
                  <img
                    src="/state-of-emblem.png"
                    alt="State Emblem of India"
                    className="h-8 sm:h-9 w-auto object-contain mx-auto"
                  />
                  <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-600">
                    भारत सरकार • GOVERNMENT OF INDIA
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय
                    <span className="block text-xs sm:text-sm font-bold text-slate-700">
                      Ministry of Statistics & Programme Implementation (MoSPI)
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-[#1E3A8A]">
                    National Statistical Systems Training Academy (NSSTA)
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                    Plot No. 22, Knowledge Park-II, Greater Noida, Gautam Buddha Nagar, U.P. – 201306
                  </p>
                </div>

                {/* Right: KSHAMATA Official Platform Emblem */}
                <div className="flex justify-end items-center">
                  <img
                    src="/kshamata-logo.png"
                    alt="KSHAMATA Competency Platform"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Official Office Memorandum Heading */}
            <div className="text-center py-1">
              <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase block mb-0.5">
                कार्यालय ज्ञापन
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase">
                OFFICE MEMORANDUM
              </h2>
            </div>

            {/* Single Clean Official Reference Bar (No Duplicate Boxes) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">OM Number</span>
                <span className="font-mono font-bold text-slate-900">{activeCircularModal.omNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training Mode</span>
                <span className="font-bold text-slate-900">
                  {activeCircularModal.mode} ({activeCircularModal.durationDays} Days)
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomination Deadline</span>
                <span className="font-bold text-rose-600">
                  {activeCircularModal.nominationDeadline
                    ? new Date(activeCircularModal.nominationDeadline).toLocaleDateString([], {
                        dateStyle: 'medium',
                      })
                    : 'Open'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issuing Authority</span>
                <span className="font-bold text-emerald-800">NSSTA / TPAC Wing</span>
              </div>
            </div>

            {/* Subject & Formal Memorandum Text */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                SUBJECT / विषय:
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-950">
                {activeCircularModal.title}
              </h4>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white border border-slate-200 rounded-xl p-4 shadow-2xs whitespace-pre-line font-medium">
                {activeCircularModal.description}
              </div>
            </div>

            {/* Target Cadres & FRAC Competencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users size={12} className="text-[#1E3A8A]" /> Target Cadre Eligibility
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeCircularModal.targetAudience || []).map((cadre, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1E3A8A] border border-blue-100"
                    >
                      {cadre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Award size={12} className="text-emerald-700" /> Mapped FRAC Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeCircularModal.mappedCompetencies || []).map((comp, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200"
                    >
                      ✓ {comp.name || comp.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Official Footer (No Crawler Noise) */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-600">
                <span className="font-bold text-slate-900 block">Training Programme Advisory Committee (TPAC)</span>
                <span className="text-[11px] text-slate-500">National Statistical Systems Training Academy (NSSTA), MoSPI</span>
              </div>

              <a
                href={activeCircularModal.sourceUrl || 'https://www.mospi.gov.in/announcements'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shadow-xs shrink-0"
              >
                <Globe size={13} />
                Open Official Portal Notice
                <ExternalLink size={12} className="opacity-80" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
