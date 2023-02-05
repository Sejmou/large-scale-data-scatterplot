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
import { getTrackData, PlotabbleFeature } from './data';
import { extent, scaleLinear } from 'd3';

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const main = async () => {
  camera.position.z = 5; // Move camera out a bit so that we can see elements in the scene

  const scatterPlot = new Object3D();
  scene.add(scatterPlot);

  const data = await getTrackData();

  const xFeature: PlotabbleFeature = 'acousticness';
  const yFeature: PlotabbleFeature = 'danceability';
  const zFeature: PlotabbleFeature = 'energy';

  const xExtent = extent(data, d => d[xFeature]) as [number, number];
  const yExtent = extent(data, d => d[yFeature]) as [number, number];
  const zExtent = extent(data, d => d[zFeature]) as [number, number];

  function createScale(extent: [number, number]) {
    return scaleLinear().domain(extent).range([-50, 50]);
  }
  const xScale = createScale(xExtent);
  const yScale = createScale(yExtent);
  const zScale = createScale(zExtent);
  const spotifyGreen = 0x1db954;
  const pointMaterial = new PointsMaterial({
    color: spotifyGreen,
    size: 0.05,
  });

  const pointVertexCoords = data.flatMap(track => [
    xScale(track[xFeature]),
    yScale(track[yFeature]),
    zScale(track[zFeature]),
  ]);
  console.log(pointVertexCoords);
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
  animate(); // starts the animation, which calls animate() every frame resulting in the cube rotating
};

main();
