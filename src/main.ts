import './style.css';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import {
  CategoricalFeatureName,
  getTrackData,
  PlotabbleFeatureName,
} from './data';
import { axisBottom, axisLeft, scaleLinear, select } from 'd3';
import setupZoomPan from './zoom-pan';
import setupTooltip from './tooltip';
import { getColor } from './color';
import {
  computeViewportFillingPlaneDimensions,
  extentWithPadding,
} from './utils';
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

const alpha = 0.4;

const renderer = new WebGLRenderer({ alpha: true, canvas: renderCanvas });
renderer.setSize(vizWidth, vizHeight);
vizContainer.appendChild(renderer.domElement);
renderer.domElement.classList.add('chart');
const chart = select(renderer.domElement);

const xFeature: PlotabbleFeatureName = 'acousticness';
const yFeature: PlotabbleFeatureName = 'danceability';
const categoryVariable: CategoricalFeatureName = 'key';

const main = async () => {
  camera.position.set(0, 0, far); // IMPORTANT: do this before computing xScaleWorldCoordinates and yScaleWorldCoordinates

  const data = await getTrackData();

  const xExtent = extentWithPadding(data, d => d[xFeature]) as [number, number];
  const yExtent = extentWithPadding(data, d => d[yFeature]) as [number, number];

  const xScaleDOMPixelCoordinates = scaleLinear()
    .domain(xExtent)
    .range([0, vizWidth]);
  const yScaleDOMPixelCoordinates = scaleLinear()
    .domain(yExtent)
    .range([vizHeight, 0]);

  const xAxis = axisBottom(xScaleDOMPixelCoordinates).ticks(10);
  const yAxis = axisLeft(yScaleDOMPixelCoordinates).ticks(10);
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

  const zoom = setupZoomPan({
    view: chart,
    camera,
    far,
    near,
    width: vizWidth,
    height: vizHeight,
    fov,
    axesGroupsAndScales: {
      xAxis,
      yAxis,
      xAxisGroup,
      yAxisGroup,
      xScale: xScaleDOMPixelCoordinates,
      yScale: yScaleDOMPixelCoordinates,
    },
  });

  const { width: scatterplotPlaneWidth, height: scatterPlotPlaneHeight } =
    computeViewportFillingPlaneDimensions({
      distanceFromCamera: camera.position.z,
      fov,
      aspectRatio: vizWidth / vizHeight,
    });
  const xScaleWorldCoordinates = scaleLinear()
    .domain(xExtent)
    .range([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2]);
  const yScaleWorldCoordinates = scaleLinear()
    .domain(yExtent)
    .range([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2]);

  const pointsX = data.map(d => xScaleWorldCoordinates(d[xFeature]));
  const pointsY = data.map(d => yScaleWorldCoordinates(d[yFeature]));
  const pointColors = data.map(d => getColor(d[categoryVariable]));
  const pointRenderConfigs = data.map((_, i) => ({
    x: pointsX[i],
    y: pointsY[i],
    color: pointColors[i],
  }));

  const points = createPoints({ pointConfigs: pointRenderConfigs, alpha });
  scene.add(points);

  setupTooltip({
    view: chart,
    camera,
    scatterPoints: points,
    scene,
    renderConfigs: pointRenderConfigs,
    width: vizWidth,
    height: vizHeight,
    zoom,
    far,
    near,
  });

  function animate() {
    requestAnimationFrame(animate); // called every frame (usually 60fps)
    renderer.render(scene, camera);
  }
  animate(); // starts rendering
};

main();
