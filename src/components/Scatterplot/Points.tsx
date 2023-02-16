import { ThreeElements, useLoader, useThree } from '@react-three/fiber';
import { scaleLinear } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Color, TextureLoader } from 'three';
import { useScatterplotStore } from './store';
import {
  computeViewportFillingPlaneDimensions,
  extentWithPaddingRawNumbers,
} from './utils';

export type PointRenderConfig = {
  x: number;
  y: number;
  color: Color;
};

const Points = (props: ThreeElements['mesh']) => {
  const circleTexture = useLoader(
    TextureLoader,
    'circle_texture_antialiased.png'
  );
  const pointSize = useScatterplotStore(state => state.pointSize);
  const alpha = useScatterplotStore(state => state.alpha);
  const canvas = useThree(state => state.gl.domElement);
  const camPos = useScatterplotStore(state => state.camPos);
  const fov = useScatterplotStore(state => state.fov);
  const pointRenderConfigs = useScatterplotStore(
    state => state.pointRenderConfigs
  );
  const [lastGeometryUpdate, setLastGeometryUpdate] = useState(Date.now());
  const setXScaleWorldCoordinates = useScatterplotStore(
    state => state.setXScaleWorldCoordinates
  );
  const setYScaleWorldCoordinates = useScatterplotStore(
    state => state.setYScaleWorldCoordinates
  );

  const { pointPositions, pointColors } = useMemo(() => {
    const pointConfigs = pointRenderConfigs;
    if (pointConfigs && canvas) {
      const pointVertexCoords: [number, number, number][] = [];
      const pointVertexColors: [number, number, number][] = [];

      const vizWidth = canvas.clientWidth;
      const vizHeight = canvas.clientHeight;
      const xValues = pointConfigs.map(pc => pc.x);
      const yValues = pointConfigs.map(pc => pc.y);
      const xExtent = extentWithPaddingRawNumbers(xValues) as [number, number];
      const yExtent = extentWithPaddingRawNumbers(yValues) as [number, number];
      const { width: scatterplotPlaneWidth, height: scatterPlotPlaneHeight } =
        computeViewportFillingPlaneDimensions({
          distanceFromCamera: camPos[2],
          fov,
          aspectRatio: vizWidth / vizHeight,
        });
      const xScaleWorldCoordinates = scaleLinear()
        .domain(xExtent)
        .range([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2]);
      const yScaleWorldCoordinates = scaleLinear()
        .domain(yExtent)
        .range([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2]);

      pointConfigs.forEach(pc => {
        pointVertexCoords.push([
          xScaleWorldCoordinates(pc.x),
          yScaleWorldCoordinates(pc.y),
          0,
        ]);
        const { r, g, b } = pc.color;
        pointVertexColors.push([r, g, b]);
      });

      setXScaleWorldCoordinates(xScaleWorldCoordinates);
      setYScaleWorldCoordinates(yScaleWorldCoordinates);

      setLastGeometryUpdate(Date.now());
      return {
        pointPositions: new Float32Array(pointVertexCoords.flat()),
        pointColors: new Float32Array(pointVertexColors.flat()),
      };
    } else {
      return {
        pointPositions: new Float32Array([]),
        pointColors: new Float32Array([]),
      };
    }
  }, [pointRenderConfigs, canvas]);

  const pointsRef = useRef<THREE.Points>(null);
  const setCurrentPoints = useScatterplotStore(state => state.setCurrentPoints);
  useEffect(() => {
    if (pointsRef.current) {
      setCurrentPoints(pointsRef.current);
    }
  }, [pointsRef]);

  return (
    <>
      <points ref={pointsRef}>
        <pointsMaterial
          size={pointSize}
          opacity={alpha}
          map={circleTexture}
          vertexColors={true}
          sizeAttenuation={false}
          transparent={true}
        />
        {/* buffer geometries apparently have to be recreated if we want to change buffer attributes: https://github.com/pmndrs/react-three-fiber/discussions/545 - so my approach is just using the timestamp of the last udpate as the key prop, setting it to a new value every time the inputs change */}
        <bufferGeometry key={lastGeometryUpdate}>
          <bufferAttribute
            attach="attributes-position"
            array={pointPositions}
            itemSize={3}
            count={pointPositions.length / 3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={pointColors}
            itemSize={3}
            count={pointColors.length / 3}
          />
        </bufferGeometry>
      </points>
    </>
  );
};
export default Points;
