import { ScaleLinear } from 'd3';
import { Color, Points } from 'three';
import { createStore, useStore } from 'zustand';
import { ReactNode, createContext, useContext } from 'react';
import { devtools } from 'zustand/middleware';

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

type State<CategoryFeatureValue extends string = string> = {
  xAxisConfig: AxisConfig;
  yAxisConfig: AxisConfig;
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
  setXAxisConfig: (newConfig: AxisConfig) => void;
  setYAxisConfig: (newConfig: AxisConfig) => void;
  setColorConfig: (
    newConfig:
      | VertexColorEncodingConfig<CategoryFeatureValue>
      | SingleVertexColorConfig
      | undefined
  ) => void;
  setOnPointClick: (
    newCallback: ((pointIndex: number) => void) | undefined
  ) => void;
  setOnPointHoverStart: (
    newCallback: ((pointIndex: number) => void) | undefined
  ) => void;
  setOnPointHoverEnd: (newCallback: (() => void) | undefined) => void;
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
};

const fov = 40;
const near = 1;
const far = 101;
const initialCamPos: [number, number, number] = [0, 0, far];
const dummyAxisConfig: AxisConfig = {
  data: [],
  featureName: 'No feature provided',
  beginAtZero: true,
};

export const createScatterplotStore = <
  CategoryFeatureValue extends string
>() => {
  console.log('creating new scatterplot store');
  return createStore<
    State<CategoryFeatureValue>,
    [['zustand/devtools', never]]
  >(
    devtools(set => ({
      fov,
      near,
      far,
      pointRenderConfigs: [],
      pointSize: 12,
      alpha: 0.5,
      camPos: initialCamPos,
      xAxisConfig: dummyAxisConfig,
      yAxisConfig: dummyAxisConfig,
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
      setXAxisConfig: (newConfig: AxisConfig) =>
        set({ xAxisConfig: newConfig }),
      setYAxisConfig: (newConfig: AxisConfig) =>
        set({ yAxisConfig: newConfig }),
      setColorConfig: (
        newConfig:
          | VertexColorEncodingConfig<CategoryFeatureValue>
          | SingleVertexColorConfig
          | undefined
      ) => set({ colorConfig: newConfig }),
      setOnPointClick: (
        newCallback: ((pointIndex: number) => void) | undefined
      ) => set({ onPointClick: newCallback }),
      setOnPointHoverStart: (
        newCallback: ((pointIndex: number) => void) | undefined
      ) => set({ onPointHoverStart: newCallback }),
      setOnPointHoverEnd: (newCallback: (() => void) | undefined) =>
        set({ onPointHoverEnd: newCallback }),
    }))
  );
};

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
