import { scaleLog, ZoomBehavior } from 'd3';
import { Object3D, PerspectiveCamera, Points, Raycaster, Scene } from 'three';
import { createPoints, PointRenderConfig } from './render';
import { getScale } from './utils';

export default function setup(params: {
  camera: PerspectiveCamera;
  scatterPoints: Points;
  view: any;
  scene: Scene;
  renderConfigs: PointRenderConfig[];
  width: number;
  height: number;
  zoom: ZoomBehavior<Element, unknown>;
  far: number;
  near: number;
}) {
  const {
    camera,
    scatterPoints,
    view,
    scene,
    renderConfigs,
    width,
    height,
    zoom,
    far,
    near,
  } = params;
  const hoverContainer = new Object3D();
  scene.add(hoverContainer);

  const zoomedInScale = getScale(near, camera.fov, height);
  const zoomedOutScale = getScale(far, camera.fov, height);
  const raycasterPointsThresholdScale = scaleLog()
    .domain([zoomedOutScale, zoomedInScale])
    .range([1, 0.05]);

  const raycaster = new Raycaster();
  zoom.on('zoom.tooltip', () => {
    // zoom.tooltip is syntax for namespacing events: https://stackoverflow.com/a/14753683/13727176
    const scale = getScale(camera.position.z, camera.fov, height);
    // I am making the threshold for the raycaster points depending on the zoom scale
    // as per default with a larger zoom level points are highlighted even if the distance between the mouse and the point (in pixel coordinates) is large
    // to understand the issue it is best to comment out the following line, zoom in and out and observe when a particular point is highlighted
    raycaster.params!.Points!.threshold = raycasterPointsThresholdScale(scale);
  });

  view.on('mousemove', (event: MouseEvent) => {
    const canvasRect = (
      event.target as HTMLCanvasElement
    ).getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    checkForAndHandleIntersects({
      raycaster,
      camera,
      scatterPoints,
      mouseX: x,
      mouseY: y,
      hoverContainer,
      renderConfigs,
      width,
      height,
    });
  });

  view.on('mouseleave', () => {
    removeHighlights(hoverContainer);
  });
}

function mouseToThree(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
) {
  const x = (mouseX / width) * 2 - 1;
  const y = -(mouseY / height) * 2 + 1;
  return { x, y };
}

function checkForAndHandleIntersects(params: {
  raycaster: Raycaster;
  camera: PerspectiveCamera;
  scatterPoints: Points;
  mouseX: number;
  mouseY: number;
  hoverContainer: Object3D;
  renderConfigs: PointRenderConfig[];
  width: number;
  height: number;
}) {
  const {
    raycaster,
    camera,
    scatterPoints,
    mouseX,
    mouseY,
    hoverContainer,
    renderConfigs,
    width,
    height,
  } = params;
  const mouseVector = mouseToThree(mouseX, mouseY, width, height);
  raycaster.setFromCamera(mouseVector, camera);
  const intersects = raycaster.intersectObject(scatterPoints);
  if (intersects.length > 0) {
    const sortedIntersects = [...intersects].sort(
      (a, b) => a.distanceToRay! - b.distanceToRay!
    );
    const pointConfig = renderConfigs[sortedIntersects[0].index!];
    highlightPoint(pointConfig, hoverContainer);
  } else {
    removeHighlights(hoverContainer);
  }
}

function highlightPoint(
  pointConfig: PointRenderConfig,
  hoverContainer: Object3D
) {
  removeHighlights(hoverContainer); // if we don't remove previous highlights, we'll end up with a bunch of points rendered on top of each other
  const highlightedPoint = createPoints({
    pointConfigs: [pointConfig],
    size: 24,
  });
  hoverContainer.add(highlightedPoint);
}

function removeHighlights(hoverContainer: Object3D) {
  hoverContainer.remove(...hoverContainer.children);
}
