import { useLoader, useThree } from '@react-three/fiber';
import { scaleLog } from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { PerspectiveCamera, TextureLoader } from 'three';
import { useScatterplotStore } from './store';
import { getScale } from './utils';
import {
  circleTextureDataURI,
  circleBorderTextureDataURI,
} from './texture-data-uris';

type Props = {
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
};
const PointClickAndHover = ({
  onPointClick,
  onPointHoverStart,
  onPointHoverEnd,
}: Props) => {
  const circleTexture = useLoader(TextureLoader, circleTextureDataURI);
  const circleBorderTexture = useLoader(
    TextureLoader,
    circleBorderTextureDataURI
  );

  const raycaster = useThree(state => state.raycaster);
  const mouse = useThree(state => state.mouse);
  const canvas = useThree(state => state.gl.domElement);
  const camera = useThree(state => state.camera);
  const scatterPoints = useScatterplotStore(state => state.currentPoints);
  const pointRenderConfigs = useScatterplotStore(
    state => state.pointRenderConfigs
  );
  const pointSize = useScatterplotStore(state => state.pointSize);
  const xScaleWorldCoordinates = useScatterplotStore(
    state => state.xScaleWorldCoordinates
  );
  const yScaleWorldCoordinates = useScatterplotStore(
    state => state.yScaleWorldCoordinates
  );

  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null
  );
  const hoveredPointData = useMemo(() => {
    if (hoveredPointIndex !== null) {
      const config = pointRenderConfigs[hoveredPointIndex];
      if (!config) return null;
      return { x: config.x, y: config.y, color: config.color };
    } else {
      return null;
    }
  }, [hoveredPointIndex, scatterPoints, pointRenderConfigs]);
  useEffect(() => {
    if (!canvas || !mouse || !raycaster || !camera || !scatterPoints) return;
    const cam = camera as PerspectiveCamera;
    const hoverListener = (e: MouseEvent) => {
      const canvasRect = (
        e.target as HTMLCanvasElement
      ).getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      const width = canvasRect.width;
      const height = canvasRect.height;
      const mouseVector = mouseToThree(x, y, width, height);

      const zoomedInScale = getScale(cam.near, cam.fov, height);
      const zoomedOutScale = getScale(cam.far, cam.fov, height);
      const raycasterPointsThresholdScale = scaleLog()
        .domain([zoomedOutScale, zoomedInScale])
        .range([1, 0.05]);
      const scale = getScale(camera.position.z, cam.fov, height);
      // per default, with a larger zoom level points are highlighted even if the distance between the mouse and the point (in pixel coordinates) is large
      // workaround: make the threshold for the raycaster points dependent on the zoom scale
      // to understand the issue it is best to comment out the following line, zoom in and out and observe when a particular point is highlighted
      raycaster.params!.Points!.threshold =
        raycasterPointsThresholdScale(scale);
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(scatterPoints);
      if (intersects.length > 0) {
        const sortedIntersects = [...intersects].sort(
          (a, b) => a.distanceToRay! - b.distanceToRay!
        );
        const index = sortedIntersects[0].index ?? null;
        if (index !== null) {
          setHoveredPointIndex(index);
          onPointHoverStart?.(index);
        }
      } else {
        setHoveredPointIndex(null);
        onPointHoverEnd?.();
      }
    };
    canvas.addEventListener('mousemove', hoverListener);
    return () => canvas.removeEventListener('mousemove', hoverListener);
  }, [
    canvas,
    mouse,
    raycaster,
    camera,
    scatterPoints,
    onPointHoverStart,
    onPointHoverEnd,
    onPointClick,
  ]);

  return (
    <>
      {hoveredPointData !== null && (
        <>
          <points
            key={hoveredPointIndex ?? ''}
            onClick={() => {
              if (hoveredPointIndex != null) onPointClick?.(hoveredPointIndex);
            }}
            onPointerLeave={onPointHoverEnd}
          >
            {/* without the key prop, the rendered "highlighted" point would not update if another point is hovered */}
            <pointsMaterial
              size={pointSize * 1.25}
              opacity={1}
              map={circleTexture}
              vertexColors={true}
              sizeAttenuation={false}
              transparent={true}
            />
            {/* buffer geometries apparently have to be recreated if we want to change buffer attributes: https://github.com/pmndrs/react-three-fiber/discussions/545 - so my approach is just using the timestamp of the last udpate as the key prop, setting it to a new value every time the inputs change */}
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([
                    xScaleWorldCoordinates!(hoveredPointData.x),
                    yScaleWorldCoordinates!(hoveredPointData.y),
                    0,
                  ])
                }
                itemSize={3}
                count={1}
              />
              <bufferAttribute
                attach="attributes-color"
                array={new Float32Array(hoveredPointData.color)}
                itemSize={3}
                count={1}
              />
            </bufferGeometry>
          </points>
          <points key={hoveredPointIndex + 'a' ?? 'a'}>
            {/* without the key prop, the rendered "highlighted" point would not update if another point is hovered */}
            <pointsMaterial
              size={pointSize * 1.25}
              opacity={1}
              map={circleBorderTexture}
              vertexColors={true}
              sizeAttenuation={false}
              transparent={true}
            />
            {/* buffer geometries apparently have to be recreated if we want to change buffer attributes: https://github.com/pmndrs/react-three-fiber/discussions/545 - so my approach is just using the timestamp of the last udpate as the key prop, setting it to a new value every time the inputs change */}
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array([
                    xScaleWorldCoordinates!(hoveredPointData.x),
                    yScaleWorldCoordinates!(hoveredPointData.y),
                    0,
                  ])
                }
                itemSize={3}
                count={1}
              />
              <bufferAttribute
                attach="attributes-color"
                array={new Float32Array([0, 0, 0])}
                itemSize={3}
                count={1}
              />
            </bufferGeometry>
          </points>
        </>
      )}
    </>
  );
};
export default PointClickAndHover;

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
