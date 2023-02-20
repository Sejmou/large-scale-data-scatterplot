import { Canvas } from '@react-three/fiber';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Color } from 'three';
import { MapWithDefault } from './utils';
import Camera from './Camera';
import Points from './Points';
import { useScatterplotStore } from './store';
import PointClickAndHover from './PointClickAndHover';
import YAxis from './YAxis';
import XAxis from './XAxis';
import { useResizeDetector } from 'react-resize-detector';
import Legend from './Legend';

const debug = false;

export type AxisConfig = {
  data: number[];
  featureName: string;
  beginAtZero?: boolean;
};

export type ColorEncodingConfig<
  CategoryFeatureValue extends string = string
> = {
  featureName: string;
  data: CategoryFeatureValue[];
  encodings: [CategoryFeatureValue, string][];
};

export type Props<CategoryFeatureValue extends string = string> = {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  color?: ColorEncodingConfig<CategoryFeatureValue> | string;
  className?: string;
  alpha?: number;
  pointSize?: number;
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
  tooltipContent?: ReactElement;
};
const defaultColor = '#1DB954';

const Scatterplot = <CategoryFeatureValue extends string>({
  xAxis,
  yAxis,
  color,
  className,
  pointSize,
  alpha,
  onPointClick,
  onPointHoverStart,
  onPointHoverEnd,
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
  const setCanvasDimensions = useScatterplotStore(
    state => state.setPlotCanvasDimensionsDOM
  );

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

  const {
    width: canvasWidth = 0,
    height: canvasHeight = 0,
    ref: canvasRef,
  } = useResizeDetector();
  useEffect(() => {
    setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
  }, [canvasWidth, canvasHeight, setCanvasDimensions]);

  console.log('Scatterplot render');

  const [pointsKey, setPointsKey] = useState(0);
  useEffect(() => {
    setPointsKey(k => k + 1);
  }, [canvasWidth, canvasHeight]);

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
      {typeof color === 'object' && <Legend encodings={color.encodings} />}
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateAreas: "'y-axis canvas' '. x-axis'",
          gridTemplateColumns: '48px 1fr',
          gridTemplateRows: '1fr 48px',
        }}
      >
        <Canvas
          ref={canvasRef}
          camera={{ fov, near, far }}
          style={{ gridArea: 'canvas' }}
        >
          <Camera />
          <PointClickAndHover
            onPointClick={onPointClick}
            onPointHoverStart={onPointHoverStart}
            onPointHoverEnd={onPointHoverEnd}
          />
          {/* Points should rerender on every resize - using the key prop like this is my dirty hack for that lol */}
          <Points key={pointsKey} />
        </Canvas>
        <XAxis featureName={xFeature} gridArea="x-axis" />
        <YAxis featureName={yFeature} gridArea="y-axis" />
      </div>
    </>
  );
};
export default Scatterplot;