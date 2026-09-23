import React from 'react';
import type { TripSummaryStats } from '../../types/trip';
import { formatDuration, formatDistance } from '../../services/tripCalculationService';
import { Clock, Footprints, Landmark, Gauge } from 'lucide-react';

interface TripSummaryProps {
  stats: TripSummaryStats;
  walkingSpeedKmh: number;
  onWalkingSpeedChange: (speed: number) => void;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
  stats,
  walkingSpeedKmh,
  onWalkingSpeedChange,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 p-4 space-y-3">
      {/* Total Time Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-100 block">
              Estimated Total Duration
            </span>
            <div className="text-2xl font-black tracking-tight mt-0.5">
              {formatDuration(stats.totalDurationMinutes)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Walking Time */}
        <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Footprints className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">
              Walking
            </div>
            <div className="font-bold text-slate-800 truncate">
              {formatDuration(stats.totalWalkingMinutes)}{' '}
              <span className="font-normal text-[11px] text-slate-500">
                ({formatDistance(stats.totalDistanceMeters)})
              </span>
            </div>
          </div>
        </div>

        {/* Attractions Time */}
        <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">
              At Attractions
            </div>
            <div className="font-bold text-slate-800 truncate">
              {formatDuration(stats.totalAttractionMinutes)}{' '}
              <span className="font-normal text-[11px] text-slate-500">
                ({stats.stopCount} {stats.stopCount === 1 ? 'stop' : 'stops'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Walking Speed Adjuster */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
        <label className="flex items-center gap-1 font-medium text-[11px] text-slate-500">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span>Walking Pace:</span>
        </label>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {[
            { label: 'Stroll (3.5 km/h)', speed: 3.5 },
            { label: 'Standard (4.5 km/h)', speed: 4.5 },
            { label: 'Brisk (5.5 km/h)', speed: 5.5 },
          ].map((item) => (
            <button
              key={item.speed}
              type="button"
              onClick={() => onWalkingSpeedChange(item.speed)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                walkingSpeedKmh === item.speed
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.speed} km/h
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
