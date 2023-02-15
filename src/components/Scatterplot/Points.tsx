import { ThreeElements, useLoader, useThree } from '@react-three/fiber';
import { scaleLinear } from 'd3';
import { useMemo, useRef, useState } from 'react';
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
  pointSize: number;
  alpha: number;
  onPointClick?: (pointIndex: number) => void;
  onPointHoverStart?: (pointIndex: number) => void;
  onPointHoverEnd?: () => void;
};
const Points = (props: ThreeElements['mesh'] & Props) => {
  const circleTexture = useLoader(
    TextureLoader,
    'circle_texture_antialiased.png'
  );
  const canvas = useThree(state => state.gl.domElement);
  const camPos = useScatterplotStore(state => state.camPos);
  const fov = useScatterplotStore(state => state.fov);
  const pointRenderConfigs = useScatterplotStore(
    state => state.pointRenderConfigs
  );
  const [lastGeometryUpdate, setLastGeometryUpdate] = useState(Date.now());

  const {
    pointPositions,
    pointColors,
    xScaleWorldCoordinates,
    yScaleWorldCoordinates,
  } = useMemo(() => {
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
      setLastGeometryUpdate(Date.now());
      return {
        pointPositions: new Float32Array(pointVertexCoords.flat()),
        pointColors: new Float32Array(pointVertexColors.flat()),
        xScaleWorldCoordinates,
        yScaleWorldCoordinates,
      };
    } else {
      return {
        pointPositions: new Float32Array([]),
        pointColors: new Float32Array([]),
      };
    }
  }, [pointRenderConfigs, canvas]);

  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null
  );

  const hoveredPointData = useMemo(() => {
    if (hoveredPointIndex !== null) {
      const config = pointRenderConfigs[hoveredPointIndex];
      return { x: config.x, y: config.y, color: config.color };
    } else {
      return null;
    }
  }, [hoveredPointIndex, pointRenderConfigs]);

  console.log({ hoveredPointData });

  return (
    <>
      <points
        onClick={e => {
          props.onPointClick &&
            e.index !== undefined &&
            props.onPointClick(e.index);
        }}
        onPointerEnter={e => {
          console.log(e);
          const index = e.index;
          if (index !== undefined) {
            setHoveredPointIndex(index);
            props.onPointHoverStart && props.onPointHoverStart(index);
          }
        }}
        onPointerLeave={e => {
          props.onPointHoverEnd && props.onPointHoverEnd();
          setHoveredPointIndex(null);
        }}
      >
        <pointsMaterial
          size={props.pointSize}
          opacity={props.alpha}
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
      {hoveredPointData !== null && (
        <points>
          <pointsMaterial
            size={props.pointSize * 1.25}
            opacity={Math.min(props.alpha * 1.5, 1)}
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
              array={new Float32Array([1, 0, 0])}
              itemSize={3}
              count={1}
            />
          </bufferGeometry>
        </points>
      )}
    </>
  );
};
export default Points;
