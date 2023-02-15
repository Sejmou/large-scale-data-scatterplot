import { D3ZoomEvent, scaleLinear, zoom } from 'd3';
import { PerspectiveCamera } from 'three';
import {
  computeViewportFillingPlaneDimensions,
  getCameraZ,
  getScale,
} from '../utils';

export function initializeCameraAndCreateZoomHandler(params: {
  camera: PerspectiveCamera;
  width: number;
  height: number;
  // axesGroupsAndScales: AxesGroupsAndScales;
}) {
  const { camera, width, height } = params;
  // in this project, zooming is implemented by moving a camera that always looks in the same direction (z = -1)
  // and changing ONLY its position (x, y) and distance from the origin (z)
  const zoomedOutScale = getScale(camera.far, camera.fov, height);
  const zoomedInScale = getScale(camera.near, camera.fov, height);
  // when the camera is at the farthest distance from the origin, it should capture the entire pannable area and not be able to pan further
  // if the camera is at the farthest possible distance from the origin, the scatter plot is "fully zoomed out"
  // then, all scatter plot points are placed on a plane that spans the entire pannable area
  // this means that the observation with the largest x and y value will be a at the top right corner of the viewport
  // while the observation with the smallest x and y value will be at the bottom left corner of the viewport

  // we need to compute the width and height of the pannable area so that
  // we can set the translateExtent of the d3 zoom handler accordingly, preventing users from moving outside the scatter plot axes
  const { width: pannableAreaWidth, height: pannableAreaHeight } =
    computeViewportFillingPlaneDimensions({
      distanceFromCamera: camera.far,
      fov: camera.fov,
      aspectRatio: camera.aspect,
    });

  // const { xAxisGroup, yAxisGroup, xScale, yScale, xAxis, yAxis } =
  //   params.axesGroupsAndScales;

  // const worldXToDataX = scaleLinear()
  //   .domain([-pannableAreaWidth / 2, pannableAreaWidth / 2])
  //   .range(xScale.domain());
  // const worldYToDataY = scaleLinear()
  //   .domain([-pannableAreaHeight / 2, pannableAreaHeight / 2])
  //   .range(yScale.domain());

  const d3Zoom = zoom()
    .scaleExtent([zoomedOutScale, zoomedInScale])
    .translateExtent([
      [-pannableAreaWidth / 2, -pannableAreaHeight / 2], // top left corner (note: y axis is inverted; if the camera is looking at x=0 and y=0 in world coordinates, we are NOT at x=0 and y=0 of scatter plot but rather center of the scatter plot)
      [pannableAreaWidth / 2, pannableAreaHeight / 2], // bottom right corner
    ])
    .on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
      const { x, y, k: scale } = event.transform;
      const xTransformed = -(x - width / 2);
      const yTransformed = y - height / 2;

      // update camera position (compute coordinates in 3D space)
      const camX = xTransformed / scale;
      const camY = yTransformed / scale;
      const camZ = getCameraZ(scale, camera.fov, height);
      camera.position.set(camX, camY, camZ);

      // convert coordinates of currently panned area (3D space!) to data range
      const pannedAreaWidth = width / scale;
      const pannedAreaLeft = camX - pannedAreaWidth / 2;
      const pannedAreaRight = camX + pannedAreaWidth / 2;
      const pannedAreaHeight = height / scale;
      const pannedAreaTop = camY + pannedAreaHeight / 2;
      const pannedAreaBottom = camY - pannedAreaHeight / 2;

      // create scales for axes
      // const newScaleX = scaleLinear()
      //   .domain([worldXToDataX(pannedAreaLeft), worldXToDataX(pannedAreaRight)])
      //   .range([0, width]);
      // const newScaleY = scaleLinear()
      //   .domain([worldYToDataY(pannedAreaBottom), worldYToDataY(pannedAreaTop)])
      //   .range([height, 0]);

      // // update axes
      // xAxisGroup.call(xAxis.scale(newScaleX));
      // yAxisGroup.call(yAxis.scale(newScaleY));
    });
  return d3Zoom;
}