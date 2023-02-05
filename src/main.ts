import './style.css';
import {
  BufferAttribute,
  BufferGeometry,
  Object3D,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { getTrackData, PlotabbleFeatureName } from './data';
import { extent, scaleLinear, select } from 'd3';
import { setupZoom } from './camera-zoom-pan-utils';

const scene = new Scene();
const vizWidth = window.innerWidth;
const vizHeight = window.innerHeight;

const fov = 40;
const aspectRatio = vizWidth / vizHeight;
const near = 1;
const far = 101;
const camera = new PerspectiveCamera(fov, aspectRatio, near, far);

const renderer = new WebGLRenderer();
renderer.setSize(vizWidth, vizHeight);
document.body.appendChild(renderer.domElement);

const main = async () => {
  camera.position.z = 1; // Move camera out a bit so that we can see elements in the scene

  const scatterPlot = new Object3D();
  scene.add(scatterPlot);

  const data = await getTrackData();

  const xFeature: PlotabbleFeatureName = 'acousticness';
  const yFeature: PlotabbleFeatureName = 'danceability';

  const xExtent = extent(data, d => d[xFeature]) as [number, number];
  const yExtent = extent(data, d => d[yFeature]) as [number, number];

  function createScale(extent: [number, number]) {
    return scaleLinear().domain(extent).range([-0.5, 0.5]);
  }
  const xScale = createScale(xExtent);
  const yScale = createScale(yExtent);

  const spotifyGreen = 0x1db954;
  const pointMaterial = new PointsMaterial({
    color: spotifyGreen,
    size: 0.01,
    // vertexColors: true,
  });

  const pointVertexCoords = data.flatMap(track => [
    xScale(track[xFeature]),
    yScale(track[yFeature]),
    0,
  ]);
  const pointsGeo = new BufferGeometry();
  pointsGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(pointVertexCoords), 3)
  );
  const pointsMesh = new Points(pointsGeo, pointMaterial);
  scene.add(pointsMesh);

  function animate() {
    requestAnimationFrame(animate); // called every frame (usually 60fps)
    renderer.render(scene, camera);
  }
  animate(); // starts rendering

  setupZoom({
    view: select(renderer.domElement),
    camera,
    far,
    near,
    width: vizWidth,
    height: vizHeight,
    fov,
  });
};

main();
