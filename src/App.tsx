import './globals.css';
import { useEffect, useState } from 'react';
import Scatterplot from './components/Scatterplot';
import { getTrackData, PlottableFeatures } from './utils/data';

import type { PlotabbleFeatureName } from './utils/data';

function App() {
  const [data, setData] = useState<PlottableFeatures[]>([]);
  useEffect(() => {
    getTrackData().then(data => setData(data));
  });
  const [xFeature, setXFeature] =
    useState<PlotabbleFeatureName>('danceability');
  const [yFeature, setYFeature] = useState<PlotabbleFeatureName>('energy');

  const featureOptions = Object.keys(data[0]).filter(
    prop => typeof data[0][prop as PlotabbleFeatureName] == 'number'
  ) as PlotabbleFeatureName[]; // really dirty, but it works lol

  return (
    <div className="container">
      <h1>Hello from React</h1>
      <div className="flex gap">
        <div>
          <label htmlFor="x-value">x-axis</label>
          <select
            name="x-value"
            onChange={event =>
              setXFeature(event.target.value as PlotabbleFeatureName)
            }
          >
            {featureOptions.map((o, i) => (
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
              setYFeature(event.target.value as PlotabbleFeatureName)
            }
          >
            {featureOptions.map((o, i) => (
              <option key={i} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Scatterplot
        data={data.slice(0, 3)}
        xFeature={xFeature}
        yFeature={yFeature}
      />
    </div>
  );
}

export default App;
