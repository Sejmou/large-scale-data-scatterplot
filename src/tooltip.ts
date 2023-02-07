import { Object3D, PerspectiveCamera, Points, Raycaster, Scene } from 'three';
import { createPoints, PointRenderConfig } from './render';

export default function setup(params: {
  camera: PerspectiveCamera;
  scatterPoints: Points;
  view: any;
  scene: Scene;
  renderConfigs: PointRenderConfig[];
  width: number;
  height: number;
}) {
  const { camera, scatterPoints, view, scene, renderConfigs, width, height } =
    params;
  const hoverContainer = new Object3D();
  scene.add(hoverContainer);

  const raycaster = new Raycaster();
  raycaster.params!.Points!.threshold = 1; // setting this to a higher value (default 1) makes it easier to hover over points - issue: when scaled in, this triggers even when point is far from being hovered

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
  const highlightedPoint = createPoints([pointConfig], 24);
  hoverContainer.add(highlightedPoint);
}

function removeHighlights(hoverContainer: Object3D) {
  hoverContainer.remove(...hoverContainer.children);
}
