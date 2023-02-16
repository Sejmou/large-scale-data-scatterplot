import { ScaleLinear } from 'd3';
import { Points } from 'three';
import create from 'zustand';
import { PointRenderConfig } from './Points';

type State = {
  camPos: [number, number, number];
  fov: number;
  near: number;
  far: number;
  pointSize: number;
  alpha: number;
  currentPoints?: Points;
  xScaleWorldCoordinates?: ScaleLinear<number, number, never>;
  yScaleWorldCoordinates?: ScaleLinear<number, number, never>;
  pointRenderConfigs: PointRenderConfig[];
  setCamPos: (newPos: [number, number, number]) => void;
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
};

const fov = 40;
const near = 1;
const far = 101;
const initialCamPos: [number, number, number] = [0, 0, far];

export const useScatterplotStore = create<State>(set => ({
  fov,
  near,
  far,
  camPos: initialCamPos,
  pointRenderConfigs: [],
  pointSize: 12,
  alpha: 0.5,
  setCamPos: newPos => set({ camPos: newPos }),
  setPointRenderConfigs: newConfigs => set({ pointRenderConfigs: newConfigs }),
  setCurrentPoints: newPoints => set({ currentPoints: newPoints }),
  setPointSize: newSize => set({ pointSize: newSize }),
  setAlpha: newAlpha => set({ alpha: newAlpha }),
  setXScaleWorldCoordinates: newScale =>
    set({ xScaleWorldCoordinates: newScale }),
  setYScaleWorldCoordinates: newScale =>
    set({ yScaleWorldCoordinates: newScale }),
}));
