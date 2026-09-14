import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock3,
  Building2,
  ShieldCheck,
  ArrowRight,
  Star,
  BookOpenText,
  Filter,
  X,
  ExternalLink,
  CheckCircle2,
  Layers,
  RotateCcw,
} from 'lucide-react';
import api from '../../../services/api.js';
import PageHeader from '../../../components/PageHeader.jsx';
import Select from '../../../components/Select.jsx';
import KarmayogiLogo from '../../../components/common/KarmayogiLogo.jsx';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Title A–Z', value: 'title' },
  { label: 'Duration (High to Low)', value: 'duration' },
  { label: 'Provider', value: 'provider' },
];

export default function IGOTExplorePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedOrg, setSelectedOrg] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async (nextQuery = query) => {
    setLoading(true);
    try {
      const res = await api.get('/igot/courses', {
        params: {
          query: nextQuery,
          limit: 36,
          offset: 0,
        },
      });

      const nextCourses = res.data?.result?.content || [];
      setCourses(nextCourses);
    } catch (error) {
      console.error('Failed to fetch iGOT catalog', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const uniqueAreas = useMemo(
    () => ['All', ...new Set(courses.map((course) => course.competencyArea).filter(Boolean))],
    [courses],
  );

  const uniqueOrgs = useMemo(
    () => ['All', ...new Set(courses.map((course) => course.organisation).filter(Boolean))],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...courses]
      .filter((course) => {
        const matchesQuery =
          !normalizedQuery ||
          course.name?.toLowerCase().includes(normalizedQuery) ||
          course.description?.toLowerCase().includes(normalizedQuery) ||
          course.tags?.some((tag) => String(tag).toLowerCase().includes(normalizedQuery));

        const matchesArea =
          selectedArea === 'All' || course.competencyArea === selectedArea;
        const matchesOrg =
          selectedOrg === 'All' || course.organisation === selectedOrg;

        return matchesQuery && matchesArea && matchesOrg;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return (a.name || '').localeCompare(b.name || '');
          case 'duration':
            return Number(b.durationSeconds || 0) - Number(a.durationSeconds || 0);
          case 'provider':
            return (a.organisation || '').localeCompare(b.organisation || '');
          default:
            return 0;
        }
      });
  }, [courses, query, selectedArea, selectedOrg, sortBy]);

  const handleSearch = () => fetchCourses(query);

  const handleReset = () => {
    setQuery('');
    setSelectedArea('All');
    setSelectedOrg('All');
    setSortBy('relevance');
    fetchCourses('');
  };

  const isFiltered = query.trim() !== '' || selectedArea !== 'All' || selectedOrg !== 'All' || sortBy !== 'relevance';

  // Helper for competency badge styling
  const getCompetencyBadgeStyle = (area) => {
    const lower = (area || '').toLowerCase();
    if (lower.includes('domain')) {
      return 'bg-blue-50 text-[#1E3A8A] border-blue-200/80';
    }
    if (lower.includes('functional')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    }
    if (lower.includes('behavioural')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Explore iGOT Catalogue"
        subtitle="Browse real, government-aligned learning content from the Karmayogi catalog with competency filters and structured course details."
      />

      {/* ── Unified Top Control Panel (Clean 2-Row Architecture) ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm relative overflow-hidden">
        {/* Dark Black-Blue Gradient Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-950 via-[#1E3A8A] to-[#1D4ED8]" />

        <div className="space-y-4">
          {/* ── ROW 1: Search Bar + Search Button (Side by Side for optimal UX) ── */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
                placeholder="Search courses, skills, competencies, or official keywords..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    fetchCourses('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Prominent Search Button directly beside search bar */}
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-blue-900 hover:to-slate-900 active:scale-95 cursor-pointer"
            >
              <Search className="h-4 w-4 text-blue-200" />
              <span>Search</span>
            </button>
          </div>

          {/* ── ROW 2: All Filters, Reset Button & Fast Category Chips (Strict Single Row) ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
            {/* Left: Filter Dropdowns + Reset Button strictly inline */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#1E3A8A]" />
                <span>Filters:</span>
              </div>

              {/* Competency Area Dropdown */}
              <div className="min-w-[140px] shrink-0">
                <Select
                  size="sm"
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  options={uniqueAreas.map((area) => ({
                    value: area,
                    label: area === 'All' ? 'Area: All' : area,
                  }))}
                />
              </div>

              {/* Organisation Dropdown */}
              <div className="min-w-[140px] shrink-0">
                <Select
                  size="sm"
                  value={selectedOrg}
                  onChange={(event) => setSelectedOrg(event.target.value)}
                  options={uniqueOrgs.map((org) => ({
                    value: org,
                    label: org === 'All' ? 'Org: All' : org,
                  }))}
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="min-w-[150px] shrink-0">
                <Select
                  size="sm"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  options={SORT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: `Sort: ${option.label}`,
                  }))}
                />
              </div>

              {/* Reset Button (permanently visible beside Sort By in the same row) */}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 hover:bg-slate-100 hover:border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition active:scale-95 cursor-pointer shrink-0"
                title="Reset all search queries and filters"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>

            {/* Right: Fast Category Switcher */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0">
              {uniqueAreas.slice(0, 5).map((area) => {
                const isActive = selectedArea === area;
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Course Cards Grid (Full-width 3-cards-per-row) ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-16 text-center text-sm text-slate-500 shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A8A]" />
          Loading official iGOT Karmayogi catalog...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
          <BookOpenText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-bold text-slate-800">No matching courses found</p>
          <p className="mt-1 text-sm text-slate-500">
            No iGOT courses matched your search criteria. Try a different keyword or reset filters.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-blue-900 hover:to-slate-900 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <article
              key={course.identifier || course.igotIdentifier || course.id || course.name}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Card Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-950 via-[#1E3A8A] to-[#1D4ED8] opacity-70 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Top Badge & Category Row */}
                <div className="mb-3.5 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-2 text-white shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${getCompetencyBadgeStyle(
                        course.competencyArea,
                      )}`}
                    >
                      {course.competencyArea || 'Domain'}
                    </span>
                  </div>
                </div>

                {/* Course Title & Organization */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {course.organisation || 'Government of India'}
                  </p>
                  <h3 className="mt-1 text-base font-extrabold leading-snug text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                    {course.name}
                  </h3>
                </div>

                {/* Course Description */}
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {course.description ||
                    'Standardized capacity-building curriculum curated for public statistical administration under Mission Karmayogi.'}
                </p>

                {/* Metadata Row (Duration, Level, Rating) */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <Clock3 className="h-3 w-3 text-slate-500" />
                    {Math.max(1, Math.round((Number(course.durationSeconds) || 3600) / 3600))}h
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    <ShieldCheck className="h-3 w-3 text-slate-500" />
                    {course.level || 'Beginner'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 border border-amber-200/60">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    {course.rating || '4.8'}
                  </span>
                </div>

                {/* Topic / Competency Tags */}
                {Array.isArray(course.tags) && course.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer with Details Action */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <KarmayogiLogo className="h-4 w-4 shrink-0" />
                  iGOT Karmayogi
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-900 hover:to-slate-900 active:scale-95 cursor-pointer"
                >
                  View details
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Interactive Course Details Modal ── */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header: Dark Black-Blue Gradient */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 relative shrink-0">
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute right-5 top-5 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <KarmayogiLogo className="h-5 w-5 shrink-0" />
                <span className="rounded-md bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-200 border border-blue-400/30">
                  {selectedCourse.competencyArea || 'Domain'}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {selectedCourse.organisation || 'Government of India'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white leading-snug pr-8">
                {selectedCourse.name}
              </h2>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Clock3 className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    {Math.max(1, Math.round((Number(selectedCourse.durationSeconds) || 3600) / 3600))} Hours
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Level</span>
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    {selectedCourse.level || 'Beginner'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</span>
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    {selectedCourse.rating || '4.8'} / 5.0
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider</span>
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    {selectedCourse.organisation || 'MoSPI'}
                  </span>
                </div>
              </div>

              {/* Course Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Course Overview</h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selectedCourse.description ||
                    'Comprehensive curriculum curated for civil servants and statistical cadre officers under Mission Karmayogi National Programme for Civil Services Capacity Building (NPCSCB).'}
                </p>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Competency Outcomes</h4>
                <div className="space-y-2">
                  {(Array.isArray(selectedCourse.learningOutcomes) && selectedCourse.learningOutcomes.length > 0
                    ? selectedCourse.learningOutcomes
                    : [
                        'Understand baseline statistical concepts and regulatory standards under MoSPI framework.',
                        'Apply analytical tools and standard operating procedures for survey microdata processing.',
                        'Demonstrate quality assurance and data governance standards compliant with NQAF.',
                      ]
                  ).map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags & Skills Covered */}
              {Array.isArray(selectedCourse.tags) && selectedCourse.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Skills & Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCourse.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-blue-50 border border-blue-200/70 px-2.5 py-1 text-xs font-semibold text-[#1E3A8A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <a
                href="https://igotkarmayogi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-900 hover:to-slate-900 cursor-pointer"
              >
                Start on iGOT Karmayogi
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
