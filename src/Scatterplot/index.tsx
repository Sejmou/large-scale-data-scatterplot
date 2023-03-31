import { Canvas } from '@react-three/fiber';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Color } from 'three';
import { MapWithDefault } from './utils';
import Camera from './Camera';
import Points from './Points';
import {
  AxisConfigInternal,
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
import { Tooltip } from 'react-tooltip';
import PlotSVGContent from './PlotSVGContent';
import classNames from 'classnames';

export type AxisConfig = Omit<AxisConfigInternal, 'tickFormat'> & {
  tickFormat?: (value: number, index: number) => string;
}; // don't want to expose the internal tickFormat type (which would introduce a dependency on d3 for consumers of this library)

export type ScatterplotProps<CategoryFeatureValue extends string = string> = {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  color?:
    | VertexColorEncodingConfig<CategoryFeatureValue>
    | SingleVertexColorConfig;
  alpha?: number;
  pointSize?: number;
  className?: string;
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
  tooltipContent?: ReactNode;
  margins?: Partial<PlotMargins>;
  darkMode?: boolean;
};
const defaultColor = '#1DB954';
const Scatterplot = <CategoryFeatureValue extends string>(
  props: ScatterplotProps<CategoryFeatureValue>
) => {
  const store = useMemo(() => createScatterplotStore(), []); // store should not be recreated on every rerender of this component

  useEffect(() => {
    store.setState({
      xAxisConfig: {
        ...props.xAxis,
        tickFormat: props.xAxis.tickFormat as AxisConfigInternal['tickFormat'], // TODO: research whether this type assertion can be avoided or even causes issues
      },
    });
  }, [props.xAxis, store]);
  useEffect(() => {
    store.setState({
      yAxisConfig: {
        ...props.yAxis,
        tickFormat: props.yAxis.tickFormat as AxisConfigInternal['tickFormat'],
      },
    });
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
  useEffect(() => {
    const darkMode = props.darkMode;
    if (darkMode) {
      store.setState({ darkMode });
    }
    if (darkMode === false) {
      store.setState({ darkMode: false });
    }
  }, [props.darkMode, store]);

  return (
    <ScatterplotContext.Provider value={store}>
      <ScatterplotChild {...props} />
    </ScatterplotContext.Provider>
  );
};

const ScatterplotChild = <CategoryFeatureValue extends string>({
  color,
  tooltipContent,
  className,
}: Pick<
  ScatterplotProps<CategoryFeatureValue>,
  'color' | 'tooltipContent' | 'className'
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

  const tooltipAnchorId = useScatterplotStore(state => state.tooltipAnchorId);
  const tooltipPosition = useScatterplotStore(state => state.tooltipPosition);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const setCanvasWrapperElement = useScatterplotStore(
    state => state.setCanvasWrapperElement
  );
  useEffect(() => {
    if (canvasWrapperRef.current) {
      setCanvasWrapperElement(canvasWrapperRef.current);
    }
  }, [canvasWrapperRef, setCanvasWrapperElement]);

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

  const containerRef = useRef<HTMLDivElement>(null);
  const setPlotContainer = useScatterplotStore(
    store => store.setPlotContainerElement
  );
  useEffect(() => {
    if (containerRef.current) {
      setPlotContainer(containerRef.current);
    }
  }, [containerRef, setPlotContainer]);

  return (
    <div
      className={classNames('w-full h-full flex flex-col', className)}
      ref={containerRef}
    >
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
          <div
            className="h-full w-full"
            id={tooltipAnchorId}
            ref={canvasWrapperRef}
          >
            <Canvas ref={canvasRef} camera={{ fov, near, far }}>
              <Camera />
              <PointClickAndHover />
              {/* Points should rerender on every resize - using the key prop like this is my dirty hack for that lol */}
              <Points key={pointsKey} />
            </Canvas>
          </div>
          <Tooltip
            anchorSelect={'#' + tooltipAnchorId}
            position={tooltipPosition}
            float={false}
            className={classNames({ hidden: !tooltipPosition })}
          >
            {tooltipContent}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
export default Scatterplot;
