import create from 'zustand';

type State = {
  camPos: [number, number, number];
  fov: number;
  near: number;
  far: number;
  setCamPos: (newPos: [number, number, number]) => void;
};

const fov = 40;
const near = 1;
const far = 101;
const initialCamPos: [number, number, number] = [0, 0, 10];

export const useScatterplotStore = create<State>(set => ({
  fov,
  near,
  far,
  camPos: initialCamPos,
  setCamPos: newPos => set({ camPos: newPos }),
}));
