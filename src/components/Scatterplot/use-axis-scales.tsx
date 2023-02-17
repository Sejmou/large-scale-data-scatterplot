import { scaleLinear } from 'd3';
import { useMemo } from 'react';
import { useScatterplotStore } from './store';
import { getScale } from './utils';

export default function useAxisScales() {
  const xScaleWorldToData = useScatterplotStore(
    state => state.xScaleWorldToData
  );
  const yScaleWorldToData = useScatterplotStore(
    state => state.yScaleWorldToData
  );
  const camPos = useScatterplotStore(state => state.camPos);
  const fov = useScatterplotStore(state => state.fov);
  const plotCanvasDimensions = useScatterplotStore(
    state => state.plotCanvasDimensionsDOM
  );

  const { xScale, yScale } = useMemo(() => {
    console.log('called');
    if (xScaleWorldToData && yScaleWorldToData) {
      const [camX, camY, camZ] = camPos;
      const canvasWidth = plotCanvasDimensions?.width ?? 0;
      const canvasHeight = plotCanvasDimensions?.height ?? 0;
      const scale = getScale(camZ, fov, canvasHeight);
      const pannedAreaWidthWorld = canvasWidth / scale;
      const pannedAreaHeightWorld = canvasHeight / scale;
      const pannedAreaLeft = camX - pannedAreaWidthWorld / 2;
      const pannedAreaRight = camX + pannedAreaWidthWorld / 2;
      const pannedAreaTop = camY + pannedAreaHeightWorld / 2;
      const pannedAreaBottom = camY - pannedAreaHeightWorld / 2;

      const newXScale = scaleLinear()
        .domain([
          xScaleWorldToData(pannedAreaLeft),
          xScaleWorldToData(pannedAreaRight),
        ])
        .range([0, canvasWidth]);
      const newYScale = scaleLinear()
        .domain([
          yScaleWorldToData(pannedAreaBottom),
          yScaleWorldToData(pannedAreaTop),
        ])
        .range([canvasHeight, 0]);
      return { xScale: newXScale, yScale: newYScale };
    } else {
      return { xScale: undefined, yScale: undefined };
    }
  }, [camPos, plotCanvasDimensions, fov, xScaleWorldToData, yScaleWorldToData]);

  return { xScale, yScale };
}
