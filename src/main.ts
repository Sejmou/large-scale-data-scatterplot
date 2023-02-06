import './style.css';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import {
  CategoricalFeatureName,
  getTrackData,
  PlotabbleFeatureName,
} from './data';
import { extent, scaleLinear, select } from 'd3';
import setupZoomPan from './zoom-pan';
import setupTooltip from './tooltip';
import { getColor } from './color';
import { computeViewportFillingPlaneDimensions } from './utils';
import { createPoints } from './render';

const scene = new Scene();
const vizWidth = window.innerWidth;
const vizHeight = window.innerHeight;

const fov = 40;
const aspectRatio = vizWidth / vizHeight;
const near = 1;
const far = 101;
const camera = new PerspectiveCamera(fov, aspectRatio, near, far);

const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(vizWidth, vizHeight);
document.body.appendChild(renderer.domElement);

const main = async () => {
  setupZoomPan({
    view: select(renderer.domElement),
    camera,
    far,
    near,
    width: vizWidth,
    height: vizHeight,
    fov,
  });

  const { width: scatterplotPlaneWidth, height: scatterPlotPlaneHeight } =
    computeViewportFillingPlaneDimensions({
      distanceFromCamera: camera.position.z,
      fov,
      aspectRatio: vizWidth / vizHeight,
    });

  const data = await getTrackData();

  const xFeature: PlotabbleFeatureName = 'acousticness';
  const yFeature: PlotabbleFeatureName = 'danceability';

  const xExtent = extent(data, d => d[xFeature]) as [number, number];
  const yExtent = extent(data, d => d[yFeature]) as [number, number];

  const xScale = scaleLinear()
    .domain(xExtent)
    .range([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2]);
  const yScale = scaleLinear()
    .domain(yExtent)
    .range([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2]);

  const categoryVariable: CategoricalFeatureName = 'key';

  const pointsX = data.map(d => xScale(d[xFeature]));
  const pointsY = data.map(d => yScale(d[yFeature]));
  const pointColors = data.map(d => getColor(d[categoryVariable]));
  const pointRenderConfigs = data.map((_, i) => ({
    x: pointsX[i],
    y: pointsY[i],
    color: pointColors[i],
  }));

  const points = createPoints(pointRenderConfigs);
  scene.add(points);

  setupTooltip({
    view: select(renderer.domElement),
    camera,
    scatterPoints: points,
    scene,
    renderConfigs: pointRenderConfigs,
  });

  function animate() {
    requestAnimationFrame(animate); // called every frame (usually 60fps)
    renderer.render(scene, camera);
  }
  animate(); // starts rendering
};

main();
