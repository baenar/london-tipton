import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, BookOpen, Edit2 } from 'lucide-react';
import type { SavedTripData } from '../../types/trip';

interface TripActionsProps {
  tripTitle: string;
  onTripTitleChange: (title: string) => void;
  hasStops: boolean;
  trips: SavedTripData[];
  onExportJson: () => void;
  onImportJsonFile: (file: File) => void;
  onClearTrip: () => void;
  onLoadTrip: (index: number) => void;
}

export const TripActions: React.FC<TripActionsProps> = ({
  tripTitle,
  onTripTitleChange,
  hasStops,
  trips,
  onExportJson,
  onImportJsonFile,
  onClearTrip,
  onLoadTrip,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJsonFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
      {/* Trip Title Field */}
      <div className="flex items-center gap-1.5 px-1">
        <Edit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={tripTitle}
          onChange={(e) => onTripTitleChange(e.target.value)}
          placeholder="Name your trip..."
          className="text-xs font-semibold text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white px-1.5 py-1 rounded-md border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-hidden w-full transition-colors"
        />
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Export JSON */}
        <button
          onClick={onExportJson}
          disabled={!hasStops}
          title="Download trip as JSON file"
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            hasStops
              ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save to JSON</span>
        </button>

        {/* Open from JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import trip from a JSON file"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Open from JSON</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Secondary Bar: My Trips & Clear */}
      <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="shrink-0">My Trips:</span>
          <select
            value=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (Number.isInteger(idx) && idx >= 0) onLoadTrip(idx);
            }}
            title="Open a trip bundled from src/data/trips/"
            className="text-[11px] font-medium text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-md px-1.5 py-0.5 border border-slate-200 hover:border-indigo-300 focus:border-indigo-400 focus:outline-hidden cursor-pointer truncate max-w-[150px]"
          >
            <option value="" disabled>
              Select a trip...
            </option>
            {trips.map((trip, idx) => (
              <option key={trip.id} value={idx}>
                {trip.title} ({trip.stops.length} stops)
              </option>
            ))}
          </select>
        </div>

        {hasStops && (
          <button
            onClick={onClearTrip}
            className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
