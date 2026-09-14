/**
 * adminData.store.js
 *
 * Industry-grade reactive store for all NSSTA / MoSPI Admin command center tabs.
 *
 * Capabilities:
 * - Cache-first with stale-while-revalidate (0ms transitions between admin tabs)
 * - Deep load on 1st opening, then background synchronization
 * - Component-level targeted updates instead of full tab reload spinners
 * - Seamless inter-tab communication:
 *     * Review decisions in Question Queue immediately propagate to Overview counts & Assessments Studio
 *     * Recalibration in Workforce Analytics immediately updates Overview metrics & Risk Signals
 *     * Notice sync immediately updates Circulars & Overview
 */
import { create } from 'zustand';
import api from '../services/api.js';

const CACHE_TTL_MS = 45000; // 45 seconds stale-while-revalidate window

export const useAdminStore = create((set, get) => ({
  // ── Workforce Analytics State ──
  workforceAnalytics: null,
  workforceHistory: [],
  workforceError: null,
  isWorkforceLoading: false,
  isRecalibrating: false,
  workforceLastFetched: 0,

  // ── Question Review Queue State ──
  reviewQueueByStatus: {
    PENDING: [],
    APPROVED: [],
    REJECTED: [],
    NEEDS_REVISION: [],
  },
  pendingReviewCount: 0,
  isReviewQueueLoading: false,
  reviewQueueLastFetched: 0,

  // ── NSSTA Circulars / Notices State ──
  notices: [],
  syncStatus: null,
  isNoticesLoading: false,
  isNoticesSyncing: false,
  noticesLastFetched: 0,

  // ── Predictive Skill Deficit Signals State ──
  predictionsByDept: {},
  isPredictionsLoading: false,
  isPredictionsReviewing: false,
  predictionsLastFetched: 0,

  // ── ACBP Annual Report State ──
  acbpReport: null,
  isAcbpLoading: false,
  acbpLastFetched: 0,

  // ── Assessment Studio & Blueprints State ──
  blueprints: [],
  isBlueprintsLoading: false,
  blueprintsLastFetched: 0,

  officialAssessments: [],
  isOfficialAssessmentsLoading: false,
  officialAssessmentsLastFetched: 0,

  blueprintCompetencies: [],
  isBlueprintCompetenciesLoading: false,
  blueprintCompetenciesLastFetched: 0,

  isAssessmentStudioLoading: false,
  assessmentStudioLastFetched: 0,

  // ── Actions ──

  /**
   * Fetch workforce analytics with cache-first pattern.
   * If already present, renders instantaneously (0ms) and checks staleness in background.
   */
  fetchWorkforceAnalytics: async (force = false) => {
    const { workforceAnalytics, workforceLastFetched, isWorkforceLoading } = get();
    const now = Date.now();
    const isStale = now - workforceLastFetched > CACHE_TTL_MS;

    if (!force && workforceAnalytics && !isStale) {
      return workforceAnalytics;
    }

    if (isWorkforceLoading) return workforceAnalytics;

    // Only set loading if no cached data exists (prevents full-page blocking flash)
    if (!workforceAnalytics) {
      set({ isWorkforceLoading: true });
    }

    try {
      const res = await api.get('/analytics/workforce');
      const data = res?.data?.data || res?.data || null;
      const history = Array.isArray(data?.history)
        ? data.history
        : Array.isArray(res?.data?.history)
        ? res.data.history
        : [];

      set({
        workforceAnalytics: data,
        workforceHistory: history,
        workforceError: null,
        isWorkforceLoading: false,
        workforceLastFetched: Date.now(),
      });
      return data;
    } catch (err) {
      console.warn('[AdminStore] Workforce analytics fetch error:', err?.message);
      const errMsg = err?.response?.data?.message || err?.message || 'Database telemetry sync error';
      set({
        isWorkforceLoading: false,
        workforceError: errMsg,
      });
      if (!workforceAnalytics) {
        throw err;
      }
      return workforceAnalytics;
    }
  },

  /**
   * Recalibrate workforce in background.
   * Updates workforceAnalytics and broadcasts real-time updates to all tabs.
   */
  recalibrateWorkforce: async () => {
    set({ isRecalibrating: true });
    try {
      const res = await api.get('/analytics/workforce?fresh=true');
      const data = res?.data?.data || res?.data || null;
      const history = Array.isArray(data?.history)
        ? data.history
        : Array.isArray(res?.data?.history)
        ? res.data.history
        : [];

      set({
        workforceAnalytics: data,
        workforceHistory: history,
        isRecalibrating: false,
        workforceLastFetched: Date.now(),
      });

      // Broadcast event for external listeners
      try {
        window.dispatchEvent(new CustomEvent('kshamata_admin_analytics_recalibrated', { detail: data }));
      } catch {}

      return data;
    } catch (err) {
      console.error('[AdminStore] Recalibration error:', err?.message);
      set({ isRecalibrating: false });
      throw err;
    }
  },

  /**
   * Fetch Review Queue items with status filter.
   * If status queue is already cached, renders immediately (0ms).
   */
  fetchReviewQueue: async (status = 'PENDING', force = false) => {
    const { reviewQueueByStatus, reviewQueueLastFetched, isReviewQueueLoading } = get();
    const cachedItems = reviewQueueByStatus[status] || [];
    const now = Date.now();
    const isStale = now - reviewQueueLastFetched > CACHE_TTL_MS;

    if (!force && cachedItems.length > 0 && !isStale) {
      return cachedItems;
    }

    if (isReviewQueueLoading) return cachedItems;

    if (cachedItems.length === 0) {
      set({ isReviewQueueLoading: true });
    }

    try {
      const res = await api.get(`/review/queue?status=${status}`);
      const queueItems = res?.data?.queue || [];

      set((state) => {
        const nextMap = {
          ...state.reviewQueueByStatus,
          [status]: queueItems,
        };
        return {
          reviewQueueByStatus: nextMap,
          pendingReviewCount: status === 'PENDING' ? queueItems.length : state.pendingReviewCount,
          isReviewQueueLoading: false,
          reviewQueueLastFetched: Date.now(),
        };
      });

      return queueItems;
    } catch (err) {
      console.warn('[AdminStore] Review queue fetch error:', err?.message);
      set({ isReviewQueueLoading: false });
      return cachedItems;
    }
  },

  /**
   * Submit decision for a question in review queue.
   * Real-time in-memory mutation: immediately removes/updates item without requiring full tab reload.
   */
  submitReviewDecision: async (itemId, decision, comment = '') => {
    const { reviewQueueByStatus, pendingReviewCount } = get();

    // Optimistically update memory
    const currentPending = reviewQueueByStatus.PENDING || [];
    const decidedItem = currentPending.find((q) => q.id === itemId);
    const updatedPending = currentPending.filter((q) => q.id !== itemId);

    set((state) => ({
      reviewQueueByStatus: {
        ...state.reviewQueueByStatus,
        PENDING: updatedPending,
        [decision]: decidedItem ? [{ ...decidedItem, status: decision }, ...(state.reviewQueueByStatus[decision] || [])] : (state.reviewQueueByStatus[decision] || []),
      },
      pendingReviewCount: Math.max(0, pendingReviewCount - 1),
    }));

    try {
      const res = await api.post(`/review/queue/${itemId}/decision`, {
        decision,
        comment,
      });

      // Broadcast update across tabs
      try {
        window.dispatchEvent(new CustomEvent('kshamata_admin_review_decided', {
          detail: { itemId, decision, comment, pendingCount: Math.max(0, pendingReviewCount - 1) },
        }));
      } catch {}

      return res?.data;
    } catch (err) {
      console.error('[AdminStore] Review decision error:', err?.message);
      // Revert if API failed
      get().fetchReviewQueue('PENDING', true);
      throw err;
    }
  },

  /**
   * Fetch NSSTA notices & sync status with cache-first pattern.
   */
  fetchNotices: async (force = false) => {
    const { notices, noticesLastFetched, isNoticesLoading } = get();
    const now = Date.now();
    const isStale = now - noticesLastFetched > CACHE_TTL_MS;

    if (!force && notices.length > 0 && !isStale) {
      return notices;
    }

    if (isNoticesLoading) return notices;

    if (notices.length === 0) {
      set({ isNoticesLoading: true });
    }

    try {
      const [noticesRes, syncRes] = await Promise.allSettled([
        api.get('/nssta/notices'),
        api.get('/nssta/sync-status'),
      ]);

      const loadedNotices = noticesRes.status === 'fulfilled' && noticesRes.value.data?.notices
        ? noticesRes.value.data.notices
        : notices;
      const loadedSync = syncRes.status === 'fulfilled' && syncRes.value.data
        ? syncRes.value.data
        : null;

      set({
        notices: loadedNotices,
        syncStatus: loadedSync,
        isNoticesLoading: false,
        noticesLastFetched: Date.now(),
      });

      return loadedNotices;
    } catch (err) {
      console.warn('[AdminStore] NSSTA notices fetch error:', err?.message);
      set({ isNoticesLoading: false });
      return notices;
    }
  },

  /**
   * Trigger NSSTA scraper sync in background.
   */
  syncNotices: async () => {
    set({ isNoticesSyncing: true });
    try {
      await api.post('/nssta/sync');
      // Refresh notices with force=true
      await get().fetchNotices(true);
      set({ isNoticesSyncing: false });
    } catch (err) {
      console.error('[AdminStore] Notice sync failed:', err?.message);
      set({ isNoticesSyncing: false });
      throw err;
    }
  },

  /**
   * Fetch Predictive skill deficit signals for a department with cache-first pattern.
   */
  fetchPredictions: async (department = 'DIID, MoSPI', force = false) => {
    const { predictionsByDept, predictionsLastFetched, isPredictionsLoading } = get();
    const cached = predictionsByDept[department];
    const now = Date.now();
    const isStale = now - predictionsLastFetched > CACHE_TTL_MS;

    if (!force && cached && !isStale) {
      return cached;
    }

    if (isPredictionsLoading) return cached;

    if (!cached) {
      set({ isPredictionsLoading: true });
    }

    try {
      const res = await api.get(
        `/predictions/skill-trends?department=${encodeURIComponent(department)}${force ? '&fresh=true' : ''}`
      );
      const data = res?.data || null;

      set((state) => ({
        predictionsByDept: {
          ...state.predictionsByDept,
          [department]: data,
        },
        isPredictionsLoading: false,
        predictionsLastFetched: Date.now(),
      }));

      return data;
    } catch (err) {
      console.warn('[AdminStore] Predictions fetch error:', err?.message);
      set({ isPredictionsLoading: false });
      return cached;
    }
  },

  /**
   * Review predictive risk signal snapshot.
   */
  reviewPredictionSnapshot: async (snapshotId, decision, comment, department) => {
    set({ isPredictionsReviewing: true });
    try {
      await api.post('/predictions/review', {
        id: snapshotId,
        decision,
        comment,
      });
      await get().fetchPredictions(department, true);
      set({ isPredictionsReviewing: false });
    } catch (err) {
      set({ isPredictionsReviewing: false });
      throw err;
    }
  },

  /**
   * Fetch ACBP report with cache-first pattern.
   */
  fetchACBPReport: async (force = false) => {
    const { acbpReport, acbpLastFetched, isAcbpLoading } = get();
    const now = Date.now();
    const isStale = now - acbpLastFetched > CACHE_TTL_MS * 2;

    if (!force && acbpReport && !isStale) {
      return acbpReport;
    }

    if (isAcbpLoading) return acbpReport;

    if (!acbpReport) {
      set({ isAcbpLoading: true });
    }

    try {
      const res = await api.get('/reports/acbp');
      const data = res?.data?.acbpReport || null;
      set({
        acbpReport: data,
        isAcbpLoading: false,
        acbpLastFetched: Date.now(),
      });
      return data;
    } catch (err) {
      console.warn('[AdminStore] ACBP report fetch error:', err?.message);
      set({ isAcbpLoading: false });
      return acbpReport;
    }
  },

  /**
   * Fetch assessment blueprints with cache-first pattern.
   */
  fetchBlueprints: async (force = false) => {
    const { blueprints, blueprintsLastFetched, isBlueprintsLoading } = get();
    const now = Date.now();
    const isStale = now - blueprintsLastFetched > CACHE_TTL_MS;

    if (!force && blueprints.length > 0 && !isStale) {
      return blueprints;
    }

    if (isBlueprintsLoading) return blueprints;

    if (blueprints.length === 0) {
      set({ isBlueprintsLoading: true });
    }

    try {
      const res = await api.get('/assessment-blueprints');
      const items = res?.data?.items || res?.data || [];
      const list = Array.isArray(items) ? items : [];
      set({
        blueprints: list,
        isBlueprintsLoading: false,
        blueprintsLastFetched: Date.now(),
      });
      return list;
    } catch (err) {
      console.warn('[AdminStore] Blueprints fetch error:', err?.message);
      set({ isBlueprintsLoading: false });
      return blueprints;
    }
  },

  /**
   * Fetch assessment studio data (blueprints, competencies, official published assessments)
   * with unified cache-first pattern and background revalidation.
   * If cached, returns immediately in 0ms so tab switching never shows a full-screen reload spinner.
   */
  fetchAssessmentStudioData: async (force = false) => {
    const {
      blueprints,
      officialAssessments,
      blueprintCompetencies,
      assessmentStudioLastFetched,
      isAssessmentStudioLoading,
    } = get();

    const now = Date.now();
    const hasData = blueprints.length > 0 && officialAssessments.length > 0;
    const isStale = now - assessmentStudioLastFetched > CACHE_TTL_MS;

    if (!force && hasData && !isStale) {
      return { blueprints, officialAssessments, blueprintCompetencies };
    }

    if (isAssessmentStudioLoading) {
      return { blueprints, officialAssessments, blueprintCompetencies };
    }

    if (!hasData) {
      set({ isAssessmentStudioLoading: true });
    }

    try {
      const [blueprintsRes, compRes, assessmentsRes] = await Promise.allSettled([
        api.get('/assessment-blueprints'),
        api.get('/assessment-blueprints/lookup/competencies'),
        api.get('/assessments'),
      ]);

      const loadedBlueprints = blueprintsRes.status === 'fulfilled'
        ? (blueprintsRes.value.data?.items || blueprintsRes.value.data || [])
        : blueprints;

      const loadedCompetencies = compRes.status === 'fulfilled'
        ? (compRes.value.data?.items || compRes.value.data || [])
        : blueprintCompetencies;

      const rawAssessments = assessmentsRes.status === 'fulfilled' ? assessmentsRes.value.data : null;
      const loadedAssessments = rawAssessments
        ? (rawAssessments.data || rawAssessments.items || rawAssessments || [])
        : officialAssessments;

      set({
        blueprints: Array.isArray(loadedBlueprints) ? loadedBlueprints : [],
        blueprintCompetencies: Array.isArray(loadedCompetencies) ? loadedCompetencies : [],
        officialAssessments: Array.isArray(loadedAssessments) ? loadedAssessments : [],
        isAssessmentStudioLoading: false,
        isBlueprintsLoading: false,
        isOfficialAssessmentsLoading: false,
        isBlueprintCompetenciesLoading: false,
        blueprintsLastFetched: Date.now(),
        blueprintCompetenciesLastFetched: Date.now(),
        officialAssessmentsLastFetched: Date.now(),
        assessmentStudioLastFetched: Date.now(),
      });

      return {
        blueprints: loadedBlueprints,
        blueprintCompetencies: loadedCompetencies,
        officialAssessments: loadedAssessments,
      };
    } catch (err) {
      console.warn('[AdminStore] Assessment studio fetch error:', err?.message);
      set({ isAssessmentStudioLoading: false });
      return { blueprints, officialAssessments, blueprintCompetencies };
    }
  },

  /**
   * Fetch official assessments with cache-first pattern.
   */
  fetchOfficialAssessments: async (force = false) => {
    const { officialAssessments, officialAssessmentsLastFetched, isOfficialAssessmentsLoading } = get();
    const now = Date.now();
    const isStale = now - officialAssessmentsLastFetched > CACHE_TTL_MS;

    if (!force && officialAssessments.length > 0 && !isStale) {
      return officialAssessments;
    }

    if (isOfficialAssessmentsLoading) return officialAssessments;

    if (officialAssessments.length === 0) {
      set({ isOfficialAssessmentsLoading: true });
    }

    try {
      const res = await api.get('/assessments');
      const data = res?.data;
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      set({
        officialAssessments: list,
        isOfficialAssessmentsLoading: false,
        officialAssessmentsLastFetched: Date.now(),
      });
      return list;
    } catch (err) {
      console.warn('[AdminStore] Official assessments fetch error:', err?.message);
      set({ isOfficialAssessmentsLoading: false });
      return officialAssessments;
    }
  },

  setBlueprintsList: (list) => {
    set({
      blueprints: Array.isArray(list) ? list : [],
      blueprintsLastFetched: Date.now(),
    });
  },

  setOfficialAssessmentsList: (list) => {
    set({
      officialAssessments: Array.isArray(list) ? list : [],
      officialAssessmentsLastFetched: Date.now(),
    });
  },

  /**
   * Pre-warm admin data in background when admin logs in or opens overview.
   * Loads all key admin data non-blockingly so every tab is instant.
   */
  prewarmAdminDashboard: () => {
    // Non-blocking background dispatch
    setTimeout(() => {
      get().fetchWorkforceAnalytics();
      get().fetchReviewQueue('PENDING');
      get().fetchNotices();
      get().fetchAssessmentStudioData();
    }, 100);
  },
}));

export default useAdminStore;
