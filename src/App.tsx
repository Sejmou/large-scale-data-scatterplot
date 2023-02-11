import './globals.css';
import { useEffect, useMemo, useState } from 'react';
import Scatterplot from './components/Scatterplot';
import {
  CategoricalFeatureName,
  getTrackData,
  PlotableFeatures,
} from './utils/data';
import { divergingColors } from './utils/color';

import type { PlotableFeatureName } from './utils/data';

type ColorOption =
  | 'use default'
  | 'set color for all'
  | 'use category encodings';

function App() {
  const [data, setData] = useState<PlotableFeatures[]>([]);
  useEffect(() => {
    getTrackData().then(data => setData(data));
  }, []);
  const [xFeature, setXFeature] = useState<PlotableFeatureName>('danceability');
  const [yFeature, setYFeature] = useState<PlotableFeatureName>('energy');

  const xValues = useMemo(() => data.map(d => d[xFeature]), [data, xFeature]);
  const yValues = useMemo(() => data.map(d => d[yFeature]), [data, yFeature]);

  const colorOptions: ColorOption[] = [
    'use default',
    'set color for all',
    'use category encodings',
  ];
  const [colorOption, setColorOption] = useState<ColorOption>('use default');
  const [categoricalFeature, setCategoricalFeature] =
    useState<CategoricalFeatureName>('explicit');

  const colorEncodingInput = {
    data: data.slice(0, 3), // passing the same data twice once is ok for now I guess - TODO: figure out how scatterplot component could handle detecting whether the data is categorical (for color encoding) or numerical (for axes)
  };

  const xyFeatureOptions = data[0]
    ? (Object.keys(data[0]).filter(
        prop => typeof data[0][prop as PlotableFeatureName] == 'number'
      ) as PlotableFeatureName[])
    : []; // really dirty, but it works lol

  return (
    <div className="container">
      <h1>Hello from React</h1>
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
        </div>
      </div>

      <Scatterplot
        xAxis={{ data: xValues, featureName: xFeature }}
        yAxis={{ data: yValues, featureName: yFeature }}
        color={colorOption == 'use default' ? undefined : 'red'}
      />
    </div>
  );
}

export default App;
