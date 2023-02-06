import './style.css';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import {
  CategoricalFeatureName,
  getTrackData,
  PlotabbleFeatureName,
} from './data';
import { axisBottom, axisLeft, extent, scaleLinear, select } from 'd3';
import setupZoomPan from './zoom-pan';
import setupTooltip from './tooltip';
import { getColor } from './color';
import { computeViewportFillingPlaneDimensions } from './utils';
import { createPoints } from './render';

const scene = new Scene();
const vizContainer = document.querySelector('.chart')!;
const renderCanvas = document.createElement('canvas');
vizContainer.appendChild(renderCanvas);

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
renderCanvas.style.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
const vizWidth = vizContainer.clientWidth - margin.left - margin.right;
const vizHeight = vizContainer.clientHeight - margin.top - margin.bottom;
console.log(vizWidth, vizHeight);

const fov = 40;
const aspectRatio = vizWidth / vizHeight;
const near = 1;
const far = 101;
const camera = new PerspectiveCamera(fov, aspectRatio, near, far);

const renderer = new WebGLRenderer({ alpha: true, canvas: renderCanvas });
renderer.setSize(vizWidth, vizHeight);
vizContainer.appendChild(renderer.domElement);
renderer.domElement.classList.add('chart');
const chart = select(renderer.domElement);

const main = async () => {
  setupZoomPan({
    view: chart,
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

  const xScaleWorldCoordinates = scaleLinear()
    .domain(xExtent)
    .range([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2]);
  const xScalePixelCoordinates = scaleLinear()
    .domain(xExtent)
    .range([0, vizWidth]);
  const yScaleWorldCoordinates = scaleLinear()
    .domain(yExtent)
    .range([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2]);
  const yScalePixelCoordinates = scaleLinear()
    .domain(yExtent)
    .range([vizHeight, 0]);

  const xAxis = axisBottom(xScalePixelCoordinates).ticks(10);
  const yAxis = axisLeft(yScalePixelCoordinates).ticks(10);
  const axesSvg = select('.chart')
    .append('svg')
    .attr('width', vizWidth)
    .attr('height', vizHeight);
  const xAxisGroup = axesSvg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${margin.left},${vizHeight + margin.top})`)
    .attr('width', vizWidth)
    .call(xAxis);
  const yAxisGroup = axesSvg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);

  const categoryVariable: CategoricalFeatureName = 'key';

  const pointsX = data.map(d => xScaleWorldCoordinates(d[xFeature]));
  const pointsY = data.map(d => yScaleWorldCoordinates(d[yFeature]));
  const pointColors = data.map(d => getColor(d[categoryVariable]));
  const pointRenderConfigs = data.map((_, i) => ({
    x: pointsX[i],
    y: pointsY[i],
    color: pointColors[i],
  }));

  const points = createPoints(pointRenderConfigs);
  scene.add(points);

  setupTooltip({
    view: chart,
    camera,
    scatterPoints: points,
    scene,
    renderConfigs: pointRenderConfigs,
    width: vizWidth,
    height: vizHeight,
  });

  function animate() {
    requestAnimationFrame(animate); // called every frame (usually 60fps)
    renderer.render(scene, camera);
  }
  animate(); // starts rendering
};

main();
