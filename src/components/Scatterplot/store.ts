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
  camPos: [number, number, number];
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
  setCamPos: (newCamPos: [number, number, number]) => void;
};

const fov = 40;
const near = 1;
const far = 101;
const initialCamPos: [number, number, number] = [0, 0, far];

export const useScatterplotStore = create<State>(set => ({
  fov,
  near,
  far,
  pointRenderConfigs: [],
  pointSize: 12,
  alpha: 0.5,
  camPos: initialCamPos,
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
  setCamPos: newCamPos => set({ camPos: newCamPos }),
}));
