import type { SavedTripData } from '../types/trip';

export const SAMPLE_TRIPS: SavedTripData[] = [
  {
    version: '1.0',
    id: 'trip-royal-london',
    title: 'The Royal London & Westminster Walk',
    description: 'Explore the heart of British royalty, politics, and pageantry along the Thames and St James.',
    createdAt: '2026-09-22T10:00:00.000Z',
    walkingSpeedKmh: 4.5,
    stops: [
      { locationId: 'buckingham-palace', durationMinutes: 45 },
      { locationId: 'trafalgar-square', durationMinutes: 30 },
      { locationId: 'big-ben', durationMinutes: 30 },
      { locationId: 'london-eye', durationMinutes: 45 },
    ],
  },
  {
    version: '1.0',
    id: 'trip-thames-cultural',
    title: 'Historic Thames & South Bank Highlights',
    description: 'From Sir Christopher Wren’s baroque masterpiece to Shakespearean drama and Tower Bridge.',
    createdAt: '2026-09-22T10:00:00.000Z',
    walkingSpeedKmh: 4.5,
    stops: [
      { locationId: 'st-pauls-cathedral', durationMinutes: 60 },
      { locationId: 'tate-modern', durationMinutes: 45 },
      { locationId: 'shakespeares-globe', durationMinutes: 30 },
      { locationId: 'borough-market', durationMinutes: 45 },
      { locationId: 'tower-bridge', durationMinutes: 40 },
      { locationId: 'tower-of-london', durationMinutes: 75 },
    ],
  },
];
