import type { SavedTripData } from '../types/trip';

/**
 * Loads all trip JSON files in src/data/trips/ automatically.
 * Drop any exported trip JSON into src/data/trips/ and Vite bundles it,
 * so the trip can be opened later on a phone via the deployed site.
 */
export function getSavedTrips(): SavedTripData[] {
  const jsonModules = import.meta.glob<{ default: SavedTripData } | SavedTripData>(
    '../data/trips/*.json',
    { eager: true }
  );

  const trips: SavedTripData[] = [];

  for (const path in jsonModules) {
    const rawData = jsonModules[path];
    const data = (rawData && 'default' in rawData ? rawData.default : rawData) as Partial<SavedTripData>;

    if (
      data &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      Array.isArray(data.stops)
    ) {
      trips.push({
        version: data.version || '1.0',
        id: data.id,
        title: data.title,
        description: data.description,
        createdAt: data.createdAt || new Date(0).toISOString(),
        walkingSpeedKmh: Number(data.walkingSpeedKmh) || 4.5,
        stops: data.stops,
        customLocations: data.customLocations,
      });
    }
  }

  return trips;
}