import { PerspectiveCamera, Points, Raycaster } from 'three';
import { TrackData } from './data';

export default function setup(params: {
  camera: PerspectiveCamera;
  scatterPoints: Points;
  view: any;
  data: TrackData[];
}) {
  const { camera, scatterPoints, view, data } = params;
  view.on('mousemove', (event: { pageX: number; pageY: number }) => {
    const { pageX, pageY } = event;
    const raycaster = getRayCaster();
    checkIntersects({
      raycaster,
      camera,
      scatterPoints,
      mouseX: pageX,
      mouseY: pageY,
      data,
    });
  });
}

let rayCaster: Raycaster;

function getRayCaster() {
  if (!rayCaster) {
    rayCaster = new Raycaster();
  }
  return rayCaster;
}

function mouseToThree(mouseX: number, mouseY: number) {
  const x = (mouseX / window.innerWidth) * 2 - 1;
  const y = -(mouseY / window.innerHeight) * 2 + 1;
  return { x, y };
}

function checkIntersects(params: {
  raycaster: Raycaster;
  camera: PerspectiveCamera;
  scatterPoints: Points;
  mouseX: number;
  mouseY: number;
  data: TrackData[];
}) {
  const { raycaster, camera, scatterPoints, mouseX, mouseY, data } = params;
  const mouse_vector = mouseToThree(mouseX, mouseY);
  raycaster.setFromCamera(mouse_vector, camera);
  const intersects = raycaster.intersectObject(scatterPoints);
  if (intersects[0]) {
    const sorted_intersects = [...intersects].sort(
      (a, b) => a.distanceToRay! - b.distanceToRay!
    );
    const intersect = sorted_intersects[0];
    const index = intersect.index;
    const datum = index ? data[index] : null;
    console.log(datum);
    // highlightPoint(datum);
    // showTooltip(mouse_position, datum);
  } else {
    // removeHighlights();
    // hideTooltip();
  }
}
