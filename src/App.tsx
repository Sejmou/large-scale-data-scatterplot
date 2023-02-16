import './globals.css';
import { useEffect, useMemo, useState } from 'react';
import Scatterplot from './components/Scatterplot';
import {
  CategoricalFeatureName,
  CategoricalFeatures,
  explicitValues,
  getTrackData,
  keys,
  modes,
  PlotableFeatures,
  timeSignatures,
} from './utils/data';
import { divergingColors } from './utils/color';

import type { PlotableFeatureName } from './utils/data';

type ColorOption =
  | 'use default'
  | 'set color for all'
  | 'use category encodings';

const debug = true;

function App() {
  const [numericData, setNumericData] = useState<PlotableFeatures[]>([]);
  const [categoricalData, setCategoricalData] = useState<CategoricalFeatures[]>(
    []
  );

  useEffect(() => {
    getTrackData().then(data => {
      const numericFeatures: PlotableFeatures[] = data.map(d => ({
        danceability: d.danceability,
        energy: d.energy,
        loudness: d.loudness,
        speechiness: d.speechiness,
        acousticness: d.acousticness,
        instrumentalness: d.instrumentalness,
        liveness: d.liveness,
        valence: d.valence,
        tempo: d.tempo,
        durationMs: d.durationMs,
        isrcYear: d.isrcYear,
      }));
      setNumericData(numericFeatures);
      const categoricalFeatures: CategoricalFeatures[] = data.map(d => ({
        explicit: d.explicit,
        key: d.key,
        mode: d.mode,
        timeSignature: d.timeSignature,
      }));
      setCategoricalData(categoricalFeatures);
    });
  }, []);
  const [xFeature, setXFeature] = useState<PlotableFeatureName>('danceability');
  const [yFeature, setYFeature] = useState<PlotableFeatureName>('energy');
  const [categoricalFeature, setCategoricalFeature] =
    useState<CategoricalFeatureName>('explicit');

  const xValues = useMemo(
    () => numericData.map(d => d[xFeature]),
    [numericData, xFeature]
  );
  const yValues = useMemo(
    () => numericData.map(d => d[yFeature]),
    [numericData, yFeature]
  );

  const colorOptions: ColorOption[] = [
    'use default',
    'set color for all',
    'use category encodings',
  ];
  const [colorOption, setColorOption] = useState<ColorOption>('use default');
  const colorEncodings = useMemo(() => {
    return getColorEncoding(categoricalFeature);
  }, [categoricalFeature]);

  const colorInput = useMemo(() => {
    switch (colorOption) {
      case 'use default':
        return undefined;
      case 'set color for all':
        return '#ff6961';
      case 'use category encodings':
        return {
          featureName: categoricalFeature,
          data: categoricalData.map(d => d[categoricalFeature]),
          encodings: colorEncodings,
        };
    }
  }, [colorOption, categoricalFeature, colorEncodings, numericData]);

  const xyFeatureOptions = numericData[0]
    ? (Object.keys(numericData[0]) as PlotableFeatureName[])
    : [];

  const categoricalFeatureOptions = useMemo(
    () =>
      categoricalData[0]
        ? (Object.keys(categoricalData[0]) as CategoricalFeatureName[])
        : [],
    [categoricalData]
  );

  return (
    <div className="px-4 py-2 h-full w-full flex flex-col">
      <h1 className="text-3xl">Large-scale data scatterplot in React</h1>
      <div className="bg-blue-300">
        <h2>Component input config</h2>
        <div className="flex gap-4">
          <div>
            <label htmlFor="x-value">x-axis</label>
            <select
              name="x-value"
              onChange={event =>
                setXFeature(event.target.value as PlotableFeatureName)
              }
              value={xFeature}
            >
              {xyFeatureOptions.map((o, i) => (
                <option key={i} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="y-value">y-axis</label>
            <select
              name="y-value"
              onChange={event =>
                setYFeature(event.target.value as PlotableFeatureName)
              }
              value={yFeature}
            >
              {xyFeatureOptions.map((o, i) => (
                <option key={i} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="color">color</label>
            <select
              name="color"
              onChange={event =>
                setColorOption(event.target.value as ColorOption)
              }
              value={colorOption}
            >
              {colorOptions.map((o, i) => (
                <option key={i} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          {colorOption == 'use category encodings' && (
            <div>
              <label htmlFor="categorical">categorical</label>
              <select
                name="categorical"
                onChange={event =>
                  setCategoricalFeature(
                    event.target.value as CategoricalFeatureName
                  )
                }
              >
                {categoricalFeatureOptions.map((o, i) => (
                  <option key={i} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <Scatterplot
        className="flex-1"
        key={debug ? Date.now() : ''} // simple hack for forcing re-render on every rerun of the App component function, causing canvas to be recreated and resized
        xAxis={{ data: xValues, featureName: xFeature }}
        yAxis={{ data: yValues, featureName: yFeature }}
        color={colorInput}
      />
    </div>
  );
}

export default App;

function getColorEncoding(
  categoricalFeature: CategoricalFeatureName
): [string, string][] {
  switch (categoricalFeature) {
    case 'explicit':
      return explicitValues.map((v, i) => [v, divergingColors[i]]);
    case 'key':
      return keys.map((v, i) => [v, divergingColors[i]]);
    case 'mode':
      return modes.map((v, i) => [v, divergingColors[i]]);
    case 'timeSignature':
      return timeSignatures.map((v, i) => [v, divergingColors[i]]);
  }
}
