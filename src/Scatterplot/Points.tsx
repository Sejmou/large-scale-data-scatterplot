import { useLoader, useThree } from '@react-three/fiber';
import { scaleLinear } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TextureLoader } from 'three';
import { useScatterplotStore } from './store';
import {
  computeViewportFillingPlaneDimensions,
  extentWithPaddingRawNumbers,
} from './utils';

type Props = {
  beginAtZeroX?: boolean;
  beginAtZeroY?: boolean;
};

const Points = ({ beginAtZeroX, beginAtZeroY }: Props) => {
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
  const xScaleWorldCoordinates = useScatterplotStore(
    state => state.xScaleWorldCoordinates
  );
  const yScaleWorldCoordinates = useScatterplotStore(
    state => state.yScaleWorldCoordinates
  );
  const setPlotPlaneDimensions = useScatterplotStore(
    state => state.setPlotPlaneDimensionsWorld
  );
  const setXScaleWorldToData = useScatterplotStore(
    state => state.setXScaleWorldToData
  );
  const setYScaleWorldToData = useScatterplotStore(
    state => state.setYScaleWorldToData
  );
  const canvas = useThree(state => state.gl.domElement);

  useEffect(() => {
    const xValues = pointRenderConfigs.map(pc => pc.x);
    const yValues = pointRenderConfigs.map(pc => pc.y);
    const xExtent = extentWithPaddingRawNumbers(
      beginAtZeroX ? [...xValues, 0] : xValues
    ) as [number, number];
    const yExtent = extentWithPaddingRawNumbers(
      beginAtZeroY ? [...yValues, 0] : yValues
    ) as [number, number];
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const { width: scatterplotPlaneWidth, height: scatterPlotPlaneHeight } =
      computeViewportFillingPlaneDimensions({
        distanceFromCamera: far,
        fov,
        aspectRatio: canvasWidth / canvasHeight,
      });
    setPlotPlaneDimensions({
      width: scatterplotPlaneWidth,
      height: scatterPlotPlaneHeight,
    });
    const xScaleWorldCoordinates = scaleLinear()
      .domain(xExtent)
      .range([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2]);
    const yScaleWorldCoordinates = scaleLinear()
      .domain(yExtent)
      .range([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2]);

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

    setXScaleWorldToData(
      scaleLinear()
        .domain([-scatterplotPlaneWidth / 2, scatterplotPlaneWidth / 2])
        .range(xScaleWorldCoordinates.domain())
    );
    setYScaleWorldToData(
      scaleLinear()
        .domain([-scatterPlotPlaneHeight / 2, scatterPlotPlaneHeight / 2])
        .range(yScaleWorldCoordinates.domain())
    );

    setLastGeometryUpdate(Date.now());
  }, [pointRenderConfigs, canvas, far, fov]);

  const { pointPositions, pointColors } = useMemo(() => {
    if (
      xScaleWorldCoordinates === undefined ||
      yScaleWorldCoordinates === undefined
    ) {
      return {
        pointPositions: new Float32Array([]),
        pointColors: new Float32Array([]),
      };
    }
    const pointVertexCoords: [number, number, number][] = [];
    const pointVertexColors: [number, number, number][] = [];
    pointRenderConfigs.forEach(pc => {
      pointVertexCoords.push([
        xScaleWorldCoordinates(pc.x),
        yScaleWorldCoordinates(pc.y),
        0,
      ]);
      const { r, g, b } = pc.color;
      pointVertexColors.push([r, g, b]);
    });
    const pointPositions = new Float32Array(pointVertexCoords.flat());
    const pointColors = new Float32Array(pointVertexColors.flat());
    return { pointPositions, pointColors };
  }, [pointRenderConfigs, xScaleWorldCoordinates, yScaleWorldCoordinates]);

  const pointsRef = useRef<THREE.Points>(null);
  const setCurrentPoints = useScatterplotStore(state => state.setCurrentPoints);
  useEffect(() => {
    if (pointsRef.current) {
      setCurrentPoints(pointsRef.current);
    }
  }, [pointsRef]);

  return (
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
  );
};
export default Points;
