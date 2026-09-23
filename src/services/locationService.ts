import type { LocationItem } from '../types/location';

/**
 * Loads all JSON attraction files in src/data/locations/ automatically.
 * Any new .json file placed in src/data/locations/ is immediately picked up by Vite!
 */
export function getAllLocations(): LocationItem[] {
  const jsonModules = import.meta.glob<{ default: LocationItem } | LocationItem>(
    '../data/locations/*.json',
    { eager: true }
  );

  const locations: LocationItem[] = [];

  for (const path in jsonModules) {
    const rawData = jsonModules[path];
    const data = (rawData && 'default' in rawData ? rawData.default : rawData) as Partial<LocationItem>;

    if (
      data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      Array.isArray(data.coordinates) &&
      data.coordinates.length === 2 &&
      typeof data.coordinates[0] === 'number' &&
      typeof data.coordinates[1] === 'number'
    ) {
      locations.push({
        id: data.id,
        name: data.name,
        coordinates: [data.coordinates[0], data.coordinates[1]],
        description: data.description || 'No description available.',
        wikipediaUrl: data.wikipediaUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.name)}`,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
        category: data.category || 'Iconic Landmark',
        suggestedDurationMinutes: Number(data.suggestedDurationMinutes) || 45,
        highlight: data.highlight,
        address: data.address,
      });
    }
  }

  // Sort alphabetically by name
  return locations.sort((a, b) => a.name.localeCompare(b.name));
}

export function getLocationById(locations: LocationItem[], id: string): LocationItem | undefined {
  return locations.find(loc => loc.id === id);
}
