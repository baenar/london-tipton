import type { TripStop, WalkingSegment, TripSummaryStats } from '../types/trip';

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

// Urban walking detour factor: streets don't go in straight lines
const URBAN_DETOUR_FACTOR = 1.25;

/**
 * Calculates straight-line distance in meters between two coordinates using the Haversine formula,
 * adjusted for realistic urban walking path detours.
 */
export function calculateWalkingDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const haversineMeters = EARTH_RADIUS_METERS * c;

  return Math.round(haversineMeters * URBAN_DETOUR_FACTOR);
}

/**
 * Calculates walking time in minutes based on distance and speed (km/h)
 */
export function calculateWalkingMinutes(
  distanceMeters: number,
  walkingSpeedKmh: number = 4.5
): number {
  if (distanceMeters <= 0 || walkingSpeedKmh <= 0) return 0;
  const speedMetersPerMinute = (walkingSpeedKmh * 1000) / 60;
  return Math.max(1, Math.round(distanceMeters / speedMetersPerMinute));
}

/**
 * Calculates walking segments between consecutive stops in an itinerary
 */
export function calculateSegments(
  stops: TripStop[],
  walkingSpeedKmh: number = 4.5
): WalkingSegment[] {
  const segments: WalkingSegment[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const fromStop = stops[i];
    const toStop = stops[i + 1];

    const dist = calculateWalkingDistanceMeters(
      fromStop.location.coordinates,
      toStop.location.coordinates
    );

    const dur = calculateWalkingMinutes(dist, walkingSpeedKmh);

    segments.push({
      fromStopId: fromStop.stopId,
      toStopId: toStop.stopId,
      fromName: fromStop.location.name,
      toName: toStop.location.name,
      distanceMeters: dist,
      durationMinutes: dur,
    });
  }

  return segments;
}

/**
 * Summarizes the entire trip statistics
 */
export function calculateTripSummary(
  stops: TripStop[],
  walkingSpeedKmh: number = 4.5
): TripSummaryStats {
  const totalAttractionMinutes = stops.reduce(
    (acc, stop) => acc + (stop.durationMinutes || 0),
    0
  );

  const segments = calculateSegments(stops, walkingSpeedKmh);

  const totalWalkingMinutes = segments.reduce(
    (acc, seg) => acc + seg.durationMinutes,
    0
  );

  const totalDistanceMeters = segments.reduce(
    (acc, seg) => acc + seg.distanceMeters,
    0
  );

  return {
    totalDurationMinutes: totalAttractionMinutes + totalWalkingMinutes,
    totalWalkingMinutes,
    totalAttractionMinutes,
    totalDistanceMeters,
    stopCount: stops.length,
  };
}

/**
 * Formats minutes into human-readable strings like "1h 45m" or "35m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
}

/**
 * Formats meters into human-readable strings like "1.4 km" or "650 m"
 */
export function formatDistance(meters: number): string {
  if (!meters || meters <= 0) return '0 m';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
