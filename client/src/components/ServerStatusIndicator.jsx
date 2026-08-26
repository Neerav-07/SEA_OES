import React from 'react';
import { Activity, CheckCircle2, Server } from 'lucide-react';

export default function ServerStatusIndicator({ servers, isWakingUp, readyCount, allReady }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs backdrop-blur-xs transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          {isWakingUp ? (
            <Activity className="h-3.5 w-3.5 animate-pulse text-amber-600" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          )}
          <span className="text-[11px]">
            {isWakingUp
              ? `Waking up cloud servers (${readyCount}/3)...`
              : 'All 3 Production Servers Online'}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isWakingUp
              ? 'bg-amber-100/90 text-amber-800 animate-pulse'
              : 'bg-emerald-100/90 text-emerald-800'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isWakingUp ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
            }`}
          />
          {isWakingUp ? 'Starting...' : 'Healthy'}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
        {Object.entries(servers).map(([key, srv]) => (
          <div
            key={key}
            className={`flex items-center gap-1 rounded-md px-1.5 py-1 font-medium transition-colors ${
              srv.status === 'ready'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-amber-50 text-amber-800 border border-amber-200/60 animate-pulse'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                srv.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="truncate">{srv.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
