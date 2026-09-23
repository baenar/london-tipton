export type AttractionCategory =
  | 'Iconic Landmark'
  | 'Museum & Gallery'
  | 'Royal & Historic'
  | 'Market & Food'
  | 'Park & Nature'
  | 'Entertainment & View'
  | 'Hotel & Stay'
  | 'Custom Point';

export interface LocationItem {
  id: string;
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  description: string;
  wikipediaUrl: string;
  tripadvisorUrl?: string;
  imageUrl: string;
  category: AttractionCategory;
  suggestedDurationMinutes: number;
  highlight?: string;
  address?: string;
}
