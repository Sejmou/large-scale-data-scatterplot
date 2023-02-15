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
        return 'red';
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
    <>
      <h1>Large-scale data scatterplot in React</h1>
      <div className="bg-blue-300">
        <h2>Component input config</h2>
        <div className="flex gap">
          <div>
            <label htmlFor="x-value">x-axis</label>
            <select
              name="x-value"
              onChange={event =>
                setXFeature(event.target.value as PlotableFeatureName)
              }
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
        xAxis={{ data: xValues, featureName: xFeature }}
        yAxis={{ data: yValues, featureName: yFeature }}
        color={colorInput}
      />
    </>
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
