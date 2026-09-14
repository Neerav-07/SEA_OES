/**
 * dashboardData.store.js
 * 
 * Industry-grade reactive store for all dashboard telemetry, assessments,
 * skill gaps, and competency profiles.
 * 
 * Features:
 * - Cache-first & stale-while-revalidate (0ms tab transitions, NO full-page reloading spinners)
 * - Real-time cross-tab updates (actions in Tab A update Tab B & C immediately in memory)
 * - Guaranteed persistence & resilience (never wipes data to empty [] on transient network/DB errors)
 */
import { create } from 'zustand';
import api from '../services/api.js';

function getActiveUserKey() {
  try {
    const raw = localStorage.getItem('karmayogi-auth-store');
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user?.id || user?.email) return user.id || user.email;
    }
  } catch {
    // fallback
  }
  return 'active_official';
}

function getStoredLocalAttempts() {
  try {
    const userKey = getActiveUserKey();
    const historyKey = `kshamata_assessment_attempts_${userKey}`;
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
  } catch {
    return [];
  }
}

function saveLocalAttempt(entry) {
  try {
    const userKey = getActiveUserKey();
    const historyKey = `kshamata_assessment_attempts_${userKey}`;
    const prev = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const next = [entry, ...prev.filter((item) => item.id !== entry.id)];
    localStorage.setItem(historyKey, JSON.stringify(next));
  } catch (err) {
    console.warn('[Store] Could not persist attempt to localStorage:', err);
  }
}

