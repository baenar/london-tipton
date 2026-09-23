import { useState, useEffect, useMemo, useCallback } from 'react';
import type { LocationItem } from './types/location';
import type { TripStop } from './types/trip';
import { getAllLocations } from './services/locationService';
import {
  calculateTripSummary,
  calculateSegments,
  formatDuration,
} from './services/tripCalculationService';
import {
  downloadTripJson,
  parseTripJson,
  saveTripToLocalStorage,
  loadTripFromLocalStorage,
  saveCustomLocationsToLocalStorage,
  loadCustomLocationsFromLocalStorage,
} from './services/tripStorageService';
import { SAMPLE_TRIPS } from './data/sampleTrips';
import { MapView } from './components/Map/MapView';
import { AttractionList } from './components/Attractions/AttractionList';
import { AttractionDetailModal } from './components/Attractions/AttractionDetailModal';
import { AddCustomPointModal } from './components/Map/AddCustomPointModal';
import { TripSummary } from './components/TripPlanner/TripSummary';
import { ItineraryList } from './components/TripPlanner/ItineraryList';
import { TripActions } from './components/TripPlanner/TripActions';
import { Header } from './components/Layout/Header';
import { MobileTabs } from './components/Layout/MobileTabs';
import type { MobileTab } from './components/Layout/MobileTabs';
import { HelpModal } from './components/Layout/HelpModal';
import { ListOrdered, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Load static modular JSON locations
  const [staticLocations] = useState<LocationItem[]>(() => getAllLocations());

  // Boot state (localStorage + fallback preset), computed once on first render
  const [bootState] = useState(() => {
    const savedCustomLocations = loadCustomLocationsFromLocalStorage();
    const all = [...staticLocations, ...savedCustomLocations];

    const cached = loadTripFromLocalStorage(all);
    if (cached && cached.stops.length > 0) {
      return {
        title: cached.title,
        stops: cached.stops,
        walkingSpeedKmh: cached.walkingSpeedKmh,
        customLocations: mergeUniqueLocations(savedCustomLocations, cached.customLocations),
      };
    }

    const sample = SAMPLE_TRIPS[0];
    const parsed = parseTripJson(JSON.stringify(sample), all);
    return {
      title: parsed.resolvedStops.length > 0 ? sample.title : 'My London Walking Trip',
      stops: parsed.resolvedStops.length > 0 ? parsed.resolvedStops : [],
      walkingSpeedKmh: parsed.resolvedStops.length > 0 ? sample.walkingSpeedKmh : 4.5,
      customLocations: savedCustomLocations,
    };
  });

  // User-created custom locations
  const [customLocations, setCustomLocations] = useState<LocationItem[]>(bootState.customLocations);

  // Combined locations list (static + custom)
  const allLocations = useMemo(() => {
    return [...staticLocations, ...customLocations];
  }, [staticLocations, customLocations]);

  // Trip state
  const [tripTitle, setTripTitle] = useState<string>(bootState.title);
  const [tripStops, setTripStops] = useState<TripStop[]>(bootState.stops);
  const [walkingSpeedKmh, setWalkingSpeedKmh] = useState<number>(bootState.walkingSpeedKmh);

  // UI state
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [clickedMapCoords, setClickedMapCoords] = useState<[number, number] | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('map');
  const [desktopSidebarTab, setDesktopSidebarTab] = useState<'itinerary' | 'attractions'>('itinerary');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show temporary toast
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Persist trip to localStorage on change
  useEffect(() => {
    if (tripStops.length > 0) {
      saveTripToLocalStorage(tripTitle, tripStops, walkingSpeedKmh);
    }
  }, [tripTitle, tripStops, walkingSpeedKmh]);

  // Persist custom locations
  useEffect(() => {
    saveCustomLocationsToLocalStorage(customLocations);
  }, [customLocations]);

  // Map of location occurrences in itinerary
  const tripLocationCountMap = useMemo(() => {
    const map = new Map<string, number>();
    tripStops.forEach((stop) => {
      map.set(stop.locationId, (map.get(stop.locationId) || 0) + 1);
    });
    return map;
  }, [tripStops]);

  // Trip stats & segments
  const tripStats = useMemo(
    () => calculateTripSummary(tripStops, walkingSpeedKmh),
    [tripStops, walkingSpeedKmh]
  );

  const walkingSegments = useMemo(
    () => calculateSegments(tripStops, walkingSpeedKmh),
    [tripStops, walkingSpeedKmh]
  );

  // Add stop to trip
  const handleAddStop = useCallback(
    (location: LocationItem, durationMinutes?: number) => {
      const newStop: TripStop = {
        stopId: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        locationId: location.id,
        location,
        durationMinutes:
          typeof durationMinutes === 'number'
            ? durationMinutes
            : (location.suggestedDurationMinutes ?? 45),
      };

      setTripStops((prev) => [...prev, newStop]);
      showToast(`Added "${location.name}" to your trip!`);
    },
    [showToast]
  );

  // Add user custom point from map click
  const handleAddCustomPoint = useCallback(
    (newLocation: LocationItem, durationMinutes: number) => {
      setCustomLocations((prev) => [...prev, newLocation]);
      handleAddStop(newLocation, durationMinutes);
      showToast(`Custom location "${newLocation.name}" created and added to trip!`);
    },
    [handleAddStop, showToast]
  );

  // Remove stop
  const handleRemoveStop = useCallback((stopId: string) => {
    setTripStops((prev) => prev.filter((s) => s.stopId !== stopId));
  }, []);

  // Update stop duration
  const handleUpdateDuration = useCallback((stopId: string, durationMinutes: number) => {
    setTripStops((prev) =>
      prev.map((s) => (s.stopId === stopId ? { ...s, durationMinutes } : s))
    );
  }, []);

  // Reorder stops
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setTripStops((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setTripStops((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }, []);

  // Clear trip
  const handleClearTrip = useCallback(() => {
    if (window.confirm('Are you sure you want to clear this trip itinerary?')) {
      setTripStops([]);
      showToast('Trip itinerary cleared.');
    }
  }, [showToast]);

  // Load preset walk
  const handleLoadPreset = useCallback(
    (index: number) => {
      const preset = SAMPLE_TRIPS[index];
      if (!preset) return;

      const parsed = parseTripJson(JSON.stringify(preset), allLocations);
      if (parsed.resolvedStops.length > 0) {
        setTripTitle(preset.title);
        setTripStops(parsed.resolvedStops);
        setWalkingSpeedKmh(preset.walkingSpeedKmh);
        showToast(`Loaded preset: "${preset.title}"`);
      }
    },
    [allLocations, showToast]
  );

  // Export trip to JSON file
  const handleExportJson = useCallback(() => {
    if (tripStops.length === 0) {
      showToast('Please add at least one stop before exporting.', 'error');
      return;
    }
    downloadTripJson(tripTitle, tripStops, walkingSpeedKmh);
    showToast('Trip saved and downloaded as JSON file!');
  }, [tripTitle, tripStops, walkingSpeedKmh, showToast]);

  // Import trip from uploaded JSON file
  const handleImportJsonFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const result = parseTripJson(text, allLocations);

        if (result.error) {
          showToast(result.error, 'error');
          return;
        }

        if (result.resolvedStops.length === 0) {
          showToast('No recognizable London attractions found in this file.', 'error');
          return;
        }

        // Restore custom locations if present
        if (result.importedCustomLocations.length > 0) {
          setCustomLocations((prev) => {
            const merged = [...prev];
            result.importedCustomLocations.forEach((c) => {
              if (!merged.some((m) => m.id === c.id)) merged.push(c);
            });
            return merged;
          });
        }

        setTripTitle(result.tripData?.title || file.name.replace(/\.json$/i, ''));
        setTripStops(result.resolvedStops);
        if (result.tripData?.walkingSpeedKmh) {
          setWalkingSpeedKmh(result.tripData.walkingSpeedKmh);
        }

        if (result.missingLocationIds.length > 0) {
          showToast(
            `Loaded ${result.resolvedStops.length} stops (${result.missingLocationIds.length} unknown IDs skipped).`
          );
        } else {
          showToast(`Successfully opened trip with ${result.resolvedStops.length} stops!`);
        }
      };

      reader.onerror = () => {
        showToast('Error reading the selected file.', 'error');
      };

      reader.readAsText(file);
    },
    [allLocations, showToast]
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden select-none">
      {/* App Header */}
      <Header
        stopsCount={tripStops.length}
        totalDurationFormatted={formatDuration(tripStats.totalDurationMinutes)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar / Mobile Panel */}
        <aside
          className={`w-full md:w-[420px] lg:w-[480px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 transition-all ${
            // Mobile visibility
            activeMobileTab === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Desktop Tab Switcher */}
          <div className="hidden md:grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-1.5 shrink-0">
            <button
              onClick={() => setDesktopSidebarTab('itinerary')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                desktopSidebarTab === 'itinerary'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Itinerary</span>
              {tripStops.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] rounded-full">
                  {tripStops.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setDesktopSidebarTab('attractions')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                desktopSidebarTab === 'attractions'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Attractions & Hotels</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                {allLocations.length}
              </span>
            </button>
          </div>

          {/* Conditional View: Itinerary vs Attractions */}
          {(desktopSidebarTab === 'itinerary' && activeMobileTab !== 'attractions') ||
          activeMobileTab === 'itinerary' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Trip Time & Distance Summary */}
              <TripSummary
                stats={tripStats}
                walkingSpeedKmh={walkingSpeedKmh}
                onWalkingSpeedChange={setWalkingSpeedKmh}
              />

              {/* Stops Itinerary List */}
              <ItineraryList
                stops={tripStops}
                segments={walkingSegments}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                onUpdateDuration={handleUpdateDuration}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemoveStop={handleRemoveStop}
                onOpenAttractionsTab={() => {
                  setDesktopSidebarTab('attractions');
                  setActiveMobileTab('attractions');
                }}
                onLoadPreset={handleLoadPreset}
              />

              {/* Bottom Actions (Save JSON, Open JSON, Presets) */}
              <TripActions
                tripTitle={tripTitle}
                onTripTitleChange={setTripTitle}
                hasStops={tripStops.length > 0}
                onExportJson={handleExportJson}
                onImportJsonFile={handleImportJsonFile}
                onClearTrip={handleClearTrip}
                onLoadPreset={handleLoadPreset}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <AttractionList
                locations={allLocations}
                tripLocationCountMap={tripLocationCountMap}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                onAddStop={(loc) => handleAddStop(loc)}
              />
            </div>
          )}
        </aside>

        {/* Map View Area */}
        <main
          className={`flex-1 h-full w-full relative ${
            // Mobile visibility
            activeMobileTab !== 'map' ? 'hidden md:block' : 'block'
          }`}
        >
          <MapView
            locations={allLocations}
            tripStops={tripStops}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onAddStop={(loc) => handleAddStop(loc)}
            onRemoveStop={handleRemoveStop}
            onMapClick={(coords) => setClickedMapCoords(coords)}
          />
        </main>
      </div>

      {/* Mobile Navigation Tabs */}
      <MobileTabs
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
        stopsCount={tripStops.length}
      />

      {/* Attraction Detail Modal */}
      <AttractionDetailModal
        location={selectedLocation}
        isInTripCount={
          selectedLocation ? tripLocationCountMap.get(selectedLocation.id) || 0 : 0
        }
        onClose={() => setSelectedLocation(null)}
        onAddStop={handleAddStop}
      />

      {/* Add Custom Point Modal (triggered by clicking on the map) */}
      <AddCustomPointModal
        key={clickedMapCoords ? `open-${clickedMapCoords.join(',')}` : 'closed'}
        coordinates={clickedMapCoords}
        isOpen={!!clickedMapCoords}
        onClose={() => setClickedMapCoords(null)}
        onAddCustomPoint={handleAddCustomPoint}
      />

      {/* Help / Guide Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-16 md:bottom-6 right-6 z-[1200] max-w-sm flex items-center gap-2 py-2.5 px-4 rounded-xl shadow-lg border text-xs font-semibold backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function mergeUniqueLocations(
  baseItems: LocationItem[],
  additionalItems: LocationItem[]
): LocationItem[] {
  const merged = [...baseItems];
  additionalItems.forEach((item) => {
    if (!merged.some((m) => m.id === item.id)) merged.push(item);
  });
  return merged;
}

export default App;
