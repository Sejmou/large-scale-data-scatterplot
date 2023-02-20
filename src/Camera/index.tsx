import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useScatterplotStore } from '../store';
import { initializeCameraAndCreateZoomHandler } from './zoom';
import { PerspectiveCamera } from 'three';
import { select, zoomIdentity } from 'd3';
import { getScale } from '../utils';

const Camera = () => {
  const far = useScatterplotStore(state => state.far);
  const fov = useScatterplotStore(state => state.fov);

  const camera = useThree(state => state.camera);
  const canvas = useThree(state => state.gl.domElement);
  const setCamPos = useScatterplotStore(state => state.setCamPos);

  useEffect(() => {
    if (canvas && camera && camera instanceof PerspectiveCamera) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const perspectiveCamera = camera as PerspectiveCamera;
      setCamPos([
        perspectiveCamera.position.x,
        perspectiveCamera.position.y,
        perspectiveCamera.position.z,
      ]);
      const zoomHandler = initializeCameraAndCreateZoomHandler({
        camera: perspectiveCamera,
        width,
        height,
        setCamPos,
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
