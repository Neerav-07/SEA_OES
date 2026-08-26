import { useState, useEffect } from 'react';
import { Award, Briefcase, UserCheck, Search, RefreshCw, Info, FileCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../../components/PageHeader.jsx';
import Button from '../../../components/Button.jsx';
import CompetencyTree from '../../../components/competencies/CompetencyTree.jsx';
import OfficialRoleDrawer from '../../../components/competencies/OfficialRoleDrawer.jsx';
import DiagnosticQuizModal from '../../../components/evidence/DiagnosticQuizModal.jsx';
import EvidenceProvenanceDrawer from '../../../components/evidence/EvidenceProvenanceDrawer.jsx';
import { COMPETENCY_LEVELS } from '../../../utils/constants.js';
import api from '../../../services/api.js';

import useAuthStore from '../../../store/auth.store.js';

const FALLBACK_OFFICIAL = {
  id: 'off-01',
  userName: 'Dr. Rajesh Kumar',
  userEmail: 'rajesh.kumar@mospi.gov.in',
  designation: 'Senior Statistical Officer',
  department: 'MoSPI DIID Headquarters',
  cadre: 'ISS (Indian Statistical Service)',
  experienceYears: 8,
  education: 'Ph.D. in Agricultural Statistics (IASRI)',
  roleTitle: 'Statistical Officer (SO)',
  roleCode: 'STAT_OFFICER',
  roleId: 'role-01',
};

const FALLBACK_COMPETENCIES = [
  {
    id: 'c-01',
    code: 'STAT_ANALYSIS',
    name: 'Statistical Analysis & Inference',
    category: 'Statistical',
    description: 'Descriptive, inferential statistics, probability distributions, hypothesis testing, and regression analysis for official surveys.',
    estimatedLevel: 3.6,
    requiredLevel: 4.0,
    gap: 0.4,
    confidencePct: 82,
    priority: 'HIGH',
    subCompetencies: [
      {
        id: 'sub-01',
        code: 'SUB_SAMPLING_METHODS',
        name: 'Sampling Methods Selection',
        learningObjectives: [
          { id: 'lo-01', title: 'Identify probability sampling techniques suitable for household surveys', taxonomyLevel: 2 },
          { id: 'lo-02', title: 'Calculate minimum required sample size for specified margin of error', taxonomyLevel: 3 },
        ],
      },
      {
        id: 'sub-02',
        code: 'SUB_BIAS_ESTIMATION',
        name: 'Sampling Bias & Variance Estimation',
        learningObjectives: [
          { id: 'lo-03', title: 'Calculate design effects and non-sampling error corrections', taxonomyLevel: 4 },
        ],
      },
    ],
  },
  {
    id: 'c-02',
    code: 'NATIONAL_ACCOUNTS',
    name: 'National Accounts & Macroeconomic Stats',
    category: 'Statistical',
    description: 'GDP estimation, GVA, Input-Output tables, System of National Accounts (SNA 2008), and Sectoral Economic Statistics.',
    estimatedLevel: 2.4,
    requiredLevel: 4.0,
    gap: 1.6,
    confidencePct: 68,
    priority: 'HIGH',
    subCompetencies: [
      {
        id: 'sub-03',
        code: 'SUB_GVA_CALC',
        name: 'Gross Value Added (GVA) Computation',
        learningObjectives: [
          { id: 'lo-04', title: 'Apply deflation methods to estimate real GVA across sectors', taxonomyLevel: 3 },
        ],
      },
    ],
  },
  {
    id: 'c-03',
    code: 'PYTHON_R_STATS',
    name: 'Python for Data Analytics (NSS Microdata)',
    category: 'Technical',
    description: 'Data wrangling, automated statistical modeling, pandas, numpy, statsmodels, and ggplot visualization.',
    estimatedLevel: 1.4,
    requiredLevel: 4.0,
    gap: 2.6,
    confidencePct: 92,
    priority: 'CRITICAL',
    subCompetencies: [
      {
        id: 'sub-04',
        code: 'SUB_PANDAS_MODEL',
        name: 'Automated Data Wrangling in Python',
        learningObjectives: [
          { id: 'lo-05', title: 'Build automated data cleaning and validation scripts for NSS raw files', taxonomyLevel: 3 },
        ],
      },
    ],
  },
  {
    id: 'c-04',
    code: 'DATA_QUALITY_GOV',
    name: 'Metadata Standards & SDMX Governance',
    category: 'Digital Governance',
    description: 'Data quality frameworks, NDSAP alignment, anonymization, privacy preservation, and GIGW compliance.',
    estimatedLevel: 1.6,
    requiredLevel: 4.0,
    gap: 2.4,
    confidencePct: 88,
    priority: 'CRITICAL',
    subCompetencies: [
      {
        id: 'sub-05',
        code: 'SUB_SDMX_DSD',
        name: 'SDMX Structure Definition Registry',
        learningObjectives: [
          { id: 'lo-06', title: 'Define SDMX Data Structure Definitions for National Data Warehouse', taxonomyLevel: 4 },
        ],
      },
    ],
  },
];

const FALLBACK_ROLES = [
  { id: 'role-01', title: 'Statistical Officer (SO)', department: 'MoSPI DIID', description: 'Survey collection design, statistical analysis, and audit.' },
  { id: 'role-02', title: 'Assistant Director (Surveys)', department: 'NSSO', description: 'Leads survey operations and sampling validation.' },
  { id: 'role-03', title: 'Director (Data Informatics)', department: 'MoSPI DIID HQ', description: 'Digital data architecture and capacity building.' },
];

export default function CompetenciesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.platformRole === 'ADMIN';

  const [official, setOfficial] = useState(FALLBACK_OFFICIAL);
  const [competencies, setCompetencies] = useState(FALLBACK_COMPETENCIES);
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [selectedEvidenceForAudit, setSelectedEvidenceForAudit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offRes, compRes, roleRes] = await Promise.allSettled([
        api.get('/officials'),
        api.get('/competencies'),
        api.get('/roles'),
      ]);

      if (offRes.status === 'fulfilled' && offRes.value.data?.data?.[0]) {
        const fetchedOff = offRes.value.data.data[0];
        setOfficial((prev) => ({ ...prev, ...fetchedOff }));
      }
      if (compRes.status === 'fulfilled' && compRes.value.data?.data) {
        setCompetencies(compRes.value.data.data);
      }
      if (roleRes.status === 'fulfilled' && roleRes.value.data?.data) {
        setRoles(roleRes.value.data.data);
      }
    } catch {
      // Fallback used
    }
  };

  const handleRoleUpdated = async (newRoleId) => {
    const matchedRole = roles.find((r) => r.id === newRoleId);
    if (matchedRole) {
      setOfficial((prev) => ({
        ...prev,
        roleId: newRoleId,
        roleTitle: matchedRole.title,
      }));
      toast.success(`Role updated to ${matchedRole.title}. Competency gaps recalculated!`);
    }
  };

  const handleDiagnosticSubmitted = async (results, correctCount, totalCount) => {
    toast.success(`Diagnostic finished! Scored ${correctCount}/${totalCount}. Evidence recorded and competency estimates updated.`);
    setCompetencies((prev) =>
      prev.map((c) => {
        if (c.code === 'STAT_ANALYSIS') {
          const newEstimate = Number(Math.min(5.0, c.estimatedLevel + 0.4).toFixed(1));
          return {
            ...c,
            estimatedLevel: newEstimate,
            gap: Math.max(0, Number((c.requiredLevel - newEstimate).toFixed(1))),
            confidencePct: Math.min(98, c.confidencePct + 6),
          };
        }
        return c;
      })
    );
  };

  const filteredCompetencies = competencies.filter((c) => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title={isAdmin ? "Workforce Competency Audit & Evidence Verification Engine" : "Official Competency Profiles & Evidence Engine"}
        subtitle={
          isAdmin
            ? "Inspect MoSPI cadre competency baselines, diagnostic evidence trails, and FRAC benchmark alignment for academic governance."
            : "Authoritative role competency requirements, diagnostic evidence fusion, and confidence scoring for India's Official Statistical System (MoSPI DIID)."
        }
      />

      {/* ── Official Profile Banner ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#020617] via-[#1E3A8A] to-[#1D4ED8]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white shadow-md">
              <UserCheck size={28} className="!text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A] border border-blue-100">
                  {official.cadre}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{official.department}</span>
                {isAdmin && (
                  <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200 uppercase tracking-wider">
                    Auditing Official Profile
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{official.userName}</h3>
              <p className="text-xs text-slate-600 font-medium">
                {official.designation} • {official.experienceYears} Years Experience • {official.education}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                  🛡️ Target FRAC Benchmark
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Briefcase size={14} className="text-[#1E3A8A]" /> {official.roleTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsRoleDrawerOpen(true)} className="text-xs">
                  <RefreshCw size={14} className="mr-1" /> Change Benchmark
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="text-xs !text-white"
                >
                  <ShieldCheck size={14} className="mr-1 !text-white" /> Test Diagnostic Audit
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target FRAC Benchmark</span>
                <span className="text-sm font-bold text-[#1E3A8A] flex items-center gap-1.5 mt-0.5">
                  <Briefcase size={14} /> {official.roleTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsRoleDrawerOpen(true)} className="text-xs">
                  <RefreshCw size={14} className="mr-1" /> Select Target Role
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="text-xs !text-white"
                >
                  <FileCheck size={14} className="mr-1 !text-white" /> Start Diagnostic
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Statistical', 'Technical', 'Digital Governance', 'Managerial'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1E3A8A] !text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
          />
        </div>
      </div>

      {/* ── Competency Hierarchy Tree List ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Award size={16} className="text-[#1E3A8A]" /> Mapped Competency Profiles ({filteredCompetencies.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any competency to expand sub-competencies</span>
        </div>

        {filteredCompetencies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">No competencies match your search criteria.</p>
          </div>
        ) : (
          filteredCompetencies.map((comp) => (
            <CompetencyTree
              key={comp.id}
              competency={comp}
              onStartDiagnostic={() => setIsDiagnosticOpen(true)}
            />
          ))
        )}
      </div>

      {/* ── Level Semantics Reference Legend ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#1E3A8A] mb-4 flex items-center gap-1.5">
          <Info size={14} /> Official Competency Level Semantics (Levels 1–5 Policy)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.values(COMPETENCY_LEVELS).map((lvl) => (
            <div key={lvl.level} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lvl.color }} />
                <span className="text-xs font-bold text-slate-900">{lvl.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role Assignment Drawer ── */}
      <OfficialRoleDrawer
        isOpen={isRoleDrawerOpen}
        onClose={() => setIsRoleDrawerOpen(false)}
        official={official}
        roles={roles}
        onRoleUpdated={handleRoleUpdated}
      />

      {/* ── Diagnostic Quiz Modal ── */}
      <DiagnosticQuizModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onSubmitted={handleDiagnosticSubmitted}
      />

      {/* ── Provenance Audit Drawer ── */}
      <EvidenceProvenanceDrawer
        isOpen={Boolean(selectedEvidenceForAudit)}
        onClose={() => setSelectedEvidenceForAudit(null)}
        evidenceItem={selectedEvidenceForAudit}
      />
    </div>
  );
}
