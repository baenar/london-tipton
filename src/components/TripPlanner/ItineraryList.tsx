import React from 'react';
import type { SavedTripData, TripStop, WalkingSegment } from '../../types/trip';
import type { LocationItem } from '../../types/location';
import { formatDuration, formatDistance } from '../../services/tripCalculationService';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Clock,
  Footprints,
  Compass,
  ExternalLink,
} from 'lucide-react';

interface ItineraryListProps {
  stops: TripStop[];
  segments: WalkingSegment[];
  trips: SavedTripData[];
  onSelectLocation: (location: LocationItem) => void;
  onUpdateDuration: (stopId: string, durationMinutes: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemoveStop: (stopId: string) => void;
  onOpenAttractionsTab: () => void;
  onLoadTrip: (presetIndex: number) => void;
}

export const ItineraryList: React.FC<ItineraryListProps> = ({
  stops,
  segments,
  trips,
  onSelectLocation,
  onUpdateDuration,
  onMoveUp,
  onMoveDown,
  onRemoveStop,
  onOpenAttractionsTab,
  onLoadTrip,
}) => {
  if (stops.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-50/50">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Your Itinerary is Empty
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mb-4">
          Click attractions on the map or browse the list to plan your custom London walking tour.
        </p>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={onOpenAttractionsTab}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Browse London Attractions
          </button>
          <div className="flex items-center gap-2 my-1">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 font-medium">or open a saved trip</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {trips.map((trip, idx) => (
              <button
                key={trip.id}
                onClick={() => onLoadTrip(idx)}
                className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[11px] rounded-lg border border-slate-200 transition-colors truncate"
              >
                {trip.title} ({trip.stops.length} stops)
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {stops.map((stop, index) => {
        const isFirst = index === 0;
        const isLast = index === stops.length - 1;
        const segmentAfter = segments[index];

        return (
          <React.Fragment key={stop.stopId}>
            {/* Stop Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                {/* Stop Number Badge */}
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div
                  onClick={() => onSelectLocation(stop.location)}
                  className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 cursor-pointer"
                  title="View attraction details"
                >
                  <img
                    src={stop.location.imageUrl}
                    alt={stop.location.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                  />
                </div>

                {/* Info & Duration */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4
                      onClick={() => onSelectLocation(stop.location)}
                      className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                    >
                      {stop.location.name}
                    </h4>
                    <a
                      href={stop.location.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 shrink-0"
                      title="Wikipedia link"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2">
                    {stop.location.category}
                  </p>

                  {/* Stay Duration Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>Stay:</span>
                    </label>
                    <select
                      value={stop.durationMinutes}
                      onChange={(e) =>
                        onUpdateDuration(stop.stopId, parseInt(e.target.value, 10))
                      }
                      className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value={0}>0 min (Pass-by)</option>
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>1 hour</option>
                      <option value={75}>1h 15m</option>
                      <option value={90}>1h 30m</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                {/* Controls: Up/Down/Delete */}
                <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                  <button
                    disabled={isFirst}
                    onClick={() => onMoveUp(index)}
                    title="Move stop earlier"
                    className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                      isFirst ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => onMoveDown(index)}
                    title="Move stop later"
                    className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                      isLast ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveStop(stop.stopId)}
                    title="Remove from itinerary"
                    className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Walking Segment between stops */}
            {segmentAfter && (
              <div className="flex items-center justify-center py-1">
                <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100/90 text-indigo-700 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                  <Footprints className="w-3 h-3 text-indigo-500 animate-pulse" />
                  <span>
                    Walk {formatDuration(segmentAfter.durationMinutes)} (
                    {formatDistance(segmentAfter.distanceMeters)})
                  </span>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
