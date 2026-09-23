import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LocationItem } from '../../types/location';
import type { TripStop } from '../../types/trip';
import { Compass, Maximize2, Navigation, PlusCircle } from 'lucide-react';

interface MapViewProps {
  locations: LocationItem[];
  tripStops: TripStop[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem) => void;
  onAddStop: (loc: LocationItem) => void;
  onRemoveStop: (stopId: string) => void;
  onMapClick: (coordinates: [number, number]) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  tripStops,
  selectedLocation,
  onSelectLocation,
  onAddStop,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  // Keep onMapClick in a ref so the click listener (bound once) always calls the latest handler
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [51.5074, -0.1278], // London center
      zoom: 13,
      zoomControl: false,
    });

    // Add clean zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Map Click Handler for Custom Points
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current([e.latlng.lat, e.latlng.lng]);
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route polyline when locations or tripStops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Map of stop orders for attractions that are in the trip
    const stopIndexMap = new Map<string, number[]>();
    tripStops.forEach((stop, idx) => {
      const existing = stopIndexMap.get(stop.locationId) || [];
      existing.push(idx + 1);
      stopIndexMap.set(stop.locationId, existing);
    });

    // 1. Add markers for all attractions
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const orderNumbers = stopIndexMap.get(loc.id);
      const isInTrip = !!orderNumbers && orderNumbers.length > 0;

      let iconHtml = '';

      if (isInTrip) {
        // Prominent numbered marker for stops in itinerary
        const label = orderNumbers.join(', ');
        iconHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-110 ${
            isSelected ? 'scale-115 ring-4 ring-indigo-300 rounded-full' : ''
          }">
            <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white ring-1 ring-black/10">
              ${label}
            </div>
            <div class="absolute -bottom-1.5 w-2 h-2 bg-indigo-600 transform rotate-45"></div>
          </div>
        `;
      } else if (loc.category === 'Hotel & Stay') {
        // Amber Pin for Hotel
        iconHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-110 ${
            isSelected ? 'scale-115 ring-4 ring-amber-300 rounded-full' : ''
          }">
            <div class="w-7 h-7 rounded-full bg-amber-500 text-white shadow-md border-2 border-white flex items-center justify-center font-bold text-[11px]">
              🏨
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 bg-amber-500 transform rotate-45"></div>
          </div>
        `;
      } else if (loc.category === 'Custom Point') {
        // Emerald Pin for user custom points
        iconHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-110 ${
            isSelected ? 'scale-115 ring-4 ring-emerald-300 rounded-full' : ''
          }">
            <div class="w-7 h-7 rounded-full bg-emerald-600 text-white shadow-md border-2 border-white flex items-center justify-center font-bold text-[11px]">
              📍
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-600 transform rotate-45"></div>
          </div>
        `;
      } else {
        // Standard attraction marker pin
        iconHtml = `
          <div class="relative flex items-center justify-center transform transition-transform duration-200 hover:scale-110 ${
            isSelected ? 'scale-115' : ''
          }">
            <div class="w-7 h-7 rounded-full bg-white text-slate-700 shadow-md border-2 border-slate-300 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 bg-slate-400 transform rotate-45"></div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(loc.coordinates, { icon: customIcon });

      // Build popup content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-64 max-w-[280px] p-0 font-sans';
      popupDiv.innerHTML = `
        <div class="relative h-28 w-full overflow-hidden rounded-t-lg bg-slate-100">
          <img src="${loc.imageUrl}" alt="${loc.name}" class="w-full h-full object-cover" />
          <span class="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            ${loc.category}
          </span>
        </div>
        <div class="p-3">
          <h3 class="font-bold text-slate-900 text-sm leading-tight mb-1">${loc.name}</h3>
          <p class="text-xs text-slate-600 line-clamp-2 mb-2">${loc.description}</p>
          <div class="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <span>⏳ ~${loc.suggestedDurationMinutes} mins</span>
            ${
              loc.wikipediaUrl
                ? `<a href="${loc.wikipediaUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5">
                     ${loc.category === 'Hotel & Stay' ? 'Website ↗' : 'More info ↗'}
                   </a>`
                : ''
            }
          </div>
          <div class="pt-1 border-t border-slate-100 flex gap-1.5">
            <button id="popup-btn-action-${loc.id}" class="flex-1 text-center text-xs font-semibold py-1.5 px-2 rounded-md transition-colors ${
              isInTrip
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }">
              ${isInTrip ? '+ Add Another Stop' : '+ Add to Trip'}
            </button>
            <button id="popup-btn-detail-${loc.id}" class="text-xs font-medium py-1.5 px-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md">
              Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        const actionBtn = document.getElementById(`popup-btn-action-${loc.id}`);
        if (actionBtn) {
          actionBtn.onclick = (e) => {
            e.stopPropagation();
            onAddStop(loc);
            marker.closePopup();
          };
        }
        const detailBtn = document.getElementById(`popup-btn-detail-${loc.id}`);
        if (detailBtn) {
          detailBtn.onclick = (e) => {
            e.stopPropagation();
            onSelectLocation(loc);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersGroup.addLayer(marker);
    });

    // 2. Draw Polyline for Walking Route
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    if (tripStops.length >= 2) {
      const latlngs = tripStops.map((s) => s.location.coordinates);
      const polyline = L.polyline(latlngs, {
        color: '#4f46e5', // indigo-600
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polylineLayerRef.current = polyline;
    }
  }, [locations, tripStops, selectedLocation, onSelectLocation, onAddStop]);

  // Recalculate container size if pane changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, []);

  const fitBoundsToTrip = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tripStops.length > 0) {
      const bounds = L.latLngBounds(tripStops.map((s) => s.location.coordinates));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => loc.coordinates));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  const resetToLondon = () => {
    mapInstanceRef.current?.setView([51.5074, -0.1278], 13);
  };

  return (
    <div className="relative w-full h-full min-h-[350px]">
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Floating map quick actions */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <button
          onClick={fitBoundsToTrip}
          title="Fit view to current itinerary"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-slate-800 hover:bg-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md border border-slate-200/80 transition-all hover:shadow-lg active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fit Trip</span>
        </button>
        <button
          onClick={resetToLondon}
          title="Reset to Central London"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-slate-800 hover:bg-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md border border-slate-200/80 transition-all hover:shadow-lg active:scale-95"
        >
          <Compass className="w-3.5 h-3.5 text-slate-600" />
          <span>London</span>
        </button>
      </div>

      {/* Custom Point Click Instruction Hint */}
      <div className="absolute top-4 right-14 z-[400] hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-slate-700 px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 text-xs font-medium">
        <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
        <span>Click map to add custom stop</span>
      </div>

      {/* Route info overlay if active */}
      {tripStops.length >= 2 && (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          <span>Route: {tripStops.length} stops ordered</span>
        </div>
      )}
    </div>
  );
};
