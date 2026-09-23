import type { TripStop, SavedTripData, SavedTripStop } from '../types/trip';
import type { LocationItem } from '../types/location';

const STORAGE_KEY = 'london_walking_trip_active';
const CUSTOM_LOCATIONS_KEY = 'london_custom_locations_active';

/**
 * Converts active TripStop list into a clean exportable JSON structure
 */
export function serializeTrip(
  title: string,
  stops: TripStop[],
  walkingSpeedKmh: number = 4.5,
  description?: string
): SavedTripData {
  const customLocations: LocationItem[] = [];

  const serializedStops: SavedTripStop[] = stops.map((s) => {
    const isCustom = s.location.id.startsWith('custom-') || s.location.category === 'Custom Point';
    if (isCustom) {
      if (!customLocations.some((c) => c.id === s.location.id)) {
        customLocations.push(s.location);
      }
    }

    return {
      locationId: s.locationId,
      durationMinutes: s.durationMinutes,
      customNotes: s.customNotes,
      customLocation: isCustom ? s.location : undefined,
    };
  });

  return {
    version: '1.0',
    id: `trip-${Date.now()}`,
    title: title || 'My London Walking Trip',
    description: description || 'Created with London Walking Trip Planner',
    createdAt: new Date().toISOString(),
    walkingSpeedKmh,
    stops: serializedStops,
    customLocations: customLocations.length > 0 ? customLocations : undefined,
  };
}

/**
 * Triggers a browser file download of the trip JSON
 */
export function downloadTripJson(
  title: string,
  stops: TripStop[],
  walkingSpeedKmh: number = 4.5
): void {
  const data = serializeTrip(title, stops, walkingSpeedKmh);
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeFilename =
    (title || 'london-trip')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'london-walking-trip';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFilename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates an uploaded or pasted JSON string, supporting custom locations
 */
export function parseTripJson(
  jsonText: string,
  availableLocations: LocationItem[]
): {
  tripData?: SavedTripData;
  resolvedStops: TripStop[];
  importedCustomLocations: LocationItem[];
  missingLocationIds: string[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText) as Partial<SavedTripData>;

    if (!parsed || !Array.isArray(parsed.stops)) {
      return {
        resolvedStops: [],
        importedCustomLocations: [],
        missingLocationIds: [],
        error: 'Invalid trip file format: missing "stops" array.',
      };
    }

    // Combine available locations and any custom locations embedded in the JSON
    const locationMap = new Map<string, LocationItem>(
      availableLocations.map((loc) => [loc.id, loc])
    );

    const importedCustomLocations: LocationItem[] = [];

    if (Array.isArray(parsed.customLocations)) {
      parsed.customLocations.forEach((c) => {
        if (c && c.id && c.name && Array.isArray(c.coordinates)) {
          locationMap.set(c.id, c);
          importedCustomLocations.push(c);
        }
      });
    }

    const resolvedStops: TripStop[] = [];
    const missingLocationIds: string[] = [];

    parsed.stops.forEach((rawStop: Partial<SavedTripStop>, index: number) => {
      if (!rawStop.locationId) return;

      let loc = locationMap.get(rawStop.locationId);

      // Check if embedded directly on the stop
      if (!loc && rawStop.customLocation) {
        loc = rawStop.customLocation;
        locationMap.set(loc.id, loc);
        if (!importedCustomLocations.some((c) => c.id === loc!.id)) {
          importedCustomLocations.push(loc);
        }
      }

      if (loc) {
        resolvedStops.push({
          stopId: `stop-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
          locationId: loc.id,
          location: loc,
          durationMinutes:
            typeof rawStop.durationMinutes === 'number'
              ? rawStop.durationMinutes
              : loc.suggestedDurationMinutes || 45,
          customNotes: rawStop.customNotes,
        });
      } else {
        missingLocationIds.push(rawStop.locationId);
      }
    });

    return {
      tripData: {
        version: parsed.version || '1.0',
        id: parsed.id || `trip-${Date.now()}`,
        title: parsed.title || 'Imported London Trip',
        description: parsed.description,
        createdAt: parsed.createdAt || new Date().toISOString(),
        walkingSpeedKmh: parsed.walkingSpeedKmh || 4.5,
        stops: parsed.stops as SavedTripStop[],
      },
      resolvedStops,
      importedCustomLocations,
      missingLocationIds,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown JSON syntax error';
    return {
      resolvedStops: [],
      importedCustomLocations: [],
      missingLocationIds: [],
      error: `Could not parse JSON file: ${message}`,
    };
  }
}

/**
 * Saves active trip state to localStorage
 */
export function saveTripToLocalStorage(
  title: string,
  stops: TripStop[],
  walkingSpeedKmh: number
): void {
  try {
    const data = serializeTrip(title, stops, walkingSpeedKmh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota
  }
}

/**
 * Loads active trip from localStorage
 */
export function loadTripFromLocalStorage(
  availableLocations: LocationItem[]
): {
  title: string;
  stops: TripStop[];
  walkingSpeedKmh: number;
  customLocations: LocationItem[];
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = parseTripJson(raw, availableLocations);
    if (parsed.resolvedStops.length > 0) {
      return {
        title: parsed.tripData?.title || 'My London Walking Trip',
        stops: parsed.resolvedStops,
        walkingSpeedKmh: parsed.tripData?.walkingSpeedKmh || 4.5,
        customLocations: parsed.importedCustomLocations,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Saves user custom locations to localStorage
 */
export function saveCustomLocationsToLocalStorage(customLocations: LocationItem[]): void {
  try {
    localStorage.setItem(CUSTOM_LOCATIONS_KEY, JSON.stringify(customLocations));
  } catch {
    // ignore
  }
}

/**
 * Loads user custom locations from localStorage
 */
export function loadCustomLocationsFromLocalStorage(): LocationItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LOCATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}
