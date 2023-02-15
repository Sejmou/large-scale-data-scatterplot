import create from 'zustand';
import { PointRenderConfig } from './Points';

type State = {
  camPos: [number, number, number];
  fov: number;
  near: number;
  far: number;
  setCamPos: (newPos: [number, number, number]) => void;
  pointRenderConfigs: PointRenderConfig[];
  setPointRenderConfigs: (newConfigs: PointRenderConfig[]) => void;
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
  setCamPos: newPos => set({ camPos: newPos }),
  setPointRenderConfigs: newConfigs => set({ pointRenderConfigs: newConfigs }),
}));
