import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useScatterplotStore } from '../store';
import { initializeCameraAndCreateZoomHandler } from './zoom';
import { PerspectiveCamera } from 'three';
import { select, zoomIdentity } from 'd3';
import { getCameraZ, getScale } from '../utils';

type Props = {};
const Camera = (props: Props) => {
  const camPos = useScatterplotStore(state => state.camPos);
  const setCamPos = useScatterplotStore(state => state.setCamPos);
  const far = useScatterplotStore(state => state.far);
  const near = useScatterplotStore(state => state.near);
  const fov = useScatterplotStore(state => state.fov);

  const camera = useThree(state => state.camera);
  const canvas = useThree(state => state.gl.domElement);

  useEffect(() => {
    if (canvas && camera && camera instanceof PerspectiveCamera) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const perspectiveCamera = camera as PerspectiveCamera;
      const zoomHandler = initializeCameraAndCreateZoomHandler({
        camera: perspectiveCamera,
        width,
        height,
      });
      const chart = select(canvas) as any; // don't know how to type this
      chart.call(zoomHandler);
      const initialScale = getScale(far, fov, height);
      const initialTransform = zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale);
      zoomHandler.transform(chart, initialTransform);
    }
  }, [camera, canvas]);

  return <></>; // TODO: there must be a cleaner way to access state from Three.js than this hack with using a nested element inside the Canvas that doesn't return any JSX element lol
};
export default Camera;
