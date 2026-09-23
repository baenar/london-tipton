import React from 'react';
import { X, FileCode, Clock, Download, Compass } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            <h3 className="font-bold text-sm">London Walking Trip Planner Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Time Estimations
            </h4>
            <p className="leading-relaxed">
              The total trip duration is dynamically calculated as:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] text-indigo-700">
              Total Time = Sum of Walking Segments + Sum of Attraction Stays
            </div>
            <p className="leading-relaxed">
              Walking times use Haversine distance with an urban street network detour factor (1.25x) and a customizable walking speed (3.5 to 5.5 km/h). You can customize how many minutes you plan to spend at each attraction individually!
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              Save & Open Trips (JSON)
            </h4>
            <p className="leading-relaxed">
              Click <strong>Save to JSON</strong> in the trip panel to download your full walking itinerary as a portable <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.json</code> file. You can share it or load it back anytime using <strong>Open from JSON</strong>.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-600" />
              Adding Attractions via JSON (LLM Friendly!)
            </h4>
            <p className="leading-relaxed">
              Every attraction is an independent JSON file in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">src/data/locations/</code>. Vite’s <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">import.meta.glob</code> automatically discovers and bundles any new file added there!
            </p>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
              <pre>{`{
  "id": "my-attraction-id",
  "name": "Attraction Name",
  "coordinates": [51.5074, -0.1278],
  "description": "Short description of attraction.",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/...",
  "imageUrl": "https://...image.jpg",
  "category": "Iconic Landmark",
  "suggestedDurationMinutes": 45
}`}</pre>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
