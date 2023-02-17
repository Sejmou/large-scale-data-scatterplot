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

type Props = {
  canvasWidth: number;
  canvasHeight: number;
};

const Points = ({
  canvasWidth,
  canvasHeight,
}: ThreeElements['mesh'] & Props) => {
  const circleTexture = useLoader(
    TextureLoader,
    'circle_texture_antialiased.png'
  );
  const pointSize = useScatterplotStore(state => state.pointSize);
  const alpha = useScatterplotStore(state => state.alpha);
  const far = useThree(state => state.camera.far);
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
  const setXScaleDOMPixels = useScatterplotStore(
    state => state.setXScaleDOMPixels
  );
  const setYScaleDOMPixels = useScatterplotStore(
    state => state.setYScaleDOMPixels
  );

  const { pointPositions, pointColors } = useMemo(() => {
    const pointConfigs = pointRenderConfigs;
    if (pointConfigs) {
      const pointVertexCoords: [number, number, number][] = [];
      const pointVertexColors: [number, number, number][] = [];

      const xValues = pointConfigs.map(pc => pc.x);
      const yValues = pointConfigs.map(pc => pc.y);
      const xExtent = extentWithPaddingRawNumbers(xValues) as [number, number];
      const yExtent = extentWithPaddingRawNumbers(yValues) as [number, number];
      const { width: scatterplotPlaneWidth, height: scatterPlotPlaneHeight } =
        computeViewportFillingPlaneDimensions({
          distanceFromCamera: far,
          fov,
          aspectRatio: canvasWidth / canvasHeight,
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

      const xScaleDOMPixelCoordinates = scaleLinear()
        .domain(xExtent)
        .range([0, canvasWidth]);
      const yScaleDOMPixelCoordinates = scaleLinear()
        .domain(yExtent)
        .range([canvasHeight, 0]);
      setXScaleDOMPixels(xScaleDOMPixelCoordinates);
      setYScaleDOMPixels(yScaleDOMPixelCoordinates);

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
  }, [pointRenderConfigs, canvasWidth, canvasHeight, far, fov]);

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
