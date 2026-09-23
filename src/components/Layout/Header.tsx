import React from 'react';
import { MapPin, HelpCircle } from 'lucide-react';

interface HeaderProps {
  stopsCount: number;
  totalDurationFormatted: string;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stopsCount,
  totalDurationFormatted,
  onOpenHelp,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            London Walking Planner
          </h1>
          <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
            OpenStreetMap &bullet; Custom Walking Routes
          </p>
        </div>
      </div>

      {/* Right Stats & Help */}
      <div className="flex items-center gap-3">
        {stopsCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-800">
            <span>{stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</span>
            <span>&bull;</span>
            <span>{totalDurationFormatted}</span>
          </div>
        )}

        <button
          onClick={onOpenHelp}
          title="How it works & adding attractions"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
