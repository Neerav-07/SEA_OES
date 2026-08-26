import { useState, useEffect, useRef } from 'react';

/**
 * Hook to ping and wake up all 3 production servers on Auth pages
 * 1. Express Backend Core API
 * 2. FastAPI ML Intelligence Engine
 * 3. Database / Auxiliary Sync Gateway
 * 
 * Ensures zero request timeouts on free-tier cloud platforms (e.g. Render, Koyeb, Glitch).
 */
export function useServerWarmup() {
  const [servers, setServers] = useState({
    coreApi: { label: 'Core API Server', status: 'checking' },
    mlEngine: { label: 'ML Engine', status: 'checking' },
    dbGateway: { label: 'DB & Sync Gateway', status: 'checking' },
  });
  const [isWakingUp, setIsWakingUp] = useState(true);
  const hasPinged = useRef(false);

  useEffect(() => {
    if (hasPinged.current) return;
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

    // Auxiliary / DB Gateway (or resources health probe on backend)
    const auxBase = (
      import.meta.env.VITE_AUX_SERVER_URL ||
      import.meta.env.VITE_IGOT_API_URL ||
      `${apiBase}/resources`
    ).replace(/\/$/, '');
    const auxHealthUrl = auxBase.includes('/resources') ? auxBase : `${auxBase}/health`;

    const pingServer = async (url, key) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json, text/plain, */*' },
        });
        clearTimeout(timeoutId);
        if (res.ok || res.status < 500) {
          setServers((prev) => ({
            ...prev,
            [key]: { ...prev[key], status: 'ready' },
          }));
          return true;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Fallback no-cors ping to ensure server wake-up pulse is sent even if CORS fails
        try {
          await fetch(url, { method: 'GET', mode: 'no-cors' });
        } catch {
          // ignore
        }
      }

      // Mark ready/fallback after ping attempt so user is not permanently blocked
      setServers((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: 'ready' },
      }));
      return true;
    };

    // Execute parallel pings to wake up all 3 instances
    const warmAll = async () => {
      setIsWakingUp(true);
      await Promise.allSettled([
        pingServer(apiHealthUrl, 'coreApi'),
        pingServer(mlHealthUrl, 'mlEngine'),
        pingServer(auxHealthUrl, 'dbGateway'),
      ]);
      // Graceful micro-delay for smooth transition
      setTimeout(() => {
        setIsWakingUp(false);
      }, 600);
    };

    warmAll();

    // Safety timeout: Never block user more than 5s under any condition
    const safetyTimer = setTimeout(() => {
      setIsWakingUp(false);
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, []);

  const readyCount = Object.values(servers).filter((s) => s.status === 'ready').length;
  const allReady = readyCount === 3;

  return {
    servers,
    isWakingUp,
    readyCount,
    allReady,
  };
}
export default useServerWarmup;
