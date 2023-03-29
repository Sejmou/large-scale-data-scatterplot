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
import { useResizeDetector } from 'react-resize-detector';
import Legend from './Legend';
import ReactTooltip from 'react-tooltip';
import PlotSVGContent from './PlotSVGContent';

export type ScatterplotProps<CategoryFeatureValue extends string = string> = {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  color?:
    | VertexColorEncodingConfig<CategoryFeatureValue>
    | SingleVertexColorConfig;
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
  tooltipContent,
}: Pick<
  ScatterplotProps<CategoryFeatureValue>,
  'color' | 'tooltipContent'
>) => {
  const xData = useScatterplotStore(state => state.xAxisConfig.data);
  const yData = useScatterplotStore(state => state.yAxisConfig.data);
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

  console.log('Scatterplot render function running');

  const [pointsKey, setPointsKey] = useState(0);
  useEffect(() => {
    setPointsKey(k => k + 1);
  }, [canvasWidth, canvasHeight]);

  return (
    <div className="w-full h-full flex flex-col">
      {color?.mode === 'color-encodings' && (
        <Legend encodings={color.encodings} />
      )}
      <div className="w-full h-full flex-1 relative">
        <PlotSVGContent />
        <div
          className="relative"
          style={{
            width: `calc(100% - ${marginLeft + marginRight}px)`,
            height: `calc(100% - ${marginTop + marginBottom}px)`,
            transform: `translate(${marginLeft}px, ${marginTop}px)`,
          }}
        >
          <div className="h-full w-full" data-tip="">
            <Canvas ref={canvasRef} camera={{ fov, near, far }}>
              <Camera />
              <PointClickAndHover />
              {/* Points should rerender on every resize - using the key prop like this is my dirty hack for that lol */}
              <Points key={pointsKey} />
            </Canvas>
          </div>
          <ReactTooltip>{tooltipContent}</ReactTooltip>
        </div>
      </div>
    </div>
  );
};
export default Scatterplot;
