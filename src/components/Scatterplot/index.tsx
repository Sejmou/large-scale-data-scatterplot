import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Color } from 'three';
import { MapWithDefault } from '../../utils/misc';
import Camera from './Camera';
import Points from './Points';
import { useScatterplotStore } from './store';
import Tooltip from './Tooltip';

const debug = true;

type Props<CategoryFeatureValue extends string> = {
  xAxis: {
    data: number[];
    featureName: string;
  };
  yAxis: {
    data: number[];
    featureName: string;
  };
  color?:
    | {
        featureName: string;
        data: CategoryFeatureValue[];
        encodings: [CategoryFeatureValue, string][];
      }
    | string;
  className?: string;
  alpha?: number;
  pointSize?: number;
};
const defaultColor = '#1DB954';

const Scatterplot = <CategoryFeatureValue extends string>({
  xAxis,
  yAxis,
  color,
  className,
  pointSize,
  alpha,
}: Props<CategoryFeatureValue>) => {
  const { data: xData, featureName: xFeature } = xAxis;
  const { data: yData, featureName: yFeature } = yAxis;
  const setPointRenderConfigs = useScatterplotStore(
    state => state.setPointRenderConfigs
  );
  const fov = useScatterplotStore(state => state.fov);
  const near = useScatterplotStore(state => state.near);
  const far = useScatterplotStore(state => state.far);
  const setPointSize = useScatterplotStore(state => state.setPointSize);
  const setAlpha = useScatterplotStore(state => state.setAlpha);

  useEffect(() => {
    setPointSize(pointSize ?? 12);
  }, [pointSize, setPointSize]);

  useEffect(() => {
    setAlpha(alpha ?? 0.4);
  }, [alpha, setAlpha]);

  const fillColorMap = useMemo(
    () =>
      new MapWithDefault<string, string>(
        typeof color == 'string' ? () => color : () => defaultColor,
        typeof color != 'string' && color?.encodings
          ? color.encodings
          : undefined
      ),
    [color]
  );

  useEffect(() => {
    const renderConfigs = xData.map((x, i) => ({
      x,
      y: yData[i],
      color: new Color(
        Number(
          fillColorMap
            .get(typeof color == 'object' ? color.data[i] : 'blub')
            .replace('#', '0x')
        )
      ),
    }));

    setPointRenderConfigs(renderConfigs);
  }, [xData, yData, fillColorMap]);

  return (
    <>
      {debug && (
        <div className="overflow-hidden p-2">
          <p>This is a scatterplot</p>
          <p>Its input data for the x and y axes is:</p>
          <p className="text-ellipsis">{JSON.stringify(xData)}</p>
          <p className="text-ellipsis">{JSON.stringify(yData)}</p>
          <p>
            {xFeature} will be plotted on the x-axis, while {yFeature} will be
            displayed on the y-axis.
          </p>
          {!color ? (
            <div>
              The default color{' '}
              <span style={{ color: defaultColor }}>{defaultColor}</span> will
              be used for coloring the scatterplot points.
            </div>
          ) : typeof color === 'string' ? (
            <div>
              <span style={{ color }}>{color}</span> will be used as the fill
              color for the dots on the plot.
            </div>
          ) : (
            <div>
              The following color encodings will be used:
              <ul>
                {fillColorMap &&
                  [...fillColorMap.entries()].map(([feature, color]) => (
                    <li key={feature}>
                      {feature}: <span style={{ color }}>{color}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {color && typeof color === 'object' && (
            <div>Currently color-encoding {color.featureName}</div>
          )}
        </div>
      )}
      <div className={className}>
        <Canvas camera={{ fov, near, far }}>
          <Camera />
          <Tooltip />
          <Points />
        </Canvas>
      </div>
    </>
  );
};
export default Scatterplot;