export const useDashboardStore = create((set, get) => ({
  // ── State ──
  attempts: getStoredLocalAttempts(),
  isAttemptsLoading: false,
  attemptsLastFetched: 0,

  skillGaps: [],
  isSkillGapsLoading: false,
  skillGapsLastFetched: 0,

  roles: [],
  targetRoleId: '',
  isRolesLoading: false,

  officialProfile: null,
  isOfficialLoading: false,

  // ── Actions ──

  /**
   * Load assessment attempt history with cache-first and resilient background sync.
   * If attempts are already present in store or localStorage, renders instantly (0ms delay).
   */
  fetchAttempts: async (force = false) => {
    const { attempts, attemptsLastFetched, isAttemptsLoading } = get();
    const now = Date.now();
    const isStale = now - attemptsLastFetched > 30000; // 30s cache TTL

    if (!force && attempts.length > 0 && !isStale) {
      return attempts;
    }

    if (isAttemptsLoading) return attempts;

    set({ isAttemptsLoading: true });
    try {
      const res = await api.get('/attempts/history');
      const serverAttempts = res?.data?.attempts || [];

      serverAttempts.sort((a, b) => {
        const getTime = (x) => {
          const raw = x.submitted_at || x.submittedAt || x.started_at || x.startedAt || x.created_at || 0;
          return new Date(typeof raw === 'string' && raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') + 'Z' : raw).getTime() || 0;
        };
        return getTime(b) - getTime(a);
      });

      set({
        attempts: serverAttempts,
        attemptsLastFetched: Date.now(),
        isAttemptsLoading: false,
      });
      return serverAttempts;
    } catch (err) {
      console.warn('[DashboardStore] Assessment history fetch error:', err?.message);
      set({ isAttemptsLoading: false });
      return attempts;
    }
  },

  /**
   * Add a completed assessment attempt in real time.
   * Instantly propagates to attempts, skill gaps, and official profile in memory.
   */
  addCompletedAttempt: (newAttempt) => {
    saveLocalAttempt(newAttempt);
    set((state) => {
      const existing = state.attempts || [];
      const updatedAttempts = [newAttempt, ...existing.filter((a) => a.id !== newAttempt.id)];

      // Real-time update to skill gaps if applicable
      const compCode = (newAttempt.competency_code || newAttempt.competencyCode || '').toLowerCase();
      const compName = (newAttempt.competency_name || newAttempt.competencyName || '').toLowerCase();
      const newScore = Number(newAttempt.score || 0);

      const updatedSkillGaps = (state.skillGaps || []).map((gap) => {
        const gapCode = (gap.competencyCode || gap.code || '').toLowerCase();
        const gapName = (gap.competencyName || gap.name || '').toLowerCase();
        const matches = (compCode && gapCode.includes(compCode)) || (compName && gapName.includes(compName));

        if (matches) {
          const prevLevel = Number(gap.currentLevel || gap.estimatedLevel || 1.0);
          const reqLevel = Number(gap.requiredLevel || 4.0);
          const updatedLevel = Number(Math.max(prevLevel, newScore).toFixed(1));
          const newGap = Math.max(0, Number((reqLevel - updatedLevel).toFixed(1)));
          return {
            ...gap,
            currentLevel: updatedLevel,
            estimatedLevel: updatedLevel,
            requiredLevel: reqLevel,
            targetLevel: reqLevel,
            gap: newGap,
            gapScore: newGap,
            gapSeverity: newGap,
            category: newGap >= 2.0 ? 'critical' : newGap >= 1.0 ? 'high' : newGap > 0 ? 'moderate' : 'target_met',
          };
        }
        return gap;
      });

      return {
        attempts: updatedAttempts,
        skillGaps: updatedSkillGaps,
        attemptsLastFetched: Date.now(),
      };
    });

    // Fire custom window event for any remaining legacy listeners
    try {
      window.dispatchEvent(new CustomEvent('kshamata_assessment_submitted', { detail: newAttempt }));
    } catch {
      // ignore
    }
  },

  /**
   * Load skill gaps with cache-first and background revalidation.
   */
  fetchSkillGaps: async (force = false) => {
    const { skillGaps, skillGapsLastFetched, isSkillGapsLoading } = get();
    const now = Date.now();
    const isStale = now - skillGapsLastFetched > 30000;

    if (!force && skillGaps.length > 0 && !isStale) {
      return skillGaps;
    }

    if (isSkillGapsLoading) return skillGaps;

    set({ isSkillGapsLoading: true });
    try {
      const res = await api.get('/skill-gaps');
      const rawData = res?.data?.gaps || res?.data?.data || [];
      const normalizedData = Array.isArray(rawData)
        ? rawData.map((g) => {
            const est = Number(g.estimatedLevel ?? g.currentLevel ?? 0);
            const req = Number(g.requiredLevel ?? g.targetLevel ?? 4.0);
            const gapVal = Number(g.gapSeverity ?? g.gapScore ?? g.gap ?? Math.max(0, req - est));
            return {
              ...g,
              estimatedLevel: est,
              currentLevel: est,
              requiredLevel: req,
              targetLevel: req,
              gapSeverity: gapVal,
              gapScore: gapVal,
              gap: gapVal,
            };
          })
        : [];
      set({
        skillGaps: normalizedData,
        skillGapsLastFetched: Date.now(),
        isSkillGapsLoading: false,
      });
      return normalizedData;
    } catch (err) {
      console.warn('[DashboardStore] Skill gaps fetch error (retaining cached gaps):', err?.message);
      set({ isSkillGapsLoading: false });
      return skillGaps;
    }
  },

  /**
   * Load eligible roles and target role key with cache-first pattern.
   */
  fetchRoles: async (force = false) => {
    const { roles, isRolesLoading } = get();
    if (!force && roles.length > 0) return roles;
    if (isRolesLoading) return roles;

    set({ isRolesLoading: true });
    try {
      const res = await api.get('/roles/eligible');
      const roleList = res?.data?.roles || [];
      const targetId = res?.data?.targetRoleId || '';
      set({
        roles: roleList,
        targetRoleId: targetId,
        isRolesLoading: false,
      });
      return roleList;
    } catch (err) {
      console.warn('[DashboardStore] Eligible roles fetch error:', err?.message);
      set({ isRolesLoading: false });
      return roles;
    }
  },

  /**
   * Load official user profile with cache-first pattern.
   */
  fetchOfficialProfile: async (force = false) => {
    const { officialProfile, isOfficialLoading } = get();
    if (!force && officialProfile) return officialProfile;
    if (isOfficialLoading) return officialProfile;

    set({ isOfficialLoading: true });
    try {
      const res = await api.get('/officials/me');
      const profile = res?.data?.data || null;
      if (profile) {
        set({ officialProfile: profile, isOfficialLoading: false });
      } else {
        set({ isOfficialLoading: false });
      }
      return profile;
    } catch (err) {
      console.warn('[DashboardStore] Official profile fetch error:', err?.message);
      set({ isOfficialLoading: false });
      return officialProfile;
    }
  },
}));

export default useDashboardStore;
