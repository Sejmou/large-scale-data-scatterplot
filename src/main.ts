import './style.css';
import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import {
  CategoricalFeatureName,
  getTrackData,
  PlotabbleFeatureName,
} from './data';
import { extent, scaleLinear, select } from 'd3';
import setupZoomPan from './zoom-pan';
import setupTooltip from './tooltip';
import { getColor } from './color';
import { computeScatterplotPlaneDimensions } from './scatterplot';

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

  const { scatterPlotPlaneHeight, scatterplotPlaneWidth } =
    computeScatterplotPlaneDimensions(
      camera.position.z,
      fov,
      vizWidth,
      vizHeight
    );

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

  const circleTextureAA = new TextureLoader().load(
    'circle_texture_antialiased.png'
  );
  const pointMaterial = new PointsMaterial({
    size: 8,
    vertexColors: true,
    map: circleTextureAA,
    alphaTest: 0.5,
    sizeAttenuation: false, // in visualizations, we want the points to be the same size regardless of zoom level (which in our case is the distance from the camera in 3D space)
  });

  const pointVertexCoords = data.flatMap(track => [
    xScale(track[xFeature]),
    yScale(track[yFeature]),
    0,
  ]);
  const pointVertexColors = data.flatMap(track => {
    const color = getColor(track[categoryVariable]);
    return [color.r, color.g, color.b];
  });

  const scatterPointsGeo = new BufferGeometry();
  scatterPointsGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(pointVertexCoords), 3)
  );
  scatterPointsGeo.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(pointVertexColors), 3)
  );
  const pointsMesh = new Points(scatterPointsGeo, pointMaterial);
  scene.add(pointsMesh);

  setupTooltip({
    view: select(renderer.domElement),
    camera,
    data,
    scatterPoints: pointsMesh,
  });

  function animate() {
    requestAnimationFrame(animate); // called every frame (usually 60fps)
    renderer.render(scene, camera);
  }
  animate(); // starts rendering
};

main();
