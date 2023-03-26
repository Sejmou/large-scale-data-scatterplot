import { Canvas } from '@react-three/fiber';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Color } from 'three';
import { MapWithDefault } from './utils';
import Camera from './Camera';
import Points from './Points';
import {
  AxisConfig,
  createScatterplotStore,
  PlotMargins,
  ScatterplotContext,
  SingleVertexColorConfig,
  useScatterplotStore,
  VertexColorEncodingConfig,
} from './store';
import PointClickAndHover from './PointClickAndHover';
import YAxis from './YAxis';
import XAxis from './XAxis';
import { useResizeDetector } from 'react-resize-detector';
import Legend from './Legend';
import ReactTooltip from 'react-tooltip';
import GridLines from './GridLines';

const debug = true;

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
  margins?: Partial<PlotMargins>;
};
const defaultColor = '#1DB954';

const Scatterplot = <CategoryFeatureValue extends string>(
  props: ScatterplotProps<CategoryFeatureValue>
) => {
  const store = useMemo(() => createScatterplotStore(), []); // store should not be recreated on every rerender of this component

  useEffect(() => {
    store.setState({ xAxisConfig: props.xAxis });
  }, [props.xAxis, store]);
  useEffect(() => {
    store.setState({ yAxisConfig: props.yAxis });
  }, [props.yAxis, store]);
  useEffect(() => {
    const pointSize = props.pointSize;
    if (pointSize) {
      store.setState({ pointSize });
    }
  }, [props.pointSize, store]);
  useEffect(() => {
    const alpha = props.alpha;
    if (alpha) {
      store.setState({ alpha });
    }
  }, [props.alpha, store]);
  useEffect(() => {
    const color = props.color;
    if (color) {
      store.setState({ colorConfig: color });
    } else {
      store.setState({
        colorConfig: { mode: 'same-for-all', value: defaultColor },
      });
    }
  }, [props.color, store]);
  useEffect(() => {
    const onPointClick = props.onPointClick;
    if (onPointClick) {
      store.setState({ onPointClick });
    }
  }, [props.onPointClick, store]);
  useEffect(() => {
    const onPointHoverStart = props.onPointHoverStart;
    if (onPointHoverStart) {
      store.setState({ onPointHoverStart });
    }
  }, [props.onPointHoverStart, store]);
  useEffect(() => {
    const onPointHoverEnd = props.onPointHoverEnd;
    if (onPointHoverEnd) {
      store.setState({ onPointHoverEnd });
    }
  }, [props.onPointHoverEnd, store]);
  useEffect(() => {
    const marginLeft = props.margins?.left;
    if (marginLeft) {
      store.setState(state => {
        state.plotMargins.left = marginLeft;
      });
    }
  }, [props.margins?.left, store]);
  useEffect(() => {
    const marginRight = props.margins?.right;
    if (marginRight) {
      store.setState(state => {
        state.plotMargins.right = marginRight;
      });
    }
  }, [props.margins?.right, store]);
  useEffect(() => {
    const marginTop = props.margins?.top;
    if (marginTop) {
      store.setState(state => {
        state.plotMargins.top = marginTop;
      });
    }
  }, [props.margins?.top, store]);
  useEffect(() => {
    const marginBottom = props.margins?.bottom;
    if (marginBottom) {
      store.setState(state => {
        state.plotMargins.bottom = marginBottom;
      });
    }
  }, [props.margins?.bottom, store]);

  return (
    <ScatterplotContext.Provider value={store}>
      <ScatterplotChild {...props} />
    </ScatterplotContext.Provider>
  );
};

const ScatterplotChild = <CategoryFeatureValue extends string>({
  color,
  className,
  tooltipContent,
}: Pick<
  ScatterplotProps<CategoryFeatureValue>,
  'color' | 'className' | 'tooltipContent'
>) => {
  const xAxisConfig = useScatterplotStore(state => state.xAxisConfig);
  const yAxisConfig = useScatterplotStore(state => state.yAxisConfig);
  const { data: xData, featureName: xFeature } = xAxisConfig;
  const { data: yData, featureName: yFeature } = yAxisConfig;
  const setPointRenderConfigs = useScatterplotStore(
    state => state.setPointRenderConfigs
  );
  const fov = useScatterplotStore(state => state.fov);
  const near = useScatterplotStore(state => state.near);
  const far = useScatterplotStore(state => state.far);
  const setCanvasDimensions = useScatterplotStore(
    state => state.setPlotCanvasDimensionsDOM
  );
  const marginTop = useScatterplotStore(state => state.plotMargins.top);
  const marginRight = useScatterplotStore(state => state.plotMargins.right);
  const marginBottom = useScatterplotStore(state => state.plotMargins.bottom);
  const marginLeft = useScatterplotStore(state => state.plotMargins.left);

  const fillColorMap = useMemo(() => {
    if (color?.mode === 'same-for-all')
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
  }, [xData, yData, fillColorMap, setPointRenderConfigs, color]);

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
          {color?.mode === 'color-encodings' && (
            <div>Currently color-encoding {color.featureName}</div>
          )}
        </div>
      )}
      {color?.mode === 'color-encodings' && (
        <Legend encodings={color.encodings} />
      )}
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateAreas: "'y-axis canvas' '. x-axis'",
          gridTemplateColumns: `${marginLeft}px 1fr`,
          gridTemplateRows: `1fr ${marginBottom}px`,
          marginTop,
          marginRight,
        }}
        data-tip=""
      >
        <Canvas
          ref={canvasRef}
          camera={{ fov, near, far }}
          style={{ gridArea: 'canvas' }}
        >
          <Camera />
          <PointClickAndHover />
          {/* Points should rerender on every resize - using the key prop like this is my dirty hack for that lol */}
          <Points key={pointsKey} />
        </Canvas>
        <GridLines gridArea="canvas" />
        <XAxis gridArea="x-axis" />
        <YAxis gridArea="y-axis" />
      </div>
      <ReactTooltip>{tooltipContent}</ReactTooltip>
    </>
  );
};
export default Scatterplot;
