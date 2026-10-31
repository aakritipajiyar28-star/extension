import React from 'react';
import { Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react';

interface NuanceFloatingBadgeProps {
  isNuanceActive: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  pendingAlertsCount: number;
}

export const NuanceFloatingBadge: React.FC<NuanceFloatingBadgeProps> = ({
  isNuanceActive,
  isOpen,
  onToggleOpen,
  pendingAlertsCount,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden group-hover:flex items-center mr-3 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap">
        <span className="font-semibold text-purple-400 mr-1.5">NUANCE:</span>
        <span>
          {isNuanceActive
            ? 'Active • Click to toggle Side Panel'
            : 'Paused • Click to open settings'}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleOpen}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
          isNuanceActive
            ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 text-white ring-4 ring-purple-500/20 shadow-purple-500/30'
            : 'bg-slate-800 text-slate-300 ring-4 ring-slate-700/20'
        }`}
        title="NUANCE Multimodal Companion"
      >
        {/* Animated outer pulse if active */}
        {isNuanceActive && (
          <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-30 blur-sm animate-pulse" />
        )}

        <div className="relative flex flex-col items-center">
          <Sparkles className="w-6 h-6 animate-subtle-pulse" />
          <span className="text-[9px] font-extrabold tracking-wider mt-0.5">NUANCE</span>
        </div>

        {/* Status Dot */}
        <span
          className={`absolute top-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-white ${
            isNuanceActive ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />

        {/* Pending Alerts Counter Badge */}
        {pendingAlertsCount > 0 && isNuanceActive && (
          <span className="absolute -top-2 -left-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-md animate-bounce">
            {pendingAlertsCount}
          </span>
        )}
      </button>
    </div>
  );
};
