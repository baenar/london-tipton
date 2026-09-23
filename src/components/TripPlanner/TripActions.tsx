import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, BookOpen, Edit2 } from 'lucide-react';
import { SAMPLE_TRIPS } from '../../data/sampleTrips';

interface TripActionsProps {
  tripTitle: string;
  onTripTitleChange: (title: string) => void;
  hasStops: boolean;
  onExportJson: () => void;
  onImportJsonFile: (file: File) => void;
  onClearTrip: () => void;
  onLoadPreset: (index: number) => void;
}

export const TripActions: React.FC<TripActionsProps> = ({
  tripTitle,
  onTripTitleChange,
  hasStops,
  onExportJson,
  onImportJsonFile,
  onClearTrip,
  onLoadPreset,
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

      {/* Secondary Bar: Presets & Clear */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-slate-400" />
          <span>Presets:</span>
          {SAMPLE_TRIPS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => onLoadPreset(idx)}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline ml-1"
            >
              {idx === 0 ? 'Royal' : 'Thames'}
            </button>
          ))}
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
