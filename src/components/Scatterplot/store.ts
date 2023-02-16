import { ScaleLinear } from 'd3';
import { PerspectiveCamera, Points } from 'three';
import create from 'zustand';
import { PointRenderConfig } from './Points';

type State = {
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
  camera?: PerspectiveCamera;
  pointRenderConfigs: PointRenderConfig[];
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
  setCamera: (newCamera: PerspectiveCamera) => void;
};

const fov = 40;
const near = 1;
const far = 101;

export const useScatterplotStore = create<State>(set => ({
  fov,
  near,
  far,
  pointRenderConfigs: [],
  pointSize: 12,
  alpha: 0.5,
  setPointRenderConfigs: newConfigs => set({ pointRenderConfigs: newConfigs }),
  setCurrentPoints: newPoints => set({ currentPoints: newPoints }),
  setPointSize: newSize => set({ pointSize: newSize }),
  setAlpha: newAlpha => set({ alpha: newAlpha }),
  setXScaleWorldCoordinates: newScale =>
    set({ xScaleWorldCoordinates: newScale }),
  setYScaleWorldCoordinates: newScale =>
    set({ yScaleWorldCoordinates: newScale }),
  setXScaleDOMPixels: newScale => set({ xScaleDOMPixels: newScale }),
  setYScaleDOMPixels: newScale => set({ yScaleDOMPixels: newScale }),
  setCamera: newCamera => set({ camera: newCamera }),
}));
