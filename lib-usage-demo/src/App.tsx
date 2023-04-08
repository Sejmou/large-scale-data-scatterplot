import './globals.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Scatterplot from 'react-big-dataset-scatterplot';
import {
  SingleVertexColorConfig,
  VertexColorEncodingConfig,
} from 'react-big-dataset-scatterplot';
import { Tooltip } from 'react-tooltip';

import {
  CategoricalFeatureName,
  CategoricalFeatures,
  explicitValues,
  getTrackData,
  keys,
  Metadata,
  modes,
  PlotableFeatures,
  timeSignatures,
  TrackData,
} from './utils/data';
import { divergingColors } from './utils/color';

import type { PlotableFeatureName } from './utils/data';

type ColorOption =
  | 'use default'
  | 'set color for all'
  | 'use category encodings';

const plotCanvasId = 'scatterplot-canvas'; // required for tooltip

function App() {
  const [numericData, setNumericData] = useState<PlotableFeatures[]>([]);
  const [categoricalData, setCategoricalData] = useState<CategoricalFeatures[]>(
    []
  );
  const [metadata, setMetadata] = useState<Metadata[]>([]);

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
      setMetadata(
        data.map(d => ({
          id: d.id,
          name: d.name,
          isrc: d.isrc,
          isrcAgency: d.isrcAgency,
          isrcTerritory: d.isrcTerritory,
          isrcYear: d.isrcYear,
          previewUrl: d.previewUrl,
        }))
      );
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

  const colorInput:
    | SingleVertexColorConfig
    | VertexColorEncodingConfig
    | undefined = useMemo(() => {
    switch (colorOption) {
      case 'use default':
        return undefined;
      case 'set color for all':
        return {
          mode: 'same-for-all',
          value: '#ff0000',
        };
      case 'use category encodings':
        return {
          mode: 'color-encodings',
          featureNameHeading: categoricalFeature,
          data: categoricalData.map(d => d[categoricalFeature]),
          encodings: colorEncodings,
        };
    }
  }, [colorOption, categoricalFeature, categoricalData, colorEncodings]);

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

  const [activeDatapoint, setActiveDatapoint] = useState<TrackData>();
  const activeDatapointTooltip = useMemo(() => {
    if (!activeDatapoint) return null;
    return (
      <div>
        <div>Track: {activeDatapoint.name}</div>
      </div>
    );
  }, [activeDatapoint]);

  const handlePointHoverStart = useCallback(
    (idx: number) => {
      setActiveDatapoint({
        ...metadata[idx],
        ...numericData[idx],
        ...categoricalData[idx],
      });
    },
    [setActiveDatapoint, metadata, numericData, categoricalData]
  );
  const handlePointClick = useCallback(
    (idx: number) => {
      alert('clicked ' + idx);
      alert(JSON.stringify(activeDatapoint));
    },
    [activeDatapoint]
  );
  const handlePointHoverEnd = useCallback(() => {
    setActiveDatapoint(undefined);
  }, [setActiveDatapoint]);

  console.log('rendering App');

  return (
    <div className="px-4 py-2 h-full w-full flex flex-col" data-tip="">
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
          {colorOption === 'use category encodings' && (
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
        xAxis={{
          data:
            xFeature === 'durationMs'
              ? xValues.map(d => d / 1000 / 60)
              : xValues,
          featureName:
            xFeature === 'durationMs' ? 'duration (minutes)' : xFeature,
          beginAtZero: !['tempo', 'durationMs', 'isrcYear'].includes(xFeature),
        }}
        yAxis={{
          data:
            yFeature === 'durationMs'
              ? yValues.map(d => d / 1000 / 60)
              : yValues,
          featureName: yFeature === 'durationMs' ? 'duration (s)' : yFeature,
          beginAtZero: !['tempo', 'durationMs', 'isrcYear'].includes(yFeature),
        }}
        color={colorInput}
        onPointClick={handlePointClick}
        onPointHoverStart={handlePointHoverStart}
        onPointHoverEnd={handlePointHoverEnd}
        canvasId={plotCanvasId}
      />
      <Tooltip float anchorSelect={`#${plotCanvasId}`}>
        {activeDatapointTooltip}
      </Tooltip>
    </div>
  );
}

export default App;

function getColorEncoding(
  categoricalFeature: CategoricalFeatureName
): [string, `#${string}`][] {
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
