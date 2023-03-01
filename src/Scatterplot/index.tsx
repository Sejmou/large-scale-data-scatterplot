import { Canvas } from '@react-three/fiber';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Color } from 'three';
import { MapWithDefault } from './utils';
import Camera from './Camera';
import Points from './Points';
import {
  createScatterplotStore,
  ScatterplotStoreProvider,
  useScatterplotStore,
} from './store';
import PointClickAndHover from './PointClickAndHover';
import YAxis from './YAxis';
import XAxis from './XAxis';
import { useResizeDetector } from 'react-resize-detector';
import Legend from './Legend';
import ReactTooltip from 'react-tooltip';

const debug = false;

export type AxisConfig = {
  data: number[];
  featureName: string;
  beginAtZero?: boolean;
};

type CSSHexColorString = `#${string}`;

export type SingleVertexColorConfig = {
  mode: 'same-for-all';
  value: CSSHexColorString;
};

export type VertexColorEncodingConfig<
  CategoryFeatureValue extends string = string
> = {
  mode: 'color-encodings';
  featureName: string;
  data: string[];
  encodings: [CategoryFeatureValue, CSSHexColorString][];
};

export type ScatterplotProps<CategoryFeatureValue extends string = string> = {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  color?:
    | VertexColorEncodingConfig<CategoryFeatureValue>
    | SingleVertexColorConfig;
  className?: string;
  alpha?: number;
  pointSize?: number;
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
  tooltipContent?: ReactNode;
};
const defaultColor = '#1DB954';

const Scatterplot = <CategoryFeatureValue extends string>(
  props: ScatterplotProps<CategoryFeatureValue>
) => {
  return (
    <ScatterplotStoreProvider createStore={createScatterplotStore}>
      <ScatterplotChild {...props} />
    </ScatterplotStoreProvider>
  );
};

const ScatterplotChild = <CategoryFeatureValue extends string>({
  xAxis,
  yAxis,
  color,
  className,
  pointSize,
  alpha,
  onPointClick,
  onPointHoverStart,
  onPointHoverEnd,
  tooltipContent,
}: ScatterplotProps<CategoryFeatureValue>) => {
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

  const fillColorMap = useMemo(() => {
    if (color?.mode == 'same-for-all')
      return new MapWithDefault<string, string>(() => color.value);
    if (color?.mode === 'color-encodings') {
      return new MapWithDefault<string, string>(
        () => defaultColor,
        color.encodings
      );
    }
    return new MapWithDefault<string, string>(() => defaultColor);
  }, [color]);

  useEffect(() => {
    const renderConfigs = xData.map((x, i) => ({
      x,
      y: yData[i],
      color: new Color(
        Number(
          fillColorMap
            .get(color?.mode === 'color-encodings' ? color.data[i] : '')
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
          {color?.mode == 'color-encodings' && (
            <div>Currently color-encoding {color.featureName}</div>
          )}
        </div>
      )}
      {color?.mode == 'color-encodings' && (
        <Legend encodings={color.encodings} />
      )}
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateAreas: "'y-axis canvas' '. x-axis'",
          gridTemplateColumns: '48px 1fr',
          gridTemplateRows: '1fr 48px',
        }}
        data-tip=""
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
      <ReactTooltip>{tooltipContent}</ReactTooltip>
    </>
  );
};
export default Scatterplot;
