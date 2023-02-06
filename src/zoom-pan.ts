import { D3ZoomEvent, zoom, zoomIdentity } from 'd3';
import { getCameraZ, getScale } from './utils';
import { PerspectiveCamera } from 'three';
import { computeViewportFillingPlaneDimensions } from './utils';

export default function setup(params: {
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
  // in this project, zooming is implemented by moving a camera that always looks in the same direction (z = -1)
  // and changing ONLY its position (x, y) and distance from the origin (z)
  const zoomedOutScale = getScale(far, fov, height);
  const zoomedInScale = getScale(near, fov, height);
  // when the camera is at the farthest distance from the origin, it should capture the entire pannable area and not be able to pan further
  // all scatter plot points are placed on this plane
  // if the camera is at the farthest possible distance from the origin, the scatter plot is "fully zoomed out"

  // this means that the observation with the largest x and y value will be a at the top right corner of the viewport
  // while the observation with the smallest x and y value will be at the bottom left corner of the viewport

  // we need to compute the width and height of the pannable area so that
  // we can set the translateExtent of the d3 zoom handler accordingly, preventing users from moving outside the scatter plot axes
  const { width: pannableAreaWidth, height: pannableAreHeight } =
    computeViewportFillingPlaneDimensions({
      distanceFromCamera: far,
      fov,
      aspectRatio: width / height,
    });
  const d3Zoom = zoom()
    .scaleExtent([zoomedOutScale, zoomedInScale])
    .translateExtent([
      [-pannableAreaWidth / 2, -pannableAreHeight / 2], // top left corner (note: y axis is inverted; if the camera is looking at x=0 and y=0 in world coordinates, we are NOT at x=0 and y=0 of scatter plot but rather center of the scatter plot)
      [pannableAreaWidth / 2, pannableAreHeight / 2], // bottom right corner
    ])
    .on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
      const { x, y, k: scale } = event.transform;
      const xTransformed = -(x - width / 2);
      const yTransformed = y - height / 2;

      const camX = xTransformed / scale;
      const camY = yTransformed / scale;
      const camZ = getCameraZ(scale, fov, height);

      camera.position.set(camX, camY, camZ);
    });
  return d3Zoom;
}
