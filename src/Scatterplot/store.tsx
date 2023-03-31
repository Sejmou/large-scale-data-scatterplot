import { NumberValue, ScaleLinear } from 'd3';
import { Color, Points } from 'three';
import { createStore, useStore } from 'zustand';
import { ReactNode, createContext, useContext } from 'react';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// note: we want to use a separate store for every scatterplot instance
// so that we can have multiple scatterplots with different configs on the same page
// to achieve this, we need to use a context provider for the store and wrap it around each created scatterplot
// therefore we don't just use zustand's create() function here, but instead do other stuff
// too lazy to explain in detail, but the following GitHub discussion talks about a similar problem and the solution:
// see also: https://github.com/pmndrs/zustand/blob/main/docs/previous-versions/zustand-v3-create-context.md#migration
// and a live demo of using separate store instances per component (which is exactly what I needed for my scatterplot as well): https://codesandbox.io/s/polished-pond-4jn1e2?file=/src/App.tsx:499-572

type PointRenderConfig = {
  x: number;
  y: number;
  color: Color;
};

export type AxisConfigInternal = {
  data: number[];
  featureName: string;
  beginAtZero?: boolean;
  tickFormat?: (domainValue: NumberValue, index: number) => string;
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

export type PlotMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type State<CategoryFeatureValue extends string = string> = {
  xAxisConfig: AxisConfigInternal;
  yAxisConfig: AxisConfigInternal;
  colorConfig?:
    | VertexColorEncodingConfig<CategoryFeatureValue>
    | SingleVertexColorConfig;
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
  tooltipContent?: ReactNode;
  fov: number;
  near: number;
  far: number;
  pointSize: number;
  alpha: number;
  currentPoints?: Points;
  xScaleWorldCoordinates?: ScaleLinear<number, number, never>;
  yScaleWorldCoordinates?: ScaleLinear<number, number, never>;
  xScaleDOMPixels?: ScaleLinear<number, number, never>;
  yScaleDOMPixels?: ScaleLinear<number, number, never>;
  xScaleWorldToData?: ScaleLinear<number, number, never>;
  yScaleWorldToData?: ScaleLinear<number, number, never>;
  camPos: [number, number, number];
  pointRenderConfigs: PointRenderConfig[];
  plotPlaneDimensionsWorld?: {
    width: number;
    height: number;
  };
  plotCanvasDimensionsDOM?: {
    width: number;
    height: number;
  };
  plotMargins: PlotMargins;

  darkMode: boolean;

  tooltipAnchorId: string; // required for react-tooltip
  tooltipPosition?: {
    // position (in absolute screen coordinates) where tooltip should be placed - defined if there is a currently hovered/selected point
    x: number;
    y: number;
  };
  activePointIndex?: number; // index of currently hovered (or otherwise selected) point in scatterplot
  canvasWrapperElement?: HTMLDivElement; // reference to the div element that wraps the canvas element (required for tooltip positioning)
  setCanvasWrapperElement: (newElement: HTMLDivElement) => void;

  plotContainerElement?: HTMLDivElement; // reference to the div element that wraps the entire plot area (required for axis label positioning)
  setPlotContainerElement: (newElement: HTMLDivElement) => void;

  setPointRenderConfigs: (newConfigs: PointRenderConfig[]) => void;
  setCurrentPoints: (newPoints: Points) => void;
  setPointSize: (newSize: number) => void;
  setAlpha: (newAlpha: number) => void;
  setXScaleWorldCoordinates: (
    newScale: ScaleLinear<number, number, never>
  ) => void;
  setYScaleWorldCoordinates: (
    newScale: ScaleLinear<number, number, never>
  ) => void;
  setXScaleDOMPixels: (newScale: ScaleLinear<number, number, never>) => void;
  setYScaleDOMPixels: (newScale: ScaleLinear<number, number, never>) => void;
  setXScaleWorldToData: (newScale: ScaleLinear<number, number, never>) => void;
  setYScaleWorldToData: (newScale: ScaleLinear<number, number, never>) => void;
  setCamPos: (newCamPos: [number, number, number]) => void;
  setPlotPlaneDimensionsWorld: (newDimensions: {
    width: number;
    height: number;
  }) => void;
  setPlotCanvasDimensionsDOM: (newDimensions: {
    width: number;
    height: number;
  }) => void;
  setActivePoint: (
    idx: number,
    posWorldCoordinates: { x: number; y: number }
  ) => void;
  removeActivePoint: () => void;
};

const fov = 40;
const near = 1;
const far = 101;
const initialCamPos: [number, number, number] = [0, 0, far];
const dummyAxisConfig: AxisConfigInternal = {
  data: [],
  featureName: 'No feature provided',
  beginAtZero: true,
};
const defaultMargins: PlotMargins = {
  top: 20,
  right: 20,
  bottom: 48,
  left: 48,
};

export const createScatterplotStore = <
  CategoryFeatureValue extends string
>() => {
  console.log('creating new scatterplot store');
  return createStore<
    State<CategoryFeatureValue>,
    [['zustand/devtools', never], ['zustand/immer', never]]
  >(
    devtools(
      immer((set, get) => ({
        fov,
        near,
        far,
        pointRenderConfigs: [],
        pointSize: 12,
        alpha: 0.5,
        camPos: initialCamPos,
        xAxisConfig: dummyAxisConfig,
        yAxisConfig: dummyAxisConfig,
        plotMargins: defaultMargins,
        darkMode: false,
        tooltipAnchorId: createAnchorId(),
        setPointRenderConfigs: newConfigs =>
          set({ pointRenderConfigs: newConfigs }),
        setCurrentPoints: newPoints => set({ currentPoints: newPoints }),
        setPointSize: newSize => set({ pointSize: newSize }),
        setAlpha: newAlpha => set({ alpha: newAlpha }),
        setXScaleWorldCoordinates: newScale =>
          set({ xScaleWorldCoordinates: newScale }),
        setYScaleWorldCoordinates: newScale =>
          set({ yScaleWorldCoordinates: newScale }),
        setXScaleDOMPixels: newScale => set({ xScaleDOMPixels: newScale }),
        setYScaleDOMPixels: newScale => set({ yScaleDOMPixels: newScale }),
        setXScaleWorldToData: newScale => set({ xScaleWorldToData: newScale }),
        setYScaleWorldToData: newScale => set({ yScaleWorldToData: newScale }),
        setCamPos: newCamPos => set({ camPos: newCamPos }),
        setPlotPlaneDimensionsWorld: newDimensions =>
          set({ plotPlaneDimensionsWorld: newDimensions }),
        setPlotCanvasDimensionsDOM: newDimensions =>
          set({ plotCanvasDimensionsDOM: newDimensions }),
        setActivePoint: (idx, posWorld) => {
          const canvasWrapper = get().canvasWrapperElement;
          if (canvasWrapper === undefined) {
            console.warn(
              'canvas wrapper element undefined, cannot set tooltip position'
            );
            return;
          }

          const xScaleDOMPixels = get().xScaleDOMPixels;
          const yScaleDOMPixels = get().yScaleDOMPixels;

          const xScaleWorldToData = get().xScaleWorldToData;
          const yScaleWorldToData = get().yScaleWorldToData;

          if (
            !xScaleDOMPixels ||
            !yScaleDOMPixels ||
            !xScaleWorldToData ||
            !yScaleWorldToData
          ) {
            console.warn('some scales undefined, cannot set tooltip position');
            return;
          }

          const canvasPosX = xScaleDOMPixels(xScaleWorldToData(posWorld.x));
          const canvasPosY = yScaleDOMPixels(yScaleWorldToData(posWorld.y));

          const { x: canvasWrapperLeft, y: canvasWrapperTop } =
            canvasWrapper.getBoundingClientRect();

          const tooltipPosition = {
            x: canvasWrapperLeft + canvasPosX,
            y: canvasWrapperTop + canvasPosY,
          };

          console.log(
            canvasWrapper.offsetLeft,
            canvasWrapper.offsetTop,
            tooltipPosition
          );

          set({
            activePointIndex: idx,
            tooltipPosition,
          });
        },
        removeActivePoint: () =>
          set({ activePointIndex: undefined, tooltipPosition: undefined }),
        setCanvasWrapperElement: newElement =>
          set({ canvasWrapperElement: newElement }),
        setPlotContainerElement: newElement =>
          set({ plotContainerElement: newElement }),
      }))
    )
  );
};

function createAnchorId() {
  return `scatterplot-tooltip-anchor-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

export const ScatterplotContext = createContext<ReturnType<
  typeof createScatterplotStore
> | null>(null);

export const useScatterplotStore = <T,>(selector: (state: State) => T) => {
  const store = useContext(ScatterplotContext);
  if (store === null) {
    throw new Error('no provider');
  }
  return useStore(store, selector);
};
