import { Object3D, PerspectiveCamera, Points, Raycaster, Scene } from 'three';
import { createPoints, PointRenderConfig } from './render';

export default function setup(params: {
  camera: PerspectiveCamera;
  scatterPoints: Points;
  view: any;
  scene: Scene;
  renderConfigs: PointRenderConfig[];
}) {
  const { camera, scatterPoints, view, scene, renderConfigs } = params;
  const hoverContainer = new Object3D();
  scene.add(hoverContainer);

  const raycaster = new Raycaster();

  view.on('mousemove', (event: { pageX: number; pageY: number }) => {
    const { pageX, pageY } = event;
    checkForAndHandleIntersects({
      raycaster,
      camera,
      scatterPoints,
      mouseX: pageX,
      mouseY: pageY,
      hoverContainer,
      renderConfigs,
    });
  });
}

function mouseToThree(mouseX: number, mouseY: number) {
  const x = (mouseX / window.innerWidth) * 2 - 1;
  const y = -(mouseY / window.innerHeight) * 2 + 1;
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
}) {
  const {
    raycaster,
    camera,
    scatterPoints,
    mouseX,
    mouseY,
    hoverContainer,
    renderConfigs,
  } = params;
  const mouseVector = mouseToThree(mouseX, mouseY);
  raycaster.setFromCamera(mouseVector, camera);
  const intersects = raycaster.intersectObject(scatterPoints);
  if (intersects.length > 0) {
    const sortedIntersects = [...intersects].sort(
      (a, b) => a.distanceToRay! - b.distanceToRay!
    );
    const pointConfig = renderConfigs[sortedIntersects[0].index!];
    // console.log('hovering point', pointConfig);
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
