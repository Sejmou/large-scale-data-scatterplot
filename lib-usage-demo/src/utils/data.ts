export type PlotableFeatures = {
  acousticness: number;
  danceability: number;
  durationMs: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
  isrcYear: number;
};

export const keys = [
  'C',
  'C#/Db',
  'D',
  'D#/Eb',
  'E',
  'F',
  'F#/Gb',
  'G',
  'G#/Ab',
  'A',
  'A#/Bb',
  'B',
] as const;
export const modes = ['Major', 'Minor'] as const;
export const explicitValues = ['Yes', 'No'] as const;
export const timeSignatures = ['4/4', '3/4', '5/4', 'Other'] as const;

export type CategoricalFeatures = {
  key: typeof keys[number];
  mode: typeof modes[number];
  explicit: typeof explicitValues[number];
  timeSignature: typeof timeSignatures[number];
};

export type Metadata = {
  id: string;
  name: string;
  previewUrl: string;
  isrc: string;
  isrcAgency: string;
  isrcTerritory: string;
};

export type TrackData = PlotableFeatures & CategoricalFeatures & Metadata;

export type PlotableFeatureName = keyof PlotableFeatures;
export type CategoricalFeatureName = keyof CategoricalFeatures;

export type Encodings = {
  x: PlotableFeatureName;
  y: PlotableFeatureName;
  color: CategoricalFeatureName;
};

export async function getTrackData(): Promise<TrackData[]> {
  const response = await fetch('tracks.json');
  const data = await response.json();
  return data;
}
