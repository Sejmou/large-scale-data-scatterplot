export type PlottableFeatures = {
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

export type CategoricalFeatures = {
  key: number;
  mode: number;
  timeSignature: number;
  isrcAgency: string;
  isrcTerritory: string;
  explicit: boolean;
};

export type TrackData = PlottableFeatures &
  CategoricalFeatures & {
    id: string;
    previewUrl: string;
    isrc: string;
  };

export type PlotabbleFeatureName = keyof PlottableFeatures;
export type CategoricalFeatureName = keyof CategoricalFeatures;

export type Encodings = {
  x: PlotabbleFeatureName;
  y: PlotabbleFeatureName;
  color: CategoricalFeatureName;
};

export async function getTrackData(): Promise<TrackData[]> {
  const response = await fetch('tracks.json');
  const data = await response.json();
  return data;
}
