export type TrackData = {
  id: string;
  name: string;
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
};

export type PlotabbleFeature = keyof Omit<TrackData, 'id' | 'name'>;

export async function getTrackData(): Promise<TrackData[]> {
  const response = await fetch('tracks_numeric.json');
  const data = await response.json();
  return data;
}
