import type { LocationItem } from './location';

export interface TripStop {
  stopId: string;
  locationId: string;
  location: LocationItem;
  durationMinutes: number;
  customNotes?: string;
}

export interface WalkingSegment {
  fromStopId: string;
  toStopId: string;
  fromName: string;
  toName: string;
  distanceMeters: number;
  durationMinutes: number;
}

export interface TripSummaryStats {
  totalDurationMinutes: number;
  totalWalkingMinutes: number;
  totalAttractionMinutes: number;
  totalDistanceMeters: number;
  stopCount: number;
}

export interface SavedTripStop {
  locationId: string;
  durationMinutes?: number;
  customNotes?: string;
  customLocation?: LocationItem;
}

export interface SavedTripData {
  version: string;
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  walkingSpeedKmh: number;
  stops: SavedTripStop[];
  customLocations?: LocationItem[];
}
