import { useState, useEffect, useRef } from 'react';

// In-memory module cache to ensure we never re-ping once warmed in current runtime
let globalWarmed = false;
try {
  globalWarmed = sessionStorage.getItem('kshamata_servers_warmed') === 'true';
} catch {
  // Ignore sessionStorage errors
}

/**
 * Hook to ping and wake up all 3 production servers once on initial visit:
 * 1. Express Backend Core API
 * 2. FastAPI ML Intelligence Engine
 * 3. Database & Sync Gateway
 * 
 * If already warmed during this session, avoids redundant pings and returns isWakingUp: false immediately.
 */
export function useServerWarmup() {
  const [isWakingUp, setIsWakingUp] = useState(!globalWarmed);
  const hasPinged = useRef(false);

  useEffect(() => {
    if (globalWarmed || hasPinged.current) {
      if (isWakingUp) setIsWakingUp(false);
      return;
    }
    hasPinged.current = true;

    // Resolve target server endpoints
    const apiBase = (
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:5000/api'
    ).replace(/\/$/, '');

    // Express Core API root & health
    const apiHealthUrl = apiBase.endsWith('/api') ? `${apiBase}/health` : `${apiBase}/api/health`;

    // FastAPI ML Intelligence URL
    const mlBase = (
      import.meta.env.VITE_ML_API_URL ||
      import.meta.env.VITE_ML_SERVICE_URL ||
      (apiBase.includes(':5000') ? apiBase.replace(':5000', ':8000').replace(/\/api$/, '') : 'http://localhost:8000')
    ).replace(/\/$/, '');
    const mlHealthUrl = `${mlBase}/health`;

    // Auxiliary / DB Gateway Probe
    const auxBase = (
      import.meta.env.VITE_AUX_SERVER_URL ||
      import.meta.env.VITE_IGOT_API_URL ||
      `${apiBase}/resources`
    ).replace(/\/$/, '');
    const auxHealthUrl = auxBase.includes('/resources') ? auxBase : `${auxBase}/health`;

    const pingServer = async (url) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json, text/plain, */*' },
        });
        clearTimeout(timeoutId);
      } catch {
        clearTimeout(timeoutId);
        try {
          await fetch(url, { method: 'GET', mode: 'no-cors' });
        } catch {
          // ignore
        }
      }
    };

    // Parallel wake-up pings
    const executeWarmup = async () => {
      await Promise.allSettled([
        pingServer(apiHealthUrl),
        pingServer(mlHealthUrl),
        pingServer(auxHealthUrl),
      ]);

      globalWarmed = true;
      try {
        sessionStorage.setItem('kshamata_servers_warmed', 'true');
      } catch {
        // ignore
      }
      setIsWakingUp(false);
    };

    executeWarmup();

    // Safety timeout: Maximum 4s under any slow network condition
    const safetyTimer = setTimeout(() => {
      globalWarmed = true;
      try {
        sessionStorage.setItem('kshamata_servers_warmed', 'true');
      } catch {
        // ignore
      }
      setIsWakingUp(false);
    }, 4000);

    return () => clearTimeout(safetyTimer);
  }, [isWakingUp]);

  return {
    isWakingUp,
  };
}

export default useServerWarmup;
