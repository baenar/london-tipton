import React, { useState } from 'react';
import type { LocationItem } from '../../types/location';
import { X, ExternalLink, Clock, Plus, MapPin, Sparkles } from 'lucide-react';

interface AttractionDetailModalProps {
  location: LocationItem | null;
  isInTripCount: number;
  onClose: () => void;
  onAddStop: (location: LocationItem, durationMinutes: number) => void;
}

export const AttractionDetailModal: React.FC<AttractionDetailModalProps> = ({
  location,
  isInTripCount,
  onClose,
  onAddStop,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(
    location?.suggestedDurationMinutes || 45
  );

  if (!location) return null;

  const handleAdd = () => {
    onAddStop(location, selectedDuration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-52 sm:h-60 w-full bg-slate-100 shrink-0">
          <img
            src={location.imageUrl}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category Pill */}
          <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            {location.category}
          </span>

          {/* Title on Image bottom */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
              {location.name}
            </h2>
            {location.address && (
              <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 opacity-90 drop-shadow-xs">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{location.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {location.highlight && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200/70 p-3 rounded-xl text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Highlight: </span>
                <span>{location.highlight}</span>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              About
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {location.description}
            </p>
          </div>

          {/* External Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Learn more:</span>
            <a
              href={location.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>{location.category === 'Hotel & Stay' ? 'Website' : 'Wikipedia'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Duration Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Time to spend here:
              </label>
              <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {selectedDuration} min
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {[0, 15, 30, 45, 60, 90, 120].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSelectedDuration(dur)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedDuration === dur
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dur === 0 ? '0m' : `${dur}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-[2] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isInTripCount > 0
                ? `Add Stop (${isInTripCount} in itinerary)`
                : 'Add to Walking Trip'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
