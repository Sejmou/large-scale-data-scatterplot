import { useLoader, useThree } from '@react-three/fiber';
import { scaleLog } from 'd3';
import { useEffect, useState } from 'react';
import { PerspectiveCamera, TextureLoader } from 'three';
import { PointRenderConfig, useScatterplotStore } from './store';
import { getScale } from './utils';
import {
  circleTextureDataURI,
  circleBorderTextureDataURI,
} from './texture-data-uris';
import { useRef } from 'react';

const PointInteractions = () => {
  const onPointClick = useScatterplotStore(state => state.onPointClick);
  const onPointHoverStart = useScatterplotStore(
    state => state.onPointHoverStart
  );
  const onPointHoverEnd = useScatterplotStore(state => state.onPointHoverEnd);
  const onPointTap = useScatterplotStore(state => state.onPointTap);

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

  const [hoveredPointRenderConfig, setHoveredPointRenderConfig] =
    useState<PointRenderConfig | null>(null);

  const hoveredPointIndex = useRef<number | null>(null);

  useEffect(() => {
    if (!canvas || !mouse || !raycaster || !camera || !scatterPoints) return;
    const cam = camera as PerspectiveCamera;
    const canvasMoveListener = (e: MouseEvent) => {
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
        const intersect = sortedIntersects[0];
        const index = intersect.index ?? null;
        if (
          index !== null &&
          (hoveredPointIndex.current === null ||
            hoveredPointIndex.current !== index)
        ) {
          setHoveredPointRenderConfig(pointRenderConfigs[index]!);
          hoveredPointIndex.current = index;
          onPointHoverStart?.(index);
        }
      } else {
        if (hoveredPointIndex.current !== null) {
          setHoveredPointRenderConfig(null);
          hoveredPointIndex.current = null;
          onPointHoverEnd?.();
        }
      }
    };

    let startTouch: Touch | null = null;

    const touchStartListener = (e: TouchEvent) => {
      const touches = e.touches;
      if (touches.length === 1) {
        startTouch = touches[0];
      }
    };

    const touchEndListener = (e: TouchEvent) => {
      const touches = e.touches;
      const changedTouches = e.changedTouches;
      if (startTouch && touches.length === 0 && changedTouches.length === 1) {
        const touchEnd = e.changedTouches[0];
        const startX = startTouch.clientX;
        const startY = startTouch.clientY;

        const endX = touchEnd.clientX;
        const endY = touchEnd.clientY;

        const distance = Math.sqrt(
          Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        );

        if (distance <= 5) {
          // TODO: possibly refactor, this is copy pasta from the mouse move listener above with some adaptations
          const canvasRect = (
            e.target as HTMLCanvasElement
          ).getBoundingClientRect();
          const x = startX - canvasRect.left;
          const y = startY - canvasRect.top;
          const width = canvasRect.width;
          const height = canvasRect.height;
          const mouseVector = mouseToThree(x, y, width, height);

          const zoomedInScale = getScale(cam.near, cam.fov, height);
          const zoomedOutScale = getScale(cam.far, cam.fov, height);
          const raycasterPointsThresholdScale = scaleLog()
            .domain([zoomedOutScale, zoomedInScale])
            .range([1, 0.05]);
          const scale = getScale(camera.position.z, cam.fov, height);
          // more generous threshold than in the mouse move listener
          raycaster.params!.Points!.threshold =
            raycasterPointsThresholdScale(scale) * 4;
          raycaster.setFromCamera(mouseVector, camera);

          const intersects = raycaster.intersectObject(scatterPoints);
          if (intersects.length > 0) {
            const sortedIntersects = [...intersects].sort(
              (a, b) => a.distanceToRay! - b.distanceToRay!
            );
            const intersect = sortedIntersects[0];
            const index = intersect.index ?? null;
            if (index !== null) {
              onPointTap?.(index);
              e.preventDefault();
            }
          }
        }
      }
      startTouch = null;
    };

    canvas.addEventListener('mousemove', canvasMoveListener);
    canvas.addEventListener('touchstart', touchStartListener, true);
    canvas.addEventListener('touchend', touchEndListener, true);
    return () => {
      canvas.removeEventListener('mousemove', canvasMoveListener);
      canvas.removeEventListener('touchstart', touchStartListener, true);
      canvas.removeEventListener('touchend', touchEndListener, true);
    };
  }, [
    canvas,
    mouse,
    raycaster,
    camera,
    scatterPoints,
    onPointHoverStart,
    onPointHoverEnd,
    onPointTap,
    pointRenderConfigs,
  ]);

  const clickHandler = () => {
    const pointIndex = hoveredPointIndex.current;
    if (pointIndex != null) onPointClick?.(pointIndex);
  };

  return (
    <>
      {hoveredPointRenderConfig !== null && (
        <>
          <points onClick={clickHandler}>
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
                    xScaleWorldCoordinates!(hoveredPointRenderConfig.x),
                    yScaleWorldCoordinates!(hoveredPointRenderConfig.y),
                    0,
                  ])
                }
                itemSize={3}
                count={1}
              />
              <bufferAttribute
                attach="attributes-color"
                array={new Float32Array(hoveredPointRenderConfig.color)}
                itemSize={3}
                count={1}
              />
            </bufferGeometry>
          </points>
          <points>
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
                    xScaleWorldCoordinates!(hoveredPointRenderConfig.x),
                    yScaleWorldCoordinates!(hoveredPointRenderConfig.y),
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
export default PointInteractions;

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
