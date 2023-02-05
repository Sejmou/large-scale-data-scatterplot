import { zoom, zoomIdentity } from 'd3';
import { PerspectiveCamera } from 'three';

export function setup(params: {
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

  // The camera is now at (0, 0, far) and looks at (0, 0, 0)
  // The scatterplot plane should fill the entire view frustum of the camera at its current position.
  // We compute the dimensions of the plane and return them
  // so that we can use them to scale the scatterplot points.
  return computeScaterplotPlaneDimensions(
    camera.position.z,
    fov,
    width,
    height
  );
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

export function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

function getCameraZ(scale: number, fov: number, height: number) {
  const halfFov = fov / 2;
  const halfFovRadians = toRadians(halfFov);
  const scaleHeight = height / scale;
  return scaleHeight / (2 * Math.tan(halfFovRadians));
}

function computeScaterplotPlaneDimensions(
  cameraZ: number,
  fov: number,
  width: number,
  height: number
) {
  // The scatterplot plane should fill the entire view frustum of the camera at its current position.
  // ChatGPT taught me how to compute this lol
  const aspectRatio = width / height;
  const scatterplotPlaneWidthIn3DSpace =
    2 * cameraZ * Math.tan(toRadians(fov) / 2) * aspectRatio;
  const scatterplotPlaneHeightIn3DSpace =
    scatterplotPlaneWidthIn3DSpace / aspectRatio;
  return {
    scatterplotPlaneWidth: scatterplotPlaneWidthIn3DSpace,
    scatterPlotPlaneHeight: scatterplotPlaneHeightIn3DSpace,
  };
}
