import React from 'react';
import { Map, ListOrdered, Landmark } from 'lucide-react';

export type MobileTab = 'map' | 'itinerary' | 'attractions';

interface MobileTabsProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  stopsCount: number;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  activeTab,
  onTabChange,
  stopsCount,
}) => {
  return (
    <nav className="md:hidden h-14 bg-white border-t border-slate-200 grid grid-cols-3 shrink-0 z-30 shadow-lg">
      <button
        onClick={() => onTabChange('map')}
        className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
          activeTab === 'map'
            ? 'text-indigo-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px]">Map</span>
      </button>

      <button
        onClick={() => onTabChange('itinerary')}
        className={`relative flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
          activeTab === 'itinerary'
            ? 'text-indigo-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <ListOrdered className="w-5 h-5" />
          {stopsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {stopsCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Trip</span>
      </button>

      <button
        onClick={() => onTabChange('attractions')}
        className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
          activeTab === 'attractions'
            ? 'text-indigo-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Landmark className="w-5 h-5" />
        <span className="text-[10px]">Attractions</span>
      </button>
    </nav>
  );
};
