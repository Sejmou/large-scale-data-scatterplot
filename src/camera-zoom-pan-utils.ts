import { zoom, zoomIdentity } from 'd3';
import { PerspectiveCamera } from 'three';

export function setupZoom(params: {
  view: any;
  camera: PerspectiveCamera;
  far: number;
  near: number;
  width: number;
  height: number;
  fov: number;
}) {
  const { view, camera, far, near, width, height, fov } = params;
  const d3Zoom = createZoomHandler({
    far,
    near,
    camera,
    width,
    height,
    fov,
  });
  view.call(d3Zoom);
  const initialScale = getScale(far, fov, height);
  const initialTransform = zoomIdentity
    .translate(width / 2, height / 2)
    .scale(initialScale);
  d3Zoom.transform(view, initialTransform);
  camera.position.set(0, 0, far);
}

function createZoomHandler(params: {
  far: number;
  near: number;
  camera: PerspectiveCamera;
  width: number;
  height: number;
  fov: number;
}) {
  const { far, near, camera, width, height, fov } = params;
  const d3Zoom = zoom()
    .scaleExtent([getScale(far, fov, height), getScale(near, fov, height)])
    .on('zoom', (event: { transform: { x: number; y: number; k: number } }) => {
      console.log(event.transform.x, event.transform.y, event.transform.k);
      const scale = event.transform.k;
      const x = -(event.transform.x - width / 2) / scale;
      const y = (event.transform.y - height / 2) / scale;
      const z = getCameraZ(scale, fov, height);
      camera.position.set(x, y, z);
    });
  return d3Zoom;
}

function getScale(cameraZ: number, fov: number, height: number) {
  const halfFov = fov / 2;
  const halfFovRadians = toRadians(halfFov);
  const halfFovHeight = Math.tan(halfFovRadians) * cameraZ;
  const fovHeight = halfFovHeight * 2;
  return height / fovHeight;
}

function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

function getCameraZ(scale: number, fov: number, height: number) {
  const halfFov = fov / 2;
  const halfFovRadians = toRadians(halfFov);
  const scaleHeight = height / scale;
  return scaleHeight / (2 * Math.tan(halfFovRadians));
}
