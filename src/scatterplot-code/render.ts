import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
  Texture,
  TextureLoader,
} from 'three';

export type PointRenderConfig = {
  x: number;
  y: number;
  color: Color;
};

let circleTexture: Texture;

export function getPointMaterial(pointSize: number, alpha: number) {
  const pointMaterial = new PointsMaterial({
    size: pointSize,
    vertexColors: true,
    map: getTexture(),
    sizeAttenuation: false, // in visualizations, we want the points to be the same size regardless of zoom level (which in our case is the distance from the camera in 3D space)
    transparent: true,
    opacity: alpha,
  });
  return pointMaterial;
}

export function createPoints(params: {
  pointConfigs: PointRenderConfig[];
  size?: number;
  alpha?: number;
}) {
  const { pointConfigs, size = 12, alpha = 1 } = params;
  const pointMaterial = getPointMaterial(size, alpha);

  const pointVertexCoords: [number, number, number][] = [];
  const pointVertexColors: [number, number, number][] = [];
  pointConfigs.forEach(pc => {
    pointVertexCoords.push([pc.x, pc.y, 0]);
    const { r, g, b } = pc.color;
    pointVertexColors.push([r, g, b]);
  });

  const scatterPointsGeo = new BufferGeometry();
  scatterPointsGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(pointVertexCoords.flat()), 3)
  );
  scatterPointsGeo.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(pointVertexColors.flat()), 3)
  );
  const pointsMesh = new Points(scatterPointsGeo, pointMaterial);
  return pointsMesh;
}

function getTexture() {
  if (!circleTexture) {
    circleTexture = new TextureLoader().load('circle_texture_antialiased.png');
  }
  return circleTexture;
}
